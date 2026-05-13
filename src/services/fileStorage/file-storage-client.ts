/**
 * File storage service client.
 *
 * Orchestrates: init → (single-shot PUT | parallel part PUTs) → complete.
 *
 * Design notes:
 *   - **`fetch` (not axios) for S3 PUTs.** Axios attaches request interceptors
 *     in the parent `Client` that add `Authorization: Bearer …`. That header
 *     invalidates an S3 presignature. Using `fetch` (no interceptors) makes
 *     accidental JWT leakage to S3 mechanically impossible.
 *   - **Blob body, never `arrayBuffer()`.** Passing a `Blob` to `fetch` lets
 *     the browser stream the bytes. Calling `await partBlob.arrayBuffer()`
 *     would materialize each part into a fresh `ArrayBuffer`, doubling peak
 *     memory per active part.
 *   - **URLs come from the init response, not a separate `/part-urls` call.**
 *     Backend pre-signs all parts up front. Refresh is on-demand for the
 *     subset that expires.
 *   - **`partSize` comes from the init response** — never hardcoded. When the
 *     backend later tiers part size by file size, this SDK is unaffected.
 *   - **Per-part retry with exponential backoff + jitter** for transient
 *     5xx/408/429/network. Distinct from S3-403 expiry which uses
 *     `refreshUploadUrls` then retries.
 *   - **Proactive URL refresh at T-60s.** When the per-batch `expiresAt`
 *     approaches, refresh the URLs of any still-pending parts in one call.
 *   - **Progress throttled to ~10 Hz**, monotonic (max prev/next). Prevents
 *     React re-render storms when 6 parts emit progress concurrently.
 */
import { AxiosInstance } from 'axios';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import {
  CompletedPart,
  DownloadUrlResponse,
  FileMetadataResponseDTO,
  FileStorageCompleteDTO,
  FileStorageCompleteResponseDTO,
  FileStorageError,
  FileStorageInitDTO,
  FileStorageInitResponseDTO,
  FileStorageRefreshDTO,
  PartETag,
  PreviewUrlResponse,
  PreviewUrlResponseDTO,
  RequestOptions,
  UploadFileInput
} from '../../types';
import { createSha256Hasher, Sha256Hasher } from './sha256-worker';

const DEFAULT_PART_CONCURRENCY = 6;
const MAX_PART_CONCURRENCY = 8;
const PER_PART_MAX_RETRIES = 3;
const PROACTIVE_REFRESH_MS = 60 * 1000;

/** API endpoint paths under the file-storage service base URL. */
const PATH_INIT = '/api/FileStorage/init';
const PATH_COMPLETE = (uploadId: string) =>
  `/api/FileStorage/${encodeURIComponent(uploadId)}/complete`;
const PATH_REFRESH = (uploadId: string) =>
  `/api/FileStorage/${encodeURIComponent(uploadId)}/refresh`;
const PATH_ABORT = (uploadId: string) =>
  `/api/FileStorage/${encodeURIComponent(uploadId)}`;
const PATH_METADATA = (fileReference: string) =>
  `/api/FileStorage/${encodeURIComponent(fileReference)}`;
const PATH_PREVIEW = (fileReference: string) =>
  `/api/FileStorage/${encodeURIComponent(fileReference)}/preview-url`;
const PATH_SOFT_DELETE = (fileReference: string) =>
  `/api/FileStorage/${encodeURIComponent(fileReference)}/delete`;

export class FileStorageServiceClient {
  constructor(
    _config: ServiceConfig,
    _errorHandling: ErrorHandlingConfig,
    private axios: AxiosInstance,
    /** Override in tests / mock client. */
    private hasherFactory: () => Sha256Hasher = createSha256Hasher
  ) {}

  // ------------------------------------------------------------------------
  // Low-level primitives. Also exposed publicly for future Node consumers
  // / resumable upload flows that drive the state machine themselves.
  // ------------------------------------------------------------------------

  async initUpload(
    body: FileStorageInitDTO,
    opts?: RequestOptions
  ): Promise<FileStorageInitResponseDTO> {
    const res = await this.axios.post<FileStorageInitResponseDTO>(
      PATH_INIT,
      body,
      { signal: opts?.signal }
    );
    return res.data;
  }

