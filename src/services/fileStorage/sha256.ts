/**
 * Streaming SHA-256 for file uploads.
 *
 * Two output encodings are needed:
 *   - **hex** for the full-file `sha256` field in `InitUploadRequest`.
 *   - **base64** for the per-part `x-amz-checksum-sha256` header that S3
 *     validates against during PUT.
 *
 * Implementation is split so it can be tested in Jest (Node) without a Worker:
 *   - `sha256Hex(blob)` and `sha256Base64(blob)` are pure functions.
 *   - `Sha256Worker` (in `./sha256-worker.ts`) is a thin postMessage wrapper
 *     that delegates to these so a real browser pushes the hashing off the
 *     main thread. Skeleton callers can use the pure path directly until
 *     the orchestrator wires the worker in.
 *
 * `hash-wasm` is preferred over `crypto.subtle.digest` because:
 *   - `crypto.subtle.digest` requires the *whole* input as one `BufferSource`,
 *     so a 1 GB file needs 1 GB resident before hashing starts.
 *   - `hash-wasm` exposes an incremental hasher we feed 1 MB chunks into.
 *     Peak memory stays at the chunk size + a small hash state.
 */
import { createSHA256 } from 'hash-wasm';

/** Chunk size for streaming hash — small enough to keep peak memory low. */
const HASH_CHUNK_BYTES = 1 * 1024 * 1024; // 1 MiB

/**
 * Hash a Blob to lowercase hex.
 *
 * Reads the blob in 1 MiB chunks. The `AbortSignal` is honored between chunks;
 * mid-chunk aborts wait for the active read to settle (cheap — chunks are 1 MiB).
 */
export async function sha256Hex(
  blob: Blob,
  options?: { signal?: AbortSignal }
): Promise<string> {
  return computeDigest(blob, 'hex', options?.signal);
}

/**
 * Hash a Blob to base64 (the encoding S3 expects in `x-amz-checksum-sha256`).
 *
 * `hash-wasm` returns hex; we convert at the end. Cheaper than a separate
 * binary digest because the final digest is only 32 bytes.
 */
export async function sha256Base64(
  blob: Blob,
  options?: { signal?: AbortSignal }
): Promise<string> {
  const hex = await computeDigest(blob, 'hex', options?.signal);
  return hexToBase64(hex);
}

async function computeDigest(
  blob: Blob,
  encoding: 'hex',
  signal?: AbortSignal
): Promise<string> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const hasher = await createSHA256();
  hasher.init();

  const size = blob.size;
  for (let offset = 0; offset < size; offset += HASH_CHUNK_BYTES) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    const end = Math.min(offset + HASH_CHUNK_BYTES, size);
    const chunk = blob.slice(offset, end);
    const buf = new Uint8Array(await chunk.arrayBuffer());
    hasher.update(buf);
  }

  // Encoding is fixed at hex for now — base64 is derived from hex above.
  void encoding;
  return hasher.digest('hex');
}

/** Convert a hex string (any case) to base64 without intermediate allocations. */
export function hexToBase64(hex: string): string {
  if (hex.length % 2 !== 0) {
    throw new Error(`hexToBase64: odd-length hex string (len=${hex.length})`);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  // btoa needs a binary string. Node ≥16 has globalThis.btoa.
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa !== 'undefined'
    ? btoa(binary)
    : Buffer.from(bytes).toString('base64');
}
