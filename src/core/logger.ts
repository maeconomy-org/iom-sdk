// Default configuration
let debugConfig = {
  enabled: false,
  logLevel: 'error' as 'error' | 'info',
  logToConsole: true,
  logCallback: null as ((message: string, data?: any) => void) | null
};

interface DebugConfig {
  enabled: boolean;
  logLevel?: 'error' | 'info';
  logToConsole?: boolean;
  logCallback?: (message: string, data?: any) => void;
}

/**
 * Configure the logger with the provided debug options
 */
export const configureLogger = (config?: DebugConfig): void => {
  if (!config) {
    return;
  }

  debugConfig = {
    enabled: config.enabled ?? debugConfig.enabled,
    logLevel: config.logLevel === 'info' ? 'info' : 'error',
    logToConsole: config.logToConsole ?? debugConfig.logToConsole,
    logCallback: config.logCallback ?? debugConfig.logCallback
  };
};

/**
 * Log a message if debug is enabled
 */
export const log = (
  level: 'error' | 'info',
  message: string,
  data?: any
): void => {
  if (!debugConfig.enabled) {
    return;
  }

  // Only log errors if level is set to 'error'
  if (debugConfig.logLevel === 'error' && level !== 'error') {
    return;
  }

  const formattedMessage = `[IoM Client] ${message}`;

  // Log to console if enabled
  if (debugConfig.logToConsole) {
    if (level === 'error') {
      console.error(formattedMessage, data || '');
    } else {
      console.log(formattedMessage, data || '');
    }
  }

  // Use custom log callback if provided
  if (debugConfig.logCallback) {
    debugConfig.logCallback(formattedMessage, data);
  }
};

/**
 * Log request/response information
 */
export const logHttp = (
  method: string,
  url: string,
  status?: number,
  data?: any
): void => {
  if (!debugConfig.enabled) {
    return;
  }

  const message = status ? `${method} ${url} (${status})` : `${method} ${url}`;

  log('info', message, data);
};

/**
 * Log error information
 */
export const logError = (operation: string, error: any): void => {
  if (!debugConfig.enabled) {
    return;
  }

  log('error', `Error in ${operation}`, error);
};
