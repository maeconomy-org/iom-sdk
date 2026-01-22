import { JWTToken, JWTAuthResponse, TokenRefreshConfig, AuthState } from '../types';
import { SDKConfig } from '../config';
import { TokenStorage } from './token-storage';
/**
 * Central JWT token management system with persistent storage
 * Handles token storage, validation, and automatic refresh
 */
export declare class AuthManager {
    private config;
    private loginFunction;
    private tokenStorage;
    private authState;
    private refreshConfig;
    private refreshPromise;
    private refreshTimeoutId;
    private readyPromise;
    private stateListeners;
    constructor(config: SDKConfig, loginFunction: () => Promise<JWTAuthResponse>, tokenStorage: TokenStorage, refreshConfig?: Partial<TokenRefreshConfig>);
    /**
     * Wait for AuthManager to be ready (storage initialized)
     * Prevents race conditions where isAuthenticated() is called before storage is checked
     */
    ready(): Promise<void>;
    /**
     * Initialize auth state from stored token and user data
     */
    private initializeFromStorage;
    /**
     * Get the current JWT token, refreshing if necessary
     * Does NOT perform initial authentication - user must call login() first
     */
    getValidToken(): Promise<string | null>;
    /**
     * Public method for user-initiated login
     * Call this when user clicks "Authorize/Login" button
     */
    login(): Promise<JWTToken | null>;
    /**
     * Public method for user-initiated logout
     * Call this when user clicks "Logout" button
     */
    logout(): Promise<void>;
    /**
     * Perform initial authentication to get JWT token
     * Private method - use login() for user-initiated authentication
     * Fails fast - no retries, no loops
     */
    private authenticate;
    /**
     * Refresh the current JWT token
     */
    refreshToken(): Promise<JWTToken | null>;
    /**
     * Perform the actual token refresh - single attempt, no retries
     */
    private performTokenRefresh;
    /**
     * Check if the current user is authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get the current authentication state
     */
    getAuthState(): Readonly<AuthState>;
    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(listener: (state: Readonly<AuthState>) => void): () => void;
    /**
     * Clear the current token and authentication state
     */
    clearToken(): Promise<void>;
    /**
     * Force token refresh on next request
     */
    invalidateToken(): void;
    /**
     * Create a JWTToken from the auth response
     */
    private createTokenFromResponse;
    /**
     * Set the current token and update auth state
     */
    private setToken;
    /**
     * Check if a token is still valid (not expired)
     */
    private isTokenValid;
    /**
     * Check if a token is expired
     */
    private isTokenExpired;
    /**
     * Check if a token should be refreshed (within threshold of expiry)
     */
    private shouldRefreshToken;
    /**
     * Schedule automatic token refresh
     */
    private scheduleTokenRefresh;
    private notifyAuthStateChange;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
/**
 * Create a new AuthManager instance
 */
export declare const createAuthManager: (config: SDKConfig, loginFunction: () => Promise<JWTAuthResponse>, tokenStorage: TokenStorage, refreshConfig?: Partial<TokenRefreshConfig>) => AuthManager;
