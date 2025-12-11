import { QueryParams, StatementQueryParams, AggregateFindDTO } from '@/types';
/**
 * Validates and cleans common query parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Query parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
export declare const validateQueryParams: (params?: QueryParams) => Record<string, any> | undefined;
/**
 * Validates and cleans statement query parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Statement query parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
export declare const validateStatementQueryParams: (params?: StatementQueryParams) => Record<string, any> | undefined;
/**
 * Validates and cleans aggregate find parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Aggregate find parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
export declare const validateAggregateParams: (params?: AggregateFindDTO) => Record<string, any> | undefined;
/**
 * Validates a single UUID parameter
 *
 * @param uuid - UUID to validate
 * @returns Validated UUID
 */
export declare const validateUuid: (uuid: string) => string;
