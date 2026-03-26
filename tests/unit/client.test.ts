import { jest } from '@jest/globals';
import { createClient } from '../../src/client';
import { SDKConfig } from '../../src/config';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

describe('Client', () => {
  const config: SDKConfig = {
    auth: { baseUrl: 'https://auth.example.com' },
    registry: { baseUrl: 'https://registry.example.com' },
    node: { baseUrl: 'https://node.example.com' }
  };

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: localStorageMock,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      },
      writable: true
    });
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('should initialize with valid config', () => {
      const client = createClient(config);
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.registry).toBeDefined();
      expect(client.node).toBeDefined();
    });

    it('should load state from localStorage in browser', () => {
      // Create a non-expired token (expires in 1 hour)
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const tokenPayload = JSON.stringify({ exp, userUUID: 'user-123' });
      const token = `header.${btoa(tokenPayload)}.signature`;

      const mockState = {
        token: token,
        refreshToken: 'refresh-token-123',
        user: { userUUID: 'user-123' }
      };

      localStorageMock.setItem('iom-auth-state', JSON.stringify(mockState));

      const client = createClient(config);
      expect(client.getToken()).toBe(token);
      expect(client.getUser()).toEqual(mockState.user);
      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('auth state management', () => {
    it('should notify listeners on auth state change', () => {
      const client = createClient(config);
      const listener = jest.fn();

      client.onAuthStateChange(listener);

      // Initial call on subscribe
      expect(listener).toHaveBeenCalledWith({
        isAuthenticated: false,
        user: null,
        isRefreshing: false
      });

      // Simulate logout (even if already out)
      client.logout();
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should clear state on logout', () => {
      const client = createClient(config);

      // Mock some internal state
      (client as any).token = 'token';
      (client as any).refreshToken = 'refresh-token';
      (client as any).user = { uuid: '123' };

      client.logout();

      expect(client.getToken()).toBeNull();
      expect(client.getUser()).toBeNull();
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('token expiry checking', () => {
    it('should reject expired tokens', async () => {
      // Create an expired token
      const exp = Math.floor(Date.now() / 1000) - 3600; // expired 1 hour ago
      const tokenPayload = JSON.stringify({ exp, userUUID: 'user-123' });
      const expiredToken = `header.${btoa(tokenPayload)}.signature`;

      const mockState = {
        token: expiredToken,
        user: { userUUID: 'user-123' }
      };

      localStorageMock.setItem('iom-auth-state', JSON.stringify(mockState));

      const client = createClient(config);

      await client.getValidToken();

      // Should auto-logout expired token after validation
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getToken()).toBeNull();
    });

    it('should accept valid tokens', () => {
      // Create a valid token
      const exp = Math.floor(Date.now() / 1000) + 3600; // expires in 1 hour
      const tokenPayload = JSON.stringify({ exp, userUUID: 'user-123' });
      const validToken = `header.${btoa(tokenPayload)}.signature`;

      const mockState = {
        token: validToken,
        refreshToken: 'refresh-token-123',
        user: { userUUID: 'user-123' }
      };

      localStorageMock.setItem('iom-auth-state', JSON.stringify(mockState));

      const client = createClient(config);
      expect(client.isAuthenticated()).toBe(true);
      expect(client.getToken()).toBe(validToken);
    });
  });

  describe('tokenStorage config', () => {
    it('should skip cross-tab sync for memory storage', () => {
      const client = createClient({ ...config, tokenStorage: 'memory' });
      // addEventListener should NOT be called for memory storage
      expect(window.addEventListener).not.toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    it('should skip cross-tab sync for sessionStorage', () => {
      (global as any).sessionStorage = localStorageMock;
      const client = createClient({ ...config, tokenStorage: 'sessionStorage' });
      expect(window.addEventListener).not.toHaveBeenCalled();
      expect(client).toBeDefined();
      delete (global as any).sessionStorage;
    });

    it('should enable cross-tab sync for localStorage (default)', () => {
      const client = createClient(config);
      expect(window.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(client).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('should clean up cross-tab sync listener', () => {
      const client = createClient(config);
      client.destroy();
      expect(window.removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    });

    it('should be safe to call destroy multiple times', () => {
      const client = createClient(config);
      client.destroy();
      expect(() => client.destroy()).not.toThrow();
    });
  });

  describe('onAuthStateChange unsubscribe', () => {
    it('should stop notifying after unsubscribe', () => {
      const client = createClient(config);
      const listener = jest.fn();

      const unsubscribe = client.onAuthStateChange(listener);
      // 1 call on subscribe
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      client.logout();
      // still 1 — no more calls after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('getValidToken edge cases', () => {
    it('should return null when no token and no refresh token', async () => {
      const client = createClient(config);
      const result = await client.getValidToken();
      expect(result).toBeNull();
    });

    it('should return token directly when not expired', async () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const tokenPayload = JSON.stringify({ exp, userUUID: 'user-123' });
      const validToken = `header.${btoa(tokenPayload)}.signature`;

      localStorageMock.setItem(
        'iom-auth-state',
        JSON.stringify({
          token: validToken,
          refreshToken: 'refresh-token',
          user: { userUUID: 'user-123' }
        })
      );

      const client = createClient(config);
      const result = await client.getValidToken();
      expect(result).toBe(validToken);
    });
  });
});
