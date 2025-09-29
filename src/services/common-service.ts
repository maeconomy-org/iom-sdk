import { ApiResponse, AuthResponse } from '@/types';
import { httpClient, createHttpClient, logError } from '@/core';

/**
 * Creates a dedicated HTTP client for UUID service if a separate base URL is provided
 *
 * @param client - Default HTTP client
 * @returns HTTP client configured for UUID service
 */
const getUuidServiceClient = (client = httpClient) => {
  const uuidServiceBaseUrl = client.config?.uuidServiceBaseUrl;

  if (!uuidServiceBaseUrl) {
    return client;
  }

  // Create a new client with the UUID service base URL
  const config = {
    ...client.config,
    baseUrl: uuidServiceBaseUrl
  };

  return createHttpClient(config);
};

/**
 * Authenticate with the base service using client certificate (mTLS)
 * This will trigger the browser certificate selection popup
 *
 * @param client - HTTP client instance
 * @returns Base service authentication data
 */
export const requestBaseAuth =
  (client = httpClient) =>
  async (): Promise<ApiResponse<AuthResponse | null>> => {
    try {
      const response = await client.get<AuthResponse>('/api/User');

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };
    } catch (error: any) {
      logError('requestBaseAuth', error);
      return {
        data: null,
        status: error.status || 500,
        statusText:
          error.statusText ||
          error.message ||
          'Error authenticating with base service',
        headers: {}
      };
    }
  };

/**
 * Authenticate with the UUID service using client certificate (mTLS)
 * This will trigger the browser certificate selection popup
 *
 * @param client - HTTP client instance
 * @returns UUID service authentication data
 */
export const requestUuidAuth =
  (client = httpClient) =>
  async (): Promise<ApiResponse<AuthResponse | null>> => {
    try {
      const uuidClient = getUuidServiceClient(client);

      if (uuidClient === client && !client.config?.uuidServiceBaseUrl) {
        return {
          data: null,
          status: 400,
          statusText: 'UUID service URL not configured',
          headers: {}
        };
      }

      const response = await uuidClient.get<AuthResponse>('/api/User');

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };
    } catch (error: any) {
      logError('requestUuidAuth', error);
      return {
        data: null,
        status: error.status || 500,
        statusText:
          error.statusText ||
          error.message ||
          'Error authenticating with UUID service',
        headers: {}
      };
    }
  };
