import {
  IOBClientConfig,
  UUID,
  QueryParams,
  UUObjectDTO,
  UUPropertyDTO,
  UUPropertyValueDTO,
  UUFileDTO,
  UUStatementDTO,
  ComplexObjectCreationInput,
  AggregateFindDTO,
  StatementQueryParams,
  Predicate,
  UUAddressDTO
} from './types';
import { setHttpClient, configureLogger } from './core';

// Static imports instead of dynamic
import * as objectService from './services/object-service';
import * as statementService from './services/statement-service';
import * as propertyService from './services/property-service';
import * as propertyValueService from './services/property-value-service';
import * as fileService from './services/file-service';
import * as uuidService from './services/uuid-service';
import * as objectFacade from './facade/object-facade';
import * as commonFacade from './facade/common-facade';
import * as aggregateFacade from './facade/aggregate-facade';
import * as addressService from './services/address-service';

/**
 * Initialize the IOB client with the given configuration
 *
 * @param config - Client configuration including baseUrl and optional certificate
 */
export const initializeClient = (config: IOBClientConfig): void => {
  setHttpClient(config);

  // Configure logger if debug options are provided
  if (config.debug) {
    configureLogger(config.debug);
  }
};

/**
 * Create a fully configured IOB client with API methods
 *
 * Example:
 * ```typescript
 * const iobClient = createClient({
 *   baseUrl: 'https://api.example.com',
 *   uuidServiceBaseUrl: 'https://uuid-service.example.com', // Optional
 *   certificate: {
 *     cert: '-----BEGIN CERTIFICATE-----\n...',
 *     key: '-----BEGIN PRIVATE KEY-----\n...'
 *   },
 *   debug: {
 *     enabled: true,
 *     logLevel: 'info'
 *   }
 * });
 *
 * // Then use it:
 * const entities = await iobClient.aggregate.findByUUID('uuid-here');
 * ```
 *
 * @param config - Client configuration
 * @returns A simplified client with one way to do each operation
 */
