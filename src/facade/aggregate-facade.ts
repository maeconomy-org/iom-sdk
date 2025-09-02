import {
  ApiResponse,
  AggregateFindDTO,
  AggregateEntity,
  PageAggregateEntity,
  UUID
} from '@/types';
import { httpClient, logError } from '@/core';
import * as aggregateService from '@/services/aggregate-service';

/**
 * Search for any entity by UUID using the aggregate API
 * This provides rich aggregated data including relationships, properties, and files
 *
 * @param client - HTTP client instance
 * @param params - Search parameters including pagination and filters
 * @returns The aggregate entity with all related data if found
 */
export const findByUUID =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<AggregateEntity[] | null>> => {
    try {
      // Forward to the service
      return aggregateService.findByUUID(client)(uuid);
    } catch (error: any) {
      logError('findByUUID (aggregate facade)', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error finding entity by UUID'
      };
    }
  };

/**
 * Search aggregate entities with pagination and filtering
 *
 * @param client - HTTP client instance
 * @param params - Search parameters including pagination and filters
 * @returns Paginated list of aggregate entities
 */
export const getAggregateEntities =
  (client = httpClient) =>
  async (
    params?: AggregateFindDTO
  ): Promise<ApiResponse<PageAggregateEntity>> => {
    try {
      // Forward to the service (validation is handled in service layer)
      return aggregateService.getAggregateEntities(client)(params);
    } catch (error: any) {
      logError('getAggregateEntities (aggregate facade)', error);
      throw error;
    }
  };

export const createAggregateObject =
  (client = httpClient) =>
  async (data: any): Promise<ApiResponse<any | null>> => {
    try {
      // Forward to the service
      return aggregateService.createAggregateObject(client)(data);
    } catch (error: any) {
      logError('createAggregateObject (aggregate facade)', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error creating aggregate object'
      };
    }
  };
