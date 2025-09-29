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
 * @param params - Query parameters for filtering (uuid, softDeleted)
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

/**
 * Upload a file's binary content via multipart/form-data
 *
 * Swagger: POST /api/UUFile/upload?uuidFile={uuidFile}&uuidToAttach={uuidToAttach}
 *
 * @param client - HTTP client instance
 * @param uuidFile - UUID of the file record
 * @param uuidToAttach - UUID of the object/property/value to attach to
 * @param file - Blob | File | Buffer to upload
 * @param fieldName - Optional field name (defaults to 'file')
 */
export const uploadFileBinary =
  (client = httpClient) =>
  async (
    uuidFile: UUID,
    uuidToAttach: UUID,
    file: any,
    fieldName: string = 'file'
  ): Promise<ApiResponse<any>> => {
    try {
      const validatedFileUuid = validateUuid(uuidFile);
      const validatedAttachUuid = validateUuid(uuidToAttach);

      // Construct a FormData payload (browser and modern Node >=18 support global FormData)
      const FormDataCtor = (globalThis as any).FormData;
      if (!FormDataCtor) {
        throw new Error(
          'FormData is not available in this environment. Please provide a global FormData (e.g., Node 18+), or polyfill it.'
        );
      }
      const formData = new FormDataCtor();
      formData.append(fieldName, file);

      // Build URL with query parameters
      const url = `${basePath}/upload?uuidFile=${validatedFileUuid}&uuidToAttach=${validatedAttachUuid}`;

      return await client.postForm<any>(url, formData);
    } catch (error: any) {
      logError('uploadFileBinary', error);
      throw error;
    }
  };

/**
 * Download a file's binary content
 *
 * Swagger: GET /api/UUFile/download/{uuid}
 */
export const downloadFileBinary =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<ArrayBuffer>> => {
    try {
      const validatedUuid = validateUuid(uuid);
      return await client.getBinary<ArrayBuffer>(
        `${basePath}/download/${validatedUuid}`
      );
    } catch (error: any) {
      logError('downloadFileBinary', error);
      throw error;
    }
  };
