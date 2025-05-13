import { z } from 'zod';

import { ApiResponse, UUObjectDTO, UUID, QueryParams } from '../types';
import { httpClient } from '../core/http-client';
import { validate } from '../validation/validate';
import { objectDTOSchema } from '../validation/schemas';
import { logError } from '../core/logger';

const basePath = '/api/UUObject';

/**
 * Get all objects
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of objects
 */
export const getAllObjects =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUObjectDTO[]>> => {
    try {
      // Validate params if provided
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUObjectDTO[]>(basePath, validatedParams);
    } catch (error: any) {
      logError('getAllObjects', error);
      throw error;
    }
  };

/**
 * Get objects owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of objects owned by the current user
 */
export const getOwnObjects =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUObjectDTO[]>> => {
    try {
      // Validate params if provided
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUObjectDTO[]>(
        `${basePath}/own`,
        validatedParams
      );
    } catch (error: any) {
      logError('getOwnObjects', error);
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
 * Get an object by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the object to get
 * @param params - Query parameters
 * @returns The requested object or null if not found
 */
export const getObjectByUuid =
  (client = httpClient) =>
  async (
    uuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUObjectDTO | null>> => {
    try {
      // Validate UUID and params
      const validatedUuid = validate(z.string().uuid(), uuid);
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUObjectDTO | null>(
        `${basePath}/${validatedUuid}`,
        validatedParams
      );
    } catch (error: any) {
      logError('getObjectByUuid', error);
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
      const validatedUuid = validate(z.string().uuid(), uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeleteObject', error);
      throw error;
    }
  };

/**
 * Get all objects with a specific type
 *
 * @param client - HTTP client instance
 * @param type - The type to filter by
 * @param params - Query parameters
 * @returns List of objects with the specified type
 */
export const getObjectsByType =
  (client = httpClient) =>
  async (
    type: string,
    params?: QueryParams
  ): Promise<ApiResponse<UUObjectDTO[]>> => {
    try {
      // Validate input parameters
      const validatedType = validate(z.string().min(1), type);
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUObjectDTO[]>(
        `${basePath}/byType/${validatedType}`,
        validatedParams
      );
    } catch (error: any) {
      logError('getObjectsByType', error);
      throw error;
    }
  };
