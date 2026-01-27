import * as https from 'https';
import axios, { AxiosInstance } from 'axios';
import { SDKConfig, validateSDKConfig } from './config';
import { AuthServiceClient } from './services/auth/auth-client';
import { RegistryServiceClient } from './services/registry/registry-client';
import { NodeServiceClient } from './services/node/node-client';
import { AuthResponse } from './types';

export type AuthChangeListener = (state: {
  isAuthenticated: boolean;
  user: AuthResponse | null;
  isRefreshing: boolean;
}) => void;

const EARLY_REFRESH_BUFFER_MS = 60 * 1000; // 1 minute

// helper for logging short tokens
const shortToken = (token?: string | null) =>
  token ? `${token.slice(0, 10)}...${token.slice(-6)}` : 'null';

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

  private readonly STORAGE_KEY = 'iom-auth-state';

  constructor(config: SDKConfig) {
    validateSDKConfig(config);
    this.config = config;

    this.loadState();

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
      this.createServiceAxiosInstance(config.node.baseUrl)
    );

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
      console.log('[SDK] access-token-check', {
        expired,
        exp: new Date(expMs).toISOString(),
        now: new Date().toISOString(),
        token: shortToken(this.token)
      });
      return expired;
    } catch (err) {
      console.warn('[SDK] failed to parse access token', err);
      return true;
    }
  }

  public async getValidToken(): Promise<string | null> {
    if (!this.token && !this.refreshToken) {
      console.log('[SDK] getValidToken - no token or refreshToken');
      return null;
    }

    if (!this.isAccessTokenExpired()) {
      console.log('[SDK] getValidToken - token valid', {
        token: shortToken(this.token)
      });
      return this.token;
    }

    if (this.refreshPromise) {
      console.log('[SDK] getValidToken - awaiting in-flight refresh');
      try {
        const t = await this.refreshPromise;
        console.log('[SDK] getValidToken - received refreshed token', {
          token: shortToken(t)
        });
        return t;
      } catch (err) {
        console.warn('[SDK] getValidToken - in-flight refresh failed', err);
        return null;
      }
    }

    if (this.refreshToken) {
      console.log('[SDK] getValidToken - triggering refresh', {
        oldToken: shortToken(this.token)
      });
      try {
        const t = await this.attemptTokenRefresh();
        console.log('[SDK] getValidToken - refresh completed', {
          token: shortToken(t)
        });
        return t;
      } catch (err) {
        console.warn('[SDK] getValidToken - refresh failed', err);
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
      console.log('[SDK] Startup refresh skipped - token still valid', {
        token: shortToken(this.token)
      });
      return;
    }

    if (this.refreshPromise) {
      console.log('[SDK] Startup refresh awaiting in-flight refresh');
      await this.refreshPromise;
      return;
    }

    try {
      console.log('[SDK] Startup refresh triggered', {
        oldToken: shortToken(this.token)
      });
      await this.attemptTokenRefresh();
    } catch {
      console.warn('[SDK] Startup refresh failed, logging out');
      this.logout();
    }
  }

  /* =========================
     Single-Flight Refresh
     ========================= */

  private async attemptTokenRefresh(): Promise<string> {
    if (this.refreshPromise) {
      console.log(
        '[SDK] attemptTokenRefresh - single-flight awaiting existing refresh'
      );
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      console.warn('[SDK] attemptTokenRefresh - no refresh token, logging out');
      this.logout();
      throw new Error('No refresh token');
    }

    this.isRefreshing = true;
    this.notifyListeners();

    const oldToken = this.token;

    this.refreshPromise = (async () => {
      try {
        console.log('[SDK] Refreshing access token...', {
          oldToken: shortToken(oldToken)
        });
        const response = await this.auth.refreshToken(this.refreshToken!);
        if (!response.accessToken || !response.refreshToken) {
          throw new Error('Invalid refresh token response');
        }

        this.token = response.accessToken;
        this.refreshToken = response.refreshToken;
        this.saveState();
        console.log('[SDK] Refresh successful', {
          oldToken: shortToken(oldToken),
          newToken: shortToken(response.accessToken)
        });
        return response.accessToken;
      } catch (error: any) {
        if (error.response?.status === 403) {
          console.warn('[SDK] Refresh token expired, logging out');
          this.logout();
          throw new Error('Refresh token expired');
        }
        console.error('[SDK] Refresh failed', error);
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
        this.notifyListeners();
        console.log('[SDK] Refresh finished');
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
      console.log('[SDK] Axios request', {
        url: config.url,
        token: shortToken(token)
      });
      return config;
    });

    instance.interceptors.response.use(
      r => r,
      async error => {
        const originalRequest = error.config;

        console.warn('[SDK] Axios response error', {
          url: originalRequest?.url,
          status: error.response?.status
        });

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/refreshToken')
        ) {
          originalRequest._retry = true;

          console.log('[SDK] Axios 401 - triggering refresh', {
            url: originalRequest.url
          });
          try {
            const newToken = await this.attemptTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('[SDK] Axios retrying request with new token', {
              url: originalRequest.url,
              token: shortToken(newToken)
            });
            return instance(originalRequest);
          } catch (err) {
            console.warn('[SDK] Axios 401 refresh failed, logging out', err);
            this.logout();
          }
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
      console.log('[SDK] login triggered');
      const response = await this.auth.login();
      this.token = response.token;
      this.refreshToken = response.refreshToken;
      this.user = response.user || null;
      this.saveState();
      console.log('[SDK] login successful', {
        token: shortToken(this.token),
        refreshToken: shortToken(this.refreshToken)
      });
      return { success: true, user: this.user || undefined };
    } catch (err) {
      console.warn('[SDK] login failed', err);
      this.logout();
      return { success: false };
    }
  }

  public logout(): void {
    console.log('[SDK] logout triggered');
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
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return;

    try {
      const { token, refreshToken, user } = JSON.parse(stored);
      this.token = token;
      this.refreshToken = refreshToken;
      this.user = user;
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private saveState(): void {
    if (typeof window === 'undefined') return;

    if (this.refreshToken) {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          token: this.token,
          refreshToken: this.refreshToken,
          user: this.user
        })
      );
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }

    this.notifyListeners();
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
