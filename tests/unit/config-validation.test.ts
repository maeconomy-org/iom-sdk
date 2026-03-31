/**
 * Comprehensive tests for SDK configuration validation
 * Tests all configuration options and edge cases
 */

import {
  validateSDKConfig,
  validateServiceConfig,
  createDefaultServiceConfig,
  createDefaultErrorHandling,
  resolveServiceConfigs,
  buildCertAuthBaseUrl,
  SDKConfig,
  ServiceConfig
} from '../../src/config';

describe('SDK Configuration Validation', () => {
  // Helper to create a valid config
  const createValidConfig = (): SDKConfig => ({
    baseUrl: 'https://example.com',
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

      it('should reject missing baseUrl', () => {
        const config = createValidConfig();
        // @ts-expect-error Testing missing field
        delete config.baseUrl;

        expect(() => validateSDKConfig(config)).toThrow('baseUrl is required');
      });

      it('should reject invalid baseUrl', () => {
        const config = createValidConfig();
        config.baseUrl = 'not-a-url';

        expect(() => validateSDKConfig(config)).toThrow(
          'baseUrl must be a valid URL'
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
        const config: SDKConfig = {
          baseUrl: 'http://localhost:3000'
        };

        expect(() => validateSDKConfig(config)).not.toThrow();
      });

      it('should reject invalid service override auth URL', () => {
        const config = createValidConfig();
        config.services = { auth: { baseUrl: 'not-a-valid-url' } };

        expect(() => validateSDKConfig(config)).toThrow(
          'auth service baseUrl must be a valid URL'
        );
      });

      it('should reject invalid service override registry URL', () => {
        const config = createValidConfig();
        config.services = { registry: { baseUrl: 'invalid' } };

        expect(() => validateSDKConfig(config)).toThrow(
          'registry service baseUrl must be a valid URL'
        );
      });

      it('should reject invalid service override node URL', () => {
        const config = createValidConfig();
        config.services = { node: { baseUrl: '://missing-protocol.com' } };

        expect(() => validateSDKConfig(config)).toThrow(
          'node service baseUrl must be a valid URL'
        );
      });

      it('should reject empty baseUrl', () => {
        const config = createValidConfig();
        config.baseUrl = '';

        expect(() => validateSDKConfig(config)).toThrow('baseUrl is required');
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

  describe('resolveServiceConfigs', () => {
    it('should derive service URLs from baseUrl with default paths', () => {
      const resolved = resolveServiceConfigs({
        baseUrl: 'https://maeconomy-dev.recheck.io'
      });

      expect(resolved.auth.baseUrl).toBe(
        'https://maeconomy-dev.recheck.io/auth'
      );
      expect(resolved.registry.baseUrl).toBe(
        'https://maeconomy-dev.recheck.io/registrar'
      );
      expect(resolved.node.baseUrl).toBe(
        'https://maeconomy-dev.recheck.io/node-network'
      );
    });

    it('should build cert auth URL with port 553 by default', () => {
      const resolved = resolveServiceConfigs({
        baseUrl: 'https://maeconomy-dev.recheck.io'
      });

      expect(resolved.certAuth.baseUrl).toBe(
        'https://maeconomy-dev.recheck.io:553/auth'
      );
    });

    it('should allow custom certPort', () => {
      const resolved = resolveServiceConfigs({
        baseUrl: 'https://maeconomy-dev.recheck.io',
        certPort: 8443
      });

      expect(resolved.certAuth.baseUrl).toBe(
        'https://maeconomy-dev.recheck.io:8443/auth'
      );
    });

    it('should allow service baseUrl overrides', () => {
      const resolved = resolveServiceConfigs({
        baseUrl: 'https://maeconomy-dev.recheck.io',
        services: {
          auth: { baseUrl: 'https://custom-auth.example.com' },
          node: { baseUrl: 'https://custom-node.example.com' }
        }
      });

      expect(resolved.auth.baseUrl).toBe('https://custom-auth.example.com');
      expect(resolved.node.baseUrl).toBe('https://custom-node.example.com');
      // registry still uses default
      expect(resolved.registry.baseUrl).toBe(
        'https://maeconomy-dev.recheck.io/registrar'
      );
    });

    it('should carry service overrides like timeout and retries', () => {
      const resolved = resolveServiceConfigs({
        baseUrl: 'https://example.com',
        services: {
          auth: { timeout: 5000, retries: 2 }
        }
      });

      expect(resolved.auth.timeout).toBe(5000);
      expect(resolved.auth.retries).toBe(2);
    });

    it('should set refreshBaseUrl on certAuth to the normal auth URL', () => {
      const resolved = resolveServiceConfigs({
        baseUrl: 'https://maeconomy-dev.recheck.io'
      });

      expect(resolved.certAuth.refreshBaseUrl).toBe(
        'https://maeconomy-dev.recheck.io/auth'
      );
    });

    it('should strip trailing slash from baseUrl', () => {
      const resolved = resolveServiceConfigs({
        baseUrl: 'https://example.com/'
      });

      expect(resolved.auth.baseUrl).toBe('https://example.com/auth');
    });
  });

  describe('buildCertAuthBaseUrl', () => {
    it('should replace port on HTTPS URL', () => {
      expect(buildCertAuthBaseUrl('https://example.com/auth')).toBe(
        'https://example.com:553/auth'
      );
    });

    it('should accept custom port', () => {
      expect(buildCertAuthBaseUrl('https://example.com/auth', 8443)).toBe(
        'https://example.com:8443/auth'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle baseUrl with port', () => {
      const config: SDKConfig = { baseUrl: 'https://localhost:7443' };
      expect(() => validateSDKConfig(config)).not.toThrow();
    });

    it('should handle service overrides with custom headers', () => {
      const config = createValidConfig();
      config.services = {
        auth: {
          headers: { 'X-Custom-Header': 'value', Accept: 'application/json' }
        }
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
