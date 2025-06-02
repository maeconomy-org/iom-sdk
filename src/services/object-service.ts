import { ApiResponse, UUObjectDTO, UUID, QueryParams } from '@/types';
import { httpClient, logError } from '@/core';
import {
  validateQueryParams,
  validateUuid,
  validate,
  objectDTOSchema
} from '@/validation';

const basePath = '/api/UUObject';

/**
 * Get objects with optional filtering
 * This unified function handles all object retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted, createdBy)
 * @returns List of objects matching the criteria, or single object if uuid is provided
 */
export const getObjects =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUObjectDTO[]>> => {
    try {
      const cleanParams = validateQueryParams(params);
      return await client.get<UUObjectDTO[]>(basePath, cleanParams);
    } catch (error: any) {
      logError('getObjects', error);
      throw error;
    }
  };

/**
 * Create or update an object
 *
 * @param client - HTTP client instance
 * @param object - The object to create or update
 * @returns The created or updated object
 */
export const createOrUpdateObject =
  (client = httpClient) =>
  async (object: UUObjectDTO): Promise<ApiResponse<UUObjectDTO>> => {
    try {
      // Validate object data
      const validatedObject = validate(objectDTOSchema, object);

      return await client.post<UUObjectDTO>(basePath, validatedObject);
    } catch (error: any) {
      logError('createOrUpdateObject', error);
      throw error;
    }
  };

/**
 * Soft delete an object
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the object to delete
 * @returns The API response
 */
export const softDeleteObject =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<any>> => {
    try {
      // Validate UUID
      const validatedUuid = validateUuid(uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeleteObject', error);
      throw error;
    }
  };
