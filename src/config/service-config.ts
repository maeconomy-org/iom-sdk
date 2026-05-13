/**
 * Service configuration interfaces for the IOB SDK
 * Provides type-safe configuration for individual services
 */

/**
 * Configuration for an individual service
 */
export interface ServiceConfig {
  /** Base URL for the service */
  baseUrl: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number;
  /** Additional headers to include with requests */
  headers?: Record<string, string>;
  /** Alternative base URL for specific operations (e.g., refresh token endpoint without MTLS) */
  refreshBaseUrl?: string;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  /** Global handler for authentication errors */
  onAuthError?: (error: SDKError) => void;
  /** Global handler for network errors */
  onNetworkError?: (error: SDKError) => void;
  /** Global handler for service-specific errors */
  onServiceError?: (error: SDKError, service: string) => void;
  /** Enable debug logging for requests/responses */
  debug?: boolean;
  /** Automatically retry authentication failures */
  autoRetryAuth?: boolean;
  /** Network retry configuration */
  autoRetryNetwork?: {
    maxRetries: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
  };
}

/**
 * SDK Error interface with service context
 */
export interface SDKError extends Error {
  /** Service that generated the error */
  service?: string;
  /** Error type classification */
  type?: 'authentication' | 'network' | 'validation' | 'service' | 'unknown';
  /** HTTP status code if applicable */
  status?: number;
  /** Additional error details */
  details?: any;
  /** Request context */
  context?: {
    method: string;
    url: string;
    timestamp: Date;
  };
}

/** Default service paths appended to baseUrl */
export const DEFAULT_SERVICE_PATHS = {
  auth: '/auth',
  registry: '/registrar',
  node: '/node-network',
  user: '/user',
  fileStorage: '/file-storage'
} as const;

/** Default port for mTLS certificate authentication */
export const DEFAULT_CERT_PORT = 553;

/**
 * Optional per-service overrides (baseUrl, timeout, retries, etc.)
 * If baseUrl is provided it replaces the derived URL entirely.
 */
export interface ServiceOverrides {
  auth?: Partial<ServiceConfig>;
  registry?: Partial<ServiceConfig>;
  node?: Partial<ServiceConfig>;
  user?: Partial<ServiceConfig>;
  fileStorage?: Partial<ServiceConfig>;
}

/**
 * Main SDK configuration interface
 */
export interface SDKConfig {
  /** Root URL for all services (e.g. https://maeconomy-dev.recheck.io) */
  baseUrl: string;
  /** Per-service overrides — paths, timeouts, etc. */
  services?: ServiceOverrides;
  /** Port used for mTLS certificate login (default: 553) */
  certPort?: number;
  /** Client certificate for mTLS authentication (optional - browser will handle cert selection) */
  certificate?: {
    cert: string;
    key: string;
  };
  /** Token storage strategy */
  tokenStorage?: 'localStorage' | 'sessionStorage' | 'memory';
  /** Error handling configuration */
  errorHandling?: ErrorHandlingConfig;
}

/**
 * Builds the cert-auth base URL by replacing the port on the auth base URL
 */
export function buildCertAuthBaseUrl(
  authBaseUrl: string,
  certPort: number = DEFAULT_CERT_PORT
): string {
  const url = new URL(authBaseUrl);
  url.port = String(certPort);
  return url.origin + url.pathname.replace(/\/$/, '');
}

/**
 * Resolves the full ServiceConfig for each service from SDKConfig
 */
export function resolveServiceConfigs(config: SDKConfig): {
  auth: ServiceConfig;
  registry: ServiceConfig;
  node: ServiceConfig;
  user: ServiceConfig;
  fileStorage: ServiceConfig;
  certAuth: ServiceConfig;
} {
  const authBase =
    config.services?.auth?.baseUrl ||
    `${config.baseUrl.replace(/\/$/, '')}${DEFAULT_SERVICE_PATHS.auth}`;
  const registryBase =
    config.services?.registry?.baseUrl ||
    `${config.baseUrl.replace(/\/$/, '')}${DEFAULT_SERVICE_PATHS.registry}`;
  const nodeBase =
    config.services?.node?.baseUrl ||
    `${config.baseUrl.replace(/\/$/, '')}${DEFAULT_SERVICE_PATHS.node}`;
  const userBase =
    config.services?.user?.baseUrl ||
    `${config.baseUrl.replace(/\/$/, '')}${DEFAULT_SERVICE_PATHS.user}`;
  const fileStorageBase =
    config.services?.fileStorage?.baseUrl ||
    `${config.baseUrl.replace(/\/$/, '')}${DEFAULT_SERVICE_PATHS.fileStorage}`;

  const auth: ServiceConfig = {
    baseUrl: authBase,
    ...config.services?.auth,
    // ensure baseUrl isn't accidentally overwritten by spread of partial
    ...(config.services?.auth ? { baseUrl: authBase } : {})
  };
  const registry: ServiceConfig = {
    baseUrl: registryBase,
    ...config.services?.registry,
    ...(config.services?.registry ? { baseUrl: registryBase } : {})
  };
  const node: ServiceConfig = {
    baseUrl: nodeBase,
    ...config.services?.node,
    ...(config.services?.node ? { baseUrl: nodeBase } : {})
  };
  const user: ServiceConfig = {
    baseUrl: userBase,
    ...config.services?.user,
    ...(config.services?.user ? { baseUrl: userBase } : {})
  };
  const fileStorage: ServiceConfig = {
    baseUrl: fileStorageBase,
    ...config.services?.fileStorage,
    ...(config.services?.fileStorage ? { baseUrl: fileStorageBase } : {})
  };

  const certAuthBaseUrl = buildCertAuthBaseUrl(
    authBase,
    config.certPort ?? DEFAULT_CERT_PORT
  );
  const certAuth: ServiceConfig = {
    ...auth,
    baseUrl: certAuthBaseUrl,
    refreshBaseUrl: auth.baseUrl
  };

  return { auth, registry, node, user, fileStorage, certAuth };
}

