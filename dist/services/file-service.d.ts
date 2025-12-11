import { ApiResponse, UUFileDTO, UUID, QueryParams } from '@/types';
/**
 * Get files with optional filtering
 * This unified function replaces getAllFiles, getOwnFiles, and getFileByUuid
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of files matching the criteria, or single file if uuid is provided
 */
export declare const getFiles: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUFileDTO[]>>;
/**
 * Create or update a file
 *
 * @param client - HTTP client instance
 * @param file - The file to create or update
 * @returns The created or updated file
 */
export declare const createOrUpdateFile: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (file: UUFileDTO) => Promise<ApiResponse<UUFileDTO>>;
/**
 * Soft delete a file
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the file to delete
 * @returns The API response
 */
export declare const softDeleteFile: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;
/**
 * Upload a file's binary content via multipart/form-data
 *
 * Swagger: POST /api/UUFile/upload?uuidFile={uuidFile}&uuidToAttach={uuidToAttach}
 *
 * @param client - HTTP client instance
 * @param uuidFile - UUID of the file record
 * @param uuidToAttach - UUID of the object/property/value to attach to
 * @param file - Blob | File | Buffer to upload
 * @param fieldName - Optional field name (defaults to 'file')
 */
export declare const uploadFileBinary: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuidFile: UUID, uuidToAttach: UUID, file: any, fieldName?: string) => Promise<ApiResponse<any>>;
/**
 * Download a file's binary content
 *
 * Swagger: GET /api/UUFile/download/{uuid}
 */
export declare const downloadFileBinary: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<ArrayBuffer>>;
