/**
 * Registry service client for UUID operations
 * Handles UUID creation, retrieval, and management
 */

import { UUID } from '@/types';
import { ServiceConfig, ErrorHandlingConfig } from '@/config';

// circular dependency do not change to alias imports
import { AuthManager } from '../../core/auth-manager';
import { BaseServiceClient } from '../../core/base-service-client';

/**
 * UUID record interface for registry operations
 */
export interface UUIDRecord {
  uuid: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  softDeleted: boolean;
  softDeletedAt?: string;
  softDeleteBy?: string;
  meta?: Record<string, any>;
}

/**
 * UUID creation response
 */
export interface UUIDCreationResponse {
  uuid: string;
}

/**
 * UUID authorization parameters
 */
export interface UUIDAuthParams {
  uuid: string;
  targetUserUUID: string;
  permissions: string[];
}

/**
 * Registry service client for UUID operations
 */
export class RegistryServiceClient extends BaseServiceClient {
  private authManager: AuthManager;

  constructor(
    config: ServiceConfig,
    errorHandling: ErrorHandlingConfig,
    authManager: AuthManager
  ) {
    super(config, errorHandling, 'registry');
    this.authManager = authManager;
    this.setupAuthInterceptor();
  }

  /**
   * Setup authentication interceptor for JWT token injection
   */
  private setupAuthInterceptor(): void {
    this.client.interceptors.request.use(async config => {
      const token = await this.authManager.getValidToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        // No token available - user needs to login first
        throw new Error(
          'Authentication required. Please call client.login() first.'
        );
      }
      return config;
    });

    // Handle 401 responses by invalidating token and retrying
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          this.authManager.invalidateToken();

          // Get new token and retry
          const token = await this.authManager.getValidToken();
          if (token) {
            error.config.headers['Authorization'] = `Bearer ${token}`;
            return this.client.request(error.config);
          }
        }
        throw error;
      }
    );
  }

  /**
   * Get all UUIDs owned by the current user
   */
  async getOwnedUUIDs(): Promise<UUIDRecord[]> {
    const response = await this.get<UUIDRecord[]>('/api/uuid');
    return response.data;
  }

  /**
   * Create a new UUID
   */
  async createUUID(): Promise<UUIDCreationResponse> {
    const response = await this.post<UUIDCreationResponse>('/api/uuid');
    return response.data;
  }

  /**
   * Get UUID record by UUID
   */
  async getUUIDRecord(uuid: UUID): Promise<UUIDRecord> {
    const response = await this.get<UUIDRecord>(`/api/uuid/${uuid}`);
    return response.data;
  }

  /**
   * Update UUID record metadata
   */
  async updateUUIDRecordMeta(
    uuid: UUID,
    meta: Record<string, any>
  ): Promise<UUIDRecord> {
    const response = await this.put<UUIDRecord>(`/api/uuid/${uuid}/meta`, meta);
    return response.data;
  }

  /**
   * Authorize UUID access for another user
   */
  async authorizeUUIDRecord(
    params: UUIDAuthParams
  ): Promise<{ success: boolean }> {
    const response = await this.post<{ success: boolean }>(
      `/api/uuid/${params.uuid}/authorize`,
      {
        targetUserUUID: params.targetUserUUID,
        permissions: params.permissions
      }
    );
    return response.data;
  }

  /**
   * Update error handling configuration
   */
  updateErrorHandling(newConfig: ErrorHandlingConfig): void {
    this.errorHandling = newConfig;
  }
}
