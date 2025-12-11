import { ClientConfig } from '@/types';
/**
 * Configure the logger with the provided debug options
 */
export declare const configureLogger: (config?: ClientConfig["debug"]) => void;
/**
 * Log a message if debug is enabled
 */
export declare const log: (level: "error" | "info", message: string, data?: any) => void;
/**
 * Log request/response information
 */
export declare const logHttp: (method: string, url: string, status?: number, data?: any) => void;
/**
 * Log error information
 */
export declare const logError: (operation: string, error: any) => void;