/**
 * Validates a service configuration
 */
export function validateServiceConfig(
  config: ServiceConfig,
  serviceName: string
): void {
  if (!config.baseUrl) {
    throw new Error(`${serviceName} service baseUrl is required`);
  }

  try {
    new URL(config.baseUrl);
  } catch {
    throw new Error(`${serviceName} service baseUrl must be a valid URL`);
  }

  if (
    config.timeout !== undefined &&
    (config.timeout < 0 || config.timeout > 300000)
  ) {
    throw new Error(
      `${serviceName} service timeout must be between 0 and 300000ms`
    );
  }

  if (
    config.retries !== undefined &&
    (config.retries < 0 || config.retries > 10)
  ) {
    throw new Error(`${serviceName} service retries must be between 0 and 10`);
  }
}

/**
 * Validates the complete SDK configuration
 */
export function validateSDKConfig(config: SDKConfig): void {
  if (!config.baseUrl) {
    throw new Error('baseUrl is required');
  }

  try {
    new URL(config.baseUrl);
  } catch {
    throw new Error('baseUrl must be a valid URL');
  }

  // Certificate is optional - browser handles cert selection in UI environments
  if (config.certificate) {
    if (!config.certificate.cert || !config.certificate.key) {
      throw new Error(
        'Certificate must include both cert and key when provided'
      );
    }
  }

  // Validate any explicit service override URLs
  const overrides = config.services;
  if (overrides?.auth?.baseUrl)
    validateServiceConfig({ baseUrl: overrides.auth.baseUrl }, 'auth');
  if (overrides?.registry?.baseUrl)
    validateServiceConfig({ baseUrl: overrides.registry.baseUrl }, 'registry');
  if (overrides?.node?.baseUrl)
    validateServiceConfig({ baseUrl: overrides.node.baseUrl }, 'node');
  if (overrides?.user?.baseUrl)
    validateServiceConfig({ baseUrl: overrides.user.baseUrl }, 'user');
  if (overrides?.fileStorage?.baseUrl)
    validateServiceConfig(
      { baseUrl: overrides.fileStorage.baseUrl },
      'fileStorage'
    );

  // Validate token storage option
  if (
    config.tokenStorage &&
    !['localStorage', 'sessionStorage', 'memory'].includes(config.tokenStorage)
  ) {
    throw new Error(
      'tokenStorage must be one of: localStorage, sessionStorage, memory'
    );
  }

  // Validate error handling config
  if (config.errorHandling?.autoRetryNetwork) {
    const { maxRetries, delay, backoff } =
      config.errorHandling.autoRetryNetwork;
    if (maxRetries < 0 || maxRetries > 10) {
      throw new Error('autoRetryNetwork.maxRetries must be between 0 and 10');
    }
    if (delay !== undefined && (delay < 0 || delay > 60000)) {
      throw new Error('autoRetryNetwork.delay must be between 0 and 60000ms');
    }
    if (backoff && !['linear', 'exponential'].includes(backoff)) {
      throw new Error(
        'autoRetryNetwork.backoff must be either linear or exponential'
      );
    }
  }
}

/**
 * Creates a default service configuration with sensible defaults
 */
export function createDefaultServiceConfig(baseUrl: string): ServiceConfig {
  return {
    baseUrl,
    timeout: 30000,
    retries: 3,
    headers: {}
  };
}

/**
 * Creates default error handling configuration
 */
export function createDefaultErrorHandling(): ErrorHandlingConfig {
  return {
    debug: false,
    autoRetryAuth: true,
    autoRetryNetwork: {
      maxRetries: 3,
      delay: 1000,
      backoff: 'exponential'
    }
  };
}
