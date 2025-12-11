import { ApiResponse, UUAddressDTO, UUStatementDTO, UUID } from '@/types';
/**
 * Create an address and establish relationship with an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to associate the address with
 * @param addressData - Address data (without UUID, will be generated)
 * @returns The created address with its relationship statement
 */
export declare const createAddressForObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").IOBClientConfig;
}) => (objectUuid: UUID, addressData: Omit<UUAddressDTO, "uuid">) => Promise<ApiResponse<{
    address: UUAddressDTO;
    statement: UUStatementDTO;
}>>;
/**
 * Get address for an object by finding the HAS_ADDRESS relationship
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object
 * @returns The address associated with the object, or null if none found
 */
export declare const getAddressForObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").IOBClientConfig;
}) => (objectUuid: UUID) => Promise<ApiResponse<UUAddressDTO | null>>;
/**
 * Update address for an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object
 * @param addressData - Updated address data
 * @returns The updated address
 */
export declare const updateAddressForObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").IOBClientConfig;
}) => (objectUuid: UUID, addressData: Partial<UUAddressDTO>) => Promise<ApiResponse<UUAddressDTO | null>>;
/**
 * Remove address from an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object
 * @returns Response indicating success or failure
 */
export declare const removeAddressFromObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").IOBClientConfig;
}) => (objectUuid: UUID) => Promise<ApiResponse<any>>;
