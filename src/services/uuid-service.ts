import { ApiResponse, UUID } from '../types';
import { httpClient, createHttpClient } from '../core/http-client';
import { logError } from '../core/logger';

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
 * Get all UUID ownership information
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns All UUID ownership data
 */
export const getAllUUIDOwners =
  (client = httpClient, baseURL?: string) =>
  async (): Promise<ApiResponse<any>> => {
    try {
      const uuidClient = getUuidServiceClient(client, baseURL);
      const url = '/api/UUIDOwner';
      return await uuidClient.get(url);
    } catch (error: any) {
      logError('getAllUUIDOwners', error);
      throw error;
    }
  };

/**
 * Create a new UUID
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
      const url = '/api/UUIDOwner';
      return await uuidClient.post(url);
    } catch (error: any) {
      logError('createUUID', error);
      throw error;
    }
  };

/**
 * Get UUIDs owned by the current user/client
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
      const url = '/api/UUIDOwner/own';
      return await uuidClient.get(url);
    } catch (error: any) {
      logError('getOwnedUUIDs', error);
      throw error;
    }
  };
