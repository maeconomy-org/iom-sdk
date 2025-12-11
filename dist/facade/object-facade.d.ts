import { ApiResponse, ComplexObjectCreationInput, ComplexObjectOutput } from '@/types';
/**
 * Create a complex object with multiple properties, multiple values per property,
 * and files attached to the object, properties, and values.
 * This high-level operation handles creating the complete object hierarchy in a single function call.
 *
 * @param client - HTTP client instance
 * @param objectData - The complex object data including properties, values, files, and optional parents
 * @returns The created complex object with all its relationships
 */
export declare const createFullObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: import("@/types").ClientConfig;
}) => (objectData: ComplexObjectCreationInput) => Promise<ApiResponse<ComplexObjectOutput | null>>;
