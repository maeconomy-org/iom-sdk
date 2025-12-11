import { ApiResponse, UUFileDTO, UUID } from '@/types';
/**
 * Upload a file by external URL reference
 *
 * This creates a UUFile record with a provided URL in `fileReference` and links it to a parent object.
 * Always creates a new UUID first, then creates the file record and statement.
 *
 * @param client - HTTP client instance
 * @param input - File reference input with required fileReference and uuidToAttach
 * @returns The created file record
 */
export declare const uploadByReference: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (input: {
    fileReference: string;
    uuidToAttach: UUID;
    label?: string;
}) => Promise<ApiResponse<UUFileDTO | null>>;
/**
 * Upload a file's binary content directly
 *
 * Complete flow for direct binary upload:
 * 1) Create UUID for the file
 * 2) Create UUFile record with fileName
 * 3) POST the binary to /api/UUFile/upload with uuidFile and uuidToAttach
 * 4) Create statement to link file to parent object
 *
 * @param client - HTTP client instance
 * @param input - File upload input
 * @returns The created file record
 */
export declare const uploadDirect: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (input: {
    file: File | Blob | ArrayBuffer | FormData;
    uuidToAttach: UUID;
}) => Promise<ApiResponse<UUFileDTO | null>>;
/**
 * Upload using pre-constructed FormData from UI
 *
 * For cases where the UI has already constructed FormData with additional fields.
 * This method bypasses the internal FormData construction and uses the provided FormData directly.
 *
 * @param client - HTTP client instance
 * @param input - Upload input with pre-constructed FormData
 * @returns Upload response
 */
export declare const uploadFormData: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (input: {
    formData: FormData;
    uuidFile: UUID;
    uuidToAttach: UUID;
}) => Promise<ApiResponse<any>>;
/**
 * Download file binary via UUID
 */
export declare const download: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<ArrayBuffer>>;