  /**
   * Refresh presigned URLs for an in-flight upload. Pass `partNumbers` to
   * refresh only specific parts (response `urls` come back in the same
   * order). Pass nothing / empty to refresh all parts.
   *
   * Returns the full init-response shape — `uploadId`, `fileReference`,
   * `urls`, `partSize`, `expiresAt`. The session and part numbers are
   * preserved; only the URLs (and the `expiresAt` TTL) change.
   */
  async refreshUploadUrls(
    uploadId: string,
    partNumbers?: number[],
    opts?: RequestOptions
  ): Promise<FileStorageInitResponseDTO> {
    const body: FileStorageRefreshDTO = partNumbers?.length
      ? { partNumbers }
      : {};
    const res = await this.axios.post<FileStorageInitResponseDTO>(
      PATH_REFRESH(uploadId),
      body,
      { signal: opts?.signal }
    );
    return res.data;
  }

  async completeUpload(
    uploadId: string,
    parts: CompletedPart[],
    opts?: RequestOptions
  ): Promise<FileStorageCompleteResponseDTO> {
    const body: FileStorageCompleteDTO = { parts };
    const res = await this.axios.post<FileStorageCompleteResponseDTO>(
      PATH_COMPLETE(uploadId),
      body,
      { signal: opts?.signal }
    );
    return res.data;
  }

