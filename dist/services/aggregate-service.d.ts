import { ApiResponse, AggregateFindDTO, AggregateEntity, PageAggregateEntity, AggregateCreateDTO, UUID } from '@/types';
/**
 * Find any entity by UUID using the aggregate API
 * Uses the new /api/Aggregate/{uuid} endpoint which provides rich aggregated data
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the entity to find
 * @returns The aggregate entity if found, null otherwise
 */
export declare const findByUUID: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<AggregateEntity[] | null>>;
/**
 * Search aggregate entities with pagination and filtering
 * Uses the new /api/Aggregate/search endpoint with POST method for advanced searching
 *
 * @param client - HTTP client instance
 * @param params - Aggregate search parameters including the new searchBy field
 * @returns Paginated list of aggregate entities
 */
export declare const getAggregateEntities: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (params?: AggregateFindDTO) => Promise<ApiResponse<PageAggregateEntity>>;
/**
 * Create aggregate objects using the new API structure
 * Uses POST /api/Aggregate endpoint with new AggregateCreateDTO structure
 *
 * @param client - HTTP client instance
 * @param data - Aggregate creation data with user context
 * @returns Created aggregate response
 */
export declare const createAggregateObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (data: AggregateCreateDTO) => Promise<ApiResponse<any | null>>;
/**
 * Import multiple aggregate objects using the new API structure
 * Uses POST /api/Aggregate/Import endpoint with new AggregateCreateDTO structure
 *
 * @param client - HTTP client instance
 * @param data - Aggregate creation data with user context
 * @returns Import response
 */
export declare const importAggregateObjects: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (data: AggregateCreateDTO) => Promise<ApiResponse<any | null>>;
