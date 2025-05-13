import { z } from 'zod';

import { ApiResponse, UUFileDTO, UUID, QueryParams } from '../types';
import { httpClient } from '../core/http-client';
import { validate } from '../validation/validate';
import { fileDTOSchema } from '../validation/schemas';
import { logError } from '../core/logger';

const basePath = '/api/UUFile';

/**
 * Get all files
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of files
 */
export const getAllFiles =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUFileDTO[]>> => {
    try {
      // Validate params if provided
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUFileDTO[]>(basePath, validatedParams);
    } catch (error: any) {
      logError('getAllFiles', error);
      throw error;
    }
  };

/**
 * Get files owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of files owned by the current user
 */
export const getOwnFiles =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUFileDTO[]>> => {
    try {
      // Validate params if provided
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUFileDTO[]>(`${basePath}/own`, validatedParams);
    } catch (error: any) {
      logError('getOwnFiles', error);
      throw error;
    }
  };

/**
 * Create or update a file
 *
 * @param client - HTTP client instance
 * @param file - The file to create or update
 * @returns The created or updated file
 */
export const createOrUpdateFile =
  (client = httpClient) =>
  async (file: UUFileDTO): Promise<ApiResponse<UUFileDTO>> => {
    try {
      // Validate file data
      const validatedFile = validate(fileDTOSchema, file);

      return await client.post<UUFileDTO>(basePath, validatedFile);
    } catch (error: any) {
      logError('createOrUpdateFile', error);
      throw error;
    }
  };

/**
 * Get a file by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the file to get
 * @param params - Query parameters
 * @returns The requested file or null if not found
 */
export const getFileByUuid =
  (client = httpClient) =>
  async (
    uuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUFileDTO | null>> => {
    try {
      // Validate UUID and params
      const validatedUuid = validate(z.string().uuid(), uuid);
      const validatedParams = params
        ? {
            softDeleted: validate(z.boolean().optional(), params.softDeleted)
          }
        : undefined;

      return await client.get<UUFileDTO | null>(
        `${basePath}/${validatedUuid}`,
        validatedParams
      );
    } catch (error: any) {
      logError('getFileByUuid', error);
      throw error;
    }
  };

/**
 * Get file content
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the file to get content for
 * @returns The file content (typically base64 encoded)
 */
export const getFileContent =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<string>> => {
    try {
      // Validate UUID
      const validatedUuid = validate(z.string().uuid(), uuid);

      return await client.get<string>(`${basePath}/${validatedUuid}/content`);
    } catch (error: any) {
      logError('getFileContent', error);
      throw error;
    }
  };

/**
 * Soft delete a file
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the file to delete
 * @returns The API response
 */
export const softDeleteFile =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<any>> => {
    try {
      // Validate UUID
      const validatedUuid = validate(z.string().uuid(), uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeleteFile', error);
      throw error;
    }
  };