  /**
   * Best-effort abort with a 2s timeout. Never throws — callers (cancel paths,
   * `pagehide`) shouldn't be blocked by a failing cleanup call. The backend
   * relies on the S3 lifecycle rule `AbortIncompleteMultipartUpload` to
   * reclaim storage if this call doesn't reach the server.
   */
  async abortUpload(uploadId: string): Promise<void> {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 2000);
      try {
        await this.axios.delete(PATH_ABORT(uploadId), { signal: ctl.signal });
      } finally {
        clearTimeout(t);
      }
    } catch {
      // intentionally swallowed
    }
  }

  // ------------------------------------------------------------------------
  // Metadata + lifecycle.
  // ------------------------------------------------------------------------

  async getMetadata(
    fileReference: string,
    opts?: RequestOptions
  ): Promise<FileMetadataResponseDTO> {
    const res = await this.axios.get<FileMetadataResponseDTO>(
      PATH_METADATA(fileReference),
      { signal: opts?.signal }
    );
    return res.data;
  }

  /**
   * Soft-delete a file. Status flips to `DELETED`, bytes stay in the bucket,
   * preview/download return 404. There is intentionally no hard delete.
   */
  async softDelete(
    fileReference: string,
    opts?: RequestOptions
  ): Promise<void> {
    await this.axios.delete(PATH_SOFT_DELETE(fileReference), {
      signal: opts?.signal
    });
  }

  // ------------------------------------------------------------------------
  // Read URLs.
  // ------------------------------------------------------------------------

  async getPreviewUrl(
    fileReference: string,
    opts?: RequestOptions
  ): Promise<PreviewUrlResponse> {
    const res = await this.axios.get<PreviewUrlResponseDTO>(
      PATH_PREVIEW(fileReference),
      { signal: opts?.signal }
    );
    return res.data;
  }

  /**
   * Temporary shim: the swagger doesn't yet expose a JSON `/download-url`
   * endpoint mirroring `/preview-url` with `attachment` disposition. Until
   * backend adds it, we reuse the preview URL — relying on the `download`
   * attribute on the `<a>` element to trigger the download dialog rather
   * than the server-signed `Content-Disposition: attachment`.
   *
   * TODO(backend): GET /api/FileStorage/{fileReference}/download-url returning
   * { url, expiresAt } with `response-content-disposition=attachment` baked
   * into the signed URL. Then change this method to call that endpoint.
   */
  async getDownloadUrl(
    fileReference: string,
    opts?: RequestOptions
  ): Promise<DownloadUrlResponse> {
    const preview = await this.getPreviewUrl(fileReference, opts);
    return { url: preview.url, expiresAt: preview.expiresAt };
  }

  // ------------------------------------------------------------------------
  // High-level upload (UI default).
  // ------------------------------------------------------------------------

  async uploadFile(
    input: UploadFileInput
  ): Promise<FileStorageCompleteResponseDTO> {
    const { file, fileName, contentType, onProgress, signal, concurrency } =
      input;

    throwIfAborted(signal);

    const resolvedConcurrency = Math.min(
      MAX_PART_CONCURRENCY,
      Math.max(1, concurrency ?? DEFAULT_PART_CONCURRENCY)
    );
    const resolvedName =
      fileName ?? (file instanceof File ? file.name : 'file');
    const resolvedType =
      contentType ??
      (file instanceof File ? file.type : 'application/octet-stream');
    const hasher = this.hasherFactory();
    const progress = createProgressEmitter(file.size, onProgress);
    // Tracked outside the try so the catch can fire DELETE /api/FileStorage/{uploadId}
    // for cancelled / failed sessions. Without this the S3 multipart upload
    // lingers until the bucket lifecycle rule cleans it up.
    let activeUploadId: string | undefined;

    try {
      // 1. Compute the full-file hash up front. Server verifies on complete
      //    for single-shot uploads. Multipart uploads currently don't
      //    re-verify on the server (cost) but we still send the hash so the
      //    invariant is recoverable later.
      const sha256 = await hasher.hashFullFile(file, signal);

      // 2. Init the upload session.
      const init = await this.initUpload(
        {
          fileName: resolvedName,
          mimeType: resolvedType,
          size: file.size,
          sha256
        },
        { signal }
      );
      activeUploadId = init.uploadId;

      if (init.urls.length === 0) {
        throw new FileStorageError(
          'InvalidRequest',
          'init returned no presigned URLs'
        );
      }

      // 3. Single-shot path: one URL, partSize null.
      if (init.urls.length === 1 && init.partSize === null) {
        const etag = await putToS3({
          url: init.urls[0],
          body: file,
          contentType: resolvedType,
          signal,
          onProgress: loaded => progress.set(1, loaded)
        });
        progress.flush();
        return this.completeUpload(init.uploadId, [{ partNumber: 1, etag }], {
          signal
        });
      }

      // 4. Multipart path.
      if (init.partSize === null) {
        throw new FileStorageError(
          'InvalidRequest',
          'multipart init returned null partSize'
        );
      }
      const completed = await this.runMultipart({
        init: init as FileStorageInitResponseDTO & { partSize: number },
        file,
        contentType: resolvedType,
        concurrency: resolvedConcurrency,
        onPartLoaded: (partNumber, loaded) => progress.set(partNumber, loaded),
        signal
      });
      progress.flush();

      return this.completeUpload(init.uploadId, completed, { signal });
    } catch (err) {
      const normalized = normalizeError(err);
      // Fire-and-forget the server-side cleanup. `abortUpload` is best-effort
      // with its own 2s timeout and swallows errors, so this can't extend the
      // user-visible cancel latency or mask the real failure.
      if (activeUploadId) {
        void this.abortUpload(activeUploadId);
      }
      throw normalized;
    } finally {
      hasher.dispose();
    }
  }

  // ------------------------------------------------------------------------
  // Multipart orchestrator.
  // ------------------------------------------------------------------------

  private async runMultipart(args: {
    init: FileStorageInitResponseDTO & { partSize: number };
    file: Blob;
    contentType: string;
    concurrency: number;
    onPartLoaded: (partNumber: number, loaded: number) => void;
    signal?: AbortSignal;
  }): Promise<CompletedPart[]> {
    const { init, file, contentType, concurrency, onPartLoaded, signal } = args;

    const partCount = init.urls.length;
    // URLs are 0-indexed in `init.urls`; part numbers are 1-indexed.
    const urls = new Map<number, string>();
    for (let n = 1; n <= partCount; n++) urls.set(n, init.urls[n - 1]);

    // Single batch-wide expiry; refresh when we approach it.
    let batchExpiresAt = Date.parse(init.expiresAt);

    const refreshIfNeeded = async (partNumber: number): Promise<string> => {
      const url = urls.get(partNumber);
      if (!url) {
        const refreshed = await this.refreshUploadUrls(
          init.uploadId,
          [partNumber],
          { signal }
        );
        urls.set(partNumber, refreshed.urls[0]);
        batchExpiresAt = Date.parse(refreshed.expiresAt);
        return refreshed.urls[0];
      }
      // Proactive batch refresh: if within PROACTIVE_REFRESH_MS of expiry,
      // refresh all still-pending parts in one call.
      if (
        Number.isFinite(batchExpiresAt) &&
        batchExpiresAt - Date.now() < PROACTIVE_REFRESH_MS
      ) {
        const pending: number[] = [];
        for (let n = 1; n <= partCount; n++) {
          if (!completed.has(n)) pending.push(n);
        }
        if (pending.length > 0) {
          const refreshed = await this.refreshUploadUrls(
            init.uploadId,
            pending,
            { signal }
          );
          for (let i = 0; i < pending.length; i++) {
            urls.set(pending[i], refreshed.urls[i]);
          }
          batchExpiresAt = Date.parse(refreshed.expiresAt);
        }
      }
      return urls.get(partNumber)!;
    };

    const completed = new Map<number, CompletedPart>();
    const inFlight = new Set<number>();
    const queue: number[] = [];
    for (let n = 1; n <= partCount; n++) queue.push(n);

    const uploadOne = async (partNumber: number): Promise<void> => {
      const offset = (partNumber - 1) * init.partSize;
      const end = Math.min(offset + init.partSize, file.size);
      const partBlob = file.slice(offset, end);

      let attempt = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        throwIfAborted(signal);
        const url = await refreshIfNeeded(partNumber);
        try {
          const etag = await putToS3({
            url,
            body: partBlob,
            contentType,
            signal,
            onProgress: loaded => onPartLoaded(partNumber, loaded)
          });
          onPartLoaded(partNumber, partBlob.size);
          const entry: PartETag = { partNumber, etag };
          completed.set(partNumber, entry);
          return;
        } catch (err) {
          // Expired presigned URL — fetch a fresh one and retry without
          // counting the attempt.
          if (err instanceof FileStorageError && err.kind === 'Expired') {
            urls.delete(partNumber);
            continue;
          }
          if (
            err instanceof FileStorageError &&
            (err.kind === 'Aborted' || err.kind === 'Forbidden')
          ) {
            throw err;
          }
          if (attempt >= PER_PART_MAX_RETRIES) {
            throw err;
          }
          attempt += 1;
          const backoff = backoffDelayMs(attempt, err);
          await sleep(backoff, signal);
        }
      }
    };

    return new Promise<CompletedPart[]>((resolve, reject) => {
      let settled = false;
      const finish = (err?: unknown) => {
        if (settled) return;
        settled = true;
        if (err) reject(err);
        else {
          const out: CompletedPart[] = [];
          for (let n = 1; n <= partCount; n++) {
            const p = completed.get(n);
            if (!p) {
              reject(new Error(`Missing completed part ${n}`));
              return;
            }
            out.push(p);
          }
          resolve(out);
        }
      };

      const tryDispatch = () => {
        if (settled) return;
        while (inFlight.size < concurrency && queue.length > 0) {
          const next = queue.shift()!;
          inFlight.add(next);
          uploadOne(next).then(
            () => {
              inFlight.delete(next);
              if (queue.length === 0 && inFlight.size === 0) {
                finish();
              } else {
                tryDispatch();
              }
            },
            err => {
              inFlight.delete(next);
              finish(err);
            }
          );
        }
      };

      tryDispatch();
    });
  }
}

