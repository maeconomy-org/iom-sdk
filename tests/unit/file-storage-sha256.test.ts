import {
  sha256Hex,
  sha256Base64,
  hexToBase64
} from '../../src/services/fileStorage/sha256';

/**
 * Note on test fixtures:
 *
 * Real `Blob.prototype.arrayBuffer()` in Node interacts badly with hash-wasm's
 * WASM heap under Jest+ts-jest's ESM transform — the bytes get corrupted on
 * the way into the WASM. In the browser this works fine. To keep the unit
 * tests deterministic without rewriting the SDK for one environment, we use
 * a `FakeBlob` that mirrors the slice/arrayBuffer surface with bytes backed
 * by an ordinary `Uint8Array` we constructed via `TextEncoder` — that path
 * exercises the streaming chunk loop without hitting the interop bug.
 *
 * The vector-correctness assertion (does hash-wasm produce the canonical
 * digest for "hello"?) is covered indirectly: if the chunked loop produces
 * the right digest for *any* input, the hashing is wired correctly.
 */
class FakeBlob {
  constructor(private bytes: Uint8Array) {}
  get size(): number {
    return this.bytes.byteLength;
  }
  slice(start = 0, end = this.bytes.byteLength): FakeBlob {
    return new FakeBlob(this.bytes.subarray(start, end));
  }
  async arrayBuffer(): Promise<ArrayBuffer> {
    // Return a fresh, contiguous ArrayBuffer so hash-wasm sees correct bytes.
    const copy = new Uint8Array(this.bytes.byteLength);
    copy.set(this.bytes);
    return copy.buffer;
  }
}

const HELLO_HEX =
  '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
const HELLO_B64 = 'LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=';
const EMPTY_HEX =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

function fakeBlob(payload: string | Uint8Array): Blob {
  const bytes =
    typeof payload === 'string' ? new TextEncoder().encode(payload) : payload;
  return new FakeBlob(bytes) as unknown as Blob;
}

describe('sha256Hex', () => {
  it('hashes "hello" to the canonical SHA-256 hex', async () => {
    expect(await sha256Hex(fakeBlob('hello'))).toBe(HELLO_HEX);
  });

  it('hashes an empty blob to the canonical empty-input digest', async () => {
    expect(await sha256Hex(fakeBlob(''))).toBe(EMPTY_HEX);
  });

  it('hashes a multi-MiB blob (crosses the 1 MiB chunk boundary)', async () => {
    // 2.5 MiB of 0x41 ("A").
    const buf = new Uint8Array(Math.floor(2.5 * 1024 * 1024));
    buf.fill(0x41);
    const hex = await sha256Hex(fakeBlob(buf));
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
    // Sanity: two runs over the same input agree (no shared-state leak).
    expect(await sha256Hex(fakeBlob(buf))).toBe(hex);
  });

  it('honors AbortSignal between chunks', async () => {
    const buf = new Uint8Array(3 * 1024 * 1024);
    const ctl = new AbortController();
    ctl.abort();
    await expect(
      sha256Hex(fakeBlob(buf), { signal: ctl.signal })
    ).rejects.toBeInstanceOf(DOMException);
  });
});

describe('sha256Base64', () => {
  it('returns the base64 of the hex digest', async () => {
    expect(await sha256Base64(fakeBlob('hello'))).toBe(HELLO_B64);
  });
});

describe('hexToBase64', () => {
  it('round-trips the hello digest', () => {
    expect(hexToBase64(HELLO_HEX)).toBe(HELLO_B64);
  });

  it('throws on odd-length input', () => {
    expect(() => hexToBase64('abc')).toThrow(/odd-length/);
  });
});
