import { httpClient, logError } from '@/core';
import * as fileService from '@/services/file-service';
import * as uuidService from '@/services/uuid-service';
import { ApiResponse, UUFileDTO, UUID } from '@/types';
import { validate, fileDTOSchema } from '@/validation';

/**
 * Register a file by external URL reference
 *
 * This creates or updates a UUFile record with a provided URL in `fileReference`.
 * If `uuid` is not provided, a new UUID will be requested first.
 */
export const uploadByReference =
  (client = httpClient) =>
  async (
    file: Partial<UUFileDTO> & { fileName: string; fileReference: string }
  ): Promise<ApiResponse<UUFileDTO | null>> => {
    try {
      let fileWithUuid: UUFileDTO;

      if (file.uuid) {
        fileWithUuid = file as UUFileDTO;
      } else {
        const uuidResponse = await uuidService.createUUID(client)();
        if (!uuidResponse.data?.uuid) {
          throw new Error('Failed to obtain UUID for file');
        }
        fileWithUuid = {
          ...(file as any),
          uuid: uuidResponse.data.uuid
        } as UUFileDTO;
      }

      // Validate and persist the UUFile record
      const validated = validate(fileDTOSchema, fileWithUuid);
      const created = await fileService.createOrUpdateFile(client)(validated);
      return created;
    } catch (error: any) {
      logError('uploadByReference (facade)', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error uploading file by reference'
      };
    }
  };

/**
 * Upload a file's binary content using multipart/form-data
 *
 * Steps:
 * 1) Ensure a UUFile record exists (create it if only metadata passed)
 * 2) POST the binary to /api/UUFile/upload/{uuid}
 */
type UploadDirectInput =
  | { uuid: UUID; file: any }
  | { file: any; fileName: string; fileReference: string; label?: string };

export const uploadDirect =
  (client = httpClient) =>
  async (input: UploadDirectInput): Promise<ApiResponse<UUFileDTO | null>> => {
    try {
      let fileUuid: UUID;

      if ('uuid' in input && (input as { uuid?: UUID }).uuid) {
        fileUuid = (input as { uuid: UUID }).uuid;
      } else {
        // Create UUFile record first
        const uuidResponse = await uuidService.createUUID(client)();
        if (!uuidResponse.data?.uuid) {
          throw new Error('Failed to obtain UUID for file');
        }

        const meta = input as Exclude<
          UploadDirectInput,
          { uuid: UUID; file: any }
        >;
        const fileRecord: UUFileDTO = {
          uuid: uuidResponse.data.uuid,
          fileName: meta.fileName,
          fileReference: meta.fileReference,
          label: meta.label
        } as UUFileDTO;

        const validated = validate(fileDTOSchema, fileRecord);
        const created = await fileService.createOrUpdateFile(client)(validated);
        if (!created.data) {
          throw new Error('Failed to create UUFile before binary upload');
        }
        fileUuid = created.data.uuid;
      }

      // Upload binary
      await fileService.uploadFileBinary(client)(fileUuid, input.file);

      // Return the final UUFile DTO
      const files = await fileService.getFiles(client)({ uuid: fileUuid });
      return {
        data: files.data?.[0] || null,
        status: files.status,
        statusText: files.statusText,
        headers: files.headers
      };
    } catch (error: any) {
      logError('uploadDirect (facade)', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error uploading file binary'
      };
    }
  };

/**
 * Download file binary via UUID
 */
export const download =
  (client = httpClient) =>
  async (uuid: UUID) => {
    try {
      return await fileService.downloadFileBinary(client)(uuid);
    } catch (error: any) {
      logError('download (facade)', error);
      throw error;
    }
  };
