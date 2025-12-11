import { ApiResponse, UUPropertyValueDTO, UUID, QueryParams } from '@/types';
/**
 * Set a value for a property
 * This high-level operation automatically gets a UUID, creates the value,
 * and establishes the relationship with the property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - UUID of the property to set the value for
 * @param value - Value data (UUID will be generated if not provided)
 * @returns The created property value
 */
export declare const setValueForProperty: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (propertyUuid: UUID, value: Partial<UUPropertyValueDTO>) => Promise<ApiResponse<UUPropertyValueDTO>>;
/**
 * Get all values for a property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - UUID of the property to get values for
 * @param params - Query parameters
 * @returns List of values for the property
 */
export declare const getValuesForProperty: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (propertyUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUPropertyValueDTO[]>>;
