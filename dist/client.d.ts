import { AxiosInstance } from 'axios';
import { SDKConfig } from './config';
import { AuthServiceClient } from './services/auth/auth-client';
import { RegistryServiceClient } from './services/registry/registry-client';
import { NodeServiceClient } from './services/node/node-client';
import { UpAuthServiceClient } from './services/up/up-client';
import { AuthResponse, EmailPasswordLoginRequest, EmailPasswordRegisterRequest } from './types';
export type AuthChangeListener = (state: {
    isAuthenticated: boolean;
    user: AuthResponse | null;
    isRefreshing: boolean;
}) => void;
export declare class Client {
    private config;
    private axiosInstance;
    private token;
    private refreshToken;
    private user;
    private listeners;
    private refreshPromise;
    private isRefreshing;
    ready: Promise<void>;
    auth: AuthServiceClient;
    registry: RegistryServiceClient;
    node: NodeServiceClient;
    up: UpAuthServiceClient | null;
    private readonly STORAGE_KEY;
    constructor(config: SDKConfig);
    isAuthenticated(): boolean;
    getUser(): AuthResponse | null;
    getToken(): string | null;
    private isAccessTokenExpired;
    getValidToken(): Promise<string | null>;
    private refreshIfNeededOnStartup;
    private attemptTokenRefresh;
    private createServiceAxiosInstance;
    login(): Promise<{
        success: boolean;
        user?: AuthResponse;
    }>;
    /**
     * Login with email and password via UP auth service
     */
    loginWithEmailPassword(request: EmailPasswordLoginRequest): Promise<{
        success: boolean;
        user?: AuthResponse;
    }>;
    /**
     * Register a new user with email and password via UP auth service
     */
    register(request: EmailPasswordRegisterRequest): Promise<{
        success: boolean;
        message?: string;
    }>;
    logout(): void;
    private loadState;
    private saveState;
    private notifyListeners;
    onAuthStateChange(listener: AuthChangeListener): () => void;
    getAxios(): AxiosInstance;
}
export declare function initClient(config: SDKConfig): Client;
export declare const createClient: typeof initClient;
