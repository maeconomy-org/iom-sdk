import {
  JWTToken,
  JWTAuthResponse,
  TokenRefreshConfig,
  AuthState
} from '../types';
import { SDKConfig } from '../config';
import { TokenStorage } from './token-storage';
import { logError, logHttp } from './logger';

/**
 * Central JWT token management system with persistent storage
 * Handles token storage, validation, and automatic refresh
 */
export class AuthManager {
  private authState: AuthState = {
    isAuthenticated: false,
    isRefreshing: false
  };

  private refreshConfig: Required<TokenRefreshConfig> = {
    refreshThresholdMinutes: 5,
    maxRetries: 1, // Only try once, no retries
    retryDelayMs: 1000
  };

  private refreshPromise: Promise<JWTToken | null> | null = null;
  private refreshTimeoutId: NodeJS.Timeout | null = null;
  private readyPromise: Promise<void>;
  private stateListeners: Set<(state: Readonly<AuthState>) => void> = new Set();

  constructor(
    private config: SDKConfig,
    private loginFunction: () => Promise<JWTAuthResponse>,
    private tokenStorage: TokenStorage,
    refreshConfig?: Partial<TokenRefreshConfig>
  ) {
    if (refreshConfig) {
      this.refreshConfig = { ...this.refreshConfig, ...refreshConfig };
    }

    // Initialize from stored token
    this.readyPromise = this.initializeFromStorage();
  }

  /**
   * Wait for AuthManager to be ready (storage initialized)
   * Prevents race conditions where isAuthenticated() is called before storage is checked
   */
  async ready(): Promise<void> {
    await this.readyPromise;
  }

  /**
   * Initialize auth state from stored token and user data
   */
  private async initializeFromStorage(): Promise<void> {
    try {
      const storedAuthData = await this.tokenStorage.getAuthData();
      if (storedAuthData && this.isTokenValid(storedAuthData.token)) {
        this.authState.token = storedAuthData.token;
        this.authState.user = storedAuthData.user;
        this.authState.isAuthenticated = true;
        this.scheduleTokenRefresh(storedAuthData.token);
      }
    } catch (error) {
      logError('Failed to initialize from stored auth data', error);
    } finally {
      this.notifyAuthStateChange();
    }
  }

  /**
   * Get the current JWT token, refreshing if necessary
   * Does NOT perform initial authentication - user must call login() first
   */
  async getValidToken(): Promise<string | null> {
    // Check stored auth data first if we don't have one in memory
    if (!this.authState.token) {
      const storedAuthData = await this.tokenStorage.getAuthData();
      if (storedAuthData && this.isTokenValid(storedAuthData.token)) {
        this.authState.token = storedAuthData.token;
        this.authState.user = storedAuthData.user;
        this.authState.isAuthenticated = true;
        this.scheduleTokenRefresh(storedAuthData.token);
        this.notifyAuthStateChange();
      }
    }

    if (this.authState.token) {
      // If we need to refresh and not already refreshing, start refresh
      if (
        this.shouldRefreshToken(this.authState.token) &&
        !this.authState.isRefreshing
      ) {
        const refreshedToken = await this.refreshToken();
        if (refreshedToken) {
          return refreshedToken.token;
        }
      }

      // If we have a valid token, return it
      if (this.isTokenValid(this.authState.token)) {
        return this.authState.token.token;
      }
    }

    // If no token or expired, return null - user must login first
    if (!this.authState.token || this.isTokenExpired(this.authState.token)) {
      if (this.authState.token && this.isTokenExpired(this.authState.token)) {
        await this.clearToken();
      }
      logError('No valid token available', 'User must login first');
      return null;
    }

    return this.authState.token?.token || null;
  }

  /**
   * Public method for user-initiated login
   * Call this when user clicks "Authorize/Login" button
   */
  async login(): Promise<JWTToken | null> {
    return this.authenticate();
  }

  /**
   * Public method for user-initiated logout
   * Call this when user clicks "Logout" button
   */
  async logout(): Promise<void> {
    await this.clearToken();
  }

  /**
   * Perform initial authentication to get JWT token
   * Private method - use login() for user-initiated authentication
   * Fails fast - no retries, no loops
   */
  private async authenticate(): Promise<JWTToken | null> {
    try {
      logHttp('AUTH', 'Performing authentication');

      const response = await this.loginFunction();
      const token = this.createTokenFromResponse(response);

      if (response.user) {
        this.authState.user = response.user;
      }
      await this.setToken(token);
      this.scheduleTokenRefresh(token);

      logHttp('AUTH', 'Authentication successful');
      return token;
    } catch (error) {
      logError('Authentication failed - no retries will be attempted', error);
      this.authState.lastAuthError =
        error instanceof Error ? error.message : 'Authentication failed';
      this.authState.isAuthenticated = false;

      // Clear any existing token on auth failure
      await this.clearToken();

      return null;
    }
  }

