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
