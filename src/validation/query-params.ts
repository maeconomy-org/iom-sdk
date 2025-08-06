import { z } from 'zod';

import {
  QueryParams,
  StatementQueryParams,
  Predicate,
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
    softDeleted: validate(z.boolean().optional(), params.softDeleted),
    createdBy: validate(z.string().optional(), params.createdBy)
  };

  // Remove undefined values from params
  return Object.fromEntries(
    Object.entries(validatedParams).filter(([_, v]) => v !== undefined)
  );
};

/**
 * Validates and cleans statement query parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Statement query parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
export const validateStatementQueryParams = (
  params?: StatementQueryParams
): Record<string, any> | undefined => {
  if (!params) {
    return undefined;
  }

  const validatedParams = {
    subject: params.subject
      ? validate(z.string().uuid(), params.subject)
      : undefined,
    predicate: params.predicate
      ? validate(z.nativeEnum(Predicate), params.predicate)
      : undefined,
    object: params.object
      ? validate(z.string().uuid(), params.object)
      : undefined,
    softDeleted: validate(z.boolean().optional(), params.softDeleted),
    createdBy: validate(z.string().optional(), params.createdBy)
  };

  // Remove undefined values from params
  return Object.fromEntries(
    Object.entries(validatedParams).filter(([_, v]) => v !== undefined)
  );
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

  const validatedParams = {
    page:
      params.page !== undefined
        ? validate(z.number().int().min(0), params.page)
        : undefined,
    size:
      params.size !== undefined
        ? validate(z.number().int().min(1).max(1000), params.size)
        : undefined,
    createdBy: validate(z.string().optional(), params.createdBy),
    hasChildrenFull: validate(z.boolean().optional(), params.hasChildrenFull),
    hasHistory: validate(z.boolean().optional(), params.hasHistory),
    hasParentUUIDFilter: validate(
      z.boolean().optional(),
      params.hasParentUUIDFilter
    ),
    parentUUID: params.parentUUID
      ? validate(z.string().uuid(), params.parentUUID)
      : undefined,
    searchTerm: validate(z.string().optional(), params.searchTerm)
  };

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
