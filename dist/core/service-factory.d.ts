/**
 * Service factory for creating individual service clients
 * Implements factory pattern with dependency injection
 */
import { SDKConfig, ErrorHandlingConfig } from '../config';
import { AuthManager } from './auth-manager';
import { TokenStorage } from './token-storage';
import { AuthServiceClient } from '../services/auth/auth-client';
import { RegistryServiceClient } from '../services/registry/registry-client';
import { NodeServiceClient } from '../services/node/node-client';
/**
 * Service factory class that manages service client creation and lifecycle
 */
export declare class ServiceFactory {
    private config;
    private errorHandling;
    private tokenStorage;
    private authManager;
    private authClient?;
    private registryClient?;
    private nodeClient?;
    constructor(config: SDKConfig);
    /**
     * Get or create auth service client
     */
    getAuthClient(): AuthServiceClient;
    /**
     * Get or create registry service client
     */
    getRegistryClient(): RegistryServiceClient;
    /**
     * Get or create node service client
     */
    getNodeClient(): NodeServiceClient;
    /**
     * Get auth manager instance
     */
    getAuthManager(): AuthManager;
    /**
     * Get token storage instance
     */
    getTokenStorage(): TokenStorage;
    /**
     * Get current configuration
     */
    getConfig(): SDKConfig;
    /**
     * Update error handling configuration
     */
    updateErrorHandling(newConfig: Partial<ErrorHandlingConfig>): void;
    /**
     * Destroy all service clients and cleanup resources
     */
    destroy(): void;
}
/**
 * Create service factory with configuration validation
 */
export declare function createServiceFactory(config: SDKConfig): ServiceFactory;
