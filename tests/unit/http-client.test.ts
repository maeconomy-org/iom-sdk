import axios from 'axios';
import { createHttpClient } from '../../src/core/http-client';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HTTP Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as any);
  });

  describe('createHttpClient', () => {
    it('should create a client with the correct base URL', () => {
      const baseUrl = 'https://test-api.example.com';
      createHttpClient({ baseUrl });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: baseUrl
        })
      );
    });

    it('should add certificate to httpsAgent when provided', () => {
      const baseUrl = 'https://test-api.example.com';
      const cert = 'test-cert';
      const key = 'test-key';

      createHttpClient({
        baseUrl,
        certificate: { cert, key }
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          httpsAgent: expect.objectContaining({
            options: expect.objectContaining({
              cert,
              key
            })
          })
        })
      );
    });

    it('should add custom headers when provided', () => {
      const baseUrl = 'https://test-api.example.com';
      const headers = {
        'X-Custom-Header': 'test-value',
        Authorization: 'Bearer token123'
      };

      createHttpClient({
        baseUrl,
        headers
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining(headers)
        })
      );
    });
  });

  describe('HTTP methods', () => {
    const mockResponse = {
      data: { id: '123' },
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' }
    };

    const axiosInstance = {
      get: jest.fn().mockResolvedValue(mockResponse),
      post: jest.fn().mockResolvedValue(mockResponse),
      put: jest.fn().mockResolvedValue(mockResponse),
      delete: jest.fn().mockResolvedValue(mockResponse)
    };

    beforeEach(() => {
      mockedAxios.create.mockReturnValue(axiosInstance as any);
    });

    it('should make a GET request with the correct parameters', async () => {
      const client = createHttpClient({
        baseUrl: 'https://test-api.example.com'
      });

      const params = { id: '123' };
      const result = await client.get<any>('/test', params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/test', { params });
      expect(result).toEqual({
        data: mockResponse.data,
        status: mockResponse.status,
        statusText: mockResponse.statusText,
        headers: mockResponse.headers
      });
    });

    it('should make a POST request with the correct data', async () => {
      const client = createHttpClient({
        baseUrl: 'https://test-api.example.com'
      });

      const data = { name: 'Test' };
      const result = await client.post<any>('/test', data);

      expect(axiosInstance.post).toHaveBeenCalledWith('/test', data, undefined);
      expect(result).toEqual({
        data: mockResponse.data,
        status: mockResponse.status,
        statusText: mockResponse.statusText,
        headers: mockResponse.headers
      });
    });

    it('should make a PUT request with the correct data', async () => {
      const client = createHttpClient({
        baseUrl: 'https://test-api.example.com'
      });

      const data = { name: 'Updated Test' };
      const result = await client.put<any>('/test/123', data);

      expect(axiosInstance.put).toHaveBeenCalledWith('/test/123', data);
      expect(result).toEqual({
        data: mockResponse.data,
        status: mockResponse.status,
        statusText: mockResponse.statusText,
        headers: mockResponse.headers
      });
    });

    it('should make a DELETE request with the correct URL', async () => {
      const client = createHttpClient({
        baseUrl: 'https://test-api.example.com'
      });

      const result = await client.delete<any>('/test/123');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/test/123', undefined);
      expect(result).toEqual({
        data: mockResponse.data,
        status: mockResponse.status,
        statusText: mockResponse.statusText,
        headers: mockResponse.headers
      });
    });
  });

  describe('Error handling', () => {
    it('should handle response errors correctly', async () => {
      const errorResponse = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' }
        }
      };

      const axiosInstance = {
        get: jest.fn().mockRejectedValue(errorResponse)
      };

      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const client = createHttpClient({
        baseUrl: 'https://test-api.example.com'
      });

      await expect(client.get('/test/not-found')).rejects.toEqual({
        status: 404,
        statusText: 'Not Found',
        message: 'Resource not found',
        details: errorResponse.response.data
      });
    });

    it('should handle network errors correctly', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      const axiosInstance = {
        get: jest.fn().mockRejectedValue(networkError)
      };

      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const client = createHttpClient({
        baseUrl: 'https://test-api.example.com'
      });

      await expect(client.get('/test')).rejects.toEqual({
        status: 0,
        statusText: 'No Response',
        message: 'No response received from server',
        details: networkError.request
      });
    });

    it('should handle request setup errors correctly', async () => {
      const setupError = {
        message: 'Invalid URL'
      };

      const axiosInstance = {
        get: jest.fn().mockRejectedValue(setupError)
      };

      mockedAxios.create.mockReturnValue(axiosInstance as any);

      const client = createHttpClient({
        baseUrl: 'https://test-api.example.com'
      });

      await expect(client.get('/test')).rejects.toEqual({
        status: 0,
        statusText: 'Request Error',
        message: 'Invalid URL',
        details: setupError
      });
    });
  });
});
