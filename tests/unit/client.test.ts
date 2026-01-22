/**
 * Comprehensive tests for IOBClient
 * Tests main client interface and service access
 */

import { createClient, IOBClient } from '../../src/client';
import { SDKConfig } from '../../src/config';

// Mock the service factory
jest.mock('../../src/core/service-factory', () => {
  const mockAuthClient = {
    login: jest.fn().mockResolvedValue({ token: 'test', expiresIn: 3600 })
  };

  const mockRegistryClient = {
    createUUID: jest.fn().mockResolvedValue({ uuid: 'test-uuid' })
  };

  const mockNodeClient = {
    createObject: jest.fn().mockResolvedValue({ uuid: 'obj-uuid' })
  };

  const mockAuthManager = {
    getValidToken: jest.fn().mockResolvedValue('valid-token'),
    isAuthenticated: jest.fn().mockReturnValue(true),
    destroy: jest.fn()
  };

  const mockTokenStorage = {
    getToken: jest.fn().mockResolvedValue(null),
    setToken: jest.fn().mockResolvedValue(undefined),
    removeToken: jest.fn().mockResolvedValue(undefined),
    isAvailable: jest.fn().mockReturnValue(true)
  };

  const createMockFactory = () => ({
    getAuthClient: jest.fn().mockReturnValue(mockAuthClient),
    getRegistryClient: jest.fn().mockReturnValue(mockRegistryClient),
    getNodeClient: jest.fn().mockReturnValue(mockNodeClient),
    getAuthManager: jest.fn().mockReturnValue(mockAuthManager),
    getTokenStorage: jest.fn().mockReturnValue(mockTokenStorage),
    destroy: jest.fn()
  });

  return {
    ServiceFactory: jest.fn().mockImplementation(createMockFactory),
    createServiceFactory: jest.fn().mockImplementation(createMockFactory)
  };
});

describe('IOBClient', () => {
  const createValidConfig = (): SDKConfig => ({
    auth: { baseUrl: 'https://auth.example.com' },
    registry: { baseUrl: 'https://registry.example.com' },
    node: { baseUrl: 'https://api.example.com' },
    certificate: {
      cert: 'test-cert',
      key: 'test-key'
    }
  });

  describe('createClient', () => {
    it('should create client with valid configuration', () => {
      const config = createValidConfig();
      const client = createClient(config);

      expect(client).toBeDefined();
    });

    it('should expose auth service client', () => {
      const config = createValidConfig();
      const client = createClient(config);

      expect(client.auth).toBeDefined();
      expect(client.getAuthClient()).toBeDefined();
    });

    it('should expose registry service client', () => {
      const config = createValidConfig();
      const client = createClient(config);

      expect(client.registry).toBeDefined();
      expect(client.getRegistryClient()).toBeDefined();
    });

    it('should expose node service client', () => {
      const config = createValidConfig();
      const client = createClient(config);

      expect(client.node).toBeDefined();
      expect(client.getNodeClient()).toBeDefined();
    });

    it('should expose auth manager', () => {
      const config = createValidConfig();
      const client = createClient(config);

      expect(client.getAuthManager()).toBeDefined();
    });

    it('should expose token storage', () => {
      const config = createValidConfig();
      const client = createClient(config);

      expect(client.getTokenStorage()).toBeDefined();
    });
  });

  describe('Service Access', () => {
    let client: IOBClient;

    beforeEach(() => {
      client = createClient(createValidConfig());
    });

    afterEach(() => {
      client.destroy();
    });

    describe('auth', () => {
      it('should provide access to auth service methods', async () => {
        expect(client.auth).toBeDefined();
        expect(typeof client.auth.login).toBe('function');
      });
    });

    describe('registry', () => {
      it('should provide access to registry service methods', async () => {
        expect(client.registry).toBeDefined();
        expect(typeof client.registry.createUUID).toBe('function');
      });
    });

    describe('node', () => {
      it('should provide access to node service methods', async () => {
        expect(client.node).toBeDefined();
        expect(typeof client.node.createObject).toBe('function');
      });
    });
  });


  describe('destroy', () => {
    it('should cleanup resources', () => {
      const client = createClient(createValidConfig());

      expect(() => client.destroy()).not.toThrow();
    });

    it('should be safe to call multiple times', () => {
      const client = createClient(createValidConfig());

      client.destroy();
      expect(() => client.destroy()).not.toThrow();
    });
  });

  describe('Configuration Options', () => {
    it('should accept configuration with tokenStorage', () => {
      const config: SDKConfig = {
        ...createValidConfig(),
        tokenStorage: 'memory'
      };

      const client = createClient(config);
      expect(client).toBeDefined();

      client.destroy();
    });

    it('should accept configuration with errorHandling', () => {
      const config: SDKConfig = {
        ...createValidConfig(),
        errorHandling: {
          debug: true,
          autoRetryAuth: false
        }
      };

      const client = createClient(config);
      expect(client).toBeDefined();

      client.destroy();
    });

    it('should accept configuration with custom timeouts', () => {
      const config: SDKConfig = {
        ...createValidConfig(),
        auth: { baseUrl: 'https://auth.example.com', timeout: 60000 },
        registry: { baseUrl: 'https://registry.example.com', timeout: 30000 },
        node: { baseUrl: 'https://api.example.com', timeout: 120000 }
      };

      const client = createClient(config);
      expect(client).toBeDefined();

      client.destroy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional configuration', () => {
      const minimalConfig: SDKConfig = {
        auth: { baseUrl: 'https://auth.example.com' },
        registry: { baseUrl: 'https://registry.example.com' },
        node: { baseUrl: 'https://api.example.com' },
        certificate: { cert: 'cert', key: 'key' }
      };

      const client = createClient(minimalConfig);
      expect(client).toBeDefined();

      client.destroy();
    });

    it('should provide consistent service instances', () => {
      const client = createClient(createValidConfig());

      const auth1 = client.auth;
      const auth2 = client.auth;
      const auth3 = client.getAuthClient();

      expect(auth1).toBe(auth2);
      expect(auth1).toBe(auth3);

      client.destroy();
    });
  });
});
