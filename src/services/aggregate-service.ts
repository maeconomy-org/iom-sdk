import {
  ApiResponse,
  AggregateFindDTO,
  AggregateEntity,
  PageAggregateEntity,
  UUID
} from '@/types';
import { httpClient, logError } from '@/core';
import { validateAggregateParams, validateUuid } from '@/validation';

const basePath = '/api/aggregate';

/**
 * Find any entity by UUID using the aggregate API
 * Uses the new /api/aggregate/{uuid} endpoint which provides rich aggregated data
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
 * Uses the new /api/aggregate endpoint for advanced searching
 *
 * @param client - HTTP client instance
 * @param params - Aggregate search parameters
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

      const response = await client.get<PageAggregateEntity>(
        basePath,
        cleanParams
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
