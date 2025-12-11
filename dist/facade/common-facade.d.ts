import { ApiResponse, AuthResponse } from '@/types';
/**
 * Authenticate with the base service using client certificate (mTLS)
 * This will trigger the browser certificate selection popup
 *
 * @param client - HTTP client instance
 * @returns Base service authentication data
 */
export declare const requestBaseAuth: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => () => Promise<ApiResponse<AuthResponse | null>>;
/**
 * Authenticate with the UUID service using client certificate (mTLS)
 * This will trigger the browser certificate selection popup
 *
 * @param client - HTTP client instance
 * @returns UUID service authentication data
 */
export declare const requestUuidAuth: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => () => Promise<ApiResponse<AuthResponse | null>>;
