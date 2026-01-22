/**
 * Base service client with common functionality
 * Provides HTTP operations, error handling, and retry logic
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as https from 'https';
import { ServiceConfig, SDKError, ErrorHandlingConfig } from '../config';
import { ApiResponse } from '../types';

/**
 * Base service client class
 */
export abstract class BaseServiceClient {
  protected client: AxiosInstance;
  protected config: ServiceConfig;
  protected errorHandling: ErrorHandlingConfig;
  protected serviceName: string;

  constructor(
    config: ServiceConfig,
    errorHandling: ErrorHandlingConfig,
    serviceName: string,
    certificate?: { cert: string; key: string }
  ) {
    this.config = config;
    this.errorHandling = errorHandling;
    this.serviceName = serviceName;

    const axiosConfig: AxiosRequestConfig = {
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers
      }
    };

    // Add client certificate if provided
    if (certificate) {
      axiosConfig.httpsAgent = new https.Agent({
        cert: certificate.cert,
        key: certificate.key,
        rejectUnauthorized: true
      });
    }

    this.client = axios.create(axiosConfig);
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  protected setupInterceptors(): void {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      config => {
        if (this.errorHandling.debug) {
          console.log(
            `[${this.serviceName}] ${config.method?.toUpperCase()} ${config.url}`
          );
        }
        return config;
      },
      error => {
        if (this.errorHandling.debug) {
          console.error(`[${this.serviceName}] Request error:`, error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      response => {
        if (this.errorHandling.debug) {
          console.log(
            `[${this.serviceName}] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
          );
        }
        return response;
      },
      async error => {
        const sdkError = this.createSDKError(error);

        // Call global error handlers
        await this.handleError(sdkError);

        // Check if we should retry
        if (this.shouldRetry(sdkError)) {
          return this.retryRequest(error.config, sdkError);
        }

        return Promise.reject(sdkError);
      }
    );
  }

  /**
   * Create standardized SDK error from axios error
   */
  protected createSDKError(error: any): SDKError {
    const sdkError = new Error() as SDKError;
    sdkError.service = this.serviceName;

    if (error.response) {
      // Server responded with error status
      sdkError.status = error.response.status;
      sdkError.message =
        error.response.data?.message ||
        error.response.statusText ||
        'Server error';
      sdkError.details = error.response.data;

      // Classify error type
      if (error.response.status === 401 || error.response.status === 403) {
        sdkError.type = 'authentication';
      } else if (error.response.status >= 400 && error.response.status < 500) {
        sdkError.type = 'validation';
      } else {
        sdkError.type = 'service';
      }
    } else if (error.request) {
      // Network error
      sdkError.type = 'network';
      sdkError.message = 'Network error - unable to reach service';
      sdkError.details = error.request;
    } else {
      // Request setup error
      sdkError.type = 'unknown';
      sdkError.message = error.message || 'Unknown error occurred';
      sdkError.details = error;
    }

    // Add request context
    if (error.config) {
      sdkError.context = {
        method: error.config.method?.toUpperCase() || 'UNKNOWN',
        url: error.config.url || 'unknown',
        timestamp: new Date()
      };
    }

    return sdkError;
  }

  /**
   * Handle error with global handlers
   */
  protected async handleError(error: SDKError): Promise<void> {
    try {
      // Call appropriate global handler
      switch (error.type) {
        case 'authentication':
          if (this.errorHandling.onAuthError) {
            this.errorHandling.onAuthError(error);
          }
          break;
        case 'network':
          if (this.errorHandling.onNetworkError) {
            this.errorHandling.onNetworkError(error);
          }
          break;
        default:
          if (this.errorHandling.onServiceError) {
            this.errorHandling.onServiceError(error, this.serviceName);
          }
          break;
      }
    } catch (handlerError) {
      if (this.errorHandling.debug) {
        console.error(`Error in global error handler:`, handlerError);
      }
    }
  }

  /**
   * Determine if request should be retried
   */
  protected shouldRetry(error: SDKError): boolean {
    // Don't retry authentication errors (handled by auth manager)
    if (error.type === 'authentication') {
      return false;
    }

    // Retry network errors if configured
    if (error.type === 'network' && this.errorHandling.autoRetryNetwork) {
      return true;
    }

    // Retry 5xx server errors
    if (error.status && error.status >= 500) {
      return true;
    }

    return false;
  }

  /**
   * Retry failed request with backoff
   */
  protected async retryRequest(
    config: AxiosRequestConfig,
    error: SDKError
  ): Promise<AxiosResponse> {
    const retryConfig = this.errorHandling.autoRetryNetwork || {
      maxRetries: 3,
      delay: 1000
    };
    const maxRetries = Math.min(
      retryConfig.maxRetries,
      this.config.retries || 3
    );

    // Track retry attempts
    config._retryCount = (config._retryCount || 0) + 1;

    if (config._retryCount > maxRetries) {
      throw error;
    }

    // Calculate delay
    let delay = retryConfig.delay || 1000;
    if (retryConfig.backoff === 'exponential') {
      delay = delay * Math.pow(2, config._retryCount - 1);
    }

    if (this.errorHandling.debug) {
      console.log(
        `[${this.serviceName}] Retrying request (${config._retryCount}/${maxRetries}) after ${delay}ms`
      );
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry the request
    return this.client.request(config);
  }

  /**
   * Make GET request
   */
  protected async get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return this.createApiResponse(response);
  }

  /**
   * Make POST request
   */
  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return this.createApiResponse(response);
  }

  /**
   * Make PUT request
   */
  protected async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return this.createApiResponse(response);
  }

  /**
   * Make DELETE request
   */
  protected async delete<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, data ? { data } : undefined);
    return this.createApiResponse(response);
  }

  /**
   * Make GET request for binary data
   */
  protected async getBinary<T = ArrayBuffer>(
    url: string
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, {
      responseType: 'arraybuffer'
    });
    return this.createApiResponse(response);
  }

  /**
   * Make POST request with form data
   */
  protected async postForm<T>(
    url: string,
    formData: any
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000 // Longer timeout for file uploads
    });
    return this.createApiResponse(response);
  }

  /**
   * Create standardized API response
   */
  protected createApiResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    };
  }

  /**
   * Add authorization header
   */
  protected setAuthorizationHeader(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  protected removeAuthorizationHeader(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Extend AxiosRequestConfig to include retry count
declare module 'axios' {
  interface AxiosRequestConfig {
    _retryCount?: number;
  }
}
