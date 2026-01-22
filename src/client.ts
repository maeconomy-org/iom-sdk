import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { SDKConfig, validateSDKConfig } from './config';
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
export class Client {
  private config: SDKConfig;
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private user: AuthResponse | null = null;
  private listeners: Set<AuthChangeListener> = new Set();

  public auth: AuthServiceClient;
  public registry: RegistryServiceClient;
  public node: NodeServiceClient;

  private readonly STORAGE_KEY = 'iom-auth-state';

  constructor(config: SDKConfig) {
    validateSDKConfig(config);
    this.config = config;

    // Load initial state synchronously from localStorage if in browser
    this.loadState();

    // Initialize services with their own axios instances (each with proper baseURL)
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

    // Keep reference to node's axios for potential direct use
    this.axiosInstance = this.node.getAxios();
  }

  private createServiceAxiosInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      timeout: 30000
    });

    // Request interceptor: add token
    instance.interceptors.request.use(config => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor: handle 401
    instance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );

    // If Node.js and certificate provided, add httpsAgent
    if (typeof window === 'undefined' && this.config.certificate) {
      instance.defaults.httpsAgent = new https.Agent({
        cert: this.config.certificate.cert,
        key: this.config.certificate.key,
        rejectUnauthorized: true
      });
    }

    return instance;
  }

  private loadState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const { token, user } = JSON.parse(stored);
          this.token = token;
          this.user = user;
        } catch (e) {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    }
  }

  private saveState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (this.token) {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify({ token: this.token, user: this.user })
        );
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const state = { isAuthenticated: this.isAuthenticated(), user: this.user };
    this.listeners.forEach(l => l(state));
  }

  public onAuthStateChange(listener: AuthChangeListener): () => void {
    this.listeners.add(listener);
    // Initial call
    listener({ isAuthenticated: this.isAuthenticated(), user: this.user });
    return () => this.listeners.delete(listener);
  }

  public async login(): Promise<{ success: boolean; user?: AuthResponse }> {
    try {
      const response = await this.auth.login();
      this.token = response.token;
      this.user = response.user || null;
      this.saveState();
      return { success: true, user: this.user || undefined };
    } catch (error) {
      this.logout();
      return { success: false };
    }
  }

  public logout(): void {
    this.token = null;
    this.user = null;
    this.saveState();
  }

  public isAuthenticated(): boolean {
    if (!this.token) {
      return false;
    }

    // Check token expiry
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public getUser(): AuthResponse | null {
    return this.user;
  }

  public getToken(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return this.token;
  }

  public getAxios(): AxiosInstance {
    return this.axiosInstance;
  }
}

/**
 * Initialize the Client
 */
export function initClient(config: SDKConfig): Client {
  return new Client(config);
}

// Keep createClient for backward compatibility but mark as deprecated or just use it
export const createClient = initClient;
