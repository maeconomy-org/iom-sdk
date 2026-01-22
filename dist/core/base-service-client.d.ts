/**
 * Base service client with common functionality
 * Provides HTTP operations, error handling, and retry logic
 */
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ServiceConfig, SDKError, ErrorHandlingConfig } from '../config';
import { ApiResponse } from '../types';
/**
 * Base service client class
 */
export declare abstract class BaseServiceClient {
    protected client: AxiosInstance;
    protected config: ServiceConfig;
    protected errorHandling: ErrorHandlingConfig;
    protected serviceName: string;
    constructor(config: ServiceConfig, errorHandling: ErrorHandlingConfig, serviceName: string, certificate?: {
        cert: string;
        key: string;
    });
    /**
     * Setup request and response interceptors
     */
    protected setupInterceptors(): void;
    /**
     * Create standardized SDK error from axios error
     */
    protected createSDKError(error: any): SDKError;
    /**
     * Handle error with global handlers
     */
    protected handleError(error: SDKError): Promise<void>;
    /**
     * Determine if request should be retried
     */
    protected shouldRetry(error: SDKError): boolean;
    /**
     * Retry failed request with backoff
     */
    protected retryRequest(config: AxiosRequestConfig, error: SDKError): Promise<AxiosResponse>;
    /**
     * Make GET request
     */
    protected get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
    /**
     * Make POST request
     */
    protected post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    /**
     * Make PUT request
     */
    protected put<T>(url: string, data?: any): Promise<ApiResponse<T>>;
    /**
     * Make DELETE request
     */
    protected delete<T>(url: string, data?: any): Promise<ApiResponse<T>>;
    /**
     * Make GET request for binary data
     */
    protected getBinary<T = ArrayBuffer>(url: string): Promise<ApiResponse<T>>;
    /**
     * Make POST request with form data
     */
    protected postForm<T>(url: string, formData: any): Promise<ApiResponse<T>>;
    /**
     * Create standardized API response
     */
    protected createApiResponse<T>(response: AxiosResponse): ApiResponse<T>;
    /**
     * Add authorization header
     */
    protected setAuthorizationHeader(token: string): void;
    /**
     * Remove authorization header
     */
    protected removeAuthorizationHeader(): void;
}
declare module 'axios' {
    interface AxiosRequestConfig {
        _retryCount?: number;
    }
}
