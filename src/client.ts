import * as https from 'https';
import axios, { AxiosInstance } from 'axios';
import { SDKConfig, validateSDKConfig } from './config';
import { AuthServiceClient } from './services/auth/auth-client';
import { RegistryServiceClient } from './services/registry/registry-client';
import { NodeServiceClient } from './services/node/node-client';
import { UpAuthServiceClient } from './services/up/up-client';
import {
  AuthResponse,
  EmailPasswordLoginRequest,
  EmailPasswordRegisterRequest
} from './types';
import { logInfo, logError } from './core/logger';
import {
  TokenStorage,
  AuthState,
  createTokenStorage,
  startCrossTabSync
} from './core/token-storage';

export type AuthChangeListener = (state: {
  isAuthenticated: boolean;
  user: AuthResponse | null;
  isRefreshing: boolean;
}) => void;

const EARLY_REFRESH_BUFFER_MS = 60 * 1000; // 1 minute

export class Client {
  private config: SDKConfig;
  private axiosInstance: AxiosInstance;

  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthResponse | null = null;

  private listeners: Set<AuthChangeListener> = new Set();

  // Single-flight refresh lock
  private refreshPromise: Promise<string> | null = null;
  private isRefreshing = false;

  public ready: Promise<void>;

  public auth: AuthServiceClient;
  public registry: RegistryServiceClient;
  public node: NodeServiceClient;
  public up: UpAuthServiceClient | null = null;

  private readonly STORAGE_KEY = 'iom-auth-state';
  private storage: TokenStorage;
  private cleanupCrossTabSync: (() => void) | null = null;

  constructor(config: SDKConfig) {
    validateSDKConfig(config);
    this.config = config;

    this.storage = createTokenStorage(config.tokenStorage, this.STORAGE_KEY);
    this.loadState();
    this.initCrossTabSync();

    this.auth = new AuthServiceClient(
      config.auth,
      config.errorHandling || {},
      config.certificate
    );

    this.registry = new RegistryServiceClient(
      config.registry,
      config.errorHandling || {},
      this.createServiceAxiosInstance(config.registry.baseUrl)
    );

    this.node = new NodeServiceClient(
      config.node,
      config.errorHandling || {},
      this.createServiceAxiosInstance(config.node.baseUrl),
      this.registry
    );

    if (config.up) {
      this.up = new UpAuthServiceClient(config.up, config.errorHandling || {});
    }

    this.axiosInstance = this.node.getAxios();

    // Startup lifecycle (single-flight safe)
    this.ready = this.refreshIfNeededOnStartup();
  }

  /* =========================
     Auth Semantics
     ========================= */

  public isAuthenticated(): boolean {
    return !!this.refreshToken;
  }

  public getUser(): AuthResponse | null {
    return this.user;
  }

  public getToken(): string | null {
    return this.token;
  }

  /* =========================
     Token Expiry Helpers
     ========================= */

