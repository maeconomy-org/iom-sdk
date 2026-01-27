interface DebugConfig {
    enabled: boolean;
    logLevel?: 'error' | 'info';
    logToConsole?: boolean;
    logCallback?: (message: string, data?: any) => void;
}
/**
 * Configure the logger with the provided debug options
 */
export declare const configureLogger: (config?: DebugConfig) => void;
/**
 * Log a message if debug is enabled
 */
export declare const log: (level: "error" | "info", message: string, data?: any) => void;
/**
 * Log informational message
 */
export declare const logInfo: (message: string, data?: any) => void;
/**
 * Log error information
 */
export declare const logError: (operation: string, error: any) => void;
export {};
