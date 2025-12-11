import { ApiResponse, UUPropertyDTO, UUID, QueryParams } from '@/types';
/**
 * Get properties with optional filtering
 * This unified function handles all property retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of properties matching the criteria, or single property if uuid is provided
 */
export declare const getProperties: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO[]>>;
/**
 * Get a property by key (convenience function)
 * Note: This filters client-side since the API doesn't support direct key lookup
 *
 * @param client - HTTP client instance
 * @param key - The key of the property to get
 * @param params - Query parameters
 * @returns The requested property or null if not found
 */
export declare const getPropertyByKey: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (key: string, params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO | null>>;
/**
 * Create or update a property
 *
 * @param client - HTTP client instance
 * @param property - The property to create or update
 * @returns The created or updated property
 */
export declare const createOrUpdateProperty: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (property: UUPropertyDTO) => Promise<ApiResponse<UUPropertyDTO>>;
/**
 * Soft delete a property
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property to delete
 * @returns The API response
 */
export declare const softDeleteProperty: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;
