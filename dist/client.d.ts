/**
 * Main SDK client with service-namespaced API
 * Provides a clean, organized interface to all IOB services
 */
import { SDKConfig } from './config';
import { AuthServiceClient } from './services/auth/auth-client';
import { RegistryServiceClient } from './services/registry/registry-client';
import { NodeServiceClient } from './services/node/node-client';
import { AuthManager } from './core/auth-manager';
import { TokenStorage } from './core/token-storage';
/**
 * Main SDK client interface
 */
export interface IOBClient {
    auth: AuthServiceClient;
    registry: RegistryServiceClient;
    node: NodeServiceClient;
    getAuthClient(): AuthServiceClient;
    getRegistryClient(): RegistryServiceClient;
    getNodeClient(): NodeServiceClient;
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
    getAuthManager(): AuthManager;
    getTokenStorage(): TokenStorage;
    destroy(): void;
}
/**
 * Create a new IOB SDK client with the provided configuration
 */
export declare function createClient(config: SDKConfig): IOBClient;
