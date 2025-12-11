export type UUID = string;
export declare enum Predicate {
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
export interface QueryParams {
    uuid?: UUID;
    softDeleted?: boolean;
}
export interface UUStatementFindDTO {
    subject?: UUID;
    predicate?: Predicate;
    object?: UUID;
    softDeleted?: boolean;
}
export interface StatementQueryParams extends UUStatementFindDTO {
}
export interface UUStatementsPropertyValue {
    value?: string;
}
export interface UUStatementsProperty {
    key?: string;
    values?: UUStatementsPropertyValue[];
}
export interface UUStatementDTO {
    subject: UUID;
    predicate: Predicate;
    object: UUID;
    properties?: UUStatementsProperty[];
}
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
export interface UUPropertyValueDTO {
    uuid: UUID;
    value?: string;
    valueTypeCast?: string;
    sourceType?: string;
}
export interface UUObjectDTO {
    uuid: UUID;
    version?: string;
    name?: string;
    abbreviation?: string;
    description?: string;
    isTemplate?: boolean;
}
export interface UUFileDTO {
    uuid: UUID;
    fileName?: string;
    fileReference?: string;
    label?: string;
    contentType?: string;
    size?: number;
}
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
export interface ClientConfig {
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
export interface UUObjectWithProperties {
    object: UUObjectDTO;
    properties: Array<{
        property: UUPropertyDTO;
        value?: UUPropertyValueDTO;
    }>;
    children?: UUObjectDTO[];
    files?: UUFileDTO[];
}
export interface ComplexObjectCreationInput {
    object: Omit<UUObjectDTO, 'uuid'>;
    parents?: UUID[];
    files?: Array<{
        file: Omit<UUFileDTO, 'uuid'>;
    }>;
    properties?: Array<{
        property: Omit<UUPropertyDTO, 'uuid'> & {
            key: string;
        };
        values?: Array<{
            value: Omit<UUPropertyValueDTO, 'uuid'>;
            files?: Array<{
                file: Omit<UUFileDTO, 'uuid'>;
            }>;
        }>;
        files?: Array<{
            file: Omit<UUFileDTO, 'uuid'>;
        }>;
    }>;
    address?: Omit<UUAddressDTO, 'uuid'>;
}
export interface ComplexObjectOutput {
    object: UUObjectDTO;
    properties: Array<{
        property: UUPropertyDTO;
        values: Array<{
            value: UUPropertyValueDTO;
            files: UUFileDTO[];
        }>;
        files: UUFileDTO[];
    }>;
    files: UUFileDTO[];
    address?: UUAddressDTO;
    parents?: UUObjectDTO[];
}
export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
}
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
/**
 * Aggregate search parameters for the /api/Aggregate/search endpoint
 * Updated to support the new POST method with searchBy functionality
 */
export interface AggregateFindDTO {
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
export interface AggregateCreateDTO {
    aggregateEntityList: AggregateEntityCreateDTO[];
    user: UserDetailsCustom;
}
export interface AggregateEntityCreateDTO {
    name?: string;
    abbreviation?: string;
    version?: string;
    description?: string;
    isTemplate?: boolean;
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
    isTemplate?: boolean;
}
