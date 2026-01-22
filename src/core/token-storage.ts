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
 * Storage key for tokens
 */
const TOKEN_STORAGE_KEY = 'iob-sdk-token';
const AUTH_DATA_STORAGE_KEY = 'iob-sdk-auth-data';

/**
 * Encrypts token data (simple base64 encoding for now)
 * In production, consider using a proper encryption library
 */
function encryptToken(token: JWTToken): string {
  try {
    const tokenData = JSON.stringify(token);
    return btoa(tokenData);
  } catch {
    // Fallback to plain JSON if btoa is not available (Node.js)
    return JSON.stringify(token);
  }
}

/**
 * Decrypts token data
 */
function decryptToken(encryptedData: string): JWTToken | null {
  try {
    // Try base64 decoding first
    let tokenData: string;
    try {
      tokenData = atob(encryptedData);
    } catch {
      // Fallback to plain text (Node.js or unencrypted data)
      tokenData = encryptedData;
    }

    const token = JSON.parse(tokenData) as JWTToken;

    // Validate token structure
    if (!token.token || !token.expiresAt || !token.issuedAt) {
      return null;
    }

    // Convert date strings back to Date objects
    token.expiresAt = new Date(token.expiresAt);
    token.issuedAt = new Date(token.issuedAt);

    // Check if token is expired
    if (token.expiresAt <= new Date()) {
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

/**
 * Encrypts auth data (token + user)
 */
function encryptAuthData(data: StoredAuthData): string {
  try {
    const authData = JSON.stringify(data);
    return btoa(authData);
  } catch {
    return JSON.stringify(data);
  }
}

/**
 * Decrypts auth data (token + user)
 */
function decryptAuthData(encryptedData: string): StoredAuthData | null {
  try {
    let authData: string;
    try {
      authData = atob(encryptedData);
    } catch {
      authData = encryptedData;
    }

    const data = JSON.parse(authData) as StoredAuthData;

    // Validate structure
    if (
      !data.token ||
      !data.token.token ||
      !data.token.expiresAt ||
      !data.token.issuedAt
    ) {
      return null;
    }

    // Convert date strings back to Date objects
    data.token.expiresAt = new Date(data.token.expiresAt);
    data.token.issuedAt = new Date(data.token.issuedAt);

    // Check if token is expired
    if (data.token.expiresAt <= new Date()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Browser localStorage implementation
 */
class LocalStorageTokenStorage implements TokenStorage {
  private storage: Storage;

  constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.storage =
      storageType === 'localStorage' ? localStorage : sessionStorage;
  }

  isAvailable(): boolean {
    try {
      const testKey = '__iob_storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  async getToken(): Promise<JWTToken | null> {
    try {
      const encryptedData = this.storage.getItem(TOKEN_STORAGE_KEY);
      if (!encryptedData) {
        return null;
      }
      return decryptToken(encryptedData);
    } catch {
      return null;
    }
  }

  async setToken(token: JWTToken): Promise<void> {
    try {
      const encryptedData = encryptToken(token);
      this.storage.setItem(TOKEN_STORAGE_KEY, encryptedData);
    } catch (error) {
      console.warn('Failed to store token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  async removeToken(): Promise<void> {
    try {
      this.storage.removeItem(TOKEN_STORAGE_KEY);
      this.storage.removeItem(AUTH_DATA_STORAGE_KEY);
    } catch {
      // Ignore errors when removing
    }
  }

  async getAuthData(): Promise<StoredAuthData | null> {
    try {
      const encryptedData = this.storage.getItem(AUTH_DATA_STORAGE_KEY);
      if (!encryptedData) {
        return null;
      }
      return decryptAuthData(encryptedData);
    } catch {
      return null;
    }
  }

  async setAuthData(data: StoredAuthData): Promise<void> {
    try {
      const encryptedData = encryptAuthData(data);
      this.storage.setItem(AUTH_DATA_STORAGE_KEY, encryptedData);
    } catch (error) {
      console.warn('Failed to store auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }
}

/**
 * Memory-based token storage (fallback for Node.js)
 */
class MemoryTokenStorage implements TokenStorage {
  private token: JWTToken | null = null;
  private authData: StoredAuthData | null = null;

  isAvailable(): boolean {
    return true;
  }

  async getToken(): Promise<JWTToken | null> {
    // Check if token is expired
    if (this.token && this.token.expiresAt <= new Date()) {
      this.token = null;
    }
    return this.token;
  }

  async setToken(token: JWTToken): Promise<void> {
    this.token = token;
  }

  async removeToken(): Promise<void> {
    this.token = null;
    this.authData = null;
  }

  async getAuthData(): Promise<StoredAuthData | null> {
    // Check if token is expired
    if (this.authData && this.authData.token.expiresAt <= new Date()) {
      this.authData = null;
    }
    return this.authData;
  }

  async setAuthData(data: StoredAuthData): Promise<void> {
    this.authData = data;
  }
}

/**
 * Cross-tab synchronization for browser environments
 */
class SynchronizedTokenStorage implements TokenStorage {
  private baseStorage: TokenStorage;
  private listeners: Set<(token: JWTToken | null) => void> = new Set();

  constructor(baseStorage: TokenStorage) {
    this.baseStorage = baseStorage;

    // Listen for storage events in browser
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === TOKEN_STORAGE_KEY) {
      // Notify listeners of token changes from other tabs
      const token = event.newValue ? decryptToken(event.newValue) : null;
      this.listeners.forEach(listener => listener(token));
    }
  }

  isAvailable(): boolean {
    return this.baseStorage.isAvailable();
  }

  async getToken(): Promise<JWTToken | null> {
    return this.baseStorage.getToken();
  }

  async setToken(token: JWTToken): Promise<void> {
    await this.baseStorage.setToken(token);
    // Notify local listeners
    this.listeners.forEach(listener => listener(token));
  }

  async removeToken(): Promise<void> {
    await this.baseStorage.removeToken();
    // Notify local listeners
    this.listeners.forEach(listener => listener(null));
  }

  async getAuthData(): Promise<StoredAuthData | null> {
    return this.baseStorage.getAuthData();
  }

  async setAuthData(data: StoredAuthData): Promise<void> {
    await this.baseStorage.setAuthData(data);
  }

  /**
   * Add listener for token changes across tabs
   */
  onTokenChange(listener: (token: JWTToken | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

/**
 * Creates appropriate token storage based on environment and preferences
 */
export function createTokenStorage(
  storageType: StorageType = 'localStorage',
  enableCrossTabSync: boolean = true
): TokenStorage {
  let baseStorage: TokenStorage;

  // Determine base storage type
  switch (storageType) {
    case 'localStorage':
    case 'sessionStorage':
      if (typeof window !== 'undefined' && window[storageType]) {
        baseStorage = new LocalStorageTokenStorage(storageType);
        if (!baseStorage.isAvailable()) {
          console.warn(
            `${storageType} not available, falling back to memory storage`
          );
          baseStorage = new MemoryTokenStorage();
        }
      } else {
        console.warn(
          `${storageType} not available in this environment, using memory storage`
        );
        baseStorage = new MemoryTokenStorage();
      }
      break;
    case 'memory':
      baseStorage = new MemoryTokenStorage();
      break;
    default:
      throw new Error(`Unsupported storage type: ${storageType}`);
  }

  // Add cross-tab synchronization for browser environments
  if (
    enableCrossTabSync &&
    typeof window !== 'undefined' &&
    baseStorage instanceof LocalStorageTokenStorage
  ) {
    return new SynchronizedTokenStorage(baseStorage);
  }

  return baseStorage;
}

/**
 * Token storage with automatic cleanup
 */
export class ManagedTokenStorage implements TokenStorage {
  private storage: TokenStorage;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(storage: TokenStorage, cleanupIntervalMs: number = 60000) {
    this.storage = storage;

    // Start cleanup interval
    if (cleanupIntervalMs > 0) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, cleanupIntervalMs);
    }
  }

  isAvailable(): boolean {
    return this.storage.isAvailable();
  }

  async getToken(): Promise<JWTToken | null> {
    const token = await this.storage.getToken();

    // Remove expired tokens
    if (token && token.expiresAt <= new Date()) {
      await this.removeToken();
      return null;
    }

    return token;
  }

  async setToken(token: JWTToken): Promise<void> {
    return this.storage.setToken(token);
  }

  async removeToken(): Promise<void> {
    return this.storage.removeToken();
  }

  async getAuthData(): Promise<StoredAuthData | null> {
    const data = await this.storage.getAuthData();

    // Remove expired auth data
    if (data && data.token.expiresAt <= new Date()) {
      await this.removeToken();
      return null;
    }

    return data;
  }

  async setAuthData(data: StoredAuthData): Promise<void> {
    return this.storage.setAuthData(data);
  }

  /**
   * Cleanup expired tokens
   */
  private async cleanup(): Promise<void> {
    try {
      const token = await this.storage.getToken();
      if (token && token.expiresAt <= new Date()) {
        await this.removeToken();
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Destroy the storage and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Add cross-tab synchronization listener if supported
   */
  onTokenChange(
    listener: (token: JWTToken | null) => void
  ): (() => void) | null {
    if (this.storage instanceof SynchronizedTokenStorage) {
      return this.storage.onTokenChange(listener);
    }
    return null;
  }
}
