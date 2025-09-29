import { ApiResponse, UUPropertyValueDTO, UUID, QueryParams } from '@/types';
import { httpClient, logError } from '@/core';
import {
  validateQueryParams,
  validateUuid,
  validate,
  propertyValueDTOSchema
} from '@/validation';

const basePath = '/api/UUPropertyValue';

/**
 * Get property values with optional filtering
 * This unified function handles all property value retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of property values matching the criteria, or single property value if uuid is provided
 */
export const getPropertyValues =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUPropertyValueDTO[]>> => {
    try {
      const cleanParams = validateQueryParams(params);
      return await client.get<UUPropertyValueDTO[]>(basePath, cleanParams);
    } catch (error: any) {
      logError('getPropertyValues', error);
      throw error;
    }
  };

/**
 * Create or update a property value
 *
 * @param client - HTTP client instance
 * @param propertyValue - The property value to create or update
 * @returns The created or updated property value
 */
export const createOrUpdatePropertyValue =
  (client = httpClient) =>
  async (
    propertyValue: UUPropertyValueDTO
  ): Promise<ApiResponse<UUPropertyValueDTO>> => {
    try {
      // Validate property value data
      const validatedPropertyValue = validate(
        propertyValueDTOSchema,
        propertyValue
      );

      return await client.post<UUPropertyValueDTO>(
        basePath,
        validatedPropertyValue
      );
    } catch (error: any) {
      logError('createOrUpdatePropertyValue', error);
      throw error;
    }
  };

/**
 * Soft delete a property value
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property value to delete
 * @returns The API response
 */
export const softDeletePropertyValue =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<any>> => {
    try {
      // Validate UUID
      const validatedUuid = validateUuid(uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeletePropertyValue', error);
      throw error;
    }
  };
