import { z } from 'zod';

import {
  QueryParams,
  Predicate,
  UUStatementsAccessFindDTO,
  AggregateFindDTO
} from '@/types';
import { validate } from '@/validation/validate';

/**
 * Validates and cleans common query parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Query parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
export const validateQueryParams = (
  params?: QueryParams
): Record<string, any> | undefined => {
  if (!params) {
    return undefined;
  }

  const validatedParams = {
    uuid: params.uuid ? validate(z.string().uuid(), params.uuid) : undefined,
    softDeleted: validate(z.boolean().optional(), params.softDeleted)
  };

  // Remove undefined values from params
  return Object.fromEntries(
    Object.entries(validatedParams).filter(([_, v]) => v !== undefined)
  );
};

/**
 * Validates and cleans statement search body parameters
 * Used by POST /api/UUStatements/find
 *
 * @param body - Statement search body to validate
 * @returns Clean validated body or undefined if no params
 */
export const validateStatementSearchBody = (
  body?: UUStatementsAccessFindDTO
): Record<string, any> | undefined => {
  if (!body) {
    return undefined;
  }

  const validated: Record<string, any> = {};

  if (body.uuStatementFind) {
    const find: Record<string, any> = {
      subject: body.uuStatementFind.subject
        ? validate(z.string().uuid(), body.uuStatementFind.subject)
        : undefined,
      predicate: body.uuStatementFind.predicate
        ? validate(z.nativeEnum(Predicate), body.uuStatementFind.predicate)
        : undefined,
      object: body.uuStatementFind.object
        ? validate(z.string().uuid(), body.uuStatementFind.object)
        : undefined,
      softDeleted: validate(
        z.boolean().optional(),
        body.uuStatementFind.softDeleted
      )
    };
    validated.uuStatementFind = Object.fromEntries(
      Object.entries(find).filter(([_, v]) => v !== undefined)
    );
  }

  if (body.accessFind) {
    validated.accessFind = {
      readDefaultGroup: validate(
        z.boolean().optional(),
        body.accessFind.readDefaultGroup
      ),
      readOwnGroups: validate(
        z.boolean().optional(),
        body.accessFind.readOwnGroups
      ),
      readPublicGroups: validate(
        z.boolean().optional(),
        body.accessFind.readPublicGroups
      ),
      readUserSharedGroups: validate(
        z.boolean().optional(),
        body.accessFind.readUserSharedGroups
      ),
      groupUUIDList: body.accessFind.groupUUIDList
        ? validate(z.array(z.string()), body.accessFind.groupUUIDList)
        : undefined
    };
  }

  return Object.keys(validated).length > 0 ? validated : undefined;
};

/**
 * Validates and cleans aggregate find parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Aggregate find parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
export const validateAggregateParams = (
  params?: AggregateFindDTO
): Record<string, any> | undefined => {
  if (!params) {
    return undefined;
  }

  const validatedParams: Record<string, any> = {
    page:
      params.page !== undefined
        ? validate(z.number().int().min(0), params.page)
        : undefined,
    size:
      params.size !== undefined
        ? validate(z.number().int().min(1).max(1000), params.size)
        : undefined,
    hasChildrenFull: validate(z.boolean().optional(), params.hasChildrenFull),
    hasHistory: validate(z.boolean().optional(), params.hasHistory),
    hasParentUUIDFilter: validate(
      z.boolean().optional(),
      params.hasParentUUIDFilter
    ),
    parentUUID: params.parentUUID
      ? validate(z.string().uuid(), params.parentUUID)
      : undefined,
    searchTerm: validate(z.string().optional(), params.searchTerm),
    searchBy: validate(z.record(z.any()).optional(), params.searchBy)
  };

  if (params.accessFind) {
    validatedParams.accessFind = {
      readDefaultGroup: validate(
        z.boolean().optional(),
        params.accessFind.readDefaultGroup
      ),
      readOwnGroups: validate(
        z.boolean().optional(),
        params.accessFind.readOwnGroups
      ),
      readPublicGroups: validate(
        z.boolean().optional(),
        params.accessFind.readPublicGroups
      ),
      readUserSharedGroups: validate(
        z.boolean().optional(),
        params.accessFind.readUserSharedGroups
      ),
      groupUUIDList: params.accessFind.groupUUIDList
        ? validate(z.array(z.string()), params.accessFind.groupUUIDList)
        : undefined
    };
  }

  // Remove undefined values from params
  return Object.fromEntries(
    Object.entries(validatedParams).filter(([_, v]) => v !== undefined)
  );
};

/**
 * Validates a single UUID parameter
 *
 * @param uuid - UUID to validate
 * @returns Validated UUID
 */
export const validateUuid = (uuid: string): string => {
  return validate(z.string().uuid(), uuid);
};
