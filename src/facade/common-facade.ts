import { httpClient, logError } from '@/core';
import { ApiResponse, AuthResponse } from '@/types';
import * as commonService from '@/services/common-service';

/**
 * Authenticate with the base service using client certificate (mTLS)
 * This will trigger the browser certificate selection popup
 *
 * @param client - HTTP client instance
 * @returns Base service authentication data
 */
export const requestBaseAuth =
  (client = httpClient) =>
  async (): Promise<ApiResponse<AuthResponse | null>> => {
    try {
      // Forward to the service
      return commonService.requestBaseAuth(client)();
    } catch (error: any) {
      logError('requestBaseAuth (facade)', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error authenticating with base service'
      };
    }
  };

/**
 * Authenticate with the UUID service using client certificate (mTLS)
 * This will trigger the browser certificate selection popup
 *
 * @param client - HTTP client instance
 * @returns UUID service authentication data
 */
export const requestUuidAuth =
  (client = httpClient) =>
  async (): Promise<ApiResponse<AuthResponse | null>> => {
    try {
      // Forward to the service
      return commonService.requestUuidAuth(client)();
    } catch (error: any) {
      logError('requestUuidAuth (facade)', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error authenticating with UUID service'
      };
    }
  };
