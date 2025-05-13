import { z } from 'zod';

import { ApiResponse, UUPropertyValueDTO, UUID, QueryParams } from '../types';
import { httpClient } from '../core/http-client';
import { validate } from '../validation/validate';
import { propertyValueDTOSchema } from '../validation/schemas';
import { logError } from '../core/logger';

const basePath = '/api/UUPropertyValue';

/**
 * Get all property values
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of property values
 */
export const getAllPropertyValues =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUPropertyValueDTO[]>> => {
    try {
      // Validate params if provided
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUPropertyValueDTO[]>(basePath, validatedParams);
    } catch (error: any) {
      logError('getAllPropertyValues', error);
      throw error;
    }
  };

/**
 * Get property values owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of property values owned by the current user
 */
export const getOwnPropertyValues =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUPropertyValueDTO[]>> => {
    try {
      // Validate params if provided
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUPropertyValueDTO[]>(
        `${basePath}/own`,
        validatedParams
      );
    } catch (error: any) {
      logError('getOwnPropertyValues', error);
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
 * Get a property value by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property value to get
 * @param params - Query parameters
 * @returns The requested property value or null if not found
 */
export const getPropertyValueByUuid =
  (client = httpClient) =>
  async (
    uuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUPropertyValueDTO | null>> => {
    try {
      // Validate UUID and params
      const validatedUuid = validate(z.string().uuid(), uuid);
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUPropertyValueDTO | null>(
        `${basePath}/${validatedUuid}`,
        validatedParams
      );
    } catch (error: any) {
      logError('getPropertyValueByUuid', error);
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
      const validatedUuid = validate(z.string().uuid(), uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeletePropertyValue', error);
      throw error;
    }
  };
