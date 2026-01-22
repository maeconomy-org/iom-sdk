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

/**
 * Main SDK configuration interface
 */
export interface SDKConfig {
  /** Auth service configuration */
  auth: ServiceConfig;
  /** Registry/UUID service configuration */
  registry: ServiceConfig;
  /** Node service configuration */
  node: ServiceConfig;
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
  if (!config.auth) {
    throw new Error('Auth service configuration is required');
  }
  if (!config.registry) {
    throw new Error('Registry service configuration is required');
  }
  if (!config.node) {
    throw new Error('Node service configuration is required');
  }
  // Certificate is optional - browser handles cert selection in UI environments
  if (config.certificate) {
    if (!config.certificate.cert || !config.certificate.key) {
      throw new Error(
        'Certificate must include both cert and key when provided'
      );
    }
  }

  validateServiceConfig(config.auth, 'auth');
  validateServiceConfig(config.registry, 'registry');
  validateServiceConfig(config.node, 'node');

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
