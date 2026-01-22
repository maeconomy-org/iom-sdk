/**
 * Token storage abstraction for persistent JWT token management
 * Supports localStorage, sessionStorage, and memory storage with graceful fallbacks
 */
import { JWTToken, AuthResponse } from '../types';
/**
 * Stored auth data including token and user info
 */
export interface StoredAuthData {
    token: JWTToken;
    user?: AuthResponse;
}
/**
 * Storage interface for token persistence
 */
export interface TokenStorage {
    /** Get stored token */
    getToken(): Promise<JWTToken | null>;
    /** Store token */
    setToken(token: JWTToken): Promise<void>;
    /** Remove stored token */
    removeToken(): Promise<void>;
    /** Check if storage is available */
    isAvailable(): boolean;
    /** Get stored auth data (token + user) */
    getAuthData(): Promise<StoredAuthData | null>;
    /** Store auth data (token + user) */
    setAuthData(data: StoredAuthData): Promise<void>;
}
/**
 * Storage type options
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'memory';
/**
 * Creates appropriate token storage based on environment and preferences
 */
export declare function createTokenStorage(storageType?: StorageType, enableCrossTabSync?: boolean): TokenStorage;
/**
 * Token storage with automatic cleanup
 */
export declare class ManagedTokenStorage implements TokenStorage {
    private storage;
    private cleanupInterval;
    constructor(storage: TokenStorage, cleanupIntervalMs?: number);
    isAvailable(): boolean;
    getToken(): Promise<JWTToken | null>;
    setToken(token: JWTToken): Promise<void>;
    removeToken(): Promise<void>;
    getAuthData(): Promise<StoredAuthData | null>;
    setAuthData(data: StoredAuthData): Promise<void>;
    /**
     * Cleanup expired tokens
     */
    private cleanup;
    /**
     * Destroy the storage and cleanup resources
     */
    destroy(): void;
    /**
     * Add cross-tab synchronization listener if supported
     */
    onTokenChange(listener: (token: JWTToken | null) => void): (() => void) | null;
}
