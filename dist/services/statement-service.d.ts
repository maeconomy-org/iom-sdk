import { ApiResponse, Predicate, UUStatementDTO, UUID, QueryParams, StatementQueryParams } from '@/types';
/**
 * Get statements with optional filtering
 * This unified function handles all statement retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Statement query parameters (subject, predicate, object, softDeleted)
 * @returns List of statements matching the criteria
 */
export declare const getStatements: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (params?: StatementQueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Create or find statements
 *
 * @param client - HTTP client instance
 * @param statements - Statements to create or find
 * @returns Created or found statements
 */
export declare const createOrFindStatements: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (statements: UUStatementDTO[]) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Create a single statement (convenience method)
 *
 * @param client - HTTP client instance
 * @param statement - Statement to create
 * @returns Created statement
 */
export declare const createStatement: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (statement: UUStatementDTO) => Promise<ApiResponse<UUStatementDTO>>;
/**
 * Get statements by UUID and predicate
 * This is now a convenience wrapper around getAllStatements
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID to find statements for (subject)
 * @param predicate - The predicate to filter by
 * @param params - Query parameters
 * @returns Statements matching the criteria
 */
export declare const getStatementsByUuidAndPredicate: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID, predicate: Predicate, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Soft delete a statement
 * This performs a logical delete using the DELETE HTTP method
 *
 * @param client - HTTP client instance
 * @param statement - Statement to soft delete
 * @returns The API response
 */
export declare const softDeleteStatement: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (statement: UUStatementDTO | {
    subject: UUID;
    predicate: Predicate;
    object: UUID;
}) => Promise<ApiResponse<any>>;
/**
 * Find all children of a given UUID
 *
 * @param client - HTTP client instance
 * @param parentUuid - The parent UUID
 * @param params - Query parameters
 * @returns Statements with parent-child relationship
 */
export declare const findChildren: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (parentUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Find all parents of a given UUID
 *
 * @param client - HTTP client instance
 * @param childUuid - The child UUID
 * @param params - Query parameters
 * @returns Statements with child-parent relationship
 */
export declare const findParents: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (childUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Find all properties of an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with object-property relationship
 */
export declare const findProperties: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (objectUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Find all values of a property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - The property UUID
 * @param params - Query parameters
 * @returns Statements with property-value relationship
 */
export declare const findPropertyValues: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (propertyUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Find all files attached to an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with object-file relationship
 */
export declare const findFiles: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (objectUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
