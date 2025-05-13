import { z } from 'zod';

import {
  ApiResponse,
  Predicate,
  UUStatementDTO,
  UUID,
  QueryParams
} from '../types';
import { httpClient } from '../core/http-client';
import {
  findStatementsParamsSchema,
  statementDTOSchema
} from '../validation/schemas';
import { validate } from '../validation/validate';
import { logError } from '../core/logger';

const basePath = '/api/UUStatements';

/**
 * Get all statements
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of statements
 */
export const getAllStatements =
  (client = httpClient) =>
  (params?: QueryParams): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate params if provided
    const validatedParams = params
      ? {
          softDeleted: validate(z.boolean().optional(), params.softDeleted)
        }
      : undefined;

    return client.get<UUStatementDTO[]>(basePath, validatedParams);
  };

/**
 * Get a statement by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the statement
 * @param params - Query parameters
 * @returns Statement with the given UUID
 */
export const getStatementByUuid =
  (client = httpClient) =>
  (uuid: UUID, params?: QueryParams): Promise<ApiResponse<UUStatementDTO>> => {
    // Validate UUID
    const validatedUuid = validate(z.string().uuid(), uuid);

    // Validate params if provided
    const validatedParams = params
      ? {
          softDeleted: validate(z.boolean().optional(), params.softDeleted)
        }
      : undefined;

    return client.get<UUStatementDTO>(
      `${basePath}/${validatedUuid}`,
      validatedParams
    );
  };

/**
 * Get statements owned by the current user
 *
 * @param client - HTTP client instance
 * @param params - Query parameters
 * @returns List of statements owned by the current user
 */
export const getOwnStatements =
  (client = httpClient) =>
  (params?: QueryParams): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate params if provided
    const validatedParams = params
      ? {
          softDeleted: validate(z.boolean().optional(), params.softDeleted)
        }
      : undefined;

    return client.get<UUStatementDTO[]>(`${basePath}/own`, validatedParams);
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
 * Find statements based on subject, predicate, and/or object criteria
 *
 * @param client - HTTP client instance
 * @param params - Search parameters (subject, predicate, object)
 * @param queryParams - Query parameters like softDeleted
 * @returns Statements matching the criteria
 */
export const findStatements =
  (client = httpClient) =>
  async (
    params: {
      subject?: UUID;
      predicate?: Predicate;
      object?: UUID;
    },
    queryParams?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    try {
      // Validate search parameters
      const validatedParams = validate(findStatementsParamsSchema, params);
      const validatedQueryParams = queryParams
        ? {
            softDeleted: validate(
              z.boolean().optional(),
              queryParams.softDeleted
            )
          }
        : undefined;

      // Combine search params and query params for query string
      const combinedQueryParams = {
        ...(validatedParams.object ? { object: validatedParams.object } : {}),
        ...(validatedQueryParams || {})
      };

      // If we have both subject and predicate, use the direct path format
      if (validatedParams.subject && validatedParams.predicate) {
        return await client.get<UUStatementDTO[]>(
          `${basePath}/${validatedParams.subject}/${validatedParams.predicate}`,
          combinedQueryParams
        );
      }
      // If we have just predicate, use predicate path
      else if (validatedParams.predicate) {
        return await client.get<UUStatementDTO[]>(
          `${basePath}/${validatedParams.predicate}`,
          {
            ...(validatedParams.subject
              ? { subject: validatedParams.subject }
              : {}),
            ...combinedQueryParams
          }
        );
      }
      // If we have just subject, use subject path
      else if (validatedParams.subject) {
        return await client.get<UUStatementDTO[]>(
          `${basePath}/${validatedParams.subject}`,
          combinedQueryParams
        );
      }
      // If neither subject nor predicate is provided, we can't perform a search
      else {
        throw new Error(
          'At least subject or predicate must be provided for statement search'
        );
      }
    } catch (error: any) {
      logError('findStatements', error);
      throw error;
    }
  };

