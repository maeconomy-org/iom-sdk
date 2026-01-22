// Core types and configuration
export * from './types';
export * from './config';

// Main client API - this is what most users should use
export { createClient } from './client';
export type { IOBClient } from './client';

// Service clients for advanced usage
export { AuthServiceClient } from './services/auth';
export { RegistryServiceClient } from './services/registry';
export { NodeServiceClient } from './services/node';

// Core utilities
export { ServiceFactory, createServiceFactory } from './core/service-factory';
export { AuthManager, createAuthManager } from './core/auth-manager';
export { createTokenStorage, ManagedTokenStorage } from './core/token-storage';
export { configureLogger } from './core/logger';
