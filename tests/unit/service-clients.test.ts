/**
 * Comprehensive tests for service clients
 * Tests AuthServiceClient, RegistryServiceClient, and NodeServiceClient
 */

import { AuthServiceClient } from '../../src/services/auth/auth-client';
import { RegistryServiceClient } from '../../src/services/registry/registry-client';
import { NodeServiceClient } from '../../src/services/node/node-client';
import { AuthManager } from '../../src/core/auth-manager';
import { ServiceConfig, ErrorHandlingConfig } from '../../src/config';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

describe('Service Clients', () => {
  const defaultServiceConfig: ServiceConfig = {
    baseUrl: 'https://api.test.com',
    timeout: 5000,
    retries: 3
  };

  const defaultErrorHandling: ErrorHandlingConfig = {
    debug: false,
    autoRetryAuth: true
  };

  const mockCertificate = {
    cert: 'test-cert',
    key: 'test-key'
  };

  describe('AuthServiceClient', () => {
    let client: AuthServiceClient;

    beforeEach(() => {
      client = new AuthServiceClient(
        defaultServiceConfig,
        defaultErrorHandling,
        mockCertificate
      );
    });

    describe('Constructor', () => {
      it('should create client with valid configuration', () => {
        expect(client).toBeDefined();
        expect(client).toBeInstanceOf(AuthServiceClient);
      });

      it('should store certificate for mTLS', () => {
        // Client should be created with certificate
        expect(client).toBeDefined();
      });
    });

    describe('login', () => {
      it('should call login endpoint with JSON response', async () => {
        const mockResponse = {
          data: {
            token: 'jwt-token',
            expiresIn: 3600,
            tokenType: 'Bearer'
          },
          status: 200
        };

        // Mock the get method (login uses GET)
        jest.spyOn(client as any, 'get').mockResolvedValue(mockResponse);

        const result = await client.login();

        expect(result).toEqual(mockResponse.data);
      });

      it('should handle plain text token response', async () => {
        const mockToken = 'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyVVVJRCI6IjkyZmRjYTBlLTEyYjktNGYyMC05ZDk3LTI3Y2ZiMzY2MWE1YyIsImNyZWRlbnRpYWxzIjoiYjQ1ZmE0N2I5YzZlNjk5MDIwMTQwNTg2YTQyZTNhMzA4MDg1YzUzMDA5M2MxZmJmM2JhNDZmMmIzMmJlYjY5MiIsImNyZWF0ZWRBdCI6MTc2ODU2NzU4Mi4zMDAxNDksImF1dGhvcml0aWVzIjpbXSwiZW5hYmxlZCI6dHJ1ZSwiYWNjb3VudE5vbkV4cGlyZWQiOnRydWUsImNyZWRlbnRpYWxzTm9uRXhwaXJlZCI6dHJ1ZSwiYWNjb3VudE5vbkxvY2tlZCI6dHJ1ZSwiaWF0IjoxNzY4ODI2NjMzLCJleHAiOjE3Njg4MzAyMzN9.signature';
        const mockResponse = {
          data: mockToken, // Plain text response
          status: 200
        };

        jest.spyOn(client as any, 'get').mockResolvedValue(mockResponse);

        const result = await client.login();

        expect(result).toEqual({
          token: mockToken,
          expiresIn: 3600, // Calculated from JWT payload (exp - iat = 1768830233 - 1768826633 = 3600)
          tokenType: 'Bearer'
        });
      });

      it('should handle login failure', async () => {
        jest
          .spyOn(client as any, 'get')
          .mockRejectedValue(new Error('Auth failed'));

        await expect(client.login()).rejects.toThrow('Auth failed');
      });

      it('should handle malformed plain text response', async () => {
        const mockResponse = {
          data: 'invalid-token-format', // Not a valid JWT
          status: 200
        };

        jest.spyOn(client as any, 'get').mockResolvedValue(mockResponse);

        const result = await client.login();

        expect(result).toEqual({
          token: 'invalid-token-format',
          expiresIn: 3600, // Default fallback
          tokenType: 'Bearer'
        });
      });
    });

    describe('updateErrorHandling', () => {
      it('should update error handling configuration', () => {
        const newConfig: ErrorHandlingConfig = {
          debug: true,
          autoRetryAuth: false
        };

        client.updateErrorHandling(newConfig);

        // Verify update was applied (internal state)
        expect((client as any).errorHandling).toEqual(newConfig);
      });
    });
  });

  describe('RegistryServiceClient', () => {
    let client: RegistryServiceClient;
    let mockAuthManager: jest.Mocked<AuthManager>;

    beforeEach(() => {
      mockAuthManager = {
        getValidToken: jest.fn().mockResolvedValue('valid-token'),
        invalidateToken: jest.fn()
      } as any;

      client = new RegistryServiceClient(
        defaultServiceConfig,
        defaultErrorHandling,
        mockAuthManager
      );
    });

    describe('Constructor', () => {
      it('should create client with auth manager', () => {
        expect(client).toBeDefined();
        expect(client).toBeInstanceOf(RegistryServiceClient);
      });
    });

    describe('createUUID', () => {
      it('should create and return new UUID', async () => {
        const mockUUID = { uuid: '123e4567-e89b-12d3-a456-426614174000' };
        jest.spyOn(client as any, 'post').mockResolvedValue({ data: mockUUID });

        const result = await client.createUUID();

        expect(result).toEqual(mockUUID);
      });

      it('should handle UUID creation failure', async () => {
        jest
          .spyOn(client as any, 'post')
          .mockRejectedValue(new Error('Creation failed'));

        await expect(client.createUUID()).rejects.toThrow('Creation failed');
      });
    });

    describe('getOwnedUUIDs', () => {
      it('should return list of owned UUIDs', async () => {
        const mockUUIDs = [
          { uuid: 'uuid-1', createdAt: '2024-01-01' },
          { uuid: 'uuid-2', createdAt: '2024-01-02' }
        ];
        jest.spyOn(client as any, 'get').mockResolvedValue({ data: mockUUIDs });

        const result = await client.getOwnedUUIDs();

        expect(result).toEqual(mockUUIDs);
        expect(result).toHaveLength(2);
      });

      it('should handle empty list', async () => {
        jest.spyOn(client as any, 'get').mockResolvedValue({ data: [] });

        const result = await client.getOwnedUUIDs();

        expect(result).toEqual([]);
      });
    });

    describe('getUUIDRecord', () => {
      it('should return UUID record by ID', async () => {
        const mockRecord = {
          uuid: 'test-uuid',
          createdAt: '2024-01-01',
          createdBy: 'user-1',
          softDeleted: false
        };
        jest
          .spyOn(client as any, 'get')
          .mockResolvedValue({ data: mockRecord });

        const result = await client.getUUIDRecord('test-uuid');

        expect(result).toEqual(mockRecord);
      });

      it('should handle not found error', async () => {
        jest
          .spyOn(client as any, 'get')
          .mockRejectedValue(
            Object.assign(new Error('Not found'), { response: { status: 404 } })
          );

        await expect(client.getUUIDRecord('invalid-uuid')).rejects.toThrow();
      });
    });

    describe('updateUUIDRecordMeta', () => {
      it('should update UUID metadata', async () => {
        const mockUpdated = {
          uuid: 'test-uuid',
          meta: { key: 'value' }
        };
        jest
          .spyOn(client as any, 'put')
          .mockResolvedValue({ data: mockUpdated });

        const result = await client.updateUUIDRecordMeta('test-uuid', {
          key: 'value'
        });

        expect(result).toEqual(mockUpdated);
      });
    });

    describe('authorizeUUIDRecord', () => {
      it('should authorize UUID access', async () => {
        jest
          .spyOn(client as any, 'post')
          .mockResolvedValue({ data: { success: true } });

        const result = await client.authorizeUUIDRecord({
          uuid: 'test-uuid',
          targetUserUUID: 'user-uuid',
          permissions: ['read', 'write']
        });

        expect(result).toEqual({ success: true });
      });
    });
  });

  describe('NodeServiceClient', () => {
    let client: NodeServiceClient;
    let mockAuthManager: jest.Mocked<AuthManager>;
    let mockRegistryClient: jest.Mocked<RegistryServiceClient>;

    beforeEach(() => {
      mockAuthManager = {
        getValidToken: jest.fn().mockResolvedValue('valid-token'),
        invalidateToken: jest.fn()
      } as any;

      mockRegistryClient = {
        createUUID: jest.fn().mockResolvedValue({ uuid: 'new-uuid-123' })
      } as any;

      client = new NodeServiceClient(
        defaultServiceConfig,
        defaultErrorHandling,
        mockAuthManager,
        mockRegistryClient
      );
    });

    describe('Constructor', () => {
      it('should create client with dependencies', () => {
        expect(client).toBeDefined();
        expect(client).toBeInstanceOf(NodeServiceClient);
      });
    });

    describe('CRUD Operations', () => {
      describe('createObject', () => {
        it('should create object', async () => {
          const mockObject = { uuid: 'obj-uuid', name: 'Test Object' };
          jest
            .spyOn(client as any, 'post')
            .mockResolvedValue({ data: mockObject });

          const result = await client.createObject({ name: 'Test Object' });

          expect(result).toEqual(mockObject);
        });
      });

      describe('getObjects', () => {
        it('should get objects with query params', async () => {
          const mockObjects = [{ uuid: 'obj-1' }, { uuid: 'obj-2' }];
          jest
            .spyOn(client as any, 'get')
            .mockResolvedValue({ data: mockObjects });

          const result = await client.getObjects({ uuid: 'test-uuid' });

          expect(result).toEqual(mockObjects);
        });
      });

      describe('createProperty', () => {
        it('should create property', async () => {
          const mockProperty = { uuid: 'prop-uuid', key: 'height' };
          jest
            .spyOn(client as any, 'post')
            .mockResolvedValue({ data: mockProperty });

          const result = await client.createProperty({ key: 'height' });

          expect(result).toEqual(mockProperty);
        });
      });

      describe('createStatement', () => {
        it('should create statement', async () => {
          const mockStatement = {
            uuid: 'stmt-uuid',
            subject: 'uuid-1',
            predicate: 'HAS_PROPERTY' as any, // Cast to allow test
            object: 'uuid-2'
          };
          jest
            .spyOn(client as any, 'post')
            .mockResolvedValue({ data: mockStatement });

          const result = await client.createStatement(mockStatement as any);

          expect(result).toEqual(mockStatement);
        });
      });
    });

    describe('Workflow Methods', () => {
      describe('uploadFileByReference', () => {
        it('should create UUID and upload file reference', async () => {
          jest.spyOn(client as any, 'post').mockResolvedValue({
            data: {
              uuid: 'file-uuid',
              fileReference: 'https://example.com/file.pdf'
            }
          });

          const result = await client.uploadFileByReference({
            fileReference: 'https://example.com/file.pdf',
            uuidToAttach: 'parent-uuid'
          });

          expect(mockRegistryClient.createUUID).toHaveBeenCalled();
          expect(result.status).toBe(200);
        });

        it('should handle upload failure', async () => {
          mockRegistryClient.createUUID.mockRejectedValue(
            new Error('UUID creation failed')
          );

          const result = await client.uploadFileByReference({
            fileReference: 'https://example.com/file.pdf',
            uuidToAttach: 'parent-uuid'
          });

          expect(result.status).toBe(500);
          expect(result.data).toBeNull();
        });
      });

      describe('uploadFileDirect', () => {
        it('should create UUID and upload file directly', async () => {
          const mockFile = new File(['content'], 'test.pdf', {
            type: 'application/pdf'
          });

          jest.spyOn(client, 'uploadFile').mockResolvedValue({
            uuid: 'file-uuid',
            fileName: 'test.pdf'
          } as any);
          jest.spyOn(client as any, 'post').mockResolvedValue({ data: {} });

          const result = await client.uploadFileDirect({
            file: mockFile,
            uuidToAttach: 'parent-uuid'
          });

          expect(mockRegistryClient.createUUID).toHaveBeenCalled();
          expect(result.status).toBe(200);
        });
      });

      describe('addPropertyToObject', () => {
        const validObjectUuid = '123e4567-e89b-12d3-a456-426614174000';
        const validPropertyUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

        it('should create property with new UUID if not provided', async () => {
          jest.spyOn(client, 'createProperty').mockResolvedValue({
            uuid: 'new-uuid-123',
            key: 'height'
          } as any);
          jest.spyOn(client, 'createStatement').mockResolvedValue({} as any);

          const result = await client.addPropertyToObject(validObjectUuid, {
            key: 'height'
          });

          expect(mockRegistryClient.createUUID).toHaveBeenCalled();
          expect(result.status).toBe(200);
        });

        it('should use existing UUID if provided', async () => {
          // Reset mock to track calls
          mockRegistryClient.createUUID.mockClear();

          jest.spyOn(client, 'createProperty').mockResolvedValue({
            uuid: validPropertyUuid,
            key: 'height'
          } as any);
          jest.spyOn(client, 'createStatement').mockResolvedValue({} as any);

          const result = await client.addPropertyToObject(validObjectUuid, {
            uuid: validPropertyUuid,
            key: 'height'
          });

          // Should not create new UUID since one was provided
          expect(mockRegistryClient.createUUID).not.toHaveBeenCalled();
          expect(result.status).toBe(200);
        });

        it('should validate object UUID format', async () => {
          const result = await client.addPropertyToObject('invalid-uuid', {
            key: 'height'
          });

          // Should fail validation
          expect(result.status).toBe(500);
        });
      });
    });

    describe('Aggregate Operations', () => {
      const validObjectUuid = '123e4567-e89b-12d3-a456-426614174000';

      describe('searchAggregates', () => {
        it('should search aggregates with pagination', async () => {
          const mockResponse = {
            totalPages: 1,
            totalElements: 2,
            size: 10,
            content: [
              { uuid: validObjectUuid, name: 'Test Aggregate 1' },
              {
                uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                name: 'Test Aggregate 2'
              }
            ],
            number: 0,
            numberOfElements: 2,
            first: true,
            last: true,
            empty: false
          };

          jest
            .spyOn(client as any, 'post')
            .mockResolvedValue({ data: mockResponse });

          const result = await client.searchAggregates({
            page: 0,
            size: 10,
            searchTerm: 'test'
          });

          expect(result).toEqual(mockResponse);
        });
      });

      describe('createAggregates', () => {
        it('should create multiple aggregates', async () => {
          const aggregatesToCreate = [
            { name: 'Test Aggregate 1', description: 'First test aggregate' },
            { name: 'Test Aggregate 2', description: 'Second test aggregate' }
          ];

          const mockResponse = [
            {
              uuid: validObjectUuid,
              name: 'Test Aggregate 1',
              description: 'First test aggregate'
            },
            {
              uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
              name: 'Test Aggregate 2',
              description: 'Second test aggregate'
            }
          ];

          jest
            .spyOn(client as any, 'post')
            .mockResolvedValue({ data: mockResponse });

          const result = await client.createAggregates(aggregatesToCreate);

          expect(result).toEqual(mockResponse);
        });
      });

      describe('importAggregates', () => {
        it('should bulk import aggregates and return status only', async () => {
          const aggregatesToImport = [
            {
              name: 'Import Aggregate 1',
              description: 'First import aggregate'
            },
            {
              name: 'Import Aggregate 2',
              description: 'Second import aggregate'
            }
          ];

          jest.spyOn(client as any, 'post').mockResolvedValue({
            data: undefined,
            status: 200,
            statusText: 'OK'
          });

          const result = await client.importAggregates(aggregatesToImport);

          expect(result).toEqual({
            data: undefined,
            status: 200,
            statusText: 'OK'
          });
        });

        it('should handle import errors gracefully', async () => {
          const aggregatesToImport = [{ name: 'Import Aggregate 1' }];

          const mockError = {
            status: 400,
            message: 'Invalid aggregate data'
          };

          jest.spyOn(client as any, 'post').mockRejectedValue(mockError);

          const result = await client.importAggregates(aggregatesToImport);

          expect(result).toEqual({
            data: undefined,
            status: 400,
            statusText: 'Invalid aggregate data'
          });
        });

        it('should handle network errors with default status', async () => {
          const aggregatesToImport = [{ name: 'Import Aggregate 1' }];

          // Mock an error without status property to test default fallback
          jest
            .spyOn(client as any, 'post')
            .mockRejectedValue(new Error('Network error'));

          const result = await client.importAggregates(aggregatesToImport);

          expect(result).toEqual({
            data: undefined,
            status: 500,
            statusText: 'Network error' // Uses error.message
          });
        });
      });
    });
  });
});
