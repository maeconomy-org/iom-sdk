import { ApiResponse, UUFileDTO, UUID, QueryParams } from '@/types';
import { httpClient, logError } from '@/core';
import {
  validateQueryParams,
  validateUuid,
  validate,
  fileDTOSchema
} from '@/validation';

const basePath = '/api/UUFile';

/**
 * Get files with optional filtering
 * This unified function replaces getAllFiles, getOwnFiles, and getFileByUuid
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted, createdBy)
 * @returns List of files matching the criteria, or single file if uuid is provided
 */
export const getFiles =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUFileDTO[]>> => {
    try {
      const cleanParams = validateQueryParams(params);
      return await client.get<UUFileDTO[]>(basePath, cleanParams);
    } catch (error: any) {
      logError('getFiles', error);
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
      const validatedUuid = validateUuid(uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeleteFile', error);
      throw error;
    }
  };
