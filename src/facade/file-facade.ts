import { httpClient, logError } from '@/core';
import * as fileService from '@/services/file-service';
import * as statementService from '@/services/statement-service';
import * as uuidService from '@/services/uuid-service';
import { ApiResponse, UUFileDTO, UUID, Predicate } from '@/types';
import { validate, fileDTOSchema } from '@/validation';

/**
 * Upload a file by external URL reference
 *
 * This creates a UUFile record with a provided URL in `fileReference` and links it to a parent object.
 * Always creates a new UUID first, then creates the file record and statement.
 *
 * @param client - HTTP client instance
 * @param input - File reference input with required fileReference and uuidToAttach
 * @returns The created file record
 */
export const uploadByReference =
  (client = httpClient) =>
  async (input: {
    fileReference: string; // Required - external URL or reference
    uuidToAttach: UUID; // Required - UUID of object/property/value to attach to
    label?: string;
  }): Promise<ApiResponse<UUFileDTO | null>> => {
    try {
      // 1. Always create UUID for the file
      const uuidResponse = await uuidService.createUUID(client)();
      if (!uuidResponse.data?.uuid) {
        throw new Error('Failed to obtain UUID for file');
      }

      const fileUuid = uuidResponse.data.uuid;

      // 2. Create UUFile record with provided data
      const fileRecord: UUFileDTO = {
        uuid: fileUuid,
        fileReference: input.fileReference,
        label: input.label
      };

      // Validate and persist the UUFile record
      const validated = validate(fileDTOSchema, fileRecord);
      const created = await fileService.createOrUpdateFile(client)(validated);
      if (!created.data) {
        throw new Error('Failed to create UUFile record');
      }

      // 3. Create statement to link file to parent object
      await statementService.createStatement(client)({
        subject: input.uuidToAttach,
        predicate: Predicate.HAS_FILE,
        object: fileUuid
      });

      // Return standardized success response
      return {
        data: created.data,
        status: created.status,
        statusText: created.statusText,
        headers: created.headers
      };
    } catch (error: any) {
      logError('uploadByReference (facade)', error);
      return {
        data: null,
        status: error.status || 500,
        statusText:
          error.statusText ||
          error.message ||
          'Error uploading file by reference',
        headers: error.headers || {}
      };
    }
  };

/**
 * Upload a file's binary content directly
 *
 * Complete flow for direct binary upload:
 * 1) Create UUID for the file
 * 2) Create UUFile record with fileName
 * 3) POST the binary to /api/UUFile/upload with uuidFile and uuidToAttach
 * 4) Create statement to link file to parent object
 *
 * @param client - HTTP client instance
 * @param input - File upload input
 * @returns The created file record
 */
export const uploadDirect =
  (client = httpClient) =>
  async (input: {
    file: File | Blob | ArrayBuffer | FormData;
    uuidToAttach: UUID;
  }): Promise<ApiResponse<UUFileDTO | null>> => {
    try {
      // 1. Create UUID for the file
      const uuidResponse = await uuidService.createUUID(client)();
      if (!uuidResponse.data?.uuid) {
        throw new Error('Failed to obtain UUID for file');
      }
      const fileUuid = uuidResponse.data.uuid;

      // 2. Upload the binary content with attachment UUID
      const created = await fileService.uploadFileBinary(client)(
        fileUuid,
        input.uuidToAttach,
        input.file
      );

      // 3. Create statement to link file to parent object
      await statementService.createStatement(client)({
        subject: input.uuidToAttach,
        predicate: Predicate.HAS_FILE,
        object: fileUuid
      });

      // Return the created file record
      return {
        data: created.data,
        status: created.status,
        statusText: created.statusText,
        headers: created.headers
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
 * Upload using pre-constructed FormData from UI
 *
 * For cases where the UI has already constructed FormData with additional fields.
 * This method bypasses the internal FormData construction and uses the provided FormData directly.
 *
 * @param client - HTTP client instance
 * @param input - Upload input with pre-constructed FormData
 * @returns Upload response
 */
export const uploadFormData =
  (client = httpClient) =>
  async (input: {
    formData: FormData;
    uuidFile: UUID;
    uuidToAttach: UUID;
  }): Promise<ApiResponse<any>> => {
    try {
      // Build URL with query parameters
      const url = `/api/UUFile/upload?uuidFile=${input.uuidFile}&uuidToAttach=${input.uuidToAttach}`;

      // Use the pre-constructed FormData directly
      return await client.postForm<any>(url, input.formData);
    } catch (error: any) {
      logError('uploadFormData (facade)', error);
      throw error;
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
