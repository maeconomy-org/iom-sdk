/**
 * Service factory for creating individual service clients
 * Implements factory pattern with dependency injection
 */

import {
  SDKConfig,
  ErrorHandlingConfig,
  createDefaultErrorHandling
} from '../config';
import { AuthManager } from './auth-manager';
import {
  TokenStorage,
  createTokenStorage,
  ManagedTokenStorage
} from './token-storage';
import { JWTAuthResponse } from '../types';

// Import service clients (will be created in restructure step)
import { AuthServiceClient } from '../services/auth/auth-client';
import { RegistryServiceClient } from '../services/registry/registry-client';
import { NodeServiceClient } from '../services/node/node-client';

/**
 * Service factory class that manages service client creation and lifecycle
 */
export class ServiceFactory {
  private config: SDKConfig;
  private errorHandling: ErrorHandlingConfig;
  private tokenStorage: TokenStorage;
  private authManager: AuthManager;

  // Service client instances
  private authClient?: AuthServiceClient;
  private registryClient?: RegistryServiceClient;
  private nodeClient?: NodeServiceClient;

  constructor(config: SDKConfig) {
    this.config = config;
    this.errorHandling = {
      ...createDefaultErrorHandling(),
      ...config.errorHandling
    };

    // Create token storage
    const baseTokenStorage = createTokenStorage(
      config.tokenStorage || 'localStorage'
    );
    this.tokenStorage = new ManagedTokenStorage(baseTokenStorage);

    // Create auth manager with login function
    const loginFunction = async (): Promise<JWTAuthResponse> => {
      const authClient = this.getAuthClient();
      return authClient.login();
    };

    this.authManager = new AuthManager(
      config,
      loginFunction,
      this.tokenStorage,
      {
        refreshThresholdMinutes: 5,
        maxRetries: 3,
        retryDelayMs: 1000
      }
    );
  }

  /**
   * Get or create auth service client
   */
  getAuthClient(): AuthServiceClient {
    if (!this.authClient) {
      this.authClient = new AuthServiceClient(
        this.config.auth,
        this.errorHandling,
        this.config.certificate
      );
    }
    return this.authClient;
  }

  /**
   * Get or create registry service client
   */
  getRegistryClient(): RegistryServiceClient {
    if (!this.registryClient) {
      this.registryClient = new RegistryServiceClient(
        this.config.registry,
        this.errorHandling,
        this.authManager
      );
    }
    return this.registryClient;
  }

  /**
   * Get or create node service client
   */
  getNodeClient(): NodeServiceClient {
    if (!this.nodeClient) {
      this.nodeClient = new NodeServiceClient(
        this.config.node,
        this.errorHandling,
        this.authManager,
        this.getRegistryClient()
      );
    }
    return this.nodeClient;
  }

  /**
   * Get auth manager instance
   */
  getAuthManager(): AuthManager {
    return this.authManager;
  }

  /**
   * Get token storage instance
   */
  getTokenStorage(): TokenStorage {
    return this.tokenStorage;
  }

  /**
   * Get current configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Update error handling configuration
   */
  updateErrorHandling(newConfig: Partial<ErrorHandlingConfig>): void {
    this.errorHandling = { ...this.errorHandling, ...newConfig };

    // Update existing clients
    if (this.authClient) {
      this.authClient.updateErrorHandling(this.errorHandling);
    }
    if (this.registryClient) {
      this.registryClient.updateErrorHandling(this.errorHandling);
    }
    if (this.nodeClient) {
      this.nodeClient.updateErrorHandling(this.errorHandling);
    }
  }

  /**
   * Destroy all service clients and cleanup resources
   */
  destroy(): void {
    // Destroy auth manager
    this.authManager.destroy();

    // Destroy token storage
    if (this.tokenStorage instanceof ManagedTokenStorage) {
      this.tokenStorage.destroy();
    }

    // Clear service client references
    this.authClient = undefined;
    this.registryClient = undefined;
    this.nodeClient = undefined;
  }
}

/**
 * Create service factory with configuration validation
 */
export function createServiceFactory(config: SDKConfig): ServiceFactory {
  return new ServiceFactory(config);
}
