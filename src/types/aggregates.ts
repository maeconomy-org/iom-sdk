/**
 * Aggregate API types (from Swagger documentation)
 */

import { UUID, AccessFindDTO } from './services';
import { UUMathFormulaCalcArg, UUMathFormulaCalcResult } from './math-formulas';

/**
 * Aggregate search parameters for the POST /api/Aggregate/find endpoint
 * Access control is now nested under accessFind (same AccessFindDTO as statements)
 */
export interface AggregateFindDTO {
  page?: number;
  size?: number;
  hasChildrenFull?: boolean;
  hasHistory?: boolean;
  hasParentUUIDFilter?: boolean;
  parentUUID?: string;
  accessFind?: AccessFindDTO;
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
  mathFormulas?: AggregateUUMathFormula[];
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
// The API now expects an array of AggregateEntityCreateDTO directly
export type AggregateCreateDTO = AggregateEntityCreateDTO[];

export interface AggregateEntityCreateDTO {
  name?: string;
  abbreviation?: string;
  version?: string;
  description?: string;
  isTemplate?: boolean;
  groupUUID?: UUID;
  // Parent UUIDs to establish parent-child relationships
  parents?: UUID[];
  address?: AggregateUUAddressCreateDTO;
  files?: AggregateUUFileCreateDTO[];
  properties?: AggregateUUPropertyCreateDTO[];
  mathFormulas?: AggregateUUMathFormulaCreateDTO[];
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
  mathFormulaExternalUUID?: string;
  files?: AggregateUUFileCreateDTO[];
}

export interface AuditUser {
  userUUID?: string;
  userAuthIdentifier?: string;
  userAuthIdentifierType?: string;
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
  isTemplate?: boolean;
}

// ============================================================================
// MATH FORMULA AGGREGATE TYPES
// ============================================================================

/**
 * Math formula reference for aggregate create payload
 * uuid references an existing formula; mathFormulaCalc defines the calculation
 */
export interface AggregateUUMathFormulaCreateDTO {
  uuid?: string;
  mathFormulaCalc: AggregateUUMathFormulaCalcCreateDTO;
}

/**
 * Calculation create payload for aggregate API (no uuid — auto-generated by backend)
 */
export interface AggregateUUMathFormulaCalcCreateDTO {
  args: UUMathFormulaCalcArg[];
  result: UUMathFormulaCalcResult;
}

/**
 * Math formula in aggregate response (with audit fields)
 */
export interface AggregateUUMathFormula {
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  name?: string;
  expression?: string;
  description?: string;
  version?: string;
  mathFormulaCalc?: AggregateUUMathFormulaCalc;
}

/**
 * Formula calculation in aggregate response (with audit fields)
 */
export interface AggregateUUMathFormulaCalc {
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  uuid?: string;
  args?: UUMathFormulaCalcArg[];
  result?: UUMathFormulaCalcResult;
}
