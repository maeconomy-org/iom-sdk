import { ApiResponse, UUID } from '@/types';
/**
 * Get UUIDs owned by the current user/client
 * Uses /api/UUID/own endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns UUIDs owned by the current user/client
 */
export declare const getOwnedUUIDs: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}, baseURL?: string) => () => Promise<ApiResponse<any>>;
/**
 * Create a new UUID
 * Updated to use /api/UUID endpoint from new swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns The newly created UUID data
 */
export declare const createUUID: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}, baseURL?: string) => () => Promise<ApiResponse<{
    uuid: UUID;
}>>;
/**
 * Get UUID record by UUID
 * Updated to use /api/UUID/{uuid} endpoint from new swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param uuid - UUID to find
 * @returns UUID record data
 */
export declare const getUUIDRecord: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}, baseURL?: string) => (uuid: UUID) => Promise<ApiResponse<any>>;
/**
 * Update UUID record metadata
 * New endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param params - UUID record metadata update parameters
 * @returns Updated UUID record data
 */
export declare const updateUUIDRecordMeta: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}, baseURL?: string) => (params: {
    uuid?: UUID;
    nodeType: string;
}) => Promise<ApiResponse<any>>;
/**
 * Authorize UUID record access
 * New endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param params - Authorization parameters
 * @returns Authorization response
 */
export declare const authorizeUUIDRecord: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}, baseURL?: string) => (params: {
    userUUID: UUID;
    resourceId: UUID;
}) => Promise<ApiResponse<any>>;
