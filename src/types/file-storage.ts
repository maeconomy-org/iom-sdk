/**
 * File storage service DTOs.
 *
 * Shape sourced from `docs/filestorage.swagger.json`. Field names mirror the
 * swagger exactly (`mimeType` not `contentType`, `fileReference` not
 * `fileUuid`, `checksumSHA256` not `sha256` on `PartETag`).
 *
 * Flow after a successful upload:
 *   1. `client.fileStorage.uploadFile(...)` → returns `FileStorageCompleteResponseDTO`
 *      with `fileReference`.
 *   2. Caller then registers the file with the node-network registry via
 *      `client.node.createOrUpdateFile({ fileReference, fileName, contentType,
 *      size, ... })` so the UUFile record can be attached to an object/property.
 *
 * The FileStorage service is bytes-only; node-network is records-and-relations.
 */

/**
 * Request body for `POST /api/FileStorage/init`.
 *
 * `sha256` is hex-encoded (lowercase). All three required fields are
 * server-validated; mismatches surface as 400 `InvalidRequest`.
 */
export interface FileStorageInitDTO {
  fileName: string;
  mimeType: string;
  /** Bytes; min 1. int64 server-side. */
  size: number;
  /** Hex-encoded full-file SHA-256, lowercase. */
  sha256: string;
}

/**
 * Response from `POST /api/FileStorage/init` and `POST /{uploadId}/refresh`.
 *
 * Note: `urls.length === 1` and `partSize === null` together signal the
 * single-shot path. Otherwise this is a multipart upload and the caller
 * PUTs `file.slice((i-1)*partSize, i*partSize)` to `urls[i-1]`.
 *
 * `expiresAt` applies to every URL in `urls` — there is no per-URL expiry.
 */
export interface FileStorageInitResponseDTO {
  uploadId: string;
  fileReference: string;
  urls: string[];
  /** Bytes per part; null for single-shot. */
  partSize: number | null;
  /** ISO-8601 timestamp — all URLs in `urls` expire at this moment. */
  expiresAt: string;
}

/**
 * Request body for `POST /api/FileStorage/{uploadId}/refresh`.
 *
 * When `partNumbers` is omitted or empty, the server returns fresh URLs for
 * every part in the original init batch. When provided, the response `urls`
 * array contains URLs only for those part numbers, in the same order. Pass
 * the missing parts only to keep refresh responses small for huge multipart
 * uploads.
 */
export interface FileStorageRefreshDTO {
  partNumbers?: number[];
}

/**
 * A completed part with its server-returned ETag.
 *
 * `checksumSHA256` is optional. When the SDK computes per-part SHA-256 it
 * sends the base64-encoded digest here so the server can pass it through to
 * S3's per-part integrity check (`x-amz-checksum-sha256`).
 */
export interface PartETag {
  partNumber: number;
  etag: string;
  /** Base64-encoded per-part SHA-256. Omit if not computed. */
  checksumSHA256?: string;
}

/**
 * Request body for `POST /api/FileStorage/{uploadId}/complete`.
 *
 * Single-shot uploads (where `urls.length === 1`) still send a one-element
 * `parts` array with `partNumber: 1` and the ETag returned from the single
 * PUT. The server uses the array length to dispatch single-shot vs multipart
 * completion internally.
 */
export interface FileStorageCompleteDTO {
  parts: PartETag[];
}

/** Lifecycle states surfaced via `status` on metadata + complete responses. */
export type FileStatus =
  | 'PENDING'
  | 'UPLOADING'
  | 'READY'
  | 'FAILED'
  | 'DELETED';

/**
 * Response from `POST /api/FileStorage/{uploadId}/complete`.
 *
 * `status` is normally `READY`. If size/SHA-256 verification fails the
 * server returns `FAILED` and the bytes are reclaimed.
 */
export interface FileStorageCompleteResponseDTO {
  fileReference: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: FileStatus;
}

// AuditUser is declared in `./aggregates` (shared across node-network and
// file-storage). Imported here as a type so it's available to the DTOs
// below without duplicating the symbol on the barrel export.
import type { AuditUser } from './aggregates';

/**
 * Response from `GET /api/FileStorage/{fileReference}`.
 *
 * Carries the `mimeType` that was previously on `PreviewUrlResponseDTO`.
 * Fetch this alongside `getPreviewUrl` when the consumer needs to pick the
 * right preview element (image vs PDF vs video).
 */
