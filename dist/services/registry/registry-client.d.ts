/**
 * Registry service client for UUID operations
 * Handles UUID creation, retrieval, and management
 */
import { UUID } from '@/types';
import { ServiceConfig, ErrorHandlingConfig } from '@/config';
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
export declare class RegistryServiceClient extends BaseServiceClient {
    private authManager;
    constructor(config: ServiceConfig, errorHandling: ErrorHandlingConfig, authManager: AuthManager);
    /**
     * Setup authentication interceptor for JWT token injection
     */
    private setupAuthInterceptor;
    /**
     * Get all UUIDs owned by the current user
     */
    getOwnedUUIDs(): Promise<UUIDRecord[]>;
    /**
     * Create a new UUID
     */
    createUUID(): Promise<UUIDCreationResponse>;
    /**
     * Get UUID record by UUID
     */
    getUUIDRecord(uuid: UUID): Promise<UUIDRecord>;
    /**
     * Update UUID record metadata
     */
    updateUUIDRecordMeta(uuid: UUID, meta: Record<string, any>): Promise<UUIDRecord>;
    /**
     * Authorize UUID access for another user
     */
    authorizeUUIDRecord(params: UUIDAuthParams): Promise<{
        success: boolean;
    }>;
    /**
     * Update error handling configuration
     */
    updateErrorHandling(newConfig: ErrorHandlingConfig): void;
}
