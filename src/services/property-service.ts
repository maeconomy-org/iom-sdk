import { z } from 'zod';
import { ApiResponse, UUPropertyDTO, UUID, QueryParams } from '@/types';
import { httpClient, logError } from '@/core';
import {
  validateQueryParams,
  validateUuid,
  validate,
  propertyDTOSchema
} from '@/validation';

const basePath = '/api/UUProperty';

/**
 * Get properties with optional filtering
 * This unified function handles all property retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of properties matching the criteria, or single property if uuid is provided
 */
export const getProperties =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUPropertyDTO[]>> => {
    try {
      const cleanParams = validateQueryParams(params);
      return await client.get<UUPropertyDTO[]>(basePath, cleanParams);
    } catch (error: any) {
      logError('getProperties', error);
      throw error;
    }
  };

/**
 * Get a property by key (convenience function)
 * Note: This filters client-side since the API doesn't support direct key lookup
 *
 * @param client - HTTP client instance
 * @param key - The key of the property to get
 * @param params - Query parameters
 * @returns The requested property or null if not found
 */
export const getPropertyByKey =
  (client = httpClient) =>
  async (
    key: string,
    params?: QueryParams
  ): Promise<ApiResponse<UUPropertyDTO | null>> => {
    try {
      const validatedKey = validate(z.string().min(1), key);
      const response = await getProperties(client)(params);

      if (!response.data) {
        return {
          ...response,
          data: null
        };
      }

      // Filter by key on client side
      const property = response.data.find(p => p.key === validatedKey) || null;

      return {
        ...response,
        data: property
      };
    } catch (error: any) {
      logError('getPropertyByKey', error);
      throw error;
    }
  };

/**
 * Create or update a property
 *
 * @param client - HTTP client instance
 * @param property - The property to create or update
 * @returns The created or updated property
 */
export const createOrUpdateProperty =
  (client = httpClient) =>
  async (property: UUPropertyDTO): Promise<ApiResponse<UUPropertyDTO>> => {
    try {
      // Validate property data
      const validatedProperty = validate(propertyDTOSchema, property);

      return await client.post<UUPropertyDTO>(basePath, validatedProperty);
    } catch (error: any) {
      logError('createOrUpdateProperty', error);
      throw error;
    }
  };

/**
 * Soft delete a property
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property to delete
 * @returns The API response
 */
export const softDeleteProperty =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<any>> => {
    try {
      // Validate UUID
      const validatedUuid = validateUuid(uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeleteProperty', error);
      throw error;
    }
  };
