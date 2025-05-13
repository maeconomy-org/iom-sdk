import { z } from 'zod';

import { ApiResponse, UUPropertyDTO, UUID, QueryParams } from '../types';
import { httpClient } from '../core/http-client';
import { validate } from '../validation/validate';
import { propertyDTOSchema } from '../validation/schemas';
import { logError } from '../core/logger';

const basePath = '/api/UUProperty';

/**
 * Get all properties
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of properties
 */
export const getAllProperties =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUPropertyDTO[]>> => {
    try {
      // Validate params if provided
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUPropertyDTO[]>(basePath, validatedParams);
    } catch (error: any) {
      logError('getAllProperties', error);
      throw error;
    }
  };

/**
 * Get properties owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of properties owned by the current user
 */
export const getOwnProperties =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUPropertyDTO[]>> => {
    try {
      // Validate params if provided
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUPropertyDTO[]>(
        `${basePath}/own`,
        validatedParams
      );
    } catch (error: any) {
      logError('getOwnProperties', error);
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
 * Get a property by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property to get
 * @param params - Query parameters
 * @returns The requested property or null if not found
 */
export const getPropertyByUuid =
  (client = httpClient) =>
  async (
    uuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUPropertyDTO | null>> => {
    try {
      // Validate UUID and params
      const validatedUuid = validate(z.string().uuid(), uuid);
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUPropertyDTO | null>(
        `${basePath}/${validatedUuid}`,
        validatedParams
      );
    } catch (error: any) {
      logError('getPropertyByUuid', error);
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
      const validatedUuid = validate(z.string().uuid(), uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeleteProperty', error);
      throw error;
    }
  };

/**
 * Get a property by key
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
      // Validate key and params
      const validatedKey = validate(z.string().min(1), key);
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUPropertyDTO | null>(
        `${basePath}/byKey/${validatedKey}`,
        validatedParams
      );
    } catch (error: any) {
      logError('getPropertyByKey', error);
      throw error;
    }
  };