  private isAccessTokenExpired(): boolean {
    if (!this.token) return true;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const expMs = payload.exp * 1000;
      const expired = Date.now() >= expMs - EARLY_REFRESH_BUFFER_MS;
      return expired;
    } catch (err) {
      logError('Parse access token', err);
      return true;
    }
  }

  public async getValidToken(): Promise<string | null> {
    if (!this.token && !this.refreshToken) {
      return null;
    }

    if (!this.isAccessTokenExpired()) {
      return this.token;
    }

    if (this.refreshPromise) {
      try {
        const t = await this.refreshPromise;
        return t;
      } catch (err) {
        logError('In-flight refresh failed', err);
        return null;
      }
    }

    if (this.refreshToken) {
      try {
        const t = await this.attemptTokenRefresh();
        return t;
      } catch (err) {
        logError('Token refresh failed', err);
        return null;
      }
    }

    this.logout();
    return null;
  }

  /* =========================
     Startup Refresh
     ========================= */

  private async refreshIfNeededOnStartup(): Promise<void> {
    if (!this.refreshToken) return;
    if (!this.isAccessTokenExpired()) {
      return;
    }

    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    try {
      await this.attemptTokenRefresh();
    } catch {
      logError('Startup refresh failed', null);
      this.logout();
    }
  }

  /* =========================
     Single-Flight Refresh
     ========================= */

  private async attemptTokenRefresh(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      this.logout();
      throw new Error('No refresh token');
    }

    this.isRefreshing = true;
    this.notifyListeners();

    this.refreshPromise = (async () => {
      try {
        const response = await this.auth.refreshToken(this.refreshToken!);
        if (!response.accessToken || !response.refreshToken) {
          logError('Invalid refresh token response', response);
          throw new Error('Invalid refresh token response');
        }

        this.token = response.accessToken;
        this.refreshToken = response.refreshToken;
        this.saveState();
        return response.accessToken;
      } catch (error: any) {
        if (error.response?.status === 403) {
          logError('Refresh token expired', null);
          this.logout();
          throw new Error('Refresh token expired');
        }
        logError('Refresh failed', error);
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
        this.notifyListeners();
      }
    })();

    return this.refreshPromise;
  }

  /* =========================
     Axios Setup
     ========================= */

  private createServiceAxiosInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      timeout: 30000
    });

    instance.interceptors.request.use(async config => {
      const token = await this.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      r => r,
      async error => {
        const originalRequest = error.config;

        logError('Axios response error', {
          url: originalRequest?.url,
          status: error.response?.status
        });

        // Handle 401 - token refresh
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/refreshToken')
        ) {
          originalRequest._retry = true;

          try {
            const newToken = await this.attemptTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } catch (err) {
            logError('Axios 401 refresh failed', err);
            this.logout();
          }
        }

        // Retry on network errors and 5xx (not on 4xx)
        const retryCount = originalRequest._retryCount || 0;
        const maxRetries =
          this.config.errorHandling?.autoRetryNetwork?.maxRetries ?? 0;
        const isRetryable =
          maxRetries > 0 &&
          retryCount < maxRetries &&
          !originalRequest._retry && // Don't retry if already retried for 401
          (!error.response || // Network error (no response)
            error.response.status >= 500); // Server error

        if (isRetryable) {
          originalRequest._retryCount = retryCount + 1;

          const baseDelay =
            this.config.errorHandling?.autoRetryNetwork?.delay ?? 1000;
          const backoff =
            this.config.errorHandling?.autoRetryNetwork?.backoff ??
            'exponential';
          const delay =
            backoff === 'exponential'
              ? baseDelay * Math.pow(2, retryCount)
              : baseDelay * (retryCount + 1);

          logInfo(
            `Retrying request (${retryCount + 1}/${maxRetries}) after ${delay}ms`
          );

          await new Promise(resolve => setTimeout(resolve, delay));
          return instance(originalRequest);
        }

        return Promise.reject(error);
      }
    );

    if (typeof window === 'undefined' && this.config.certificate) {
      instance.defaults.httpsAgent = new https.Agent({
        cert: this.config.certificate.cert,
        key: this.config.certificate.key,
        rejectUnauthorized: true
      });
    }

    return instance;
  }

  /* =========================
     Login / Logout
     ========================= */

  public async login(): Promise<{ success: boolean; user?: AuthResponse }> {
    try {
      const response = await this.auth.login();
      this.token = response.token;
      this.refreshToken = response.refreshToken;
      this.user = response.user || null;
      this.saveState();
      logInfo('Login successful');
      return { success: true, user: this.user || undefined };
    } catch (error) {
      logError('Login failed', error);
      return { success: false };
    }
  }

  /**
   * Login with email and password via UP auth service
   */
  public async loginWithEmailPassword(
    request: EmailPasswordLoginRequest
  ): Promise<{ success: boolean; user?: AuthResponse }> {
    if (!this.up) {
      throw new Error(
        'UP auth service not configured. Provide "up" in SDKConfig.'
      );
    }

    try {
      const response = await this.up.login(request);
      this.token = response.token;
      this.refreshToken = response.refreshToken;
      this.user = response.user || null;
      this.saveState();
      logInfo('Email/password login successful');
      return { success: true, user: this.user || undefined };
    } catch (error) {
      logError('Email/password login failed', error);
      return { success: false };
    }
  }

  /**
   * Register a new user with email and password via UP auth service
   */
  public async register(
    request: EmailPasswordRegisterRequest
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.up) {
      throw new Error(
        'UP auth service not configured. Provide "up" in SDKConfig.'
      );
    }

    try {
      const message = await this.up.register(request);
      logInfo('Registration successful');
      return { success: true, message };
    } catch (error) {
      logError('Registration failed', error);
      return { success: false };
    }
  }

  public logout(): void {
    logInfo('Logout triggered');
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.refreshPromise = null;
    this.isRefreshing = false;
    this.saveState();
  }

  /* =========================
     Persistence + Events
     ========================= */

  private loadState(): void {
    const state = this.storage.get();
    if (!state) return;
    this.token = state.token;
    this.refreshToken = state.refreshToken;
    this.user = state.user;
  }

  private saveState(): void {
    const state: AuthState = {
      token: this.token,
      refreshToken: this.refreshToken,
      user: this.user
    };
    this.storage.set(state);
    this.notifyListeners();
  }

  /**
   * Start listening for auth state changes in other tabs.
   * Only relevant for localStorage strategy (sessionStorage is tab-scoped).
   */
  private initCrossTabSync(): void {
    if (
      this.config.tokenStorage === 'sessionStorage' ||
      this.config.tokenStorage === 'memory'
    ) {
      return; // No cross-tab sync for non-shared storage
    }

    this.cleanupCrossTabSync = startCrossTabSync(
      this.STORAGE_KEY,
      externalState => {
        if (!externalState) {
          // Other tab logged out
          this.token = null;
          this.refreshToken = null;
          this.user = null;
          this.refreshPromise = null;
          this.isRefreshing = false;
          this.notifyListeners();
        } else {
          // Other tab updated tokens (e.g. after refresh)
          this.token = externalState.token;
          this.refreshToken = externalState.refreshToken;
          this.user = externalState.user;
          this.notifyListeners();
        }
      }
    );
  }

  /**
   * Clean up cross-tab sync listener.
   * Call this when the client is no longer needed to prevent memory leaks.
   */
  public destroy(): void {
    this.cleanupCrossTabSync?.();
    this.cleanupCrossTabSync = null;
  }

  private notifyListeners(): void {
    const state = {
      isAuthenticated: this.isAuthenticated(),
      user: this.user,
      isRefreshing: this.isRefreshing
    };
    this.listeners.forEach(l => l(state));
  }

  public onAuthStateChange(listener: AuthChangeListener): () => void {
    this.listeners.add(listener);
    listener({
      isAuthenticated: this.isAuthenticated(),
      user: this.user,
      isRefreshing: this.isRefreshing
    });
    return () => this.listeners.delete(listener);
  }

  public getAxios(): AxiosInstance {
    return this.axiosInstance;
  }
}

export function initClient(config: SDKConfig): Client {
  return new Client(config);
}

export const createClient = initClient;
