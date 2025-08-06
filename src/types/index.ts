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
  HAS_FILE = 'HAS_FILE',
  HAS_ADDRESS = 'HAS_ADDRESS',
  IS_ADDRESS_OF = 'IS_ADDRESS_OF'
}

// Common query parameters
export interface QueryParams {
  uuid?: UUID;
  softDeleted?: boolean;
  createdBy?: string;
}

// Statement query parameters (based on UUStatementFindDTO from Swagger)
export interface StatementQueryParams {
  subject?: UUID;
  predicate?: Predicate;
  object?: UUID;
  softDeleted?: boolean;
  createdBy?: string;
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
  contentType?: string;
  size?: number;
}

// UUAddress Data Transfer Object
export interface UUAddressDTO {
  uuid: UUID;
  fullAddress?: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  state?: string;
  district?: string;
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

  // Optional address to attach to the object
  address?: Omit<UUAddressDTO, 'uuid'>;
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

  // Address attached to the object if provided
  address?: UUAddressDTO;

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

/**
 * Auth response from mTLS authentication endpoint
 * Based on typical Spring Security UserDetails structure
 */
export interface AuthResponse {
  username: string;
  authenticated: boolean;
  authorities: string[];
  principal?: {
    username: string;
    enabled: boolean;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
  };
  credentials?: any;
  details?: {
    remoteAddress?: string;
    sessionId?: string;
  };
}

// ============================================================================
// AGGREGATE API TYPES (from Swagger documentation)
// ============================================================================

/**
 * Aggregate search parameters for the /api/Aggregate endpoint
 */
export interface AggregateFindDTO {
  page?: number;
  size?: number;
  createdBy?: string;
  hasChildrenFull?: boolean;
  hasHistory?: boolean;
  hasParentUUIDFilter?: boolean;
  parentUUID?: string;
  searchTerm?: string;
}

/**
 * Aggregate file entity with metadata
 */
export interface AggregateFile {
  id: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  softDeletedAt?: string;
  softDeleteBy?: string;
  softDeleted: boolean;
  uuid: string;
  fileName: string;
  fileReference: string;
  label?: string;
}

/**
 * Aggregate property entity with optional values
 */
export interface AggregateProperty {
  id: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  softDeletedAt?: string;
  softDeleteBy?: string;
  softDeleted: boolean;
  uuid: string;
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
  values?: Array<{
    id: string;
    uuid: string;
    value?: string;
    valueTypeCast?: string;
    sourceType?: string;
    softDeleted: boolean;
  }>;
}

/**
 * Aggregate address entity with metadata
 */
export interface AggregateUUAddress {
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  softDeletedAt?: string;
  softDeleteBy?: string;
  softDeleted: boolean;
  uuid: string;
  fullAddress?: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  state?: string;
  district?: string;
}

/**
 * Rich aggregate entity with all relationships and metadata
 */
export interface AggregateEntity {
  id: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  softDeletedAt?: string;
  softDeleteBy?: string;
  softDeleted: boolean;
  abbreviation?: string;
  description?: string;
  uuid: string;
  name?: string;
  version?: string;
  address?: AggregateUUAddress;
  parents: string[];
  children: string[];
  inputs: string[];
  outputs: string[];
  models: string[];
  instances: string[];
  files: AggregateFile[];
  properties: AggregateProperty[];
  history: Array<{
    uuid: string;
    name?: string;
    abbreviation?: string;
    version?: string;
    description?: string;
  }>;
}

/**
 * Paginated response for aggregate entities
 */
export interface PageAggregateEntity {
  totalPages: number;
  totalElements: number;
  size: number;
  content: AggregateEntity[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
