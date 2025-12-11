import { ApiResponse, UUAddressDTO, UUID, QueryParams } from '@/types';
/**
 * Get addresses with optional filtering
 * This unified function handles all address retrieval scenarios including by UUID
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of addresses matching the criteria, or single address if uuid is provided
 */
export declare const getAddresses: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUAddressDTO[]>>;
/**
 * Create a new address (generates UUID automatically)
 *
 * @param client - HTTP client instance
 * @param address - The address data (without UUID)
 * @returns The created address with generated UUID
 */
export declare const createAddress: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (address: Omit<UUAddressDTO, "uuid">) => Promise<ApiResponse<UUAddressDTO>>;
/**
 * Update an existing address
 *
 * @param client - HTTP client instance
 * @param address - The address to update (must include UUID)
 * @returns The updated address
 */
export declare const updateAddress: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (address: UUAddressDTO) => Promise<ApiResponse<UUAddressDTO>>;
/**
 * Create an address for an object and establish the relationship
 * This is a convenience method that combines address creation with statement creation
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to associate the address with
 * @param addressData - Address data (without UUID, will be generated)
 * @returns The created address and relationship statement
 */
export declare const createAddressForObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (objectUuid: string, addressData: Omit<UUAddressDTO, "uuid">) => Promise<ApiResponse<{
    address: UUAddressDTO;
    statement: any;
}>>;
/**
 * Soft delete an address by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the address to soft delete
 * @returns The API response
 */
export declare const softDeleteAddress: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;
