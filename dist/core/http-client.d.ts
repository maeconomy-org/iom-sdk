import { AxiosRequestConfig } from 'axios';
import { ApiResponse, ClientConfig } from '@/types';
/**
 * Create a HTTP client for making API requests to the IoM backend
 *
 * @param config - Configuration for the client
 * @returns An object with methods for making HTTP requests
 */
export declare const createHttpClient: (config: ClientConfig) => {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
};
export declare let httpClient: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
};
/**
 * Set the global default HTTP client
 *
 * @param config - The client configuration
 */
export declare const setHttpClient: (config: ClientConfig) => void;
