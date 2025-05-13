import * as objectService from '../../src/services/object-service';
import { httpClient } from '../../src/core/http-client';
import { UUObjectDTO } from '../../src/types';

// Mock the HTTP client
jest.mock('../../src/core/http-client', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    config: {
      baseUrl: 'https://test-api.example.com'
    }
  }
}));

describe('Object Service', () => {
  const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllObjects', () => {
    it('should make a GET request to the correct endpoint', async () => {
      const mockResponse = {
        data: [{ uuid: '123', name: 'Test Building' }],
        status: 200,
        statusText: 'OK'
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await objectService.getAllObjects()({
        softDeleted: false
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/UUObject', {
        softDeleted: false
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include softDeleted parameter when true', async () => {
      const mockResponse = {
        data: [{ uuid: '123', name: 'Test Building' }],
        status: 200,
        statusText: 'OK'
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      await objectService.getAllObjects()({ softDeleted: true });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/UUObject', {
        softDeleted: true
      });
    });
  });

  describe('createOrUpdateObject', () => {
    it('should make a POST request with the object data', async () => {
      const mockObject: UUObjectDTO = {
        uuid: '123',
        name: 'Test Building'
      };

      const mockResponse = {
        data: { ...mockObject },
        status: 201,
        statusText: 'Created'
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await objectService.createOrUpdateObject()(mockObject);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/UUObject',
        mockObject
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getObjectByUuid', () => {
    it('should make a GET request to the correct endpoint with UUID', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const mockResponse = {
        data: { uuid, name: 'Test Building' },
        status: 200,
        statusText: 'OK'
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await objectService.getObjectByUuid()(uuid);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/UUObject/${uuid}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle null response for non-existent object', async () => {
      const uuid = 'nonexistent-uuid';

      const mockResponse = {
        data: null,
        status: 404,
        statusText: 'Not Found'
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await objectService.getObjectByUuid()(uuid);

      expect(result.data).toBeNull();
      expect(result.status).toBe(404);
    });
  });

  describe('softDeleteObject', () => {
    it('should make a DELETE request to the correct endpoint with UUID', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK'
      };

      mockHttpClient.delete.mockResolvedValue(mockResponse);

      const result = await objectService.softDeleteObject()(uuid);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        `/api/UUObject/${uuid}`
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getObjectsByType', () => {
    it('should make a GET request to the correct endpoint with type', async () => {
      const type = 'building';

      const mockResponse = {
        data: [
          { uuid: '123', name: 'Building 1' },
          { uuid: '456', name: 'Building 2' }
        ],
        status: 200,
        statusText: 'OK'
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await objectService.getObjectsByType()(type, {
        softDeleted: false
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/api/UUObject/byType/${type}`,
        {
          softDeleted: false
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include softDeleted parameter when true', async () => {
      const type = 'building';

      mockHttpClient.get.mockResolvedValue({
        data: [],
        status: 200,
        statusText: 'OK'
      });

      await objectService.getObjectsByType()(type, { softDeleted: true });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/api/UUObject/byType/${type}`,
        {
          softDeleted: true
        }
      );
    });
  });

  describe('Custom HTTP client', () => {
    it('should use the provided HTTP client instead of the default one', async () => {
      const customClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        config: {
          baseUrl: 'https://custom-api.example.com'
        }
      };

      const mockResponse = {
        data: [{ uuid: '123', name: 'Custom Building' }],
        status: 200,
        statusText: 'OK'
      };

      customClient.get.mockResolvedValue(mockResponse);

      const result = await objectService.getAllObjects(customClient)({
        softDeleted: false
      });

      expect(customClient.get).toHaveBeenCalledWith('/api/UUObject', {
        softDeleted: false
      });
      expect(mockHttpClient.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