// ----------------------------------------------------------------------------
// Helpers (file-local).
// ----------------------------------------------------------------------------

interface PutToS3Args {
  url: string;
  body: Blob;
  contentType: string;
  signal?: AbortSignal;
  /**
   * Optional byte-progress for this single PUT. Note: native `fetch` doesn't
   * report upload progress; we approximate by emitting 0 at start and the
   * full size after success. Real per-byte progress would require XHR.
   */
  onProgress?: (loaded: number) => void;
}

/**
 * Single PUT to a presigned S3 URL via `fetch`. Returns the ETag.
 *
 * Maps fetch failures + S3 response codes to `FileStorageError` kinds so the
 * orchestrator can decide retry vs refresh vs terminal.
 */
async function putToS3(args: PutToS3Args): Promise<string> {
  const { url, body, contentType, signal, onProgress } = args;
  throwIfAborted(signal);
  onProgress?.(0);

  const headers: Record<string, string> = { 'Content-Type': contentType };

  let res: Response;
  try {
    res = await fetch(url, { method: 'PUT', body, headers, signal });
  } catch (err) {
    if (signal?.aborted) {
      throw new FileStorageError('Aborted', 'Upload aborted', { cause: err });
    }
    // `fetch` throws a TypeError on CORS / DNS / connection — indistinguishable.
    // Flag it as `CorsOrNetwork` so the message is useful during deployment.
    throw new FileStorageError(
      'CorsOrNetwork',
      'Network or CORS failure during S3 PUT — verify bucket CORS allows PUT + exposes ETag',
      { cause: err }
    );
  }

  if (!res.ok) {
    throw await s3ErrorFromResponse(res);
  }

  const etag = res.headers.get('ETag') ?? res.headers.get('etag');
  if (!etag) {
    // CORS forgot to expose ETag — backend infra issue, can't proceed.
    throw new FileStorageError(
      'CorsOrNetwork',
      'S3 PUT succeeded but ETag was not readable — bucket must set Access-Control-Expose-Headers: ETag'
    );
  }
  return etag.replace(/^"|"$/g, '');
}

