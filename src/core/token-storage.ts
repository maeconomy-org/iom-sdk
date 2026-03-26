import { AuthResponse } from '../types';
import { logInfo, logError } from './logger';

/**
 * Shape of the persisted auth state
 */
export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthResponse | null;
}

/**
 * Storage adapter interface — allows different persistence strategies
 */
export interface TokenStorage {
  /** Read the persisted auth state (returns null if nothing stored) */
  get(): AuthState | null;
  /** Persist the auth state */
  set(state: AuthState): void;
  /** Clear the persisted auth state */
  clear(): void;
}

// ---------------------------------------------------------------------------
// Implementations
// ---------------------------------------------------------------------------

/**
 * Stores auth state in localStorage (default, survives browser restart)
 */
export class LocalStorageTokenStorage implements TokenStorage {
  constructor(private readonly key: string) {}

  get(): AuthState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      return JSON.parse(raw) as AuthState;
    } catch {
      localStorage.removeItem(this.key);
      return null;
    }
  }

  set(state: AuthState): void {
    if (typeof window === 'undefined') return;
    if (state.refreshToken) {
      localStorage.setItem(this.key, JSON.stringify(state));
    } else {
      localStorage.removeItem(this.key);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.key);
  }
}

/**
 * Stores auth state in sessionStorage (cleared when tab closes)
 */
export class SessionStorageTokenStorage implements TokenStorage {
  constructor(private readonly key: string) {}

  get(): AuthState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(this.key);
      if (!raw) return null;
      return JSON.parse(raw) as AuthState;
    } catch {
      sessionStorage.removeItem(this.key);
      return null;
    }
  }

  set(state: AuthState): void {
    if (typeof window === 'undefined') return;
    if (state.refreshToken) {
      sessionStorage.setItem(this.key, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(this.key);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.key);
  }
}

/**
 * In-memory storage — tokens lost on page reload (useful for SSR / tests)
 */
export class MemoryTokenStorage implements TokenStorage {
  private state: AuthState | null = null;

  get(): AuthState | null {
    return this.state;
  }

  set(state: AuthState): void {
    this.state = state.refreshToken ? state : null;
  }

  clear(): void {
    this.state = null;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createTokenStorage(
  strategy: 'localStorage' | 'sessionStorage' | 'memory' | undefined,
  storageKey: string
): TokenStorage {
  switch (strategy) {
    case 'sessionStorage':
      return new SessionStorageTokenStorage(storageKey);
    case 'memory':
      return new MemoryTokenStorage();
    case 'localStorage':
    default:
      return new LocalStorageTokenStorage(storageKey);
  }
}

// ---------------------------------------------------------------------------
// Cross-tab sync (SDK-S2)
// ---------------------------------------------------------------------------

/**
 * Listen for auth state changes in other tabs via the `storage` event.
 * Only works with localStorage (sessionStorage is tab-scoped by design).
 *
 * @returns cleanup function to remove the listener
 */
export function startCrossTabSync(
  storageKey: string,
  onExternalChange: (state: AuthState | null) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key !== storageKey) return;

    if (!event.newValue) {
      // Another tab cleared the state (logout)
      logInfo('Cross-tab: auth state cleared in another tab');
      onExternalChange(null);
      return;
    }

    try {
      const state = JSON.parse(event.newValue) as AuthState;
      logInfo('Cross-tab: auth state updated in another tab');
      onExternalChange(state);
    } catch (err) {
      logError('Cross-tab: failed to parse storage event', err);
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
