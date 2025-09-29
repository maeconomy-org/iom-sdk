import { z } from 'zod';
import { httpClient, logError } from '@/core';
import {
  ApiResponse,
  Predicate,
  UUStatementDTO,
  UUID,
  QueryParams,
  StatementQueryParams
} from '@/types';
import {
  validateStatementQueryParams,
  validate,
  statementDTOSchema
} from '@/validation';

const basePath = '/api/UUStatements';

/**
 * Get statements with optional filtering
 * This unified function handles all statement retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Statement query parameters (subject, predicate, object, softDeleted)
 * @returns List of statements matching the criteria
 */
export const getStatements =
  (client = httpClient) =>
  async (
    params?: StatementQueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    try {
      const cleanParams = validateStatementQueryParams(params);
      return await client.get<UUStatementDTO[]>(basePath, cleanParams);
    } catch (error: any) {
      logError('getStatements', error);
      throw error;
    }
  };

/**
 * Create or find statements
 *
 * @param client - HTTP client instance
 * @param statements - Statements to create or find
 * @returns Created or found statements
 */
export const createOrFindStatements =
  (client = httpClient) =>
  (statements: UUStatementDTO[]): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate input array of statements
    const validatedStatements = validate(
      z.array(statementDTOSchema),
      statements
    );

    return client.post<UUStatementDTO[]>(basePath, validatedStatements);
  };

/**
 * Create a single statement (convenience method)
 *
 * @param client - HTTP client instance
 * @param statement - Statement to create
 * @returns Created statement
 */
export const createStatement =
  (client = httpClient) =>
  async (statement: UUStatementDTO): Promise<ApiResponse<UUStatementDTO>> => {
    try {
      // Validate statement
      const validatedStatement = validate(statementDTOSchema, statement);

      const response = await client.post<UUStatementDTO>(basePath, [
        validatedStatement
      ]);

      return {
        ...response,
        data:
          Array.isArray(response.data) && response.data.length > 0
            ? response.data[0]
            : null
      };
    } catch (error: any) {
      logError('createStatement', error);
      throw error;
    }
  };

/**
 * Get statements by UUID and predicate
 * This is now a convenience wrapper around getAllStatements
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID to find statements for (subject)
 * @param predicate - The predicate to filter by
 * @param params - Query parameters
 * @returns Statements matching the criteria
 */
export const getStatementsByUuidAndPredicate =
  (client = httpClient) =>
  async (
    uuid: UUID,
    predicate: Predicate,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    try {
      // Validate UUID and predicate
      const validatedUuid = validate(z.string().uuid(), uuid);
      const validatedPredicate = validate(z.nativeEnum(Predicate), predicate);

      // Use getAllStatements with subject and predicate
      const statementParams: StatementQueryParams = {
        subject: validatedUuid,
        predicate: validatedPredicate,
        softDeleted: params?.softDeleted
      };

      return getStatements(client)(statementParams);
    } catch (error: any) {
      logError('getStatementsByUuidAndPredicate', error);
      throw error;
    }
  };

/**
 * Soft delete a statement
 * This performs a logical delete using the DELETE HTTP method
 *
 * @param client - HTTP client instance
 * @param statement - Statement to soft delete
 * @returns The API response
 */
export const softDeleteStatement =
  (client = httpClient) =>
  async (
    statement:
      | UUStatementDTO
      | { subject: UUID; predicate: Predicate; object: UUID }
  ): Promise<ApiResponse<any>> => {
    try {
      // Validate statement
      const validatedStatement = validate(statementDTOSchema, statement);

      // Use DELETE HTTP method with statement as request body
      return await client.delete<any>(basePath, validatedStatement);
    } catch (error: any) {
      logError('softDeleteStatement', error);
      throw error;
    }
  };

/**
 * Find all children of a given UUID
 *
 * @param client - HTTP client instance
 * @param parentUuid - The parent UUID
 * @param params - Query parameters
 * @returns Statements with parent-child relationship
 */
export const findChildren =
  (client = httpClient) =>
  (
    parentUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate parent UUID
    const validatedParentUuid = validate(z.string().uuid(), parentUuid);

    return getStatementsByUuidAndPredicate(client)(
      validatedParentUuid,
      Predicate.IS_PARENT_OF,
      params
    );
  };

/**
 * Find all parents of a given UUID
 *
 * @param client - HTTP client instance
 * @param childUuid - The child UUID
 * @param params - Query parameters
 * @returns Statements with child-parent relationship
 */
export const findParents =
  (client = httpClient) =>
  (
    childUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate child UUID
    const validatedChildUuid = validate(z.string().uuid(), childUuid);

    return getStatementsByUuidAndPredicate(client)(
      validatedChildUuid,
      Predicate.IS_CHILD_OF,
      params
    );
  };

/**
 * Find all properties of an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with object-property relationship
 */
export const findProperties =
  (client = httpClient) =>
  (
    objectUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate object UUID
    const validatedObjectUuid = validate(z.string().uuid(), objectUuid);

    return getStatementsByUuidAndPredicate(client)(
      validatedObjectUuid,
      Predicate.HAS_PROPERTY,
      params
    );
  };

/**
 * Find all values of a property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - The property UUID
 * @param params - Query parameters
 * @returns Statements with property-value relationship
 */
export const findPropertyValues =
  (client = httpClient) =>
  (
    propertyUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate property UUID
    const validatedPropertyUuid = validate(z.string().uuid(), propertyUuid);

    return getStatementsByUuidAndPredicate(client)(
      validatedPropertyUuid,
      Predicate.HAS_VALUE,
      params
    );
  };

/**
 * Find all files attached to an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with object-file relationship
 */
export const findFiles =
  (client = httpClient) =>
  (
    objectUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate object UUID
    const validatedObjectUuid = validate(z.string().uuid(), objectUuid);

    return getStatementsByUuidAndPredicate(client)(
      validatedObjectUuid,
      Predicate.HAS_FILE,
      params
    );
  };
