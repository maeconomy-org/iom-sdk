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
}

// UUStatementFindDTO (from Swagger)
export interface UUStatementFindDTO {
  subject?: UUID;
  predicate?: Predicate;
  object?: UUID;
  softDeleted?: boolean;
}

// Statement query parameters (based on UUStatementFindDTO from Swagger)
export interface StatementQueryParams extends UUStatementFindDTO {}

// UUStatementsPropertyValue Data Transfer Object
export interface UUStatementsPropertyValue {
  value?: string;
}

// UUStatementsProperty Data Transfer Object
export interface UUStatementsProperty {
  key?: string;
  values?: UUStatementsPropertyValue[];
}

// UUStatement Data Transfer Object
export interface UUStatementDTO {
  subject: UUID;
  predicate: Predicate;
  object: UUID;
  properties?: UUStatementsProperty[];
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
  fileName?: string;
  fileReference?: string;
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

  // Optional parent UUIDs to establish parent-child relationships
  parents?: UUID[];

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

  // Parent objects if parents were provided
  parents?: UUObjectDTO[];
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
 * Based on actual API response structure with certificate information
 */
export interface AuthResponse {
  userUUID: string;
  credentials: string;
  createdAt: string;
  certificateInfo: {
    certificateSha256: string;
    subjectFields: {
      CN: string;
      [key: string]: string;
    };
    issuerFields: {
      CN: string;
      [key: string]: string;
    };
    serialNumber: string;
    validFrom: string;
    validTo: string;
    subjectAlternativeNames: string[];
  };
  enabled: boolean;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  accountNonLocked: boolean;
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
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  fileName?: string;
  fileReference?: string;
  label?: string;
  contentType?: string;
  size?: number;
}

/**
 * Aggregate property entity with optional values
 */
export interface AggregateProperty {
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  key?: string;
  version?: string;
  label?: string;
  description?: string;
  type?: string;
  inputType?: string;
  formula?: string;
  inputOrderPosition?: number;
  processingOrderPosition?: number;
  viewOrderPosition?: number;
  values?: AggregateUUPropertyValue[];
  files?: AggregateUUFile[];
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
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  name?: string;
  abbreviation?: string;
  version?: string;
  description?: string;
  address?: AggregateUUAddress;
  parents?: string[];
  children?: string[];
  inputs?: string[];
  outputs?: string[];
  models?: string[];
  instances?: string[];
  files?: AggregateUUFile[];
  properties?: AggregateUUProperty[];
  history?: AggregateUUObject[];
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
  pageable: {
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
}

// New types for aggregate creation based on swagger.json
export interface AggregateCreateDTO {
  aggregateEntityList: AggregateEntityCreateDTO[];
  user: UserDetailsCustom;
}

export interface AggregateEntityCreateDTO {
  name?: string;
  abbreviation?: string;
  version?: string;
  description?: string;
  // Parent UUIDs to establish parent-child relationships
  parents?: UUID[];
  address?: AggregateUUAddressCreateDTO;
  files?: AggregateUUFileCreateDTO[];
  properties?: AggregateUUPropertyCreateDTO[];
}

export interface AggregateUUAddressCreateDTO {
  fullAddress?: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  state?: string;
  district?: string;
}

export interface AggregateUUFileCreateDTO {
  fileName?: string;
  fileReference?: string;
  label?: string;
  contentType?: string;
  size?: number;
}

export interface AggregateUUPropertyCreateDTO {
  key?: string;
  version?: string;
  label?: string;
  description?: string;
  type?: string;
  inputType?: string;
  formula?: string;
  inputOrderPosition?: number;
  processingOrderPosition?: number;
  viewOrderPosition?: number;
  values?: AggregateUUPropertyValueCreateDTO[];
  files?: AggregateUUFileCreateDTO[];
}

export interface AggregateUUPropertyValueCreateDTO {
  value?: string;
  valueTypeCast?: string;
  sourceType?: string;
  files?: AggregateUUFileCreateDTO[];
}

export interface UserDetailsCustom {
  userUUID?: string;
  credentials?: any;
  createdAt?: string;
  enabled?: boolean;
  accountNonExpired?: boolean;
  credentialsNonExpired?: boolean;
  accountNonLocked?: boolean;
}

export interface AuditUser {
  userUUID?: string;
  credentials?: string;
}

// Additional aggregate types matching swagger
export interface AggregateUUFile {
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  fileName?: string;
  fileReference?: string;
  label?: string;
  contentType?: string;
  size?: number;
}

export interface AggregateUUProperty {
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  key?: string;
  version?: string;
  label?: string;
  description?: string;
  type?: string;
  inputType?: string;
  formula?: string;
  inputOrderPosition?: number;
  processingOrderPosition?: number;
  viewOrderPosition?: number;
  values?: AggregateUUPropertyValue[];
  files?: AggregateUUFile[];
}

export interface AggregateUUPropertyValue {
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  value?: string;
  valueTypeCast?: string;
  sourceType?: string;
  files?: AggregateUUFile[];
}

export interface AggregateUUObject {
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  name?: string;
  abbreviation?: string;
  version?: string;
  description?: string;
}
