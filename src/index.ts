// Core types and configuration
export * from './types';
export * from './config';

// Main client API
export { Client, initClient, createClient } from './client';
export type { AuthChangeListener } from './client';

// Service clients
export { AuthServiceClient } from './services/auth';
export { RegistryServiceClient } from './services/registry';
export { NodeServiceClient } from './services/node';
export { UpAuthServiceClient } from './services/up';

// Core utilities
export { configureLogger } from './core/logger';
export type { TokenStorage, AuthState } from './core/token-storage';
export {
  createTokenStorage,
  LocalStorageTokenStorage,
  SessionStorageTokenStorage,
  MemoryTokenStorage
} from './core/token-storage';