/**
 * Map an S3 error response (XML or empty) to a `FileStorageError` kind.
 * 403 disambiguates between "expired URL" (retryable via refresh) and
 * "signature mismatch / other" (terminal).
 */
async function s3ErrorFromResponse(res: Response): Promise<FileStorageError> {
  let body = '';
  try {
    body = await res.text();
  } catch {
    /* ignore */
  }
  const codeMatch = body.match(/<Code>([^<]+)<\/Code>/);
  const code = codeMatch?.[1];

  if (res.status === 403) {
    if (
      code === 'AccessDenied' ||
      code === 'ExpiredToken' ||
      /expired/i.test(body)
    ) {
      return new FileStorageError('Expired', `S3 403: ${code ?? 'expired'}`);
    }
    return new FileStorageError('Forbidden', `S3 403: ${code ?? 'forbidden'}`);
  }
  if (res.status === 400) {
    if (code === 'BadDigest') {
      return new FileStorageError('BadDigest', 'S3 reported BadDigest');
    }
    return new FileStorageError(
      'InvalidRequest',
      `S3 400: ${code ?? 'invalid'}`
    );
  }
  if (res.status === 404) {
    return new FileStorageError('NotFound', 'S3 404');
  }
  if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
    const retryAfter = parseRetryAfter(res.headers.get('retry-after'));
    return new FileStorageError(
      res.status === 429 ? 'Throttled' : 'CorsOrNetwork',
      `S3 ${res.status}: ${code ?? 'transient'}`,
      { retryAfter }
    );
  }
  return new FileStorageError(
    'InvalidRequest',
    `S3 ${res.status}: ${code ?? 'unknown'}`
  );
}

function parseRetryAfter(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  if (Number.isFinite(n)) return n;
  const date = Date.parse(raw);
  if (!Number.isFinite(date)) return undefined;
  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

function backoffDelayMs(attempt: number, err: unknown): number {
  // Honor Retry-After on 429.
  if (err instanceof FileStorageError && err.retryAfter !== undefined) {
    return Math.min(err.retryAfter * 1000, 30_000);
  }
  // 500ms → 1s → 2s → 4s, capped, with ±25% jitter.
  const base = Math.min(500 * 2 ** (attempt - 1), 8000);
  const jitter = base * (Math.random() * 0.5 - 0.25);
  return Math.max(50, Math.round(base + jitter));
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new FileStorageError('Aborted', 'Aborted while backing off'));
    };
    if (signal) {
      if (signal.aborted) {
        clearTimeout(t);
        reject(new FileStorageError('Aborted', 'Aborted while backing off'));
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new FileStorageError('Aborted', 'Upload aborted');
  }
}

function normalizeError(err: unknown): unknown {
  if (err instanceof FileStorageError) return err;
  if (err instanceof DOMException && err.name === 'AbortError') {
    return new FileStorageError('Aborted', err.message, { cause: err });
  }
  return err;
}

/**
 * Aggregates per-part `loaded` byte counts into a single `(loaded, total)`
 * callback. Throttles emissions to ~10 Hz and enforces monotonicity so retry
 * bumps can't make the progress bar regress.
 */
function createProgressEmitter(
  total: number,
  onProgress?: (loaded: number, total: number) => void
) {
  if (!onProgress) {
    return {
      set: (_partNumber: number, _loaded: number) => {},
      flush: () => {}
    };
  }
  const perPart = new Map<number, number>();
  let lastEmitted = 0;
  let lastEmittedAt = 0;
  let pending = false;

  const emit = () => {
    pending = false;
    lastEmittedAt = Date.now();
    let sum = 0;
    for (const v of perPart.values()) sum += v;
    const next = Math.max(lastEmitted, Math.min(total, sum));
    lastEmitted = next;
    onProgress(next, total);
  };

  return {
    set(partNumber: number, loaded: number) {
      perPart.set(partNumber, loaded);
      const now = Date.now();
      if (now - lastEmittedAt >= 100) {
        emit();
      } else if (!pending) {
        pending = true;
        setTimeout(emit, 100 - (now - lastEmittedAt));
      }
    },
    flush() {
      emit();
    }
  };
}