/**
 * Get statements by UUID and predicate
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID to find statements for
 * @param predicate - The predicate to filter by
 * @param params - Query parameters
 * @returns Statements matching the criteria
 */
export const getStatementsByUuidAndPredicate =
  (client = httpClient) =>
  (
    uuid: UUID,
    predicate: Predicate,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate UUID and predicate
    const validatedUuid = validate(z.string().uuid(), uuid);
    const validatedPredicate = validate(z.nativeEnum(Predicate), predicate);
    const validatedParams = params
      ? {
          softDeleted: validate(z.boolean().optional(), params.softDeleted)
        }
      : undefined;

    return client.get<UUStatementDTO[]>(
      `${basePath}/${validatedUuid}/${validatedPredicate}`,
      validatedParams
    );
  };

/**
 * Get statements by predicate
 *
 * @param client - HTTP client instance
 * @param predicate - The predicate to filter by
 * @param params - Query parameters
 * @returns Statements matching the predicate
 */
export const getStatementsByPredicate =
  (client = httpClient) =>
  (
    predicate: Predicate,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate predicate
    const validatedPredicate = validate(z.nativeEnum(Predicate), predicate);
    const validatedParams = params
      ? {
          softDeleted: validate(z.boolean().optional(), params.softDeleted)
        }
      : undefined;

    return client.get<UUStatementDTO[]>(
      `${basePath}/${validatedPredicate}`,
      validatedParams
    );
  };

/**
 * Get statements by subject
 *
 * @param client - HTTP client instance
 * @param subjectUuid - The subject UUID
 * @param params - Query parameters
 * @returns Statements with the given subject
 */
export const getStatementsBySubject =
  (client = httpClient) =>
  (
    subjectUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate subject UUID
    const validatedSubjectUuid = validate(z.string().uuid(), subjectUuid);

    return findStatements(client)({ subject: validatedSubjectUuid }, params);
  };

/**
 * Get statements by object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with the given object
 */
export const getStatementsByObject =
  (client = httpClient) =>
  async (
    objectUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUStatementDTO[]>> => {
    // Validate object UUID
    const validatedObjectUuid = validate(z.string().uuid(), objectUuid);

    // Since the API doesn't support direct filtering by object,
    // we need to get all statements and filter them manually
    // or we need to get all predicates and search each one for matching statements with this object

    // Get all statements (note: this might be inefficient for large datasets)
    const response = await getAllStatements(client)(params);

    if (!response.data) {
      return response;
    }

    // Filter statements where object matches the requested UUID
    const filteredStatements = response.data.filter(
      statement => statement.object === validatedObjectUuid
    );

    return {
      ...response,
      data: filteredStatements
    };
  };

/**
 * Delete a statement
 *
 * @param client - HTTP client instance
 * @param statement - Statement to delete
 * @returns API response
 */
export const deleteStatement =
  (client = httpClient) =>
  async (statement: UUStatementDTO): Promise<ApiResponse<any>> => {
    try {
      // Validate statement
      const validatedStatement = validate(statementDTOSchema, statement);

      return await client.post<any>(`${basePath}/delete`, validatedStatement);
    } catch (error: any) {
      logError('deleteStatement', error);
      throw error;
    }
  };

/**
 * Soft delete a statement
 * This performs a logical delete that can be undone later.
 *
 * @param client - HTTP client instance
 * @param statement - Statement to soft delete or individual components
 * @returns The API response
 */
export const softDeleteStatement =
  (client = httpClient) =>
  (
    statement:
      | UUStatementDTO
      | { subject: UUID; predicate: Predicate; object: UUID }
  ): Promise<ApiResponse<any>> => {
    // Validate statement
    const validatedStatement = validate(statementDTOSchema, statement);

    const { subject, predicate, object } = validatedStatement;

    return client.delete<any>(
      `${basePath}/${subject}/${predicate}/${object}/softDelete`
    );
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
