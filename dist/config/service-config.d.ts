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
export declare function validateServiceConfig(config: ServiceConfig, serviceName: string): void;
/**
 * Validates the complete SDK configuration
 */
export declare function validateSDKConfig(config: SDKConfig): void;
/**
 * Creates a default service configuration with sensible defaults
 */
export declare function createDefaultServiceConfig(baseUrl: string): ServiceConfig;
/**
 * Creates default error handling configuration
 */
export declare function createDefaultErrorHandling(): ErrorHandlingConfig;