  /**
   * Refresh the current JWT token
   */
  async refreshToken(): Promise<JWTToken | null> {
    // If already refreshing, wait for the existing refresh
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.authState.isRefreshing = true;

    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
      this.authState.isRefreshing = false;
    }
  }

  /**
   * Perform the actual token refresh - single attempt, no retries
   */
  private async performTokenRefresh(): Promise<JWTToken | null> {
    try {
      logHttp('AUTH', 'Attempting token refresh');

      const response = await this.loginFunction();
      const token = this.createTokenFromResponse(response);

      if (response.user) {
        this.authState.user = response.user;
      }
      await this.setToken(token);
      this.scheduleTokenRefresh(token);

      logHttp('AUTH', 'Token refresh successful');
      return token;
    } catch (error) {
      const authError =
        error instanceof Error ? error : new Error('Token refresh failed');

      logError(
        'Token refresh failed - no retries will be attempted',
        authError
      );

      this.authState.lastAuthError = authError.message;
      this.authState.isAuthenticated = false;
      this.authState.token = undefined;
      this.authState.user = undefined;

      // Clear stored token
      await this.tokenStorage.removeToken();

      this.notifyAuthStateChange();

      return null;
    }
  }

  /**
   * Check if the current user is authenticated
   */
  isAuthenticated(): boolean {
    return (
      this.authState.isAuthenticated &&
      this.authState.token !== undefined &&
      this.isTokenValid(this.authState.token)
    );
  }

  /**
   * Get the current authentication state
   */
  getAuthState(): Readonly<AuthState> {
    return { ...this.authState };
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(
    listener: (state: Readonly<AuthState>) => void
  ): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /**
   * Clear the current token and authentication state
   */
  async clearToken(): Promise<void> {
    this.authState = {
      isAuthenticated: false,
      isRefreshing: false,
      token: undefined,
      user: undefined,
      lastAuthError: undefined
    };

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    // Clear stored token and user data
    await this.tokenStorage.removeToken();

    this.notifyAuthStateChange();
  }

  /**
   * Force token refresh on next request
   */
  invalidateToken(): void {
    if (this.authState.token) {
      // Set token as expired to force refresh
      this.authState.token.expiresAt = new Date(Date.now() - 1000);
    }
  }

  /**
   * Create a JWTToken from the auth response
   */
  private createTokenFromResponse(response: JWTAuthResponse): JWTToken {
    const now = new Date();

    // Validate response structure
    if (!response || typeof response !== 'object') {
      throw new Error(
        'Invalid auth response: expected object with token and expiresIn'
      );
    }

    if (!response.token || typeof response.token !== 'string') {
      throw new Error('Invalid auth response: missing or invalid token');
    }

    if (typeof response.expiresIn !== 'number' || response.expiresIn <= 0) {
      logError('Invalid expiresIn value, using default 1 hour', {
        expiresIn: response.expiresIn
      });
      response.expiresIn = 3600; // Default to 1 hour
    }

    const expiresAt = new Date(now.getTime() + response.expiresIn * 1000);

    return {
      token: response.token,
      issuedAt: now,
      expiresAt
    };
  }

  /**
   * Set the current token and update auth state
   */
  private async setToken(token: JWTToken): Promise<void> {
    this.authState.token = token;
    this.authState.isAuthenticated = true;
    this.authState.lastAuthError = undefined;

    // Store token and user data persistently
    try {
      await this.tokenStorage.setAuthData({
        token,
        user: this.authState.user
      });
    } catch (error) {
      logError('Failed to store auth data', error);
      // Continue without persistent storage
    }

    this.notifyAuthStateChange();
  }

  /**
   * Check if a token is still valid (not expired)
   */
  private isTokenValid(token: JWTToken): boolean {
    return new Date() < token.expiresAt;
  }

  /**
   * Check if a token is expired
   */
  private isTokenExpired(token: JWTToken): boolean {
    return new Date() >= token.expiresAt;
  }

  /**
   * Check if a token should be refreshed (within threshold of expiry)
   */
  private shouldRefreshToken(token: JWTToken): boolean {
    const now = new Date();
    const refreshThreshold = new Date(
      token.expiresAt.getTime() -
        this.refreshConfig.refreshThresholdMinutes * 60 * 1000
    );
    return now >= refreshThreshold;
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(token: JWTToken): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    const refreshTime = new Date(
      token.expiresAt.getTime() -
        this.refreshConfig.refreshThresholdMinutes * 60 * 1000
    );
    const delay = Math.max(0, refreshTime.getTime() - Date.now());

    this.refreshTimeoutId = setTimeout(() => {
      this.refreshToken().catch(error => {
        logError('Scheduled token refresh failed', error);
      });
    }, delay);
  }

  private notifyAuthStateChange(): void {
    const snapshot = this.getAuthState();
    this.stateListeners.forEach(listener => listener(snapshot));
  }

  /**
   * Utility function to add delay
   */

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    this.refreshPromise = null;
  }
}

/**
 * Create a new AuthManager instance
 */
export const createAuthManager = (
  config: SDKConfig,
  loginFunction: () => Promise<JWTAuthResponse>,
  tokenStorage: TokenStorage,
  refreshConfig?: Partial<TokenRefreshConfig>
): AuthManager => {
  return new AuthManager(config, loginFunction, tokenStorage, refreshConfig);
};
