/**
 * Aggregate API types (from Swagger documentation)
 */
import { UUID } from './services';
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
export type AggregateCreateDTO = AggregateEntityCreateDTO[];
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
