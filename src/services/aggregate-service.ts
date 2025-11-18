import {
  ApiResponse,
  AggregateFindDTO,
  AggregateEntity,
  PageAggregateEntity,
  AggregateCreateDTO,
  UUID
} from '@/types';
import { httpClient, logError } from '@/core';
import { validateAggregateParams, validateUuid } from '@/validation';

const basePath = '/api/Aggregate';

/**
 * Find any entity by UUID using the aggregate API
 * Uses the new /api/Aggregate/{uuid} endpoint which provides rich aggregated data
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the entity to find
 * @returns The aggregate entity if found, null otherwise
 */
export const findByUUID =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<AggregateEntity[] | null>> => {
    try {
      // Validate parameters
      const validatedUuid = validateUuid(uuid);

      // Use the aggregate endpoint for UUID-based search
      const response = await client.get<AggregateEntity[]>(
        `${basePath}/${validatedUuid}`
      );

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };
    } catch (error: any) {
      logError('findByUUID', error);
      return {
        data: null,
        status: error.status || 500,
        statusText:
          error.statusText || error.message || 'Error finding entity by UUID'
      };
    }
  };

/**
 * Search aggregate entities with pagination and filtering
 * Uses the new /api/Aggregate/search endpoint with POST method for advanced searching
 *
 * @param client - HTTP client instance
 * @param params - Aggregate search parameters including the new searchBy field
 * @returns Paginated list of aggregate entities
 */
export const getAggregateEntities =
  (client = httpClient) =>
  async (
    params?: AggregateFindDTO
  ): Promise<ApiResponse<PageAggregateEntity>> => {
    try {
      // Validate parameters
      const cleanParams = validateAggregateParams(params);

      // Use POST method with the new /search endpoint
      const response = await client.post<PageAggregateEntity>(
        `${basePath}/search`,
        cleanParams || {}
      );

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };
    } catch (error: any) {
      logError('getAggregateEntities', error);
      throw error;
    }
  };

/**
 * Create aggregate objects using the new API structure
 * Uses POST /api/Aggregate endpoint with new AggregateCreateDTO structure
 *
 * @param client - HTTP client instance
 * @param data - Aggregate creation data with user context
 * @returns Created aggregate response
 */
export const createAggregateObject =
  (client = httpClient) =>
  async (data: AggregateCreateDTO): Promise<ApiResponse<any | null>> => {
    try {
      const response = await client.post<any>(basePath, data);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };
    } catch (error: any) {
      logError('createAggregateObject', error);
      return {
        data: null,
        status: error.status || 500,
        statusText:
          error.statusText ||
          error.message ||
          'Error creating aggregate object',
        headers: {}
      };
    }
  };

/**
 * Import multiple aggregate objects using the new API structure
 * Uses POST /api/Aggregate/Import endpoint with new AggregateCreateDTO structure
 *
 * @param client - HTTP client instance
 * @param data - Aggregate creation data with user context
 * @returns Import response
 */
export const importAggregateObjects =
  (client = httpClient) =>
  async (data: AggregateCreateDTO): Promise<ApiResponse<any | null>> => {
    try {
      const response = await client.post<any>(`${basePath}/Import`, data);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };
    } catch (error: any) {
      logError('importAggregateObjects', error);
      return {
        data: null,
        status: error.status || 500,
        statusText:
          error.statusText ||
          error.message ||
          'Error importing aggregate objects',
        headers: {}
      };
    }
  };