export interface FileMetadataResponseDTO {
  fileReference: string;
  fileName: string;
  mimeType: string;
  size: number;
  /** Hex-encoded full-file SHA-256 (lowercase) — what the client sent at init. */
  sha256: string;
  status: FileStatus;
  createdBy: AuditUser;
  /** ISO-8601. */
  createdAt: string;
}

/**
 * Response from `GET /api/FileStorage/{fileReference}/preview-url`.
 *
 * The URL has `response-content-disposition=inline` baked in by the server
 * for whitelisted MIME types; for everything else the server bakes in
 * `attachment` to neutralize stored-XSS via MIME spoofing.
 */
export interface PreviewUrlResponseDTO {
  url: string;
  /** ISO-8601. */
  expiresAt: string;
}

// ----------------------------------------------------------------------------
// SDK-internal aliases (back-compat exports). The orchestrator uses these
// names so call-site renames are kept to a minimum on consumers.
// ----------------------------------------------------------------------------

export type InitUploadRequest = FileStorageInitDTO;
export type InitUploadResponse = FileStorageInitResponseDTO;
export type RefreshUrlsRequest = FileStorageRefreshDTO;
export type CompletedPart = PartETag;
export type CompleteUploadRequest = FileStorageCompleteDTO;
export type CompleteUploadResponse = FileStorageCompleteResponseDTO;
export type FileMetadata = FileMetadataResponseDTO;
export type PreviewUrlResponse = PreviewUrlResponseDTO;

/**
 * Until the backend ships a JSON `/download-url` endpoint that mirrors
 * `/preview-url` with `attachment` disposition baked in, the SDK exposes
 * this shape from `getDownloadUrl` and currently routes it through the
 * preview-url endpoint. When the backend adds the dedicated endpoint, switch
 * the implementation without touching callers.
 *
 * TODO(backend): GET /api/FileStorage/{fileReference}/download-url
 *   → { url, expiresAt } with `response-content-disposition=attachment`
 */
export interface DownloadUrlResponse {
  url: string;
  /** ISO-8601. */
  expiresAt: string;
}

/**
 * Typed errors thrown by `FileStorageServiceClient`. Map RFC 7807 ProblemDetails
 * from the backend + S3-side errors into one of these kinds.
 *
 * - `BadDigest` / `ChecksumMismatch` — content hash mismatch (S3 / backend).
 * - `InvalidRequest` — 400-class validation failure.
 * - `NotFound` — file or uploadId doesn't exist.
 * - `Expired` — presigned URL expired (parse S3 XML `AccessDenied`).
 * - `Forbidden` — terminal 403 (e.g. `SignatureDoesNotMatch`).
 * - `Throttled` — 429; honor `retryAfter`.
 * - `QuotaExceeded` — storage quota.
 * - `CorsOrNetwork` — fetch threw TypeError ("Failed to fetch") — typically
 *    a CORS misconfig on the bucket. Distinct from a real network failure
 *    so we surface a useful message during deployment.
 * - `Aborted` — `AbortSignal` fired.
 */
export type FileStorageErrorKind =
  | 'BadDigest'
  | 'ChecksumMismatch'
  | 'InvalidRequest'
  | 'NotFound'
  | 'Expired'
  | 'Forbidden'
  | 'Throttled'
  | 'QuotaExceeded'
  | 'CorsOrNetwork'
  | 'Aborted';

export class FileStorageError extends Error {
  readonly kind: FileStorageErrorKind;
  /** Seconds; populated for `Throttled` from the `Retry-After` header. */
  readonly retryAfter?: number;
  /** Underlying cause (axios error, fetch TypeError, S3 XML body, etc.) — debug only. */
  readonly cause?: unknown;

  constructor(
    kind: FileStorageErrorKind,
    message: string,
    options?: { retryAfter?: number; cause?: unknown }
  ) {
    super(message);
    this.name = 'FileStorageError';
    this.kind = kind;
    this.retryAfter = options?.retryAfter;
    this.cause = options?.cause;
  }
}

/**
 * Input to `FileStorageServiceClient.uploadFile()`.
 *
 * `concurrency` controls per-file part parallelism (default 6, cap 8). For
 * the global file concurrency cap, see `FileUploadService` in the UI.
 */
export interface UploadFileInput {
  file: File | Blob;
  fileName?: string;
  contentType?: string;
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
  concurrency?: number;
}
