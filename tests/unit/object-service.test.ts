import * as objectService from '../../src/services/object-service';
import { UUObjectDTO } from '../../src/types';

// Mock the HTTP client
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  config: {
    baseUrl: 'https://api.example.com'
  }
};

// Use jest.doMock to mock the barrel '@/core' import used by services
jest.doMock('../../src/core', () => ({
  httpClient: mockHttpClient,
  logError: jest.fn()
}));

describe('Object Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getObjects', () => {
    it('should make a GET request to get all objects', async () => {
      const mockResponse = {
        data: [
          {
            uuid: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Building'
          }
        ],
        status: 200,
        statusText: 'OK'
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await objectService.getObjects()({
        softDeleted: false
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/UUObject', {
        softDeleted: false
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make a GET request to get object by UUID', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const mockResponse = {
        data: [{ uuid, name: 'Test Building' }],
        status: 200,
        statusText: 'OK'
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await objectService.getObjects()({
        uuid: uuid
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/UUObject', {
        uuid: uuid
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include softDeleted parameter when true', async () => {
      const mockResponse = {
        data: [
          {
            uuid: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Building'
          }
        ],
        status: 200,
        statusText: 'OK'
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      await objectService.getObjects()({ softDeleted: true });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/UUObject', {
        softDeleted: true
      });
    });
  });

  describe('createOrUpdateObject', () => {
    it('should make a POST request with the object data', async () => {
      const mockObject: UUObjectDTO = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
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

  describe('Custom HTTP client', () => {
    it('should use the provided HTTP client instead of the default one', async () => {
      const customClient = {
        get: jest.fn(),
        getBinary: jest.fn(),
        post: jest.fn(),
        postForm: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        config: {
          baseUrl: 'https://custom-api.example.com'
        }
      } as any;

      const mockResponse = {
        data: [
          {
            uuid: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Custom Building'
          }
        ],
        status: 200,
        statusText: 'OK'
      };

      customClient.get.mockResolvedValue(mockResponse);

      const result = await objectService.getObjects(customClient)({
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
