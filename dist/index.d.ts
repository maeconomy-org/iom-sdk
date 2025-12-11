import * as axios from 'axios';
import { z } from 'zod';

type UUID$1 = string;
declare enum Predicate$1 {
    IS_PARENT_OF = "IS_PARENT_OF",
    IS_CHILD_OF = "IS_CHILD_OF",
    IS_INPUT_OF = "IS_INPUT_OF",
    IS_OUTPUT_OF = "IS_OUTPUT_OF",
    IS_SOURCE_TEMPLATE_OF = "IS_SOURCE_TEMPLATE_OF",
    IS_TEMPLATE_INSTANCE_OF = "IS_TEMPLATE_INSTANCE_OF",
    IS_PROPERTY_OF = "IS_PROPERTY_OF",
    HAS_PROPERTY = "HAS_PROPERTY",
    IS_VALUE_OF = "IS_VALUE_OF",
    HAS_VALUE = "HAS_VALUE",
    IS_FILE_OF = "IS_FILE_OF",
    HAS_FILE = "HAS_FILE",
    HAS_ADDRESS = "HAS_ADDRESS",
    IS_ADDRESS_OF = "IS_ADDRESS_OF"
}
interface QueryParams$1 {
    uuid?: UUID$1;
    softDeleted?: boolean;
}
interface UUStatementFindDTO$1 {
    subject?: UUID$1;
    predicate?: Predicate$1;
    object?: UUID$1;
    softDeleted?: boolean;
}
interface StatementQueryParams$1 extends UUStatementFindDTO$1 {
}
interface UUStatementsPropertyValue$1 {
    value?: string;
}
interface UUStatementsProperty$1 {
    key?: string;
    values?: UUStatementsPropertyValue$1[];
}
interface UUStatementDTO$1 {
    subject: UUID$1;
    predicate: Predicate$1;
    object: UUID$1;
    properties?: UUStatementsProperty$1[];
}
interface UUPropertyDTO$1 {
    uuid: UUID$1;
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
interface UUPropertyValueDTO$1 {
    uuid: UUID$1;
    value?: string;
    valueTypeCast?: string;
    sourceType?: string;
}
interface UUObjectDTO$1 {
    uuid: UUID$1;
    version?: string;
    name?: string;
    abbreviation?: string;
    description?: string;
    isTemplate?: boolean;
}
interface UUFileDTO$1 {
    uuid: UUID$1;
    fileName?: string;
    fileReference?: string;
    label?: string;
    contentType?: string;
    size?: number;
}
interface UUAddressDTO$1 {
    uuid: UUID$1;
    fullAddress?: string;
    street?: string;
    houseNumber?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    state?: string;
    district?: string;
}
interface ClientConfig$1 {
    baseUrl: string;
    uuidServiceBaseUrl?: string;
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
interface UUObjectWithProperties {
    object: UUObjectDTO$1;
    properties: Array<{
        property: UUPropertyDTO$1;
        value?: UUPropertyValueDTO$1;
    }>;
    children?: UUObjectDTO$1[];
    files?: UUFileDTO$1[];
}
interface ComplexObjectCreationInput$1 {
    object: Omit<UUObjectDTO$1, 'uuid'>;
    parents?: UUID$1[];
    files?: Array<{
        file: Omit<UUFileDTO$1, 'uuid'>;
    }>;
    properties?: Array<{
        property: Omit<UUPropertyDTO$1, 'uuid'> & {
            key: string;
        };
        values?: Array<{
            value: Omit<UUPropertyValueDTO$1, 'uuid'>;
            files?: Array<{
                file: Omit<UUFileDTO$1, 'uuid'>;
            }>;
        }>;
        files?: Array<{
            file: Omit<UUFileDTO$1, 'uuid'>;
        }>;
    }>;
    address?: Omit<UUAddressDTO$1, 'uuid'>;
}
interface ComplexObjectOutput$1 {
    object: UUObjectDTO$1;
    properties: Array<{
        property: UUPropertyDTO$1;
        values: Array<{
            value: UUPropertyValueDTO$1;
            files: UUFileDTO$1[];
        }>;
        files: UUFileDTO$1[];
    }>;
    files: UUFileDTO$1[];
    address?: UUAddressDTO$1;
    parents?: UUObjectDTO$1[];
}
interface ApiResponse$1<T> {
    data: T;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
}
interface ApiError {
    status: number;
    statusText: string;
    message: string;
    details?: any;
}
/**
 * Auth response from mTLS authentication endpoint
 * Based on actual API response structure with certificate information
 */
interface AuthResponse$1 {
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
/**
 * Aggregate search parameters for the /api/Aggregate/search endpoint
 * Updated to support the new POST method with searchBy functionality
 */
interface AggregateFindDTO$1 {
    page?: number;
    size?: number;
    hasChildrenFull?: boolean;
    hasHistory?: boolean;
    hasParentUUIDFilter?: boolean;
    parentUUID?: string;
    searchTerm?: string;
    searchBy?: Record<string, any>;
}
/**
 * Aggregate file entity with metadata
 */
interface AggregateFile {
    createdAt?: string;
    createdBy?: AuditUser$1;
    lastUpdatedAt?: string;
    lastUpdatedBy?: AuditUser$1;
    softDeletedAt?: string;
    softDeleteBy?: AuditUser$1;
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
interface AggregateProperty {
    createdAt?: string;
    createdBy?: AuditUser$1;
    lastUpdatedAt?: string;
    lastUpdatedBy?: AuditUser$1;
    softDeletedAt?: string;
    softDeleteBy?: AuditUser$1;
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
    values?: AggregateUUPropertyValue$1[];
    files?: AggregateUUFile$1[];
}
/**
 * Aggregate address entity with metadata
 */
interface AggregateUUAddress$1 {
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
interface AggregateEntity$1 {
    createdAt?: string;
    createdBy?: AuditUser$1;
    lastUpdatedAt?: string;
    lastUpdatedBy?: AuditUser$1;
    softDeletedAt?: string;
    softDeleteBy?: AuditUser$1;
    softDeleted?: boolean;
    uuid?: string;
    name?: string;
    abbreviation?: string;
    version?: string;
    description?: string;
    isTemplate?: boolean;
    address?: AggregateUUAddress$1;
    parents?: string[];
    children?: string[];
    inputs?: string[];
    outputs?: string[];
    sourceTemplates?: string[];
    templateInstances?: string[];
    files?: AggregateUUFile$1[];
    properties?: AggregateUUProperty$1[];
    history?: AggregateUUObject$1[];
}
/**
 * Paginated response for aggregate entities
 */
interface PageAggregateEntity$1 {
    totalPages: number;
    totalElements: number;
    size: number;
    content: AggregateEntity$1[];
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
interface AggregateCreateDTO$1 {
    aggregateEntityList: AggregateEntityCreateDTO$1[];
    user: UserDetailsCustom$1;
}
interface AggregateEntityCreateDTO$1 {
    name?: string;
    abbreviation?: string;
    version?: string;
    description?: string;
    isTemplate?: boolean;
    parents?: UUID$1[];
    address?: AggregateUUAddressCreateDTO$1;
    files?: AggregateUUFileCreateDTO$1[];
    properties?: AggregateUUPropertyCreateDTO$1[];
}
interface AggregateUUAddressCreateDTO$1 {
    fullAddress?: string;
    street?: string;
    houseNumber?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    state?: string;
    district?: string;
}
interface AggregateUUFileCreateDTO$1 {
    fileName?: string;
    fileReference?: string;
    label?: string;
    contentType?: string;
    size?: number;
}
interface AggregateUUPropertyCreateDTO$1 {
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
    values?: AggregateUUPropertyValueCreateDTO$1[];
    files?: AggregateUUFileCreateDTO$1[];
}
interface AggregateUUPropertyValueCreateDTO$1 {
    value?: string;
    valueTypeCast?: string;
    sourceType?: string;
    files?: AggregateUUFileCreateDTO$1[];
}
interface UserDetailsCustom$1 {
    userUUID?: string;
    credentials?: any;
    createdAt?: string;
    enabled?: boolean;
    accountNonExpired?: boolean;
    credentialsNonExpired?: boolean;
    accountNonLocked?: boolean;
}
interface AuditUser$1 {
    userUUID?: string;
    credentials?: string;
}
interface AggregateUUFile$1 {
    createdAt?: string;
    createdBy?: AuditUser$1;
    lastUpdatedAt?: string;
    lastUpdatedBy?: AuditUser$1;
    softDeletedAt?: string;
    softDeleteBy?: AuditUser$1;
    softDeleted?: boolean;
    uuid?: string;
    fileName?: string;
    fileReference?: string;
    label?: string;
    contentType?: string;
    size?: number;
}
interface AggregateUUProperty$1 {
    createdAt?: string;
    createdBy?: AuditUser$1;
    lastUpdatedAt?: string;
    lastUpdatedBy?: AuditUser$1;
    softDeletedAt?: string;
    softDeleteBy?: AuditUser$1;
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
    values?: AggregateUUPropertyValue$1[];
    files?: AggregateUUFile$1[];
}
interface AggregateUUPropertyValue$1 {
    createdAt?: string;
    createdBy?: AuditUser$1;
    lastUpdatedAt?: string;
    lastUpdatedBy?: AuditUser$1;
    softDeletedAt?: string;
    softDeleteBy?: AuditUser$1;
    softDeleted?: boolean;
    uuid?: string;
    value?: string;
    valueTypeCast?: string;
    sourceType?: string;
    files?: AggregateUUFile$1[];
}
interface AggregateUUObject$1 {
    createdAt?: string;
    createdBy?: AuditUser$1;
    lastUpdatedAt?: string;
    lastUpdatedBy?: AuditUser$1;
    softDeletedAt?: string;
    softDeleteBy?: AuditUser$1;
    softDeleted?: boolean;
    uuid?: string;
    name?: string;
    abbreviation?: string;
    version?: string;
    description?: string;
    isTemplate?: boolean;
}

// Common UUID pattern used throughout the API
type UUID = string;

// Predicate types for statements
declare enum Predicate {
  IS_PARENT_OF = 'IS_PARENT_OF',
  IS_CHILD_OF = 'IS_CHILD_OF',
  IS_INPUT_OF = 'IS_INPUT_OF',
  IS_OUTPUT_OF = 'IS_OUTPUT_OF',
  IS_SOURCE_TEMPLATE_OF = 'IS_SOURCE_TEMPLATE_OF',
  IS_TEMPLATE_INSTANCE_OF = 'IS_TEMPLATE_INSTANCE_OF',
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
interface QueryParams {
  uuid?: UUID;
  softDeleted?: boolean;
}

// UUStatementFindDTO (from Swagger)
interface UUStatementFindDTO {
  subject?: UUID;
  predicate?: Predicate;
  object?: UUID;
  softDeleted?: boolean;
}

// Statement query parameters (based on UUStatementFindDTO from Swagger)
interface StatementQueryParams extends UUStatementFindDTO {}

// UUStatementsPropertyValue Data Transfer Object
interface UUStatementsPropertyValue {
  value?: string;
}

// UUStatementsProperty Data Transfer Object
interface UUStatementsProperty {
  key?: string;
  values?: UUStatementsPropertyValue[];
}

// UUStatement Data Transfer Object
interface UUStatementDTO {
  subject: UUID;
  predicate: Predicate;
  object: UUID;
  properties?: UUStatementsProperty[];
}

// UUProperty Data Transfer Object
interface UUPropertyDTO {
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
interface UUPropertyValueDTO {
  uuid: UUID;
  value?: string;
  valueTypeCast?: string;
  sourceType?: string;
}

// UUObject Data Transfer Object
interface UUObjectDTO {
  uuid: UUID;
  version?: string;
  name?: string;
  abbreviation?: string;
  description?: string;
  isTemplate?: boolean;
}

// UUFile Data Transfer Object
interface UUFileDTO {
  uuid: UUID;
  fileName?: string;
  fileReference?: string;
  label?: string;
  contentType?: string;
  size?: number;
}

// UUAddress Data Transfer Object
interface UUAddressDTO {
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
interface ClientConfig {
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

// Complex object creation input
interface ComplexObjectCreationInput {
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
interface ComplexObjectOutput {
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
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
}

/**
 * Auth response from mTLS authentication endpoint
 * Based on actual API response structure with certificate information
 */
interface AuthResponse {
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
 * Aggregate search parameters for the /api/Aggregate/search endpoint
 * Updated to support the new POST method with searchBy functionality
 */
interface AggregateFindDTO {
  page?: number;
  size?: number;
  hasChildrenFull?: boolean;
  hasHistory?: boolean;
  hasParentUUIDFilter?: boolean;
  parentUUID?: string;
  searchTerm?: string;
  searchBy?: Record<string, any>;
}

/**
 * Aggregate address entity with metadata
 */
interface AggregateUUAddress {
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
interface AggregateEntity {
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
  isTemplate?: boolean;
  address?: AggregateUUAddress;
  parents?: string[];
  children?: string[];
  inputs?: string[];
  outputs?: string[];
  sourceTemplates?: string[];
  templateInstances?: string[];
  files?: AggregateUUFile[];
  properties?: AggregateUUProperty[];
  history?: AggregateUUObject[];
}

/**
 * Paginated response for aggregate entities
 */
interface PageAggregateEntity {
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
interface AggregateCreateDTO {
  aggregateEntityList: AggregateEntityCreateDTO[];
  user: UserDetailsCustom;
}

interface AggregateEntityCreateDTO {
  name?: string;
  abbreviation?: string;
  version?: string;
  description?: string;
  isTemplate?: boolean;
  // Parent UUIDs to establish parent-child relationships
  parents?: UUID[];
  address?: AggregateUUAddressCreateDTO;
  files?: AggregateUUFileCreateDTO[];
  properties?: AggregateUUPropertyCreateDTO[];
}

interface AggregateUUAddressCreateDTO {
  fullAddress?: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  state?: string;
  district?: string;
}

interface AggregateUUFileCreateDTO {
  fileName?: string;
  fileReference?: string;
  label?: string;
  contentType?: string;
  size?: number;
}

interface AggregateUUPropertyCreateDTO {
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

interface AggregateUUPropertyValueCreateDTO {
  value?: string;
  valueTypeCast?: string;
  sourceType?: string;
  files?: AggregateUUFileCreateDTO[];
}

interface UserDetailsCustom {
  userUUID?: string;
  credentials?: any;
  createdAt?: string;
  enabled?: boolean;
  accountNonExpired?: boolean;
  credentialsNonExpired?: boolean;
  accountNonLocked?: boolean;
}

interface AuditUser {
  userUUID?: string;
  credentials?: string;
}

// Additional aggregate types matching swagger
interface AggregateUUFile {
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

interface AggregateUUProperty {
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

interface AggregateUUPropertyValue {
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

interface AggregateUUObject {
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
  isTemplate?: boolean;
}

/**
 * Set the global default HTTP client
 *
 * @param config - The client configuration
 */
declare const setHttpClient: (config: ClientConfig) => void;

/**
 * Configure the logger with the provided debug options
 */
declare const configureLogger: (config?: ClientConfig["debug"]) => void;

/**
 * Initialize the client with the given configuration
 *
 * @param config - Client configuration including baseUrl and optional certificate
 */
declare const initializeClient: (config: ClientConfig$1) => void;
declare const createClient: (config: ClientConfig$1) => {
    debug: {
        /**
         * Enable or disable debug mode at runtime
         */
        configure: (options: ClientConfig$1["debug"]) => void;
    };
    auth: {
        requestBaseAuth: () => Promise<ApiResponse$1<AuthResponse$1 | null>>;
        requestUuidAuth: () => Promise<ApiResponse$1<AuthResponse$1 | null>>;
    };
    aggregate: {
        findByUUID: (uuid: UUID$1) => Promise<ApiResponse$1<AggregateEntity$1[] | null>>;
        getAggregateEntities: (params?: AggregateFindDTO$1) => Promise<ApiResponse$1<PageAggregateEntity$1>>;
        createAggregateObject: (data: AggregateCreateDTO$1) => Promise<ApiResponse$1<any>>;
        importAggregateObjects: (data: AggregateCreateDTO$1) => Promise<ApiResponse$1<any>>;
    };
    objects: {
        create: (object: UUObjectDTO$1) => Promise<ApiResponse$1<UUObjectDTO$1>>;
        createFullObject: (objectData: ComplexObjectCreationInput$1) => Promise<ApiResponse$1<ComplexObjectOutput$1 | null>>;
        getObjects: (params?: QueryParams$1) => Promise<ApiResponse$1<UUObjectDTO$1[]>>;
        delete: (uuid: UUID$1) => Promise<ApiResponse$1<any>>;
    };
    properties: {
        addToObject: (objectUuid: UUID$1, property: Partial<UUPropertyDTO$1> & {
            key: string;
        }) => Promise<ApiResponse$1<UUPropertyDTO$1>>;
        create: (property: UUPropertyDTO$1) => Promise<ApiResponse$1<UUPropertyDTO$1>>;
        getProperties: (params?: QueryParams$1) => Promise<ApiResponse$1<UUPropertyDTO$1[]>>;
        getPropertyByKey: (key: string, params?: QueryParams$1) => Promise<ApiResponse$1<UUPropertyDTO$1 | null>>;
        delete: (uuid: UUID$1) => Promise<ApiResponse$1<any>>;
    };
    values: {
        setForProperty: (propertyUuid: UUID$1, value: Partial<UUPropertyValueDTO$1>) => Promise<ApiResponse$1<UUPropertyValueDTO$1>>;
        create: (value: UUPropertyValueDTO$1) => Promise<ApiResponse$1<UUPropertyValueDTO$1>>;
        getPropertyValues: (params?: QueryParams$1) => Promise<ApiResponse$1<UUPropertyValueDTO$1[]>>;
        delete: (uuid: UUID$1) => Promise<ApiResponse$1<any>>;
    };
    files: {
        create: (file: UUFileDTO$1) => Promise<ApiResponse$1<UUFileDTO$1>>;
        getFiles: (params?: QueryParams$1) => Promise<ApiResponse$1<UUFileDTO$1[]>>;
        delete: (uuid: UUID$1) => Promise<ApiResponse$1<any>>;
        uploadByReference: (input: {
            fileReference: string;
            uuidToAttach: UUID$1;
            label?: string;
        }) => Promise<ApiResponse$1<UUFileDTO$1 | null>>;
        uploadDirect: (input: {
            file: File | Blob | ArrayBuffer | FormData;
            uuidToAttach: UUID$1;
        }) => Promise<ApiResponse$1<UUFileDTO$1 | null>>;
        uploadFormData: (input: {
            formData: FormData;
            uuidFile: UUID$1;
            uuidToAttach: UUID$1;
        }) => Promise<ApiResponse$1<any>>;
        download: (uuid: UUID$1) => Promise<ApiResponse$1<ArrayBuffer>>;
    };
    statements: {
        getStatements: (params?: StatementQueryParams$1) => Promise<ApiResponse$1<UUStatementDTO$1[]>>;
        create: (statement: UUStatementDTO$1) => Promise<ApiResponse$1<UUStatementDTO$1>>;
        delete: (statement: UUStatementDTO$1) => Promise<ApiResponse$1<any>>;
    };
    uuid: {
        create: () => Promise<ApiResponse$1<{
            uuid: UUID$1;
        }>>;
        getOwned: () => Promise<ApiResponse$1<any>>;
        getRecord: (uuid: UUID$1) => Promise<ApiResponse$1<any>>;
        updateRecordMeta: (params: {
            uuid?: UUID$1;
            nodeType: string;
        }) => Promise<ApiResponse$1<any>>;
        authorize: (params: {
            userUUID: UUID$1;
            resourceId: UUID$1;
        }) => Promise<ApiResponse$1<any>>;
    };
    addresses: {
        create: (address: Omit<UUAddressDTO$1, "uuid">) => Promise<ApiResponse$1<UUAddressDTO$1>>;
        update: (address: UUAddressDTO$1) => Promise<ApiResponse$1<UUAddressDTO$1>>;
        get: (params?: QueryParams$1) => Promise<ApiResponse$1<UUAddressDTO$1[]>>;
        delete: (uuid: UUID$1) => Promise<ApiResponse$1<any>>;
        createForObject: (objectUuid: UUID$1, address: Omit<UUAddressDTO$1, "uuid">) => Promise<ApiResponse$1<{
            address: UUAddressDTO$1;
            statement: any;
        }>>;
    };
};

/**
 * Get objects with optional filtering
 * This unified function handles all object retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of objects matching the criteria, or single object if uuid is provided
 */
declare const getObjects: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUObjectDTO[]>>;
/**
 * Create or update an object
 *
 * @param client - HTTP client instance
 * @param object - The object to create or update
 * @returns The created or updated object
 */
declare const createOrUpdateObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (object: UUObjectDTO) => Promise<ApiResponse<UUObjectDTO>>;
/**
 * Soft delete an object
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the object to delete
 * @returns The API response
 */
declare const softDeleteObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;

/**
 * Get statements with optional filtering
 * This unified function handles all statement retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Statement query parameters (subject, predicate, object, softDeleted)
 * @returns List of statements matching the criteria
 */
declare const getStatements: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (params?: StatementQueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Create or find statements
 *
 * @param client - HTTP client instance
 * @param statements - Statements to create or find
 * @returns Created or found statements
 */
declare const createOrFindStatements: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (statements: UUStatementDTO[]) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Create a single statement (convenience method)
 *
 * @param client - HTTP client instance
 * @param statement - Statement to create
 * @returns Created statement
 */
declare const createStatement: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
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
declare const getStatementsByUuidAndPredicate: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID, predicate: Predicate, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Soft delete a statement
 * This performs a logical delete using the DELETE HTTP method
 *
 * @param client - HTTP client instance
 * @param statement - Statement to soft delete
 * @returns The API response
 */
declare const softDeleteStatement: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
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
declare const findChildren: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (parentUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Find all parents of a given UUID
 *
 * @param client - HTTP client instance
 * @param childUuid - The child UUID
 * @param params - Query parameters
 * @returns Statements with child-parent relationship
 */
declare const findParents: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (childUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Find all properties of an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with object-property relationship
 */
declare const findProperties: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (objectUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Find all values of a property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - The property UUID
 * @param params - Query parameters
 * @returns Statements with property-value relationship
 */
declare const findPropertyValues: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (propertyUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;
/**
 * Find all files attached to an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - The object UUID
 * @param params - Query parameters
 * @returns Statements with object-file relationship
 */
declare const findFiles: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (objectUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUStatementDTO[]>>;

/**
 * Get properties with optional filtering
 * This unified function handles all property retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of properties matching the criteria, or single property if uuid is provided
 */
declare const getProperties: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO[]>>;
/**
 * Get a property by key (convenience function)
 * Note: This filters client-side since the API doesn't support direct key lookup
 *
 * @param client - HTTP client instance
 * @param key - The key of the property to get
 * @param params - Query parameters
 * @returns The requested property or null if not found
 */
declare const getPropertyByKey: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (key: string, params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO | null>>;
/**
 * Create or update a property
 *
 * @param client - HTTP client instance
 * @param property - The property to create or update
 * @returns The created or updated property
 */
declare const createOrUpdateProperty: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (property: UUPropertyDTO) => Promise<ApiResponse<UUPropertyDTO>>;
/**
 * Soft delete a property
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property to delete
 * @returns The API response
 */
declare const softDeleteProperty: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;

/**
 * Get property values with optional filtering
 * This unified function handles all property value retrieval scenarios
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of property values matching the criteria, or single property value if uuid is provided
 */
declare const getPropertyValues: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUPropertyValueDTO[]>>;
/**
 * Create or update a property value
 *
 * @param client - HTTP client instance
 * @param propertyValue - The property value to create or update
 * @returns The created or updated property value
 */
declare const createOrUpdatePropertyValue: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (propertyValue: UUPropertyValueDTO) => Promise<ApiResponse<UUPropertyValueDTO>>;
/**
 * Soft delete a property value
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the property value to delete
 * @returns The API response
 */
declare const softDeletePropertyValue: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;

/**
 * Get files with optional filtering
 * This unified function replaces getAllFiles, getOwnFiles, and getFileByUuid
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of files matching the criteria, or single file if uuid is provided
 */
declare const getFiles: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUFileDTO[]>>;
/**
 * Create or update a file
 *
 * @param client - HTTP client instance
 * @param file - The file to create or update
 * @returns The created or updated file
 */
declare const createOrUpdateFile: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (file: UUFileDTO) => Promise<ApiResponse<UUFileDTO>>;
/**
 * Soft delete a file
 *
 * @param client - HTTP client instance
 * @param uuid - The UUID of the file to delete
 * @returns The API response
 */
declare const softDeleteFile: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
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
declare const uploadFileBinary: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuidFile: UUID, uuidToAttach: UUID, file: any, fieldName?: string) => Promise<ApiResponse<any>>;
/**
 * Download a file's binary content
 *
 * Swagger: GET /api/UUFile/download/{uuid}
 */
declare const downloadFileBinary: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<ArrayBuffer>>;

/**
 * Get addresses with optional filtering
 * This unified function handles all address retrieval scenarios including by UUID
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted)
 * @returns List of addresses matching the criteria, or single address if uuid is provided
 */
declare const getAddresses: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (params?: QueryParams) => Promise<ApiResponse<UUAddressDTO[]>>;
/**
 * Create a new address (generates UUID automatically)
 *
 * @param client - HTTP client instance
 * @param address - The address data (without UUID)
 * @returns The created address with generated UUID
 */
declare const createAddress: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (address: Omit<UUAddressDTO, "uuid">) => Promise<ApiResponse<UUAddressDTO>>;
/**
 * Update an existing address
 *
 * @param client - HTTP client instance
 * @param address - The address to update (must include UUID)
 * @returns The updated address
 */
declare const updateAddress: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (address: UUAddressDTO) => Promise<ApiResponse<UUAddressDTO>>;
/**
 * Create an address for an object and establish the relationship
 * This is a convenience method that combines address creation with statement creation
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to associate the address with
 * @param addressData - Address data (without UUID, will be generated)
 * @returns The created address and relationship statement
 */
declare const createAddressForObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (objectUuid: string, addressData: Omit<UUAddressDTO, "uuid">) => Promise<ApiResponse<{
    address: UUAddressDTO;
    statement: any;
}>>;
/**
 * Soft delete an address by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the address to soft delete
 * @returns The API response
 */
declare const softDeleteAddress: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<any>>;

/**
 * Get UUIDs owned by the current user/client
 * Uses /api/UUID/own endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns UUIDs owned by the current user/client
 */
declare const getOwnedUUIDs: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}, baseURL?: string) => () => Promise<ApiResponse<any>>;
/**
 * Create a new UUID
 * Updated to use /api/UUID endpoint from new swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @returns The newly created UUID data
 */
declare const createUUID: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}, baseURL?: string) => () => Promise<ApiResponse<{
    uuid: UUID;
}>>;
/**
 * Get UUID record by UUID
 * Updated to use /api/UUID/{uuid} endpoint from new swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param uuid - UUID to find
 * @returns UUID record data
 */
declare const getUUIDRecord: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}, baseURL?: string) => (uuid: UUID) => Promise<ApiResponse<any>>;
/**
 * Update UUID record metadata
 * New endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param params - UUID record metadata update parameters
 * @returns Updated UUID record data
 */
declare const updateUUIDRecordMeta: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}, baseURL?: string) => (params: {
    uuid?: UUID;
    nodeType: string;
}) => Promise<ApiResponse<any>>;
/**
 * Authorize UUID record access
 * New endpoint from swagger-uuid.json
 *
 * @param client - HTTP client instance
 * @param baseURL - Optional base URL for the UUID service (different from main API)
 * @param params - Authorization parameters
 * @returns Authorization response
 */
declare const authorizeUUIDRecord: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}, baseURL?: string) => (params: {
    userUUID: UUID;
    resourceId: UUID;
}) => Promise<ApiResponse<any>>;

/**
 * Find any entity by UUID using the aggregate API
 * Uses the new /api/Aggregate/{uuid} endpoint which provides rich aggregated data
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the entity to find
 * @returns The aggregate entity if found, null otherwise
 */
declare const findByUUID$1: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<AggregateEntity[] | null>>;
/**
 * Search aggregate entities with pagination and filtering
 * Uses the new /api/Aggregate/search endpoint with POST method for advanced searching
 *
 * @param client - HTTP client instance
 * @param params - Aggregate search parameters including the new searchBy field
 * @returns Paginated list of aggregate entities
 */
declare const getAggregateEntities$1: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (params?: AggregateFindDTO) => Promise<ApiResponse<PageAggregateEntity>>;
/**
 * Create aggregate objects using the new API structure
 * Uses POST /api/Aggregate endpoint with new AggregateCreateDTO structure
 *
 * @param client - HTTP client instance
 * @param data - Aggregate creation data with user context
 * @returns Created aggregate response
 */
declare const createAggregateObject$1: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (data: AggregateCreateDTO) => Promise<ApiResponse<any | null>>;
/**
 * Import multiple aggregate objects using the new API structure
 * Uses POST /api/Aggregate/Import endpoint with new AggregateCreateDTO structure
 *
 * @param client - HTTP client instance
 * @param data - Aggregate creation data with user context
 * @returns Import response
 */
declare const importAggregateObjects$1: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (data: AggregateCreateDTO) => Promise<ApiResponse<any | null>>;

/**
 * Authenticate with the base service using client certificate (mTLS)
 * This will trigger the browser certificate selection popup
 *
 * @param client - HTTP client instance
 * @returns Base service authentication data
 */
declare const requestBaseAuth: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => () => Promise<ApiResponse<AuthResponse | null>>;
/**
 * Authenticate with the UUID service using client certificate (mTLS)
 * This will trigger the browser certificate selection popup
 *
 * @param client - HTTP client instance
 * @returns UUID service authentication data
 */
declare const requestUuidAuth: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => () => Promise<ApiResponse<AuthResponse | null>>;

/**
 * Create a complex object with multiple properties, multiple values per property,
 * and files attached to the object, properties, and values.
 * This high-level operation handles creating the complete object hierarchy in a single function call.
 *
 * @param client - HTTP client instance
 * @param objectData - The complex object data including properties, values, files, and optional parents
 * @returns The created complex object with all its relationships
 */
declare const createFullObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (objectData: ComplexObjectCreationInput) => Promise<ApiResponse<ComplexObjectOutput | null>>;

/**
 * Add a property to an object
 * This high-level operation automatically gets a UUID, creates the property,
 * and establishes the relationship with the object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to add the property to
 * @param property - Property data (UUID will be generated if not provided)
 * @returns The created property
 */
declare const addPropertyToObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (objectUuid: UUID, property: Partial<UUPropertyDTO> & {
    key: string;
}) => Promise<ApiResponse<UUPropertyDTO>>;
/**
 * Get all properties for an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to get properties for
 * @param params - Query parameters
 * @returns List of properties for the object
 */
declare const getPropertiesForObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (objectUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUPropertyDTO[]>>;

/**
 * Set a value for a property
 * This high-level operation automatically gets a UUID, creates the value,
 * and establishes the relationship with the property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - UUID of the property to set the value for
 * @param value - Value data (UUID will be generated if not provided)
 * @returns The created property value
 */
declare const setValueForProperty: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (propertyUuid: UUID, value: Partial<UUPropertyValueDTO>) => Promise<ApiResponse<UUPropertyValueDTO>>;
/**
 * Get all values for a property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - UUID of the property to get values for
 * @param params - Query parameters
 * @returns List of values for the property
 */
declare const getValuesForProperty: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (propertyUuid: UUID, params?: QueryParams) => Promise<ApiResponse<UUPropertyValueDTO[]>>;

/**
 * Search for any entity by UUID using the aggregate API
 * This provides rich aggregated data including relationships, properties, and files
 *
 * @param client - HTTP client instance
 * @param params - Search parameters including pagination and filters
 * @returns The aggregate entity with all related data if found
 */
declare const findByUUID: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<AggregateEntity[] | null>>;
/**
 * Search aggregate entities with pagination and filtering
 *
 * @param client - HTTP client instance
 * @param params - Search parameters including pagination and filters
 * @returns Paginated list of aggregate entities
 */
declare const getAggregateEntities: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (params?: AggregateFindDTO) => Promise<ApiResponse<PageAggregateEntity>>;
declare const createAggregateObject: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (data: any) => Promise<ApiResponse<any | null>>;
/**
 * Import multiple aggregate objects
 *
 * @param client - HTTP client instance
 * @param data - Aggregate creation data with user context
 * @returns Import response
 */
declare const importAggregateObjects: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (data: any) => Promise<ApiResponse<any | null>>;

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
declare const uploadByReference: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
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
declare const uploadDirect: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
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
declare const uploadFormData: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (input: {
    formData: FormData;
    uuidFile: UUID;
    uuidToAttach: UUID;
}) => Promise<ApiResponse<any>>;
/**
 * Download file binary via UUID
 */
declare const download: (client?: {
    get: <T>(url: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
    getBinary: <T = ArrayBuffer>(url: string) => Promise<ApiResponse<T>>;
    post: <T>(url: string, data?: any, config?: axios.AxiosRequestConfig) => Promise<ApiResponse<T>>;
    postForm: <T>(url: string, formData: any) => Promise<ApiResponse<T>>;
    put: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    delete: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
    config: ClientConfig;
}) => (uuid: UUID) => Promise<ApiResponse<ArrayBuffer>>;

/**
 * Validation error class for handling Zod validation errors
 */
declare class ValidationError extends Error {
    errors: Record<string, string[]>;
    constructor(error: z.ZodError);
}
/**
 * Generic validation function for validating data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws ValidationError
 */
declare function validate<T>(schema: z.ZodType<T>, data: unknown): T;
/**
 * Safe validation function that doesn't throw errors but returns a result
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either validated data or validation errors
 */
declare function validateSafe<T>(schema: z.ZodType<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    errors: Record<string, string[]>;
};

/**
 * Validates and cleans common query parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Query parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
declare const validateQueryParams: (params?: QueryParams) => Record<string, any> | undefined;
/**
 * Validates and cleans statement query parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Statement query parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
declare const validateStatementQueryParams: (params?: StatementQueryParams) => Record<string, any> | undefined;
/**
 * Validates and cleans aggregate find parameters
 * Removes undefined values to avoid sending them in requests
 *
 * @param params - Aggregate find parameters to validate
 * @returns Clean validated parameters or undefined if no params
 */
declare const validateAggregateParams: (params?: AggregateFindDTO) => Record<string, any> | undefined;
/**
 * Validates a single UUID parameter
 *
 * @param uuid - UUID to validate
 * @returns Validated UUID
 */
declare const validateUuid: (uuid: string) => string;

export { Predicate$1 as Predicate, ValidationError, addPropertyToObject, findByUUID$1 as aggregateFindByUUID, findByUUID as aggregateSearch, authorizeUUIDRecord, configureLogger, createAddress, createAddressForObject, createAggregateObject as createAggregate, createAggregateObject$1 as createAggregateObject, createClient, createFullObject, createOrFindStatements, createOrUpdateFile, createOrUpdateObject, createOrUpdateProperty, createOrUpdatePropertyValue, createStatement, createUUID, download as downloadFile, downloadFileBinary, findChildren, findFiles, findParents, findProperties, findPropertyValues, getAddresses, getAggregateEntities$1 as getAggregateEntities, getFiles, getObjects, getOwnedUUIDs, getProperties, getPropertiesForObject, getPropertyByKey, getPropertyValues, getStatements, getStatementsByUuidAndPredicate, getUUIDRecord, getValuesForProperty, importAggregateObjects$1 as importAggregateObjects, importAggregateObjects as importAggregates, initializeClient, requestBaseAuth, requestUuidAuth, getAggregateEntities as searchAggregateEntities, setHttpClient, setValueForProperty, softDeleteAddress, softDeleteFile, softDeleteObject, softDeleteProperty, softDeletePropertyValue, softDeleteStatement, updateAddress, updateUUIDRecordMeta, uploadFileBinary, uploadByReference as uploadFileByReference, uploadDirect as uploadFileDirect, uploadFormData as uploadFileFormData, validate, validateAggregateParams, validateQueryParams, validateSafe, validateStatementQueryParams, validateUuid };
export type { AggregateCreateDTO$1 as AggregateCreateDTO, AggregateEntity$1 as AggregateEntity, AggregateEntityCreateDTO$1 as AggregateEntityCreateDTO, AggregateFile, AggregateFindDTO$1 as AggregateFindDTO, AggregateProperty, AggregateUUAddress$1 as AggregateUUAddress, AggregateUUAddressCreateDTO$1 as AggregateUUAddressCreateDTO, AggregateUUFile$1 as AggregateUUFile, AggregateUUFileCreateDTO$1 as AggregateUUFileCreateDTO, AggregateUUObject$1 as AggregateUUObject, AggregateUUProperty$1 as AggregateUUProperty, AggregateUUPropertyCreateDTO$1 as AggregateUUPropertyCreateDTO, AggregateUUPropertyValue$1 as AggregateUUPropertyValue, AggregateUUPropertyValueCreateDTO$1 as AggregateUUPropertyValueCreateDTO, ApiError, ApiResponse$1 as ApiResponse, AuditUser$1 as AuditUser, AuthResponse$1 as AuthResponse, ClientConfig$1 as ClientConfig, ComplexObjectCreationInput$1 as ComplexObjectCreationInput, ComplexObjectOutput$1 as ComplexObjectOutput, PageAggregateEntity$1 as PageAggregateEntity, QueryParams$1 as QueryParams, StatementQueryParams$1 as StatementQueryParams, UUAddressDTO$1 as UUAddressDTO, UUFileDTO$1 as UUFileDTO, UUID$1 as UUID, UUObjectDTO$1 as UUObjectDTO, UUObjectWithProperties, UUPropertyDTO$1 as UUPropertyDTO, UUPropertyValueDTO$1 as UUPropertyValueDTO, UUStatementDTO$1 as UUStatementDTO, UUStatementFindDTO$1 as UUStatementFindDTO, UUStatementsProperty$1 as UUStatementsProperty, UUStatementsPropertyValue$1 as UUStatementsPropertyValue, UserDetailsCustom$1 as UserDetailsCustom };
