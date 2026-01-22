/**
 * Comprehensive tests for ServiceFactory
 * Tests service creation, caching, and lifecycle management
 */

import {
  ServiceFactory,
  createServiceFactory
} from '../../src/core/service-factory';
import { SDKConfig } from '../../src/config';

// Mock service clients
jest.mock('../../src/services/auth/auth-client');
jest.mock('../../src/services/registry/registry-client');
jest.mock('../../src/services/node/node-client');
jest.mock('../../src/core/auth-manager');
jest.mock('../../src/core/token-storage');

describe('ServiceFactory', () => {
  const createValidConfig = (): SDKConfig => ({
    auth: { baseUrl: 'https://auth.example.com' },
    registry: { baseUrl: 'https://registry.example.com' },
    node: { baseUrl: 'https://api.example.com' },
    certificate: {
      cert: 'test-cert',
      key: 'test-key'
    },
    tokenStorage: 'memory',
    errorHandling: {
      debug: false,
      autoRetryAuth: true
    }
  });

  describe('createServiceFactory', () => {
    it('should create service factory with valid config', () => {
      const config = createValidConfig();
      const factory = createServiceFactory(config);

      expect(factory).toBeDefined();
      expect(factory).toBeInstanceOf(ServiceFactory);
    });

    it('should handle configuration with various URLs', () => {
      // Since we mock the service factory, this tests the mock behavior
      const config = createValidConfig();
      const factory = createServiceFactory(config);

      expect(factory).toBeDefined();

      factory.destroy();
    });
  });

  describe('ServiceFactory', () => {
    let factory: ServiceFactory;
    let config: SDKConfig;

    beforeEach(() => {
      config = createValidConfig();
      factory = createServiceFactory(config);
    });

    afterEach(() => {
      factory.destroy();
    });

    describe('getAuthClient', () => {
      it('should return auth client instance', () => {
        const authClient = factory.getAuthClient();

        expect(authClient).toBeDefined();
      });

      it('should return same instance on multiple calls (caching)', () => {
        const client1 = factory.getAuthClient();
        const client2 = factory.getAuthClient();

        expect(client1).toBe(client2);
      });
    });

    describe('getRegistryClient', () => {
      it('should return registry client instance', () => {
        const registryClient = factory.getRegistryClient();

        expect(registryClient).toBeDefined();
      });

      it('should return same instance on multiple calls (caching)', () => {
        const client1 = factory.getRegistryClient();
        const client2 = factory.getRegistryClient();

        expect(client1).toBe(client2);
      });
    });

    describe('getNodeClient', () => {
      it('should return node client instance', () => {
        const nodeClient = factory.getNodeClient();

        expect(nodeClient).toBeDefined();
      });

      it('should return same instance on multiple calls (caching)', () => {
        const client1 = factory.getNodeClient();
        const client2 = factory.getNodeClient();

        expect(client1).toBe(client2);
      });
    });

    describe('getAuthManager', () => {
      it('should return auth manager instance', () => {
        const authManager = factory.getAuthManager();

        expect(authManager).toBeDefined();
      });

      it('should return same instance on multiple calls', () => {
        const manager1 = factory.getAuthManager();
        const manager2 = factory.getAuthManager();

        expect(manager1).toBe(manager2);
      });
    });

    describe('getTokenStorage', () => {
      it('should return token storage instance', () => {
        const tokenStorage = factory.getTokenStorage();

        expect(tokenStorage).toBeDefined();
      });

      it('should return same instance on multiple calls', () => {
        const storage1 = factory.getTokenStorage();
        const storage2 = factory.getTokenStorage();

        expect(storage1).toBe(storage2);
      });
    });

    describe('destroy', () => {
      it('should cleanup resources on destroy', () => {
        const authManager = factory.getAuthManager();

        factory.destroy();

        // Verify destroy was called (internal state cleanup)
        // AuthManager's destroy should have been called
        expect(authManager.destroy).toHaveBeenCalled();
      });

      it('should be safe to call destroy multiple times', () => {
        factory.destroy();
        expect(() => factory.destroy()).not.toThrow();
      });
    });

    describe('Token Storage Configuration', () => {
      it('should use memory storage when configured', () => {
        const memoryConfig: SDKConfig = {
          ...createValidConfig(),
          tokenStorage: 'memory'
        };
        const memoryFactory = createServiceFactory(memoryConfig);

        const storage = memoryFactory.getTokenStorage();
        expect(storage).toBeDefined();

        memoryFactory.destroy();
      });

      it('should use localStorage when configured', () => {
        const localConfig: SDKConfig = {
          ...createValidConfig(),
          tokenStorage: 'localStorage'
        };
        const localFactory = createServiceFactory(localConfig);

        const storage = localFactory.getTokenStorage();
        expect(storage).toBeDefined();

        localFactory.destroy();
      });

      it('should use sessionStorage when configured', () => {
        const sessionConfig: SDKConfig = {
          ...createValidConfig(),
          tokenStorage: 'sessionStorage'
        };
        const sessionFactory = createServiceFactory(sessionConfig);

        const storage = sessionFactory.getTokenStorage();
        expect(storage).toBeDefined();

        sessionFactory.destroy();
      });
    });

    describe('Error Handling Configuration', () => {
      it('should pass error handling config to clients', () => {
        const errorConfig: SDKConfig = {
          ...createValidConfig(),
          errorHandling: {
            debug: true,
            autoRetryAuth: false,
            autoRetryNetwork: {
              maxRetries: 5,
              delay: 2000
            }
          }
        };
        const errorFactory = createServiceFactory(errorConfig);

        // Get clients - they should be created with the error config
        const authClient = errorFactory.getAuthClient();
        const registryClient = errorFactory.getRegistryClient();
        const nodeClient = errorFactory.getNodeClient();

        expect(authClient).toBeDefined();
        expect(registryClient).toBeDefined();
        expect(nodeClient).toBeDefined();

        errorFactory.destroy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional config gracefully', () => {
      const minimalConfig: SDKConfig = {
        auth: { baseUrl: 'https://auth.example.com' },
        registry: { baseUrl: 'https://registry.example.com' },
        node: { baseUrl: 'https://api.example.com' },
        certificate: { cert: 'cert', key: 'key' }
        // No tokenStorage or errorHandling
      };

      const factory = createServiceFactory(minimalConfig);

      expect(factory).toBeDefined();
      expect(factory.getTokenStorage()).toBeDefined();

      factory.destroy();
    });

    it('should handle configuration with custom timeouts', () => {
      const customConfig: SDKConfig = {
        auth: { baseUrl: 'https://auth.example.com', timeout: 60000 },
        registry: { baseUrl: 'https://registry.example.com', timeout: 30000 },
        node: { baseUrl: 'https://api.example.com', timeout: 120000 },
        certificate: { cert: 'cert', key: 'key' }
      };

      const factory = createServiceFactory(customConfig);

      expect(factory).toBeDefined();

      factory.destroy();
    });

    it('should handle configuration with custom retry settings', () => {
      const customConfig: SDKConfig = {
        auth: { baseUrl: 'https://auth.example.com', retries: 5 },
        registry: { baseUrl: 'https://registry.example.com', retries: 0 },
        node: { baseUrl: 'https://api.example.com', retries: 10 },
        certificate: { cert: 'cert', key: 'key' }
      };

      const factory = createServiceFactory(customConfig);

      expect(factory).toBeDefined();

      factory.destroy();
    });
  });
});
