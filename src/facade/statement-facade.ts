import { z } from 'zod';

import {
  ApiResponse,
  Predicate,
  UUStatementDTO,
  UUID,
  QueryParams
} from '../types';
import { httpClient } from '../core/http-client';
import * as statementService from '../services/statement-service';
import * as objectService from '../services/object-service';
import * as propertyService from '../services/property-service';
import * as propertyValueService from '../services/property-value-service';
import * as fileService from '../services/file-service';
import { validate } from '../validation/validate';
import { statementDTOSchema } from '../validation/schemas';
import { logError } from '../core/logger';

/**
 * Get all statements with optional softDeleted filter
 * Direct wrapper for the findBySoftDeleted endpoint
 *
 * @param client - HTTP client instance
 * @param softDeleted - Whether to include soft-deleted statements
 * @returns List of statements based on the filter
 */
export const getAllStatements =
  (client = httpClient) =>
  (softDeleted?: boolean): Promise<ApiResponse<UUStatementDTO[]>> => {
    const params = softDeleted !== undefined ? { softDeleted } : undefined;
    return statementService.getAllStatements(client)(params);
  };

/**
 * Get all statements owned by the current user with optional softDeleted filter
 * Direct wrapper for the findBySoftDeletedOwn endpoint
 *
 * @param client - HTTP client instance
 * @param softDeleted - Whether to include soft-deleted statements
 * @returns List of statements owned by the current user
 */
export const getOwnStatements =
  (client = httpClient) =>
  (softDeleted?: boolean): Promise<ApiResponse<UUStatementDTO[]>> => {
    const params = softDeleted !== undefined ? { softDeleted } : undefined;
    return statementService.getOwnStatements(client)(params);
  };

/**
 * Get statements by UUID and predicate
 * Direct wrapper for the readStatementsByUUIDAndPredicate endpoint
 *
 * @param client - HTTP client instance
 * @param uuid - UUID to filter by
 * @param predicate - Predicate to filter by
 * @param softDeleted - Whether to include soft-deleted statements
 * @returns List of statements matching the UUID and predicate
 */
export const getStatementsByUuidAndPredicate =
  (client = httpClient) =>
  (
    uuid: UUID,
    predicate: Predicate,
    softDeleted?: boolean
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    const params = softDeleted !== undefined ? { softDeleted } : undefined;
    return statementService.getStatementsByUuidAndPredicate(client)(
      uuid,
      predicate,
      params
    );
  };

/**
 * Get statements by predicate
 * Direct wrapper for the readStatementsByPredicate endpoint
 *
 * @param client - HTTP client instance
 * @param predicate - Predicate to filter by
 * @param softDeleted - Whether to include soft-deleted statements
 * @returns List of statements matching the predicate
 */
export const getStatementsByPredicate =
  (client = httpClient) =>
  (
    predicate: Predicate,
    softDeleted?: boolean
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    const params = softDeleted !== undefined ? { softDeleted } : undefined;
    return statementService.getStatementsByPredicate(client)(predicate, params);
  };

/**
 * Create a relationship between two entities
 * This is a high-level wrapper around the createStatement service
 *
 * @param client - HTTP client instance
 * @param subject - UUID of the subject entity
 * @param predicate - Relationship type
 * @param object - UUID of the object entity
 * @returns The created statement
 */
export const createRelationship =
  (client = httpClient) =>
  async (
    subject: UUID,
    predicate: Predicate,
    object: UUID
  ): Promise<ApiResponse<UUStatementDTO>> => {
    try {
      // Validate inputs
      const validatedSubject = validate(z.string().uuid(), subject);
      const validatedPredicate = validate(z.nativeEnum(Predicate), predicate);
      const validatedObject = validate(z.string().uuid(), object);

      const statement: UUStatementDTO = {
        subject: validatedSubject,
        predicate: validatedPredicate,
        object: validatedObject
      };

      return statementService.createStatement(client)(statement);
    } catch (error: any) {
      logError('createRelationship', error);
      throw error;
    }
  };

/**
 * Delete a relationship between two entities
 * This is a high-level wrapper around the deleteStatement service
 *
 * @param client - HTTP client instance
 * @param subject - UUID of the subject entity
 * @param predicate - Relationship type
 * @param object - UUID of the object entity
 * @returns Response indicating success or failure
 */
export const deleteRelationship =
  (client = httpClient) =>
  async (
    subject: UUID,
    predicate: Predicate,
    object: UUID
  ): Promise<ApiResponse<any>> => {
    try {
      // Validate inputs
      const validatedSubject = validate(z.string().uuid(), subject);
      const validatedPredicate = validate(z.nativeEnum(Predicate), predicate);
      const validatedObject = validate(z.string().uuid(), object);

      const statement: UUStatementDTO = {
        subject: validatedSubject,
        predicate: validatedPredicate,
        object: validatedObject
      };

      return statementService.deleteStatement(client)(statement);
    } catch (error: any) {
      logError('deleteRelationship', error);
      throw error;
    }
  };