export const createClient = (config: IOBClientConfig) => {
  // Initialize the client with the given configuration
  setHttpClient(config);

  // Configure logger if debug options are provided
  if (config.debug) {
    configureLogger(config.debug);
  }

  return {
    // Debug configuration
    debug: {
      /**
       * Enable or disable debug mode at runtime
       */
      configure: (options: IOBClientConfig['debug']) => {
        configureLogger(options);
      }
    },

    // Authentication
    auth: {
      // mTLS authentication
      requestBaseAuth: () => commonFacade.requestBaseAuth()(),
      requestUuidAuth: () => commonFacade.requestUuidAuth()()
    },

    // Universal search using aggregate API
    aggregate: {
      findByUUID: (uuid: UUID) => aggregateFacade.findByUUID()(uuid),
      getAggregateEntities: (params?: AggregateFindDTO) =>
        aggregateFacade.getAggregateEntities()(params)
    },

    // Entity creation and management
    objects: {
      // Create simple objects
      create: (object: UUObjectDTO) =>
        objectService.createOrUpdateObject()(object),
      createFullObject: (objectData: ComplexObjectCreationInput) =>
        objectFacade.createFullObject()(objectData),
      // Query objects
      getObjects: (params?: QueryParams) => objectService.getObjects()(params),
      // Delete objects
      delete: (uuid: UUID) => objectService.softDeleteObject()(uuid)
    },

    // Properties
    properties: {
      addToObject: async (
        objectUuid: UUID,
        property: Partial<UUPropertyDTO> & { key: string }
      ) => {
        // Get UUID if needed
        let propertyWithUuid: UUPropertyDTO;

        if ('uuid' in property && property.uuid) {
          propertyWithUuid = property as UUPropertyDTO;
        } else {
          const uuidResponse = await uuidService.createUUID()();
          if (!uuidResponse.data?.uuid) {
            throw new Error('Failed to obtain UUID for property');
          }
          propertyWithUuid = {
            ...property,
            uuid: uuidResponse.data.uuid
          } as UUPropertyDTO;
        }

        // Create property and link to object
        const propertyResponse =
          await propertyService.createOrUpdateProperty()(propertyWithUuid);
        if (propertyResponse.data) {
          await statementService.createStatement()({
            subject: objectUuid,
            predicate: Predicate.HAS_PROPERTY,
            object: propertyResponse.data.uuid
          });

          // Create inverse relationship
          await statementService.createStatement()({
            subject: propertyResponse.data.uuid,
            predicate: Predicate.IS_PROPERTY_OF,
            object: objectUuid
          });
        }
        return propertyResponse;
      },

      create: (property: UUPropertyDTO) =>
        propertyService.createOrUpdateProperty()(property),
      getProperties: (params?: QueryParams) =>
        propertyService.getProperties()(params),
      getPropertyByKey: (key: string, params?: QueryParams) =>
        propertyService.getPropertyByKey()(key, params),

      delete: (uuid: UUID) => propertyService.softDeleteProperty()(uuid)
    },

    // Property values
    values: {
      setForProperty: async (
        propertyUuid: UUID,
        value: Partial<UUPropertyValueDTO>
      ) => {
        // Get UUID if needed
        let valueWithUuid: UUPropertyValueDTO;

        if ('uuid' in value && value.uuid) {
          valueWithUuid = value as UUPropertyValueDTO;
        } else {
          const uuidResponse = await uuidService.createUUID()();
          if (!uuidResponse.data?.uuid) {
            throw new Error('Failed to obtain UUID for property value');
          }
          valueWithUuid = {
            ...value,
            uuid: uuidResponse.data.uuid
          } as UUPropertyValueDTO;
        }

        // Create value and link to property
        const valueResponse =
          await propertyValueService.createOrUpdatePropertyValue()(
            valueWithUuid
          );
        if (valueResponse.data) {
          await statementService.createStatement()({
            subject: propertyUuid,
            predicate: Predicate.HAS_VALUE,
            object: valueResponse.data.uuid
          });

          // Create inverse relationship
          await statementService.createStatement()({
            subject: valueResponse.data.uuid,
            predicate: Predicate.IS_VALUE_OF,
            object: propertyUuid
          });
        }
        return valueResponse;
      },

      create: (value: UUPropertyValueDTO) =>
        propertyValueService.createOrUpdatePropertyValue()(value),
      getPropertyValues: (params?: QueryParams) =>
        propertyValueService.getPropertyValues()(params),
      delete: (uuid: UUID) =>
        propertyValueService.softDeletePropertyValue()(uuid)
    },

    // Files
    files: {
      create: (file: UUFileDTO) => fileService.createOrUpdateFile()(file),
      getFiles: (params?: QueryParams) => fileService.getFiles()(params),
      delete: (uuid: UUID) => fileService.softDeleteFile()(uuid)
    },

    // Relationships (statements)
    statements: {
      // Get statements with filtering
      getStatements: (params?: StatementQueryParams) =>
        statementService.getStatements()(params),
      // Create statements (relationships)
      create: (statement: UUStatementDTO) =>
        statementService.createStatement()(statement),
      // Delete statements
      delete: (statement: UUStatementDTO) =>
        statementService.softDeleteStatement()(statement)
    },

    // UUID generation
    uuid: {
      create: () => uuidService.createUUID()(),
      getOwned: () => uuidService.getOwnedUUIDs()(),
      getAllOwners: () => uuidService.getAllUUIDOwners()()
    },

    // Addresses
    addresses: {
      create: (address: Omit<UUAddressDTO, 'uuid'>) =>
        addressService.createAddress()(address),
      update: (address: UUAddressDTO) =>
        addressService.updateAddress()(address),
      get: (params?: QueryParams) => addressService.getAddresses()(params),
      delete: (uuid: UUID) => addressService.softDeleteAddress()(uuid),
      createForObject: (
        objectUuid: UUID,
        address: Omit<UUAddressDTO, 'uuid'>
      ) => addressService.createAddressForObject()(objectUuid, address)
    }
  };
};
