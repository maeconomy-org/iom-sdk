/**
 * Comprehensive validation tests for SDK
 * Tests input validation, UUID validation, and parameter validation
 */

import { z } from 'zod';
import { validateSDKConfig, SDKConfig } from '../../src/config';

describe('SDK Validation Tests', () => {
  describe('UUID Validation', () => {
    const uuidSchema = z.string().uuid();

    it('should validate correct UUID format', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      ];

      validUuids.forEach(uuid => {
        expect(() => uuidSchema.parse(uuid)).not.toThrow();
      });
    });

    it('should reject invalid UUID formats', () => {
      const invalidUuids = [
        'invalid-uuid',
        '123e4567-e89b-12d3-a456',
        '123e4567-e89b-12d3-a456-426614174000-extra',
        '',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
      ];

      invalidUuids.forEach(uuid => {
        expect(() => uuidSchema.parse(uuid)).toThrow();
      });
    });

    it('should reject null and undefined', () => {
      expect(() => uuidSchema.parse(null)).toThrow();
      expect(() => uuidSchema.parse(undefined)).toThrow();
    });

    it('should reject non-string types', () => {
      expect(() => uuidSchema.parse(123)).toThrow();
      expect(() => uuidSchema.parse({})).toThrow();
      expect(() => uuidSchema.parse([])).toThrow();
    });
  });

  describe('SDK Configuration Validation', () => {
    const createValidConfig = (): SDKConfig => ({
      auth: { baseUrl: 'https://auth.example.com' },
      registry: { baseUrl: 'https://registry.example.com' },
      node: { baseUrl: 'https://api.example.com' },
      certificate: {
        cert: 'cert-content',
        key: 'key-content'
      }
    });

    it('should validate correct SDK configuration', () => {
      const validConfig = createValidConfig();
      expect(() => validateSDKConfig(validConfig)).not.toThrow();
    });

    it('should reject configuration with missing required fields', () => {
      // Missing auth
      expect(() =>
        validateSDKConfig({
          registry: { baseUrl: 'https://registry.example.com' },
          node: { baseUrl: 'https://api.example.com' }
        } as any)
      ).toThrow();

      // Missing registry
      expect(() =>
        validateSDKConfig({
          auth: { baseUrl: 'https://auth.example.com' },
          node: { baseUrl: 'https://api.example.com' }
        } as any)
      ).toThrow();

      // Missing node
      expect(() =>
        validateSDKConfig({
          auth: { baseUrl: 'https://auth.example.com' },
          registry: { baseUrl: 'https://registry.example.com' }
        } as any)
      ).toThrow();
    });

    it('should reject configuration with invalid URLs', () => {
      expect(() =>
        validateSDKConfig({
          auth: { baseUrl: 'invalid-url' },
          registry: { baseUrl: 'https://registry.example.com' },
          node: { baseUrl: 'https://api.example.com' },
          certificate: { cert: 'cert', key: 'key' }
        })
      ).toThrow();

      expect(() =>
        validateSDKConfig({
          auth: { baseUrl: 'https://auth.example.com' },
          registry: { baseUrl: 'not-a-url' },
          node: { baseUrl: 'https://api.example.com' },
          certificate: { cert: 'cert', key: 'key' }
        })
      ).toThrow();

      expect(() =>
        validateSDKConfig({
          auth: { baseUrl: 'https://auth.example.com' },
          registry: { baseUrl: 'https://registry.example.com' },
          node: { baseUrl: '' },
          certificate: { cert: 'cert', key: 'key' }
        })
      ).toThrow();
    });

    it('should validate optional configuration fields', () => {
      const configWithOptionals: SDKConfig = {
        auth: {
          baseUrl: 'https://auth.example.com',
          timeout: 10000,
          retries: 5
        },
        registry: {
          baseUrl: 'https://registry.example.com',
          timeout: 8000
        },
        node: {
          baseUrl: 'https://api.example.com',
          retries: 2
        },
        certificate: {
          cert: 'cert-content',
          key: 'key-content'
        },
        tokenStorage: 'sessionStorage',
        errorHandling: {
          debug: false,
          autoRetryAuth: true,
          autoRetryNetwork: {
            maxRetries: 3,
            delay: 1000
          }
        }
      };

      expect(() => validateSDKConfig(configWithOptionals)).not.toThrow();
    });
  });

  describe('Query Parameter Validation', () => {
    const paginationSchema = z.object({
      page: z.number().min(0).optional(),
      size: z.number().min(1).max(100).optional()
    });

    it('should validate pagination parameters', () => {
      // Valid pagination
      expect(() => paginationSchema.parse({ page: 0, size: 10 })).not.toThrow();
      expect(() => paginationSchema.parse({ page: 5, size: 50 })).not.toThrow();
      expect(() => paginationSchema.parse({})).not.toThrow();

      // Invalid pagination
      expect(() => paginationSchema.parse({ page: -1, size: 10 })).toThrow();
      expect(() => paginationSchema.parse({ page: 0, size: 0 })).toThrow();
      expect(() => paginationSchema.parse({ page: 0, size: 101 })).toThrow();
    });

    it('should validate search parameters', () => {
      const searchSchema = z.object({
        searchTerm: z.string().min(1).optional(),
        searchBy: z
          .object({
            uuid: z.string().uuid().optional(),
            name: z.string().optional(),
            isTemplate: z.boolean().optional()
          })
          .optional(),
        hasHistory: z.boolean().optional()
      });

      // Valid search parameters
      expect(() => searchSchema.parse({ searchTerm: 'test' })).not.toThrow();
      expect(() =>
        searchSchema.parse({
          searchBy: { uuid: '123e4567-e89b-12d3-a456-426614174000' }
        })
      ).not.toThrow();
      expect(() => searchSchema.parse({ hasHistory: true })).not.toThrow();

      // Invalid search parameters
      expect(() => searchSchema.parse({ searchTerm: '' })).toThrow();
      expect(() =>
        searchSchema.parse({
          searchBy: { uuid: 'invalid-uuid' }
        })
      ).toThrow();
    });

    it('should validate statement query parameters', () => {
      const statementQuerySchema = z.object({
        subject: z.string().uuid().optional(),
        predicate: z.string().optional(),
        object: z.string().uuid().optional(),
        softDeleted: z.boolean().optional()
      });

      // Valid statement queries
      expect(() =>
        statementQuerySchema.parse({
          subject: '123e4567-e89b-12d3-a456-426614174000',
          predicate: 'HAS_PROPERTY'
        })
      ).not.toThrow();

      // Invalid statement queries
      expect(() =>
        statementQuerySchema.parse({
          subject: 'invalid-uuid',
          predicate: 'HAS_PROPERTY'
        })
      ).toThrow();
    });
  });

  describe('File Upload Validation', () => {
    it('should validate file reference upload parameters', () => {
      const fileReferenceSchema = z.object({
        fileReference: z.string().url(),
        uuidToAttach: z.string().uuid(),
        fileName: z.string().optional(),
        contentType: z.string().optional(),
        size: z.number().positive().optional()
      });

      // Valid file reference
      expect(() =>
        fileReferenceSchema.parse({
          fileReference: 'https://example.com/file.pdf',
          uuidToAttach: '123e4567-e89b-12d3-a456-426614174000',
          fileName: 'document.pdf',
          contentType: 'application/pdf',
          size: 1024
        })
      ).not.toThrow();

      // Invalid file reference
      expect(() =>
        fileReferenceSchema.parse({
          fileReference: 'not-a-url',
          uuidToAttach: '123e4567-e89b-12d3-a456-426614174000'
        })
      ).toThrow();

      expect(() =>
        fileReferenceSchema.parse({
          fileReference: 'https://example.com/file.pdf',
          uuidToAttach: 'invalid-uuid'
        })
      ).toThrow();

      expect(() =>
        fileReferenceSchema.parse({
          fileReference: 'https://example.com/file.pdf',
          uuidToAttach: '123e4567-e89b-12d3-a456-426614174000',
          size: -1
        })
      ).toThrow();
    });
  });

  describe('Property and Value Validation', () => {
    it('should validate property creation parameters', () => {
      const propertySchema = z.object({
        key: z.string().min(1),
        label: z.string().optional(),
        description: z.string().optional(),
        type: z.string().optional(),
        uuid: z.string().uuid().optional()
      });

      // Valid property
      expect(() =>
        propertySchema.parse({
          key: 'height',
          label: 'Building Height',
          description: 'Height in meters',
          type: 'number'
        })
      ).not.toThrow();

      // Invalid property - empty key
      expect(() =>
        propertySchema.parse({
          key: '',
          label: 'Empty Key'
        })
      ).toThrow();

      // Invalid property - invalid uuid
      expect(() =>
        propertySchema.parse({
          key: 'height',
          uuid: 'invalid-uuid'
        })
      ).toThrow();
    });

    it('should validate property value creation parameters', () => {
      const propertyValueSchema = z.object({
        value: z.string().min(1),
        valueTypeCast: z.string().optional(),
        sourceType: z.string().optional(),
        uuid: z.string().uuid().optional()
      });

      // Valid property value
      expect(() =>
        propertyValueSchema.parse({
          value: '150.5',
          valueTypeCast: 'number',
          sourceType: 'manual'
        })
      ).not.toThrow();

      // Invalid property value - empty value
      expect(() =>
        propertyValueSchema.parse({
          value: '',
          valueTypeCast: 'number'
        })
      ).toThrow();

      // Invalid property value - invalid uuid
      expect(() =>
        propertyValueSchema.parse({
          value: '150.5',
          uuid: 'invalid-uuid'
        })
      ).toThrow();
    });
  });

  describe('Aggregate Data Validation', () => {
    it('should validate aggregate creation data', () => {
      const aggregateSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        properties: z
          .array(
            z.object({
              key: z.string().min(1),
              label: z.string().optional(),
              values: z
                .array(
                  z.object({
                    value: z.string()
                  })
                )
                .optional()
            })
          )
          .optional(),
        address: z
          .object({
            fullAddress: z.string().optional(),
            city: z.string().optional(),
            postalCode: z.string().optional()
          })
          .optional()
      });

      // Valid aggregate data
      expect(() =>
        aggregateSchema.parse({
          name: 'Smart Building',
          description: 'IoT-enabled office building',
          properties: [
            {
              key: 'height',
              label: 'Height',
              values: [{ value: '150.5' }]
            }
          ],
          address: {
            fullAddress: '123 Tech Street',
            city: 'Innovation City',
            postalCode: '12345'
          }
        })
      ).not.toThrow();

      // Invalid aggregate data - empty name
      expect(() =>
        aggregateSchema.parse({
          name: '',
          description: 'Invalid name'
        })
      ).toThrow();

      // Invalid aggregate data - empty property key
      expect(() =>
        aggregateSchema.parse({
          name: 'Valid Name',
          properties: [
            {
              key: '',
              label: 'Invalid key'
            }
          ]
        })
      ).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle deeply nested validation', () => {
      const deepSchema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              value: z.string().min(1)
            })
          })
        })
      });

      expect(() =>
        deepSchema.parse({
          level1: { level2: { level3: { value: 'test' } } }
        })
      ).not.toThrow();

      expect(() =>
        deepSchema.parse({
          level1: { level2: { level3: { value: '' } } }
        })
      ).toThrow();
    });

    it('should handle arrays with specific length constraints', () => {
      const arraySchema = z.array(z.string().uuid()).min(1).max(10);

      expect(() =>
        arraySchema.parse(['123e4567-e89b-12d3-a456-426614174000'])
      ).not.toThrow();

      expect(() => arraySchema.parse([])).toThrow();

      expect(() =>
        arraySchema.parse(
          Array(11).fill('123e4567-e89b-12d3-a456-426614174000')
        )
      ).toThrow();
    });

    it('should handle union types', () => {
      const unionSchema = z.union([z.string().uuid(), z.literal('new')]);

      expect(() =>
        unionSchema.parse('123e4567-e89b-12d3-a456-426614174000')
      ).not.toThrow();
      expect(() => unionSchema.parse('new')).not.toThrow();
      expect(() => unionSchema.parse('invalid')).toThrow();
    });
  });
});
