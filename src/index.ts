import {
  IOBClientConfig,
  Predicate,
  UUID,
  QueryParams,
  UUObjectDTO,
  UUPropertyDTO,
  UUPropertyValueDTO,
  UUFileDTO,
  UUStatementDTO,
  ComplexObjectCreationInput
} from './types';
import { setHttpClient } from './core/http-client';
import { configureLogger } from './core/logger';

// Export all types
export * from './types';

// Export all services
export * as objectService from './services/object-service';
export * as statementService from './services/statement-service';
export * as propertyService from './services/property-service';
export * as propertyValueService from './services/property-value-service';
export * as fileService from './services/file-service';
export * as uuidService from './services/uuid-service';

// Export facades
export * as objectFacade from './facade/object-facade';
export * as statementFacade from './facade/statement-facade';

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
 * const building = await iobClient.objects.getWithProperties('uuid-here');
 * ```
 *
 * @param config - Client configuration
 * @returns A domain-based client with all API methods organized by entity type
 */
export const createClient = async (config: IOBClientConfig) => {
  // Initialize the client with the given configuration
  setHttpClient(config);

  // Configure logger if debug options are provided
  if (config.debug) {
    configureLogger(config.debug);
  }

  // Import all services dynamically
  const [
    objectService,
    statementService,
    propertyService,
    propertyValueService,
    fileService,
    uuidService,
    objectFacade,
    statementFacade
  ] = await Promise.all([
    import('./services/object-service'),
    import('./services/statement-service'),
    import('./services/property-service'),
    import('./services/property-value-service'),
    import('./services/file-service'),
    import('./services/uuid-service'),
    import('./facade/object-facade'),
    import('./facade/statement-facade')
  ]);

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

    // Objects domain
    objects: {
      // High-level operations
      getWithProperties: (uuid: UUID) =>
        objectFacade.getObjectWithProperties()(uuid),
      getFullObject: (uuid: UUID, params?: QueryParams) =>
        objectFacade.getFullObject()(uuid, params),
      createWithProperties: (
        object: Omit<UUObjectDTO, 'uuid'>,
        properties: Array<{
          property: Omit<UUPropertyDTO, 'uuid'>;
          value?: Omit<UUPropertyValueDTO, 'uuid'>;
        }>
      ) => objectFacade.createObjectWithProperties()(object, properties),
      createFullObject: (objectData: ComplexObjectCreationInput) =>
        objectFacade.createFullObject()(objectData),
      updateObject: (
        uuid: UUID,
        updates: {
          object?: Partial<Omit<UUObjectDTO, 'uuid'>>;
          parentUuid?: UUID | null;
          addFiles?: Array<{
            file: Omit<UUFileDTO, 'uuid'>;
          }>;
          removeFiles?: UUID[];
          properties?: Array<{
            key: string;
            property?: Partial<Omit<UUPropertyDTO, 'uuid'>>;
            addValues?: Array<{
              value: Omit<UUPropertyValueDTO, 'uuid'>;
              addFiles?: Array<{
                file: Omit<UUFileDTO, 'uuid'>;
              }>;
            }>;
            removeValues?: UUID[];
            addFiles?: Array<{
              file: Omit<UUFileDTO, 'uuid'>;
            }>;
            removeFiles?: UUID[];
          }>;
          removeProperties?: string[];
        }
      ) => objectFacade.updateObject()(uuid, updates),
      addChild: (parentUuid: UUID, childUuid: UUID) =>
        objectFacade.addChildToObject()(parentUuid, childUuid),
      addFile: (objectUuid: UUID, file: UUFileDTO) =>
        objectFacade.addFileToObject()(objectUuid, file),

      // Direct API access
      api: {
        getById: (uuid: UUID, params?: QueryParams) =>
          objectService.getObjectByUuid()(uuid, params),
        getAll: (params?: QueryParams) => objectService.getAllObjects()(params),
        getOwn: (params?: QueryParams) => objectService.getOwnObjects()(params),
        getByType: (type: string, params?: QueryParams) =>
          objectService.getObjectsByType()(type, params),
        create: (object: UUObjectDTO) =>
          objectService.createOrUpdateObject()(object),
        delete: (uuid: UUID) => objectService.softDeleteObject()(uuid),
        softDelete: (uuid: UUID) => objectService.softDeleteObject()(uuid)
      }
    },

    // Properties domain
    properties: {
      // High-level operations
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

      // Direct API access
      api: {
        getById: (uuid: UUID, params?: QueryParams) =>
          propertyService.getPropertyByUuid()(uuid, params),
        getByKey: (key: string, params?: QueryParams) =>
          propertyService.getPropertyByKey()(key, params),
        getAll: (params?: QueryParams) =>
          propertyService.getAllProperties()(params),
        getOwn: (params?: QueryParams) =>
          propertyService.getOwnProperties()(params),
        create: (property: UUPropertyDTO) =>
          propertyService.createOrUpdateProperty()(property),
        delete: (uuid: UUID) => propertyService.softDeleteProperty()(uuid),
        softDelete: (uuid: UUID) => propertyService.softDeleteProperty()(uuid)
      }
    },

    // Values domain
    values: {
      // High-level operations
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

      // Direct API access
      api: {
        getById: (uuid: UUID, params?: QueryParams) =>
          propertyValueService.getPropertyValueByUuid()(uuid, params),
        getAll: (params?: QueryParams) =>
          propertyValueService.getAllPropertyValues()(params),
        getOwn: (params?: QueryParams) =>
          propertyValueService.getOwnPropertyValues()(params),
        create: (value: UUPropertyValueDTO) =>
          propertyValueService.createOrUpdatePropertyValue()(value),
        delete: (uuid: UUID) =>
          propertyValueService.softDeletePropertyValue()(uuid),
        softDelete: (uuid: UUID) =>
          propertyValueService.softDeletePropertyValue()(uuid)
      }
    },

    // Files domain
    files: {
      // High-level operations
      attachToObject: async (
        objectUuid: UUID,
        file: Partial<UUFileDTO> & { fileName: string; fileReference: string }
      ) => {
        // Get UUID if needed
        let fileWithUuid: UUFileDTO;

        if ('uuid' in file && file.uuid) {
          fileWithUuid = file as UUFileDTO;
        } else {
          const uuidResponse = await uuidService.createUUID()();
          if (!uuidResponse.data?.uuid) {
            throw new Error('Failed to obtain UUID for file');
          }
          fileWithUuid = { ...file, uuid: uuidResponse.data.uuid } as UUFileDTO;
        }

        // Create file and link to object
        const fileResponse =
          await fileService.createOrUpdateFile()(fileWithUuid);
        if (fileResponse.data) {
          await statementService.createStatement()({
            subject: objectUuid,
            predicate: Predicate.HAS_FILE,
            object: fileResponse.data.uuid
          });

          // Create inverse relationship
          await statementService.createStatement()({
            subject: fileResponse.data.uuid,
            predicate: Predicate.IS_FILE_OF,
            object: objectUuid
          });
        }
        return fileResponse;
      },

      // Direct API access
      api: {
        getById: (uuid: UUID, params?: QueryParams) =>
          fileService.getFileByUuid()(uuid, params),
        getContent: (uuid: UUID) => fileService.getFileContent()(uuid),
        getAll: (params?: QueryParams) => fileService.getAllFiles()(params),
        getOwn: (params?: QueryParams) => fileService.getOwnFiles()(params),
        create: (file: UUFileDTO) => fileService.createOrUpdateFile()(file),
        delete: (uuid: UUID) => fileService.softDeleteFile()(uuid),
        softDelete: (uuid: UUID) => fileService.softDeleteFile()(uuid)
      }
    },

    // Statements (relationships) domain
    statements: {
      // High-level operations
      createRelationship: (subject: UUID, predicate: Predicate, object: UUID) =>
        statementFacade.createRelationship()(subject, predicate, object),
      deleteRelationship: (subject: UUID, predicate: Predicate, object: UUID) =>
        statementFacade.deleteRelationship()(subject, predicate, object),
      softDeleteRelationship: (
        subject: UUID,
        predicate: Predicate,
        object: UUID
      ) => statementFacade.softDeleteRelationship()(subject, predicate, object),
      findAllRelationships: (entityUuid: UUID, params?: QueryParams) =>
        statementFacade.findAllRelationships()(entityUuid, params),
      expandStatement: (statement: UUStatementDTO) =>
        statementFacade.expandStatement()(statement),

      // Direct API access
      api: {
        getAll: (softDeleted?: boolean) =>
          statementFacade.getAllStatements()(softDeleted),
        getOwn: (softDeleted?: boolean) =>
          statementFacade.getOwnStatements()(softDeleted),
        getByUuidAndPredicate: (
          uuid: UUID,
          predicate: Predicate,
          softDeleted?: boolean
        ) =>
          statementFacade.getStatementsByUuidAndPredicate()(
            uuid,
            predicate,
            softDeleted
          ),
        getByPredicate: (predicate: Predicate, softDeleted?: boolean) =>
          statementFacade.getStatementsByPredicate()(predicate, softDeleted),
        getBySubject: (uuid: UUID, params?: QueryParams) =>
          statementService.getStatementsBySubject()(uuid, params),
        getByObject: (uuid: UUID, params?: QueryParams) =>
          statementService.getStatementsByObject()(uuid, params),
        create: (statement: UUStatementDTO) =>
          statementService.createStatement()(statement),
        createBatch: (statements: UUStatementDTO[]) =>
          statementService.createOrFindStatements()(statements),
        delete: (statement: UUStatementDTO) =>
          statementService.deleteStatement()(statement),
        softDelete: (statement: UUStatementDTO) =>
          statementService.softDeleteStatement()(statement),
        find: (
          params: { subject?: UUID; predicate?: Predicate; object?: UUID },
          queryParams?: QueryParams
        ) => statementService.findStatements()(params, queryParams)
      }
    },

    // UUID domain
    uuid: {
      create: () => uuidService.createUUID()(),
      getOwned: () => uuidService.getOwnedUUIDs()(),
      getAllOwners: () => uuidService.getAllUUIDOwners()()
    }
  };
};
