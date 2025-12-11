import { ApiResponse, UUObjectDTO, UUID, QueryParams } from '@/types';
/**
 * Get objects with optional filtering
 * This unified function handles all object retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of objects matching the criteria, or single object if uuid is provided
 */
export declare const getObjects: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUObjectDTO[]>>;
/**
 * Create or update an object
 *
 * @param client - HTTP client instance
 * @param object - The object to create or update
 * @returns The created or updated object
 */
export declare const createOrUpdateObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (object: UUObjectDTO) => Promise<ApiResponse<UUObjectDTO>>;
/**
 * Soft delete an object
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the object to delete
 * @returns The API response
 */
export declare const softDeleteObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;
