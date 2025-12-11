import { ApiResponse, UUPropertyDTO, UUID, QueryParams } from '@/types';
/**
 * Add a property to an object
 * This high-level operation automatically gets a UUID, creates the property,
 * and establishes the relationship with the object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to add the property to
 * @param property - Property data (UUID will be generated if not provided)
 * @returns The created property
 */
export declare const addPropertyToObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (objectUuid: UUID, property: Partial<UUPropertyDTO> & {
    key: string;
}) => Promise<ApiResponse<UUPropertyDTO>>;
/**
 * Get all properties for an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to get properties for
 * @param params - Query parameters
 * @returns List of properties for the object
 */
export declare const getPropertiesForObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (objectUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO[]>>;
