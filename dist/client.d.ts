import { AxiosInstance } from 'axios';
import { SDKConfig } from './config';
import { AuthServiceClient } from './services/auth/auth-client';
import { RegistryServiceClient } from './services/registry/registry-client';
import { NodeServiceClient } from './services/node/node-client';
import { AuthResponse } from './types';
export type AuthChangeListener = (state: {
    isAuthenticated: boolean;
    user: AuthResponse | null;
}) => void;
/**
 * Simplified IOM Client
 * acts as the single source of truth for auth state
 */
export declare class Client {
    private config;
    private axiosInstance;
    private token;
    private user;
    private listeners;
    auth: AuthServiceClient;
    registry: RegistryServiceClient;
    node: NodeServiceClient;
    private readonly STORAGE_KEY;
    constructor(config: SDKConfig);
    private createServiceAxiosInstance;
    private loadState;
    private saveState;
    private notifyListeners;
    onAuthStateChange(listener: AuthChangeListener): () => void;
    login(): Promise<{
        success: boolean;
        user?: AuthResponse;
    }>;
    logout(): void;
    isAuthenticated(): boolean;
    getUser(): AuthResponse | null;
    getToken(): string | null;
    getAxios(): AxiosInstance;
}
/**
 * Initialize the Client
 */
export declare function initClient(config: SDKConfig): Client;
export declare const createClient: typeof initClient;
