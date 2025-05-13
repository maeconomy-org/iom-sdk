// Common UUID pattern used throughout the API
export type UUID = string;

// Predicate types for statements
export enum Predicate {
  IS_PARENT_OF = 'IS_PARENT_OF',
  IS_CHILD_OF = 'IS_CHILD_OF',
  IS_INPUT_OF = 'IS_INPUT_OF',
  IS_OUTPUT_OF = 'IS_OUTPUT_OF',
  IS_MODEL_OF = 'IS_MODEL_OF',
  IS_INSTANCE_MODEL_OF = 'IS_INSTANCE_MODEL_OF',
  IS_PROPERTY_OF = 'IS_PROPERTY_OF',
  HAS_PROPERTY = 'HAS_PROPERTY',
  IS_VALUE_OF = 'IS_VALUE_OF',
  HAS_VALUE = 'HAS_VALUE',
  IS_FILE_OF = 'IS_FILE_OF',
  HAS_FILE = 'HAS_FILE'
}

// Common query parameters
export interface QueryParams {
  softDeleted?: boolean;
}

// UUStatement Data Transfer Object
export interface UUStatementDTO {
  subject: UUID;
  predicate: Predicate;
  object: UUID;
}

// UUProperty Data Transfer Object
export interface UUPropertyDTO {
  uuid: UUID;
  key: string;
  version?: string;
  label?: string;
  description?: string;
  type?: string;
  inputType?: string;
  formula?: string;
  inputOrderPosition?: number;
  processingOrderPosition?: number;
  viewOrderPosition?: number;
}

// UUPropertyValue Data Transfer Object
export interface UUPropertyValueDTO {
  uuid: UUID;
  value?: string;
  valueTypeCast?: string;
  sourceType?: string;
}

// UUObject Data Transfer Object
export interface UUObjectDTO {
  uuid: UUID;
  version?: string;
  name?: string;
  abbreviation?: string;
  description?: string;
}

// UUFile Data Transfer Object
export interface UUFileDTO {
  uuid: UUID;
  fileName: string;
  fileReference: string;
  label?: string;
}

// Configure options for the client
export interface IOBClientConfig {
  baseUrl: string;
  uuidServiceBaseUrl?: string; // Optional separate base URL for UUID service
  certificate?: {
    cert: string;
    key: string;
  };
  timeout?: number;
  headers?: Record<string, string>;
  debug?: {
    enabled: boolean;
    logLevel?: 'error' | 'info';
    logToConsole?: boolean;
    logCallback?: (message: string, data?: any) => void;
  };
}

// Higher-level entity types representing combined data from multiple endpoints
export interface UUObjectWithProperties {
  object: UUObjectDTO;
  properties: Array<{
    property: UUPropertyDTO;
    value?: UUPropertyValueDTO;
  }>;
  children?: UUObjectDTO[];
  files?: UUFileDTO[];
}

// Complex object creation input
export interface ComplexObjectCreationInput {
  // Object details (UUID will be generated)
  object: Omit<UUObjectDTO, 'uuid'>;

  // Optional parent UUID to establish parent-child relationship
  parentUuid?: UUID;

  // Files to attach directly to the object
  files?: Array<{
    file: Omit<UUFileDTO, 'uuid'>;
  }>;

  // Properties with values and files
  properties?: Array<{
    // Property details (UUID will be generated)
    property: Omit<UUPropertyDTO, 'uuid'> & { key: string };

    // Multiple values for this property
    values?: Array<{
      // Value details (UUID will be generated)
      value: Omit<UUPropertyValueDTO, 'uuid'>;

      // Files attached to this specific value
      files?: Array<{
        file: Omit<UUFileDTO, 'uuid'>;
      }>;
    }>;

    // Files attached to the property itself
    files?: Array<{
      file: Omit<UUFileDTO, 'uuid'>;
    }>;
  }>;
}

// Complex object output
export interface ComplexObjectOutput {
  // The created object
  object: UUObjectDTO;

  // All created properties with their values and files
  properties: Array<{
    property: UUPropertyDTO;
    values: Array<{
      value: UUPropertyValueDTO;
      files: UUFileDTO[];
    }>;
    files: UUFileDTO[];
  }>;

  // Files attached directly to the object
  files: UUFileDTO[];

  // Parent object if a parentUuid was provided
  parent?: UUObjectDTO;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
}

// Error response
export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  details?: any;
}
