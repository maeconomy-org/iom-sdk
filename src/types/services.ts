/**
 * Service-related types and DTOs
 */

// Common UUID pattern used throughout the API
export type UUID = string;

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

// Predicate types for statements
export enum Predicate {
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
  isTemplate?: boolean;
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
