import { jest } from '@jest/globals';
import {
  MemoryTokenStorage,
  LocalStorageTokenStorage,
  SessionStorageTokenStorage,
  createTokenStorage,
  startCrossTabSync,
  AuthState
} from '../../src/core/token-storage';

const validState: AuthState = {
  token: 'access-token',
  refreshToken: 'refresh-token',
  user: { userUUID: 'user-123' } as any
};

const stateNoRefresh: AuthState = {
  token: 'access-token',
  refreshToken: null,
  user: null
};

// ---------------------------------------------------------------------------
// MemoryTokenStorage
// ---------------------------------------------------------------------------

describe('MemoryTokenStorage', () => {
  let storage: MemoryTokenStorage;

  beforeEach(() => {
    storage = new MemoryTokenStorage();
  });

  it('should return null when empty', () => {
    expect(storage.get()).toBeNull();
  });

  it('should store and retrieve state', () => {
    storage.set(validState);
    expect(storage.get()).toEqual(validState);
  });

  it('should discard state when refreshToken is null', () => {
    storage.set(validState);
    storage.set(stateNoRefresh);
    expect(storage.get()).toBeNull();
  });

  it('should clear state', () => {
    storage.set(validState);
    storage.clear();
    expect(storage.get()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// LocalStorageTokenStorage
// ---------------------------------------------------------------------------

describe('LocalStorageTokenStorage', () => {
  const KEY = 'test-key';
  let store: Record<string, string>;

  const makeMockStorage = () => ({
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; }
  });

  beforeEach(() => {
    store = {};
    const mock = makeMockStorage();
    Object.defineProperty(global, 'window', {
      value: { localStorage: mock },
      writable: true
    });
    // The source code accesses `localStorage` directly, so also set it on global
    (global as any).localStorage = mock;
  });

  afterEach(() => {
    delete (global as any).localStorage;
  });

  it('should return null when key does not exist', () => {
    const s = new LocalStorageTokenStorage(KEY);
    expect(s.get()).toBeNull();
  });

  it('should persist and read state via localStorage', () => {
    const s = new LocalStorageTokenStorage(KEY);
    s.set(validState);
    expect(JSON.parse(store[KEY])).toEqual(validState);
    expect(s.get()).toEqual(validState);
  });

  it('should remove key when refreshToken is falsy', () => {
    const s = new LocalStorageTokenStorage(KEY);
    s.set(validState);
    s.set(stateNoRefresh);
    expect(store[KEY]).toBeUndefined();
  });

  it('should handle corrupted JSON gracefully', () => {
    store[KEY] = '{bad json';
    const s = new LocalStorageTokenStorage(KEY);
    expect(s.get()).toBeNull();
    // corrupted entry should be removed
    expect(store[KEY]).toBeUndefined();
  });

  it('should clear the key', () => {
    const s = new LocalStorageTokenStorage(KEY);
    s.set(validState);
    s.clear();
    expect(store[KEY]).toBeUndefined();
  });

  it('should return null when window is undefined', () => {
    Object.defineProperty(global, 'window', { value: undefined, writable: true });
    const s = new LocalStorageTokenStorage(KEY);
    expect(s.get()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SessionStorageTokenStorage
// ---------------------------------------------------------------------------

describe('SessionStorageTokenStorage', () => {
  const KEY = 'session-key';
  let store: Record<string, string>;

  const makeMockStorage = () => ({
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; }
  });

  beforeEach(() => {
    store = {};
    const mock = makeMockStorage();
    Object.defineProperty(global, 'window', {
      value: { sessionStorage: mock },
      writable: true
    });
    (global as any).sessionStorage = mock;
  });

  afterEach(() => {
    delete (global as any).sessionStorage;
  });

  it('should store and retrieve state', () => {
    const s = new SessionStorageTokenStorage(KEY);
    s.set(validState);
    expect(s.get()).toEqual(validState);
  });

  it('should remove key when refreshToken is falsy', () => {
    const s = new SessionStorageTokenStorage(KEY);
    s.set(validState);
    s.set(stateNoRefresh);
    expect(store[KEY]).toBeUndefined();
  });

  it('should clear the key', () => {
    const s = new SessionStorageTokenStorage(KEY);
    s.set(validState);
    s.clear();
    expect(store[KEY]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// createTokenStorage factory
// ---------------------------------------------------------------------------

describe('createTokenStorage', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', { value: {}, writable: true });
  });

  it('should default to LocalStorageTokenStorage', () => {
    const s = createTokenStorage(undefined, 'k');
    expect(s).toBeInstanceOf(LocalStorageTokenStorage);
  });

  it('should return LocalStorageTokenStorage for "localStorage"', () => {
    const s = createTokenStorage('localStorage', 'k');
    expect(s).toBeInstanceOf(LocalStorageTokenStorage);
  });

  it('should return SessionStorageTokenStorage for "sessionStorage"', () => {
    const s = createTokenStorage('sessionStorage', 'k');
    expect(s).toBeInstanceOf(SessionStorageTokenStorage);
  });

  it('should return MemoryTokenStorage for "memory"', () => {
    const s = createTokenStorage('memory', 'k');
    expect(s).toBeInstanceOf(MemoryTokenStorage);
  });
});

// ---------------------------------------------------------------------------
// startCrossTabSync
// ---------------------------------------------------------------------------

describe('startCrossTabSync', () => {
  let listeners: Map<string, Function>;

  beforeEach(() => {
    listeners = new Map();
    Object.defineProperty(global, 'window', {
      value: {
        addEventListener: jest.fn((event: string, handler: Function) => {
          listeners.set(event, handler);
        }),
        removeEventListener: jest.fn((event: string) => {
          listeners.delete(event);
        })
      },
      writable: true
    });
  });

  it('should register a storage event listener', () => {
    const cb = jest.fn();
    startCrossTabSync('my-key', cb);
    expect(window.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });

  it('should return a cleanup function that removes the listener', () => {
    const cleanup = startCrossTabSync('my-key', jest.fn());
    cleanup();
    expect(window.removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });

  it('should ignore storage events for different keys', () => {
    const cb = jest.fn();
    startCrossTabSync('my-key', cb);
    const handler = listeners.get('storage')!;
    handler({ key: 'other-key', newValue: null } as StorageEvent);
    expect(cb).not.toHaveBeenCalled();
  });

  it('should call onExternalChange with null when newValue is null (logout)', () => {
    const cb = jest.fn();
    startCrossTabSync('my-key', cb);
    const handler = listeners.get('storage')!;
    handler({ key: 'my-key', newValue: null } as StorageEvent);
    expect(cb).toHaveBeenCalledWith(null);
  });

  it('should parse and forward valid state from another tab', () => {
    const cb = jest.fn();
    startCrossTabSync('my-key', cb);
    const handler = listeners.get('storage')!;
    handler({ key: 'my-key', newValue: JSON.stringify(validState) } as StorageEvent);
    expect(cb).toHaveBeenCalledWith(validState);
  });

  it('should not throw on malformed JSON in storage event', () => {
    const cb = jest.fn();
    startCrossTabSync('my-key', cb);
    const handler = listeners.get('storage')!;
    expect(() => handler({ key: 'my-key', newValue: '{bad' } as StorageEvent)).not.toThrow();
    expect(cb).not.toHaveBeenCalled();
  });

  it('should return noop when window is undefined (SSR)', () => {
    Object.defineProperty(global, 'window', { value: undefined, writable: true });
    const cleanup = startCrossTabSync('k', jest.fn());
    expect(cleanup).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });
});
