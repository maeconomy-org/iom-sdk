/**
 * Jest global setup for SDK tests
 * Provides mocks for browser APIs and common utilities
 */

// Mock console methods to reduce noise in tests (can be re-enabled per test)
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Type definition for storage mock
interface StorageMock {
  store: Record<string, string>;
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
  length: number;
  key: jest.Mock;
}

// Create localStorage mock
function createStorageMock(): StorageMock {
  const store: Record<string, string> = {};

  return {
    store,
    getItem: jest.fn((key: string): string | null => store[key] || null),
    setItem: jest.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string): void => {
      delete store[key];
    }),
    clear: jest.fn((): void => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: jest.fn((): string | null => null)
  };
}

const localStorageMock = createStorageMock();
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

const sessionStorageMock = createStorageMock();
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// Mock File API
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  private content: unknown[];

  constructor(
    chunks: unknown[],
    filename: string,
    options: { type?: string } = {}
  ) {
    this.content = chunks;
    this.name = filename;
    this.type = options.type || '';
    this.size = chunks.reduce((size: number, chunk) => {
      if (typeof chunk === 'string') {
        return size + chunk.length;
      }
      if (chunk instanceof ArrayBuffer) {
        return size + chunk.byteLength;
      }
      return size;
    }, 0);
    this.lastModified = Date.now();
  }

  stream(): ReadableStream {
    return new ReadableStream();
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(this.size));
  }

  text(): Promise<string> {
    return Promise.resolve(
      this.content.filter((c): c is string => typeof c === 'string').join('')
    );
  }

  slice(): Blob {
    return new Blob();
  }
} as unknown as typeof File;

// Mock Blob API
global.Blob = class MockBlob {
  size: number;
  type: string;

  constructor(chunks: unknown[] = [], options: { type?: string } = {}) {
    this.type = options.type || '';
    this.size = chunks.reduce((size: number, chunk) => {
      if (typeof chunk === 'string') {
        return size + chunk.length;
      }
      if (chunk instanceof ArrayBuffer) {
        return size + chunk.byteLength;
      }
      return size;
    }, 0);
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(this.size));
  }

  text(): Promise<string> {
    return Promise.resolve('mock blob content');
  }

  stream(): ReadableStream {
    return new ReadableStream();
  }

  slice(): Blob {
    return new (global.Blob as typeof Blob)();
  }
} as unknown as typeof Blob;

// Mock FormData
global.FormData = class MockFormData {
  private data: Map<string, unknown> = new Map();

  append(name: string, value: unknown): void {
    this.data.set(name, value);
  }

  get(name: string): unknown {
    return this.data.get(name);
  }

  has(name: string): boolean {
    return this.data.has(name);
  }

  delete(name: string): void {
    this.data.delete(name);
  }

  entries(): IterableIterator<[string, unknown]> {
    return this.data.entries();
  }

  keys(): IterableIterator<string> {
    return this.data.keys();
  }

  values(): IterableIterator<unknown> {
    return this.data.values();
  }

  forEach(
    callback: (value: unknown, key: string, parent: FormData) => void
  ): void {
    this.data.forEach((value, key) =>
      callback(value, key, this as unknown as FormData)
    );
  }
} as unknown as typeof FormData;

// Mock Headers
global.Headers = class MockHeaders {
  private headers: Map<string, string> = new Map();

  constructor(init?: Record<string, string> | Headers) {
    if (init) {
      if (init instanceof Map) {
        init.forEach((value, key) => this.set(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.set(key, value);
        });
      }
    }
  }

  append(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  delete(name: string): void {
    this.headers.delete(name.toLowerCase());
  }

  entries(): IterableIterator<[string, string]> {
    return this.headers.entries();
  }

  keys(): IterableIterator<string> {
    return this.headers.keys();
  }

  values(): IterableIterator<string> {
    return this.headers.values();
  }

  forEach(
    callback: (value: string, key: string, parent: Headers) => void
  ): void {
    this.headers.forEach((value, key) =>
      callback(value, key, this as unknown as Headers)
    );
  }
} as unknown as typeof Headers;

// Mock btoa/atob for Node.js environment
if (typeof btoa === 'undefined') {
  global.btoa = (str: string): string => Buffer.from(str).toString('base64');
}

if (typeof atob === 'undefined') {
  global.atob = (str: string): string => Buffer.from(str, 'base64').toString();
}

// Export for use in tests
export {};
