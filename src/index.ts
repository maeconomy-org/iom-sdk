// Core types and configuration
export * from './types';
export { setHttpClient, configureLogger } from './core';

// Main client API - this is what most users should use
export { createClient, initializeClient } from './client';

// Advanced exports for power users
// Services - individual function exports
export {
  getObjects,
  createOrUpdateObject,
  softDeleteObject
} from './services/object-service';

export {
  getStatements,
  createStatement,
  createOrFindStatements,
  softDeleteStatement,
  getStatementsByUuidAndPredicate,
  findChildren,
  findParents,
  findProperties,
  findPropertyValues,
  findFiles
} from './services/statement-service';

export {
  getProperties,
  createOrUpdateProperty,
  getPropertyByKey,
  softDeleteProperty
} from './services/property-service';

export {
  getPropertyValues,
  createOrUpdatePropertyValue,
  softDeletePropertyValue
} from './services/property-value-service';

export {
  getFiles,
  createOrUpdateFile,
  softDeleteFile,
  uploadFileBinary,
  downloadFileBinary
} from './services/file-service';

export {
  getAddresses,
  createAddress,
  updateAddress,
  softDeleteAddress,
  createAddressForObject
} from './services/address-service';

export {
  createUUID,
  getOwnedUUIDs,
  getUUIDRecord,
  updateUUIDRecordMeta,
  authorizeUUIDRecord
} from './services/uuid-service';

export {
  findByUUID as aggregateFindByUUID,
  getAggregateEntities,
  createAggregateObject,
  importAggregateObjects
} from './services/aggregate-service';

export { requestBaseAuth, requestUuidAuth } from './services/common-service';

// Facades - high-level operations
export { createFullObject } from './facade/object-facade';

export {
  addPropertyToObject,
  getPropertiesForObject
} from './facade/property-facade';

export {
  setValueForProperty,
  getValuesForProperty
} from './facade/property-value-facade';

export {
  findByUUID as aggregateSearch,
  getAggregateEntities as searchAggregateEntities,
  createAggregateObject as createAggregate,
  importAggregateObjects as importAggregates
} from './facade/aggregate-facade';

export {
  uploadByReference as uploadFileByReference,
  uploadDirect as uploadFileDirect,
  uploadFormData as uploadFileFormData,
  download as downloadFile
} from './facade/file-facade';

// Validation utilities
export { validate, validateSafe, ValidationError } from './validation/validate';

export {
  validateQueryParams,
  validateStatementQueryParams,
  validateAggregateParams,
  validateUuid
} from './validation/query-params';
