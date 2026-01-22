/**
 * Main SDK client with service-namespaced API
 * Provides a clean, organized interface to all IOB services
 */

import { SDKConfig, validateSDKConfig } from './config';
import { ServiceFactory, createServiceFactory } from './core/service-factory';
import { AuthServiceClient } from './services/auth/auth-client';
import { RegistryServiceClient } from './services/registry/registry-client';
import { NodeServiceClient } from './services/node/node-client';
import { AuthManager } from './core/auth-manager';
import { TokenStorage } from './core/token-storage';

/**
 * Main SDK client interface
 */
export interface IOBClient {
  // Service clients
  auth: AuthServiceClient;
  registry: RegistryServiceClient;
  node: NodeServiceClient;

  // Direct service client access
  getAuthClient(): AuthServiceClient;
  getRegistryClient(): RegistryServiceClient;
  getNodeClient(): NodeServiceClient;

  // User-facing auth methods
  login(): Promise<{
    success: boolean;
    token?: string;
    expiresAt?: Date;
    issuedAt?: Date;
    user?: any;
  }>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getToken(): Promise<{
    token: string;
    expiresAt: Date;
    issuedAt: Date;
  } | null>;

  // Management
  getAuthManager(): AuthManager;
  getTokenStorage(): TokenStorage;
  destroy(): void;
}

/**
 * Main IOB SDK client implementation
 */
class IOBClientImpl implements IOBClient {
  private serviceFactory: ServiceFactory;

  constructor(config: SDKConfig) {
    // Validate configuration
    validateSDKConfig(config);

    // Create service factory
    this.serviceFactory = createServiceFactory(config);
  }

  // ============================================================================
  // SERVICE CLIENT ACCESS
  // ============================================================================

  get auth(): AuthServiceClient {
    return this.serviceFactory.getAuthClient();
  }

  get registry(): RegistryServiceClient {
    return this.serviceFactory.getRegistryClient();
  }

  get node(): NodeServiceClient {
    return this.serviceFactory.getNodeClient();
  }

  // ============================================================================
  // DIRECT SERVICE CLIENT ACCESS
  // ============================================================================

  getAuthClient(): AuthServiceClient {
    return this.serviceFactory.getAuthClient();
  }

  getRegistryClient(): RegistryServiceClient {
    return this.serviceFactory.getRegistryClient();
  }

  getNodeClient(): NodeServiceClient {
    return this.serviceFactory.getNodeClient();
  }

  // ============================================================================
  // USER-FACING AUTH METHODS
  // ============================================================================

  /**
   * User-initiated login - performs mTLS authentication
   */
  async login(): Promise<{
    success: boolean;
    token?: string;
    expiresAt?: Date;
    issuedAt?: Date;
    user?: any;
  }> {
    const authManager = this.serviceFactory.getAuthManager();
    const token = await authManager.login();
    const authState = authManager.getAuthState();
    return token
      ? {
          success: true,
          token: token.token,
          expiresAt: token.expiresAt,
          issuedAt: token.issuedAt,
          user: authState.user
        }
      : { success: false };
  }

  /**
   * User-initiated logout
   */
  async logout(): Promise<void> {
    const authManager = this.serviceFactory.getAuthManager();
    await authManager.logout();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const authManager = this.serviceFactory.getAuthManager();
    return authManager.isAuthenticated();
  }

  /**
   * Get current JWT token
   */
  async getToken(): Promise<{
    token: string;
    expiresAt: Date;
    issuedAt: Date;
  } | null> {
    const authManager = this.serviceFactory.getAuthManager();
    const tokenString = await authManager.getValidToken();
    if (tokenString) {
      const authState = authManager.getAuthState();
      if (authState.token) {
        return {
          token: authState.token.token,
          expiresAt: authState.token.expiresAt,
          issuedAt: authState.token.issuedAt
        };
      }
    }
    return null;
  }

  // ============================================================================
  // MANAGEMENT
  // ============================================================================

  getAuthManager(): AuthManager {
    return this.serviceFactory.getAuthManager();
  }

  getTokenStorage(): TokenStorage {
    return this.serviceFactory.getTokenStorage();
  }

  destroy(): void {
    this.serviceFactory.destroy();
  }
}

/**
 * Create a new IOB SDK client with the provided configuration
 */
export function createClient(config: SDKConfig): IOBClient {
  return new IOBClientImpl(config);
}
