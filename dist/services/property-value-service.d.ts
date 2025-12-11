import { ApiResponse, UUPropertyValueDTO, UUID, QueryParams } from '@/types';
/**
 * Get property values with optional filtering
 * This unified function handles all property value retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of property values matching the criteria, or single property value if uuid is provided
 */
export declare const getPropertyValues: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUPropertyValueDTO[]>>;
/**
 * Create or update a property value
 *
 * @param client - HTTP client instance
 * @param propertyValue - The property value to create or update
 * @returns The created or updated property value
 */
export declare const createOrUpdatePropertyValue: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (propertyValue: UUPropertyValueDTO) => Promise<ApiResponse<UUPropertyValueDTO>>;
/**
 * Soft delete a property value
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property value to delete
 * @returns The API response
 */
export declare const softDeletePropertyValue: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;
