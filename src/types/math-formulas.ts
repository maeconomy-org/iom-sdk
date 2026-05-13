/**
 * Math Formula and Calculation types.
 *
 * Shape sourced from `docs/node.swagger.json`. Write-side uses the lean
 * `*DTO` shapes; read-side (find responses) returns the full entity with
 * audit fields wrapped in a Spring `Page<T>` envelope.
 */

import { NodeFindDTO, UUID } from './services';
import type { AuditUser } from './aggregates';

// ============================================================================
// MATH FORMULA — WRITE SHAPES
// ============================================================================

/**
 * UUMathFormulaDTO — request body for `POST /api/UUMathFormula`.
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
 * UUMathFormulaCalcDTO — request body for `POST /api/UUMathFormulaCalc`.
 * Links a formula to concrete property-value bindings + output target.
 */
export interface UUMathFormulaCalcDTO {
  uuid: UUID;
  groupUUID?: UUID;
  args: UUMathFormulaCalcArg[];
  result: UUMathFormulaCalcResult;
}

/** Maps a variable name in the expression to a property-value UUID. */
export interface UUMathFormulaCalcArg {
  name: string;
  propertyValueUUID: UUID;
}

/** References the property-value UUID that will receive the computed result. */
export interface UUMathFormulaCalcResult {
  propertyValueUUID: UUID;
}

// ============================================================================
// MATH FORMULA — READ SHAPES (find responses)
// ============================================================================

/**
 * UUMathFormula — entity shape returned by `POST /api/UUMathFormula/find`.
 * Adds audit + soft-delete fields on top of the DTO shape.
 */
export interface UUMathFormula {
  uuid: UUID;
  name?: string;
  expression?: string;
  description?: string;
  version?: string;
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
}

// ============================================================================
// SEARCH DTOs
// ============================================================================

/**
 * Request body for `POST /api/UUMathFormula/find`. Swagger requires only
 * `{ nodeFind, page, size }` — past flattened fields (`uuid`, `name`, etc.)
 * are no longer accepted at the top level.
 */
export interface UUMathFormulaFindDTO {
  nodeFind?: NodeFindDTO;
  /** Zero-based page index. */
  page?: number;
  /** Page size. */
  size?: number;
}

/**
 * UUMathFormulaCalc find still routes through the generic
 * `NodeFindRequestDTO` (page response is `object` in swagger — kept loose
 * here until the backend tightens the contract).
 */
export interface UUMathFormulaCalcFindDTO {
  nodeFind?: NodeFindDTO;
  page?: number;
  size?: number;
}

// ============================================================================
// PAGINATION ENVELOPES
// ============================================================================

export interface SortObject {
  sorted?: boolean;
  unsorted?: boolean;
  empty?: boolean;
}

export interface PageableObject {
  paged?: boolean;
  unpaged?: boolean;
  pageNumber?: number;
  pageSize?: number;
  offset?: number;
  sort?: SortObject;
}

/** Spring `Page<UUMathFormula>` envelope. */
export interface PageUUMathFormula {
  content?: UUMathFormula[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  pageable?: PageableObject;
  sort?: SortObject;
}
