/**
 * Math Formula and Calculation types (from Swagger documentation)
 */

import { UUID } from './services';

// ============================================================================
// MATH FORMULA TYPES
// ============================================================================

/**
 * UUMathFormula Data Transfer Object
 * Represents a reusable math formula definition
 */
export interface UUMathFormulaDTO {
  uuid: UUID;
  groupUUID?: UUID;
  name: string;
  expression: string;
  description?: string;
  version?: string;
}

/**
 * UUMathFormula entity (with audit fields)
 * Matches the schema of items returned by paginated POST /api/UUMathFormula/find
 */
export interface UUMathFormula {
  createdAt?: string;
  createdBy?: { uuid?: UUID; username?: string };
  lastUpdatedAt?: string;
  lastUpdatedBy?: { uuid?: UUID; username?: string };
  softDeletedAt?: string;
  softDeleteBy?: { uuid?: UUID; username?: string };
  softDeleted?: boolean;
  uuid?: UUID;
  name?: string;
  expression?: string;
  description?: string;
  version?: string;
}

/**
 * Paginated response for math formulas (matches Spring PageImpl)
 */
export interface PageImplUUMathFormula {
  totalPages: number;
  totalElements: number;
  size: number;
  content: UUMathFormula[];
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

/**
 * UUMathFormulaCalc Data Transfer Object
 * Represents a calculation instance that links a formula to property values
 */
export interface UUMathFormulaCalcDTO {
  uuid: UUID;
  groupUUID?: UUID;
  args: UUMathFormulaCalcArg[];
  result: UUMathFormulaCalcResult;
}

/**
 * Argument for a formula calculation - maps a variable name to a property value
 */
export interface UUMathFormulaCalcArg {
  name: string;
  propertyValueUUID: UUID;
}

/**
 * Result of a formula calculation - references the output property value
 */
export interface UUMathFormulaCalcResult {
  propertyValueUUID: UUID;
}

// ============================================================================
// SEARCH DTOs
// ============================================================================

/**
 * Search parameters for finding math formulas
 */
export interface UUMathFormulaFindDTO {
  uuid?: UUID;
  name?: string;
  groupUUID?: UUID;
  softDeleted?: boolean;
  accessFind?: {
    readDefaultGroup?: boolean;
    readOwnGroups?: boolean;
    readPublicGroups?: boolean;
    readUserSharedGroups?: boolean;
    groupUUIDList?: string[];
  };
}

/**
 * Search parameters for finding formula calculations
 */
export interface UUMathFormulaCalcFindDTO {
  uuid?: UUID;
  groupUUID?: UUID;
  softDeleted?: boolean;
  accessFind?: {
    readDefaultGroup?: boolean;
    readOwnGroups?: boolean;
    readPublicGroups?: boolean;
    readUserSharedGroups?: boolean;
    groupUUIDList?: string[];
  };
}
