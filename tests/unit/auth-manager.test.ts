/**
 * Comprehensive tests for AuthManager
 * Tests JWT token management, authentication, and token refresh
 */

import { AuthManager } from '../../src/core/auth-manager';
import { TokenStorage } from '../../src/core/token-storage';
import { SDKConfig } from '../../src/config';
import { JWTAuthResponse, JWTToken } from '../../src/types';

describe('AuthManager', () => {
  let mockConfig: SDKConfig;
  let mockLoginFunction: jest.Mock<Promise<JWTAuthResponse>>;
  let mockTokenStorage: jest.Mocked<TokenStorage>;
  let authManager: AuthManager;

  // Helper to create a valid token
  const createValidToken = (expiresInMs: number = 3600000): JWTToken => ({
    token: 'valid-jwt-token',
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + expiresInMs)
  });

  // Helper to create an expired token
  const createExpiredToken = (): JWTToken => ({
    token: 'expired-jwt-token',
    issuedAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() - 3600000)
  });

  beforeEach(() => {
    jest.useFakeTimers();

    mockConfig = {
      auth: { baseUrl: 'https://auth.test.com' },
      registry: { baseUrl: 'https://registry.test.com' },
      node: { baseUrl: 'https://api.test.com' },
      certificate: { cert: 'test-cert', key: 'test-key' }
    };

    mockLoginFunction = jest.fn().mockResolvedValue({
      token: 'new-jwt-token',
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer'
    });

    mockTokenStorage = {
      getToken: jest.fn().mockResolvedValue(null),
      setToken: jest.fn().mockResolvedValue(undefined),
      removeToken: jest.fn().mockResolvedValue(undefined),
      isAvailable: jest.fn().mockReturnValue(true)
    };

    authManager = new AuthManager(
      mockConfig,
      mockLoginFunction,
      mockTokenStorage,
      { refreshThresholdMinutes: 5, maxRetries: 3, retryDelayMs: 100 }
    );
  });

  afterEach(() => {
    authManager.destroy();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should initialize from stored token if valid', async () => {
      const validToken = createValidToken();
      mockTokenStorage.getToken.mockResolvedValue(validToken);

      // Create new auth manager to trigger initialization
      const newAuthManager = new AuthManager(
        mockConfig,
        mockLoginFunction,
        mockTokenStorage
      );

      // Wait for async initialization
      await Promise.resolve();
      jest.runAllTimers();

      expect(mockTokenStorage.getToken).toHaveBeenCalled();
      newAuthManager.destroy();
    });

    it('should not use expired stored token', async () => {
      const expiredToken = createExpiredToken();
      mockTokenStorage.getToken.mockResolvedValue(expiredToken);

      const token = await authManager.getValidToken();

      // Should have performed new login
      expect(mockLoginFunction).toHaveBeenCalled();
      expect(token).toBe('new-jwt-token');
    });

    it('should return cached token if still valid', async () => {
      // First call to get token
      await authManager.getValidToken();
      expect(mockLoginFunction).toHaveBeenCalledTimes(1);

      // Second call should use cached token
      const token = await authManager.getValidToken();
      expect(mockLoginFunction).toHaveBeenCalledTimes(1);
      expect(token).toBe('new-jwt-token');
    });

    it('should store token after successful authentication', async () => {
      await authManager.getValidToken();

      expect(mockTokenStorage.setToken).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'new-jwt-token'
        })
      );
    });

    it('should clear token on clearToken call', async () => {
      await authManager.getValidToken();
      await authManager.clearToken();

      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
      expect(authManager.isAuthenticated()).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should authenticate and return token on first call', async () => {
      const token = await authManager.authenticate();

      expect(mockLoginFunction).toHaveBeenCalled();
      expect(token).not.toBeNull();
      expect(token?.token).toBe('new-jwt-token');
    });

    it('should handle authentication failure gracefully', async () => {
      mockLoginFunction.mockRejectedValue(new Error('Auth failed'));

      const token = await authManager.authenticate();

      expect(token).toBeNull();
      expect(authManager.isAuthenticated()).toBe(false);
      expect(authManager.getAuthState().lastAuthError).toBe('Auth failed');
    });

    it('should update auth state on successful authentication', async () => {
      await authManager.authenticate();

      expect(authManager.isAuthenticated()).toBe(true);
      const state = authManager.getAuthState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBeDefined();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token when calling refreshToken method', async () => {
      // First auth succeeds
      await authManager.getValidToken();
      expect(mockLoginFunction).toHaveBeenCalledTimes(1);

      // Explicitly call refresh
      await authManager.refreshToken();

      // Should have called login again for refresh
      expect(mockLoginFunction).toHaveBeenCalledTimes(2);
    });

    it('should return new token on successful refresh', async () => {
      // First auth
      const token1 = await authManager.getValidToken();
      expect(token1).toBe('new-jwt-token');

      // Setup different token for refresh
      mockLoginFunction.mockResolvedValueOnce({
        token: 'refreshed-jwt-token',
        expiresIn: 3600,
        tokenType: 'Bearer'
      });

      // Refresh
      const refreshed = await authManager.refreshToken();

      expect(refreshed?.token).toBe('refreshed-jwt-token');
    });

    it('should not trigger multiple concurrent refresh calls', async () => {
      // Get initial token
      await authManager.getValidToken();

      // Make login slow
      mockLoginFunction.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  token: 'slow-token',
                  expiresIn: 3600,
                  tokenType: 'Bearer'
                }),
              1000
            )
          )
      );

      // Trigger multiple refresh calls
      const promise1 = authManager.refreshToken();
      const promise2 = authManager.refreshToken();
      const promise3 = authManager.refreshToken();

      jest.advanceTimersByTime(1000);

      await Promise.all([promise1, promise2, promise3]);

      // Should only call login once
      expect(mockLoginFunction).toHaveBeenCalledTimes(2); // 1 initial + 1 refresh
    });

    it('should handle authentication failure', async () => {
      // Make login fail
      mockLoginFunction.mockRejectedValue(new Error('Auth failed'));

      // Try to authenticate
      const token = await authManager.authenticate();

      expect(token).toBeNull();
      expect(authManager.isAuthenticated()).toBe(false);
      expect(authManager.getAuthState().lastAuthError).toBe('Auth failed');
    });
  });

  describe('Token Validation', () => {
    it('should correctly identify valid token', async () => {
      await authManager.authenticate();
      expect(authManager.isAuthenticated()).toBe(true);
    });

    it('should correctly identify expired token', async () => {
      await authManager.authenticate();

      // Advance time past token expiry
      jest.advanceTimersByTime(4 * 60 * 60 * 1000); // 4 hours

      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('should invalidate token when requested', async () => {
      await authManager.authenticate();
      authManager.invalidateToken();

      // Token should be marked as expired
      expect(authManager.isAuthenticated()).toBe(false);
    });
  });

  describe('Auth State', () => {
    it('should return immutable auth state', async () => {
      await authManager.authenticate();

      const state1 = authManager.getAuthState();
      const state2 = authManager.getAuthState();

      // Should be different object references
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should track refreshing state correctly', async () => {
      await authManager.authenticate();

      // Start a slow refresh
      mockLoginFunction.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({ token: 'new', expiresIn: 3600, tokenType: 'Bearer' }),
              1000
            )
          )
      );

      const refreshPromise = authManager.refreshToken();

      // Check refreshing state
      expect(authManager.getAuthState().isRefreshing).toBe(true);

      jest.advanceTimersByTime(1000);
      await refreshPromise;

      expect(authManager.getAuthState().isRefreshing).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cancel scheduled refresh on destroy', async () => {
      await authManager.authenticate();
      authManager.destroy();

      // Advance time past refresh threshold
      jest.advanceTimersByTime(60 * 60 * 1000);

      // Should not have triggered additional login
      expect(mockLoginFunction).toHaveBeenCalledTimes(1);
    });
  });
});
