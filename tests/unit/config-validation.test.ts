/**
 * Comprehensive tests for SDK configuration validation
 * Tests all configuration options and edge cases
 */

import {
  validateSDKConfig,
  validateServiceConfig,
  createDefaultServiceConfig,
  createDefaultErrorHandling,
  SDKConfig,
  ServiceConfig
} from '../../src/config';

describe('SDK Configuration Validation', () => {
  // Helper to create a valid config
  const createValidConfig = (): SDKConfig => ({
    auth: { baseUrl: 'https://auth.example.com' },
    registry: { baseUrl: 'https://registry.example.com' },
    node: { baseUrl: 'https://api.example.com' },
    certificate: {
      cert: 'cert-content',
      key: 'key-content'
    }
  });

  describe('validateSDKConfig', () => {
    describe('Required Fields', () => {
      it('should accept valid configuration', () => {
        const config = createValidConfig();
        expect(() => validateSDKConfig(config)).not.toThrow();
      });

      it('should reject missing auth configuration', () => {
        const config = createValidConfig();
        // @ts-expect-error Testing missing field
        delete config.auth;

        expect(() => validateSDKConfig(config)).toThrow(
          'Auth service configuration is required'
        );
      });

      it('should reject missing registry configuration', () => {
        const config = createValidConfig();
        // @ts-expect-error Testing missing field
        delete config.registry;

        expect(() => validateSDKConfig(config)).toThrow(
          'Registry service configuration is required'
        );
      });

      it('should reject missing node configuration', () => {
        const config = createValidConfig();
        // @ts-expect-error Testing missing field
        delete config.node;

        expect(() => validateSDKConfig(config)).toThrow(
          'Node service configuration is required'
        );
      });

      it('should accept missing certificate configuration (browser handles cert selection)', () => {
        const config = createValidConfig();
        delete config.certificate;

        expect(() => validateSDKConfig(config)).not.toThrow();
      });

      it('should reject certificate with missing cert', () => {
        const config = createValidConfig();
        config.certificate!.cert = '';

        expect(() => validateSDKConfig(config)).toThrow(
          'Certificate must include both cert and key when provided'
        );
      });

      it('should reject certificate with missing key', () => {
        const config = createValidConfig();
        config.certificate!.key = '';

        expect(() => validateSDKConfig(config)).toThrow(
          'Certificate must include both cert and key when provided'
        );
      });

      it('should accept valid certificate when provided', () => {
        const config = createValidConfig();
        config.certificate = {
          cert: 'valid-cert-content',
          key: 'valid-key-content'
        };

        expect(() => validateSDKConfig(config)).not.toThrow();
      });
    });

    describe('URL Validation', () => {
      it('should accept valid HTTPS URLs', () => {
        const config = createValidConfig();
        expect(() => validateSDKConfig(config)).not.toThrow();
      });

      it('should accept valid HTTP URLs', () => {
        const config = createValidConfig();
        config.auth.baseUrl = 'http://localhost:7443';
        config.registry.baseUrl = 'http://localhost:8443';
        config.node.baseUrl = 'http://localhost:9443';

        expect(() => validateSDKConfig(config)).not.toThrow();
      });

      it('should reject invalid auth URL', () => {
        const config = createValidConfig();
        config.auth.baseUrl = 'not-a-valid-url';

        expect(() => validateSDKConfig(config)).toThrow(
          'auth service baseUrl must be a valid URL'
        );
      });

      it('should reject invalid registry URL', () => {
        const config = createValidConfig();
        config.registry.baseUrl = 'invalid';

        expect(() => validateSDKConfig(config)).toThrow(
          'registry service baseUrl must be a valid URL'
        );
      });

      it('should reject invalid node URL', () => {
        const config = createValidConfig();
        config.node.baseUrl = '://missing-protocol.com';

        expect(() => validateSDKConfig(config)).toThrow(
          'node service baseUrl must be a valid URL'
        );
      });

      it('should reject empty URL', () => {
        const config = createValidConfig();
        config.auth.baseUrl = '';

        expect(() => validateSDKConfig(config)).toThrow(
          'auth service baseUrl is required'
        );
      });
    });

    describe('Optional Fields', () => {
      it('should accept valid tokenStorage options', () => {
        const storageTypes = [
          'localStorage',
          'sessionStorage',
          'memory'
        ] as const;

        for (const storageType of storageTypes) {
          const config = createValidConfig();
          config.tokenStorage = storageType;
          expect(() => validateSDKConfig(config)).not.toThrow();
        }
      });

      it('should reject invalid tokenStorage option', () => {
        const config = createValidConfig();
        // @ts-expect-error Testing invalid value
        config.tokenStorage = 'invalidStorage';

        expect(() => validateSDKConfig(config)).toThrow(
          'tokenStorage must be one of: localStorage, sessionStorage, memory'
        );
      });

      it('should accept valid error handling config', () => {
        const config = createValidConfig();
        config.errorHandling = {
          debug: true,
          autoRetryAuth: true,
          autoRetryNetwork: {
            maxRetries: 3,
            delay: 1000,
            backoff: 'exponential'
          }
        };

        expect(() => validateSDKConfig(config)).not.toThrow();
      });

      it('should reject invalid autoRetryNetwork.maxRetries', () => {
        const config = createValidConfig();
        config.errorHandling = {
          autoRetryNetwork: { maxRetries: 15 }
        };

        expect(() => validateSDKConfig(config)).toThrow(
          'autoRetryNetwork.maxRetries must be between 0 and 10'
        );
      });

      it('should reject negative autoRetryNetwork.maxRetries', () => {
        const config = createValidConfig();
        config.errorHandling = {
          autoRetryNetwork: { maxRetries: -1 }
        };

        expect(() => validateSDKConfig(config)).toThrow(
          'autoRetryNetwork.maxRetries must be between 0 and 10'
        );
      });

      it('should reject invalid autoRetryNetwork.delay', () => {
        const config = createValidConfig();
        config.errorHandling = {
          autoRetryNetwork: { maxRetries: 3, delay: 100000 }
        };

        expect(() => validateSDKConfig(config)).toThrow(
          'autoRetryNetwork.delay must be between 0 and 60000ms'
        );
      });

      it('should reject invalid autoRetryNetwork.backoff', () => {
        const config = createValidConfig();
        config.errorHandling = {
          autoRetryNetwork: {
            maxRetries: 3,
            // @ts-expect-error Testing invalid value
            backoff: 'invalid'
          }
        };

        expect(() => validateSDKConfig(config)).toThrow(
          'autoRetryNetwork.backoff must be either linear or exponential'
        );
      });
    });
  });

  describe('validateServiceConfig', () => {
    it('should accept valid service configuration', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        timeout: 30000,
        retries: 3
      };

      expect(() => validateServiceConfig(config, 'test')).not.toThrow();
    });

    it('should reject missing baseUrl', () => {
      const config = { timeout: 30000 } as ServiceConfig;

      expect(() => validateServiceConfig(config, 'test')).toThrow(
        'test service baseUrl is required'
      );
    });

    it('should reject invalid timeout (negative)', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        timeout: -1
      };

      expect(() => validateServiceConfig(config, 'test')).toThrow(
        'test service timeout must be between 0 and 300000ms'
      );
    });

    it('should reject invalid timeout (too high)', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        timeout: 500000
      };

      expect(() => validateServiceConfig(config, 'test')).toThrow(
        'test service timeout must be between 0 and 300000ms'
      );
    });

    it('should reject invalid retries (negative)', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        retries: -1
      };

      expect(() => validateServiceConfig(config, 'test')).toThrow(
        'test service retries must be between 0 and 10'
      );
    });

    it('should reject invalid retries (too high)', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        retries: 15
      };

      expect(() => validateServiceConfig(config, 'test')).toThrow(
        'test service retries must be between 0 and 10'
      );
    });

    it('should accept timeout of 0', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        timeout: 0
      };

      expect(() => validateServiceConfig(config, 'test')).not.toThrow();
    });

    it('should accept retries of 0', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        retries: 0
      };

      expect(() => validateServiceConfig(config, 'test')).not.toThrow();
    });

    it('should accept maximum valid timeout', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        timeout: 300000
      };

      expect(() => validateServiceConfig(config, 'test')).not.toThrow();
    });

    it('should accept maximum valid retries', () => {
      const config: ServiceConfig = {
        baseUrl: 'https://example.com',
        retries: 10
      };

      expect(() => validateServiceConfig(config, 'test')).not.toThrow();
    });
  });

  describe('Factory Functions', () => {
    describe('createDefaultServiceConfig', () => {
      it('should create config with default values', () => {
        const config = createDefaultServiceConfig('https://example.com');

        expect(config).toEqual({
          baseUrl: 'https://example.com',
          timeout: 30000,
          retries: 3,
          headers: {}
        });
      });

      it('should create valid config that passes validation', () => {
        const config = createDefaultServiceConfig('https://example.com');

        expect(() => validateServiceConfig(config, 'test')).not.toThrow();
      });
    });

    describe('createDefaultErrorHandling', () => {
      it('should create error handling config with default values', () => {
        const config = createDefaultErrorHandling();

        expect(config).toEqual({
          debug: false,
          autoRetryAuth: true,
          autoRetryNetwork: {
            maxRetries: 3,
            delay: 1000,
            backoff: 'exponential'
          }
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with ports', () => {
      const config = createValidConfig();
      config.auth.baseUrl = 'https://localhost:7443';
      config.registry.baseUrl = 'https://localhost:8443';
      config.node.baseUrl = 'https://localhost:9443';

      expect(() => validateSDKConfig(config)).not.toThrow();
    });

    it('should handle URLs with paths', () => {
      const config = createValidConfig();
      config.auth.baseUrl = 'https://api.example.com/auth';
      config.registry.baseUrl = 'https://api.example.com/registry';
      config.node.baseUrl = 'https://api.example.com/node';

      expect(() => validateSDKConfig(config)).not.toThrow();
    });

    it('should handle URLs with query parameters', () => {
      const config = createValidConfig();
      config.auth.baseUrl = 'https://example.com?version=v1';

      expect(() => validateSDKConfig(config)).not.toThrow();
    });

    it('should handle custom headers', () => {
      const config = createValidConfig();
      config.auth.headers = {
        'X-Custom-Header': 'value',
        Accept: 'application/json'
      };

      expect(() => validateSDKConfig(config)).not.toThrow();
    });

    it('should handle null optional fields gracefully', () => {
      const config = createValidConfig();
      // @ts-expect-error Testing null value
      config.tokenStorage = null;
      // @ts-expect-error Testing null value
      config.errorHandling = null;

      expect(() => validateSDKConfig(config)).not.toThrow();
    });
  });
});