/**
 * Soft delete a relationship between two entities
 * This is a high-level wrapper around the softDeleteStatement service
 * The relationship is marked as deleted but can be restored later.
 *
 * @param client - HTTP client instance
 * @param subject - UUID of the subject entity
 * @param predicate - Relationship type
 * @param object - UUID of the object entity
 * @returns Response indicating success or failure
 */
export const softDeleteRelationship =
  (client = httpClient) =>
  async (
    subject: UUID,
    predicate: Predicate,
    object: UUID
  ): Promise<ApiResponse<any>> => {
    try {
      // Validate inputs
      const validatedSubject = validate(z.string().uuid(), subject);
      const validatedPredicate = validate(z.nativeEnum(Predicate), predicate);
      const validatedObject = validate(z.string().uuid(), object);

      const statement: UUStatementDTO = {
        subject: validatedSubject,
        predicate: validatedPredicate,
        object: validatedObject
      };

      return statementService.softDeleteStatement(client)(statement);
    } catch (error: any) {
      logError('softDeleteRelationship', error);
      throw error;
    }
  };

/**
 * Find all relationships for a specific entity
 * This combines multiple statement queries to find all relationships
 * where the entity appears as either subject or object
 *
 * @param client - HTTP client instance
 * @param entityUuid - UUID of the entity
 * @param params - Query parameters
 * @returns All statements involving the entity
 */
export const findAllRelationships =
  (client = httpClient) =>
  async (
    entityUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    try {
      // Validate UUID
      const validatedUuid = validate(z.string().uuid(), entityUuid);

      // Get statements where entity is subject
      const asSubjectResponse = await statementService.getStatementsBySubject(
        client
      )(validatedUuid, params);

      // Get statements where entity is object
      const asObjectResponse = await statementService.getStatementsByObject(
        client
      )(validatedUuid, params);

      // Combine results
      const combinedStatements = [
        ...(asSubjectResponse.data || []),
        ...(asObjectResponse.data || [])
      ];

      return {
        data: combinedStatements,
        status: asSubjectResponse.status,
        statusText: asSubjectResponse.statusText,
        headers: asSubjectResponse.headers
      };
    } catch (error: any) {
      logError('findAllRelationships', error);
      throw error;
    }
  };

/**
 * Get the entity details for each part of a statement
 * This expands a statement to include full details about subject and object entities
 *
 * @param client - HTTP client instance
 * @param statement - The statement to expand
 * @returns Statement with expanded subject and object details
 */
export const expandStatement =
  (client = httpClient) =>
  async (
    statement: UUStatementDTO
  ): Promise<
    ApiResponse<{
      statement: UUStatementDTO;
      subjectDetails: any | null;
      objectDetails: any | null;
    }>
  > => {
    try {
      // Validate statement
      const validatedStatement = validate(statementDTOSchema, statement);

      // Try to get subject details
      let subjectDetails = null;
      try {
        // First try as object
        const objectResponse = await objectService.getObjectByUuid(client)(
          validatedStatement.subject
        );
        if (objectResponse.data) {
          subjectDetails = objectResponse.data;
        } else {
          // Then try as property
          const propertyResponse = await propertyService.getPropertyByUuid(
            client
          )(validatedStatement.subject);
          if (propertyResponse.data) {
            subjectDetails = propertyResponse.data;
          } else {
            // Then try as property value
            const valueResponse =
              await propertyValueService.getPropertyValueByUuid(client)(
                validatedStatement.subject
              );
            if (valueResponse.data) {
              subjectDetails = valueResponse.data;
            } else {
              // Finally try as file
              const fileResponse = await fileService.getFileByUuid(client)(
                validatedStatement.subject
              );
              if (fileResponse.data) {
                subjectDetails = fileResponse.data;
              }
            }
          }
        }
      } catch (e) {
        // Ignore errors in subject resolution
      }

      // Try to get object details
      let objectDetails = null;
      try {
        // First try as object
        const objectResponse = await objectService.getObjectByUuid(client)(
          validatedStatement.object
        );
        if (objectResponse.data) {
          objectDetails = objectResponse.data;
        } else {
          // Then try as property
          const propertyResponse = await propertyService.getPropertyByUuid(
            client
          )(validatedStatement.object);
          if (propertyResponse.data) {
            objectDetails = propertyResponse.data;
          } else {
            // Then try as property value
            const valueResponse =
              await propertyValueService.getPropertyValueByUuid(client)(
                validatedStatement.object
              );
            if (valueResponse.data) {
              objectDetails = valueResponse.data;
            } else {
              // Finally try as file
              const fileResponse = await fileService.getFileByUuid(client)(
                validatedStatement.object
              );
              if (fileResponse.data) {
                objectDetails = fileResponse.data;
              }
            }
          }
        }
      } catch (e) {
        // Ignore errors in object resolution
      }

      return {
        data: {
          statement: validatedStatement,
          subjectDetails,
          objectDetails
        },
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      logError('expandStatement', error);
      throw error;
    }
  };
