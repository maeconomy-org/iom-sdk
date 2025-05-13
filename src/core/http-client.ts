import * as https from 'https';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { ApiError, ApiResponse, IOBClientConfig } from '../types';
import { configureLogger, logHttp, logError } from './logger';

/**
 * Create a HTTP client for making API requests to the IOB backend
 *
 * @param config - Configuration for the client
 * @returns An object with methods for making HTTP requests
 */
export const createHttpClient = (config: IOBClientConfig) => {
  // Configure logger if debug options are provided
  if (config.debug) {
    configureLogger(config.debug);
  }

  const axiosConfig: AxiosRequestConfig = {
    withCredentials: true,
    baseURL: config.baseUrl,
    timeout: config.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers
    }
  };

  // Add client certificate if provided
  if (config.certificate) {
    axiosConfig.httpsAgent = new https.Agent({
      cert: config.certificate.cert,
      key: config.certificate.key,
      rejectUnauthorized: true
    });
  }

  const client = axios.create(axiosConfig);

  /**
   * Handles errors from API requests
   *
   * @param error - The error object
   * @returns Standardized API error
   */
  const handleError = (error: any): ApiError => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.response.data?.message || 'Server error',
        details: error.response.data
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 0,
        statusText: 'No Response',
        message: 'No response received from server',
        details: error.request
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 0,
        statusText: 'Request Error',
        message: error.message || 'Error making request',
        details: error
      };
    }
  };

  /**
   * Makes a GET request to the specified endpoint
   *
   * @param url - The endpoint URL
   * @param params - Query parameters
   * @returns Promise with the response data
   */
  const get = async <T>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> => {
    try {
      // Log the request
      logHttp('GET', url);

      const response: AxiosResponse = await client.get(url, { params });

      // Log the response
      logHttp('GET', url, response.status);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>
      };
    } catch (error) {
      // Log the error
      logError(`GET ${url}`, error);
      throw handleError(error);
    }
  };

  /**
   * Makes a POST request to the specified endpoint
   *
   * @param url - The endpoint URL
   * @param data - Request body data
   * @returns Promise with the response data
   */
  const post = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      // Log the request
      logHttp('POST', url);

      const response: AxiosResponse = await client.post(url, data);

      // Log the response
      logHttp('POST', url, response.status);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>
      };
    } catch (error) {
      // Log the error
      logError(`POST ${url}`, error);
      throw handleError(error);
    }
  };

  /**
   * Makes a PUT request to the specified endpoint
   *
   * @param url - The endpoint URL
   * @param data - Request body data
   * @returns Promise with the response data
   */
  const put = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      // Log the request
      logHttp('PUT', url);

      const response: AxiosResponse = await client.put(url, data);

      // Log the response
      logHttp('PUT', url, response.status);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>
      };
    } catch (error) {
      // Log the error
      logError(`PUT ${url}`, error);
      throw handleError(error);
    }
  };

  /**
   * Makes a DELETE request to the specified endpoint
   *
   * @param url - The endpoint URL
   * @returns Promise with the response data
   */
  const del = async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      // Log the request
      logHttp('DELETE', url);

      const response: AxiosResponse = await client.delete(url);

      // Log the response
      logHttp('DELETE', url, response.status);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>
      };
    } catch (error) {
      // Log the error
      logError(`DELETE ${url}`, error);
      throw handleError(error);
    }
  };

  return {
    get,
    post,
    put,
    delete: del,
    config
  };
};

// Create a default HttpClient with empty config for internal reference
// This will be properly initialized when the IOB client is created
export let httpClient = createHttpClient({ baseUrl: '' });

/**
 * Set the global default HTTP client
 *
 * @param config - The client configuration
 */
export const setHttpClient = (config: IOBClientConfig): void => {
  httpClient = createHttpClient(config);
};
