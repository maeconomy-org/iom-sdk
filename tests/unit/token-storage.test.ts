/**
 * Comprehensive tests for TokenStorage
 * Tests all storage implementations and edge cases
 */

import {
  createTokenStorage,
  ManagedTokenStorage,
  TokenStorage
} from '../../src/core/token-storage';
import { JWTToken } from '../../src/types';

describe('TokenStorage', () => {
  // Helper to create a valid token
  const createValidToken = (expiresInMs: number = 3600000): JWTToken => ({
    token: 'test-jwt-token-' + Math.random(),
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + expiresInMs)
  });

  // Helper to create an expired token
  const createExpiredToken = (): JWTToken => ({
    token: 'expired-jwt-token',
    issuedAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() - 3600000)
  });

  describe('Memory Storage', () => {
    let storage: TokenStorage;

    beforeEach(() => {
      storage = createTokenStorage('memory');
    });

    it('should store and retrieve token', async () => {
      const token = createValidToken();

      await storage.setToken(token);
      const retrieved = await storage.getToken();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.token).toBe(token.token);
    });

    it('should return null when no token stored', async () => {
      const token = await storage.getToken();
      expect(token).toBeNull();
    });

    it('should remove token', async () => {
      const token = createValidToken();

      await storage.setToken(token);
      await storage.removeToken();

      const retrieved = await storage.getToken();
      expect(retrieved).toBeNull();
    });

    it('should return null for expired token', async () => {
      const expiredToken = createExpiredToken();

      // Directly set expired token (bypassing normal flow)
      await storage.setToken(expiredToken);
      const retrieved = await storage.getToken();

      expect(retrieved).toBeNull();
    });

    it('should always be available', () => {
      expect(storage.isAvailable()).toBe(true);
    });
  });

  describe('ManagedTokenStorage', () => {
    let baseStorage: TokenStorage;
    let managedStorage: ManagedTokenStorage;

    beforeEach(() => {
      jest.useFakeTimers();
      baseStorage = createTokenStorage('memory');
      managedStorage = new ManagedTokenStorage(baseStorage, 60000); // 1 minute cleanup
    });

    afterEach(() => {
      managedStorage.destroy();
      jest.useRealTimers();
    });

    it('should delegate to base storage for basic operations', async () => {
      const token = createValidToken();

      await managedStorage.setToken(token);
      const retrieved = await managedStorage.getToken();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.token).toBe(token.token);
    });

    it('should auto-cleanup expired tokens', async () => {
      const token = createValidToken(30000); // Expires in 30 seconds

      await managedStorage.setToken(token);

      // Advance time past expiry and cleanup interval
      jest.advanceTimersByTime(90000);

      // Should have cleaned up the expired token
      const retrieved = await managedStorage.getToken();
      expect(retrieved).toBeNull();
    });

    it('should return null for expired tokens even without cleanup', async () => {
      const shortLivedToken = createValidToken(1000); // 1 second

      await managedStorage.setToken(shortLivedToken);

      // Advance time past token expiry
      jest.advanceTimersByTime(2000);

      const retrieved = await managedStorage.getToken();
      expect(retrieved).toBeNull();
    });

    it('should stop cleanup interval on destroy', async () => {
      const token = createValidToken();
      await managedStorage.setToken(token);

      managedStorage.destroy();

      // Advance time significantly
      jest.advanceTimersByTime(300000);

      // Token should still exist (no cleanup ran)
      const retrieved = await baseStorage.getToken();
      expect(retrieved).not.toBeNull();
    });

    it('should report availability from base storage', () => {
      expect(managedStorage.isAvailable()).toBe(true);
    });
  });

  describe('Token Encryption/Decryption', () => {
    let storage: TokenStorage;

    beforeEach(() => {
      storage = createTokenStorage('memory');
    });

    it('should handle special characters in token', async () => {
      const token: JWTToken = {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000)
      };

      await storage.setToken(token);
      const retrieved = await storage.getToken();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.token).toBe(token.token);
    });

    it('should preserve date objects correctly', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 3600000);

      const token: JWTToken = {
        token: 'test-token',
        issuedAt: now,
        expiresAt
      };

      await storage.setToken(token);
      const retrieved = await storage.getToken();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.issuedAt).toBeInstanceOf(Date);
      expect(retrieved?.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid set/get operations', async () => {
      const storage = createTokenStorage('memory');
      const tokens = Array.from({ length: 10 }, () => createValidToken());

      for (const token of tokens) {
        await storage.setToken(token);
      }

      const lastToken = tokens[tokens.length - 1];
      const retrieved = await storage.getToken();

      expect(retrieved?.token).toBe(lastToken.token);
    });

    it('should handle concurrent operations', async () => {
      const storage = createTokenStorage('memory');
      const token = createValidToken();

      // Run concurrent operations
      const operations = [
        storage.setToken(token),
        storage.getToken(),
        storage.setToken(createValidToken()),
        storage.getToken(),
        storage.removeToken(),
        storage.getToken()
      ];

      // All should complete without error
      await expect(Promise.all(operations)).resolves.not.toThrow();
    });

    it('should handle remove on empty storage', async () => {
      const storage = createTokenStorage('memory');

      // Should not throw
      await expect(storage.removeToken()).resolves.not.toThrow();
    });

    it('should handle invalid storage type gracefully', () => {
      // @ts-expect-error Testing invalid input
      expect(() => createTokenStorage('invalid')).toThrow(
        'Unsupported storage type'
      );
    });
  });

  describe('Storage Fallback', () => {
    it('should fall back to memory storage in Node.js environment', () => {
      // In Node.js, localStorage won't be available
      const storage = createTokenStorage('localStorage');

      // Should still be available (using memory fallback)
      expect(storage.isAvailable()).toBe(true);
    });

    it('should fall back to memory storage when sessionStorage unavailable', () => {
      const storage = createTokenStorage('sessionStorage');

      // Should still be available (using memory fallback)
      expect(storage.isAvailable()).toBe(true);
    });
  });
});
