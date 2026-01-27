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
      value: { localStorage: localStorageMock },
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
});
