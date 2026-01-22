/**
 * Test configuration and utilities for SDK testing
 */

import { SDKConfig } from '../src/config';

/**
 * Default test configuration for SDK
 */
export const defaultTestConfig: SDKConfig = {
  auth: {
    baseUrl: 'https://auth.test.com',
    timeout: 5000,
    retries: 2
  },
  registry: {
    baseUrl: 'https://registry.test.com',
    timeout: 5000,
    retries: 2
  },
  node: {
    baseUrl: 'https://api.test.com',
    timeout: 10000,
    retries: 3
  },
  certificate: {
    cert: 'test-certificate-content',
    key: 'test-key-content'
  },
  tokenStorage: 'memory',
  errorHandling: {
    debug: false,
    autoRetryAuth: true,
    autoRetryNetwork: {
      maxRetries: 3,
      delay: 100
    }
  }
};

/**
 * Create a mock fetch implementation for testing
 */
export function createMockFetch(responses: Record<string, any> = {}) {
  return jest.fn().mockImplementation((url: string, options: any = {}) => {
    const method = options.method || 'GET';
    const key = `${method} ${url}`;

    // Default responses
    const defaultResponses: Record<string, any> = {
      'POST https://auth.test.com/api/auth/login': {
        token: 'mock-jwt-token',
        expiresIn: 3600
      },
      'GET https://auth.test.com/api/auth/health': { status: 'healthy' },
      'POST https://registry.test.com/api/uuid': {
        uuid: '123e4567-e89b-12d3-a456-426614174000'
      },
      'GET https://registry.test.com/api/uuid': [],
      'GET https://api.test.com/api/objects': [],
      'POST https://api.test.com/api/objects': {
        uuid: 'created-object-uuid'
      },
      'GET https://api.test.com/api/aggregates': []
    };

    // Merge with custom responses
    const allResponses = { ...defaultResponses, ...responses };

    // Find matching response
    let responseData = allResponses[key];
    if (!responseData) {
      // Try to find partial URL match
      const matchingKey = Object.keys(allResponses).find(
        k => k.includes(url) || url.includes(k.split(' ')[1])
      );
      responseData = matchingKey ? allResponses[matchingKey] : {};
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      json: async () => responseData,
      text: async () => JSON.stringify(responseData)
    });
  });
}

/**
 * Create error mock fetch for testing error handling
 */
export function createErrorMockFetch(
  errorType: 'network' | 'http' | 'json' = 'network'
) {
  return jest.fn().mockImplementation(() => {
    switch (errorType) {
      case 'network':
        return Promise.reject(new Error('Network error'));
      case 'http':
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Server error' })
        });
      case 'json':
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('Invalid JSON');
          }
        });
      default:
        return Promise.reject(new Error('Unknown error'));
    }
  });
}

/**
 * Test utilities class
 */
export class TestUtils {
  /**
   * Generate a random UUID for testing
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate multiple UUIDs for testing
   */
  static generateUUIDs(count: number): string[] {
    return Array.from({ length: count }, () => TestUtils.generateUUID());
  }

  /**
   * Measure execution time of an async function
   */
  static async measureTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; time: number }> {
    const start = performance.now();
    const result = await fn();
    const time = performance.now() - start;
    return { result, time };
  }

  /**
   * Wait for specified milliseconds
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create test configuration with overrides
   */
  static createConfig(overrides: Partial<SDKConfig> = {}): SDKConfig {
    return {
      ...defaultTestConfig,
      auth: { ...defaultTestConfig.auth, ...overrides.auth },
      registry: { ...defaultTestConfig.registry, ...overrides.registry },
      node: { ...defaultTestConfig.node, ...overrides.node },
      certificate: {
        ...defaultTestConfig.certificate,
        ...overrides.certificate
      },
      errorHandling: {
        ...defaultTestConfig.errorHandling,
        ...overrides.errorHandling
      }
    };
  }
}

/**
 * Test data fixtures
 */
export const TestFixtures = {
  validUUIDs: [
    '123e4567-e89b-12d3-a456-426614174000',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  ],

  invalidUUIDs: [
    'invalid-uuid',
    '123e4567-e89b-12d3-a456',
    '123e4567-e89b-12d3-a456-426614174000-extra',
    '',
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  ],

  validUrls: [
    'https://example.com',
    'https://api.test.com/endpoint',
    'http://localhost:3000'
  ],

  invalidUrls: ['invalid-url', 'not-a-url', '', 'ftp://example.com'],

  sampleObjects: [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Object 1',
      description: 'A test object'
    },
    {
      uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Test Object 2',
      description: 'Another test object'
    }
  ],

  sampleProperties: [
    { uuid: 'prop-uuid-1', key: 'height', label: 'Height' },
    { uuid: 'prop-uuid-2', key: 'width', label: 'Width' }
  ],

  sampleValues: [
    { uuid: 'val-uuid-1', value: '100', valueTypeCast: 'number' },
    { uuid: 'val-uuid-2', value: 'test', valueTypeCast: 'string' }
  ]
};
