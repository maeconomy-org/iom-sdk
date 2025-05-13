import { ApiResponse, Predicate, UUFileDTO, UUID, QueryParams } from '../types';
import { httpClient } from '../core/http-client';
import * as fileService from '../services/file-service';
import * as statementService from '../services/statement-service';
import * as uuidService from '../services/uuid-service';
import { validate } from '../validation/validate';
import { z } from 'zod';

/**
 * Attach a file to an object
 * This high-level operation automatically gets a UUID, creates the file,
 * and establishes the relationship with the object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to attach the file to
 * @param file - File data (UUID will be generated if not provided)
 * @returns The created file
 */
export const attachFileToObject =
  (client = httpClient) =>
  async (
    objectUuid: UUID,
    file: Partial<UUFileDTO> & { fileName: string; fileReference: string }
  ): Promise<ApiResponse<UUFileDTO>> => {
    // Validate objectUuid
    const validatedObjectUuid = validate(z.string().uuid(), objectUuid);

    // Get UUID if needed
    let fileWithUuid: UUFileDTO;

    if ('uuid' in file && file.uuid) {
      fileWithUuid = file as UUFileDTO;
    } else {
      const uuidResponse = await uuidService.createUUID(client)();
      if (!uuidResponse.data?.uuid) {
        throw new Error('Failed to obtain UUID for file');
      }
      fileWithUuid = { ...file, uuid: uuidResponse.data.uuid } as UUFileDTO;
    }

    // Create file
    const fileResponse =
      await fileService.createOrUpdateFile(client)(fileWithUuid);

    if (fileResponse.data) {
      // Create relationships
      await statementService.createStatement(client)({
        subject: validatedObjectUuid,
        predicate: Predicate.HAS_FILE,
        object: fileResponse.data.uuid
      });

      // Create inverse relationship
      await statementService.createStatement(client)({
        subject: fileResponse.data.uuid,
        predicate: Predicate.IS_FILE_OF,
        object: validatedObjectUuid
      });
    }

    return fileResponse;
  };

/**
 * Get all files for an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to get files for
 * @param params - Query parameters
 * @returns List of files for the object
 */
export const getFilesForObject =
  (client = httpClient) =>
  async (
    objectUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUFileDTO[]>> => {
    // Validate objectUuid
    const validatedObjectUuid = validate(z.string().uuid(), objectUuid);

    // Get file statements
    const statementsResponse = await statementService.findFiles(client)(
      validatedObjectUuid,
      params
    );

    if (!statementsResponse.data || statementsResponse.data.length === 0) {
      return {
        data: [],
        status: statementsResponse.status,
        statusText: statementsResponse.statusText,
        headers: statementsResponse.headers
      };
    }

    // Get file details for each statement
    const files: UUFileDTO[] = [];

    for (const statement of statementsResponse.data) {
      const fileUuid = statement.object;
      const fileResponse = await fileService.getFileByUuid(client)(
        fileUuid,
        params
      );

      if (fileResponse.data) {
        files.push(fileResponse.data);
      }
    }

    return {
      data: files,
      status: statementsResponse.status,
      statusText: statementsResponse.statusText,
      headers: statementsResponse.headers
    };
  };
