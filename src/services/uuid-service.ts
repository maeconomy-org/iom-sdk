import { ApiResponse, UUID } from '@/types';
import { httpClient, createHttpClient, logError } from '@/core';

/**
 * Creates a dedicated HTTP client for UUID service if a separate base URL is provided
 *
 * @param client - Default HTTP client
 * @param baseURL - Optional base URL for the UUID service
 * @returns HTTP client configured for UUID service
 */
const getUuidServiceClient = (client = httpClient, baseURL?: string) => {
  // If baseURL is explicitly provided, use it
  // Otherwise try to get it from the client config
  const uuidServiceBaseUrl = baseURL || client.config?.uuidServiceBaseUrl;

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
 * Get UUIDs owned by the current user/client
 * Uses /api/UUID/own endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns UUIDs owned by the current user/client
 */
export const getOwnedUUIDs =
  (client = httpClient, baseURL?: string) =>
  async (): Promise<ApiResponse<any>> => {
    try {
      const uuidClient = getUuidServiceClient(client, baseURL);
      const url = '/api/UUID/own';
      return await uuidClient.get(url);
    } catch (error: any) {
      logError('getOwnedUUIDs', error);
      throw error;
    }
  };

/**
 * Create a new UUID
 * Updated to use /api/UUID endpoint from new swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns The newly created UUID data
 */
export const createUUID =
  (client = httpClient, baseURL?: string) =>
  async (): Promise<ApiResponse<{ uuid: UUID }>> => {
    try {
      const uuidClient = getUuidServiceClient(client, baseURL);
      const url = '/api/UUID';
      return await uuidClient.post(url);
    } catch (error: any) {
      logError('createUUID', error);
      throw error;
    }
  };

/**
 * Get UUID record by UUID
 * Updated to use /api/UUID/{uuid} endpoint from new swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param uuid - UUID to find
 * @returns UUID record data
 */
export const getUUIDRecord =
  (client = httpClient, baseURL?: string) =>
  async (uuid: UUID): Promise<ApiResponse<any>> => {
    try {
      const uuidClient = getUuidServiceClient(client, baseURL);
      const url = `/api/UUID/${uuid}`;
      return await uuidClient.get(url);
    } catch (error: any) {
      logError('getUUIDRecord', error);
      throw error;
    }
  };

/**
 * Update UUID record metadata
 * New endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param params - UUID record metadata update parameters
 * @returns Updated UUID record data
 */
export const updateUUIDRecordMeta =
  (client = httpClient, baseURL?: string) =>
  async (params: {
    uuid?: UUID;
    nodeType: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const uuidClient = getUuidServiceClient(client, baseURL);
      const url = '/api/UUID/UUIDRecordMeta';
      return await uuidClient.put(url, params);
    } catch (error: any) {
      logError('updateUUIDRecordMeta', error);
      throw error;
    }
  };

/**
 * Authorize UUID record access
 * New endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param params - Authorization parameters
 * @returns Authorization response
 */
export const authorizeUUIDRecord =
  (client = httpClient, baseURL?: string) =>
  async (params: {
    userUUID: UUID;
    resourceId: UUID;
  }): Promise<ApiResponse<any>> => {
    try {
      const uuidClient = getUuidServiceClient(client, baseURL);
      const url = '/api/UUID/authorize';
      return await uuidClient.post(url, params);
    } catch (error: any) {
      logError('authorizeUUIDRecord', error);
      throw error;
    }
  };
