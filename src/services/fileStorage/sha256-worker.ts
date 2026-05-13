/**
 * Seam for SHA-256 hashing.
 *
 * Today: delegates to the pure functions in `./sha256.ts` (runs on the main
 * thread). The orchestrator imports from this file so we can swap in a real
 * Web Worker without touching callers.
 *
 * Tomorrow: wrap a `new Worker(new URL('./sha256.worker.ts', import.meta.url))`
 * with a postMessage/RPC layer and expose the same surface. The consuming
 * bundler (Vite in the UI) will pick up the worker module automatically.
 *
 * Keeping the seam means orchestrator-level tests don't care which thread
 * the hashing runs on — they call `hashFullFile()` / `hashPart()` and get
 * the same Promise shape either way.
 */
import { sha256Hex, sha256Base64 } from './sha256';

export interface Sha256Hasher {
  /** Full-file SHA-256 as lowercase hex (for `InitUploadRequest.sha256`). */
  hashFullFile(blob: Blob, signal?: AbortSignal): Promise<string>;
  /** Per-part SHA-256 as base64 (for `x-amz-checksum-sha256` header). */
  hashPart(blob: Blob, signal?: AbortSignal): Promise<string>;
  /** Idempotent. Frees any worker resources when called. */
  dispose(): void;
}

class MainThreadSha256Hasher implements Sha256Hasher {
  hashFullFile(blob: Blob, signal?: AbortSignal): Promise<string> {
    return sha256Hex(blob, { signal });
  }
  hashPart(blob: Blob, signal?: AbortSignal): Promise<string> {
    return sha256Base64(blob, { signal });
  }
  dispose(): void {
    /* no-op until a real Worker is wired up */
  }
}

/**
 * Factory — returns a hasher implementation. Today always main-thread;
 * once the worker is wired up, this picks based on `typeof Worker`.
 */
export function createSha256Hasher(): Sha256Hasher {
  return new MainThreadSha256Hasher();
}
