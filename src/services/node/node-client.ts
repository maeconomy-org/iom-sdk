/**
 * Node service client for all data operations
 * Handles objects, properties, statements, files, and addresses
 */

import { z } from 'zod';
import { BaseServiceClient } from '../../core/base-service-client';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { AuthManager } from '../../core/auth-manager';
import { RegistryServiceClient } from '../registry';
import { logError } from '../../core/logger';
import {
  UUID,
  UUObjectDTO,
  UUPropertyDTO,
  UUPropertyValueDTO,
  UUStatementDTO,
  UUFileDTO,
  UUAddressDTO,
  QueryParams,
  StatementQueryParams,
  AggregateCreateDTO,
  AggregateEntity,
  AggregateFindDTO,
  PageAggregateEntity,
  Predicate,
  ApiResponse
} from '../../types';

/**
 * Node service client for all data operations
 */
export class NodeServiceClient extends BaseServiceClient {
  private authManager: AuthManager;
  private registryClient?: RegistryServiceClient;

  constructor(
    config: ServiceConfig,
    errorHandling: ErrorHandlingConfig,
    authManager: AuthManager,
    registryClient?: RegistryServiceClient
  ) {
    super(config, errorHandling, 'node');
    this.authManager = authManager;
    this.registryClient = registryClient;
    this.setupAuthInterceptor();
  }

  /**
   * Setup authentication interceptor for JWT token injection
   */
  private setupAuthInterceptor(): void {
    this.client.interceptors.request.use(async config => {
      const token = await this.authManager.getValidToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        // No token available - user needs to login first
        throw new Error(
          'Authentication required. Please call client.login() first.'
        );
      }
      return config;
    });

    // Handle 401 responses by invalidating token and retrying
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          this.authManager.invalidateToken();

          // Get new token and retry
          const token = await this.authManager.getValidToken();
          if (token) {
            error.config.headers['Authorization'] = `Bearer ${token}`;
            return this.client.request(error.config);
          }
        }
        throw error;
      }
    );
  }

  // ============================================================================
  // OBJECT OPERATIONS
  // ============================================================================

  /**
   * Get all objects
   */
  async getObjects(params?: QueryParams): Promise<UUObjectDTO[]> {
    const response = await this.get<UUObjectDTO[]>('/api/UUObject', params);
    return response.data;
  }

  /**
   * Create or update an object
   */
  async createOrUpdateObject(object: UUObjectDTO): Promise<UUObjectDTO> {
    const response = await this.post<UUObjectDTO>('/api/UUObject', object);
    return response.data;
  }

  /**
   * Create a new object (without UUID)
   */
  async createObject(object: Omit<UUObjectDTO, 'uuid'>): Promise<UUObjectDTO> {
    const response = await this.post<UUObjectDTO>('/api/UUObject', object);
    return response.data;
  }

  /**
   * Update an existing object
   */
  async updateObject(object: UUObjectDTO): Promise<UUObjectDTO> {
    const response = await this.put<UUObjectDTO>(
      `/api/UUObject/${object.uuid}`,
      object
    );
    return response.data;
  }

  /**
   * Soft delete an object
   */
  async softDeleteObject(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean }>(
      `/api/UUObject/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // PROPERTY OPERATIONS
  // ============================================================================

  /**
   * Get all properties
   */
  async getProperties(params?: QueryParams): Promise<UUPropertyDTO[]> {
    const response = await this.get<UUPropertyDTO[]>('/api/UUProperty', params);
    return response.data;
  }

  /**
   * Create or update a property
   */
  async createOrUpdateProperty(
    property: UUPropertyDTO
  ): Promise<UUPropertyDTO> {
    const response = await this.post<UUPropertyDTO>(
      '/api/UUProperty',
      property
    );
    return response.data;
  }

  /**
   * Create a new property (without UUID)
   */
  async createProperty(
    property: Omit<UUPropertyDTO, 'uuid'>
  ): Promise<UUPropertyDTO> {
    const response = await this.post<UUPropertyDTO>(
      '/api/UUProperty',
      property
    );
    return response.data;
  }

  /**
   * Soft delete a property
   */
  async softDeleteProperty(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean }>(
      `/api/UUProperty/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // PROPERTY VALUE OPERATIONS
  // ============================================================================

  /**
   * Get all property values
   */
  async getPropertyValues(params?: QueryParams): Promise<UUPropertyValueDTO[]> {
    const response = await this.get<UUPropertyValueDTO[]>(
      '/api/UUPropertyValue',
      params
    );
    return response.data;
  }

  /**
   * Create or update a property value
   */
  async createOrUpdatePropertyValue(
    value: UUPropertyValueDTO
  ): Promise<UUPropertyValueDTO> {
    const response = await this.post<UUPropertyValueDTO>(
      '/api/UUPropertyValue',
      value
    );
    return response.data;
  }

  /**
   * Create a new property value (without UUID)
   */
  async createPropertyValue(
    value: Omit<UUPropertyValueDTO, 'uuid'>
  ): Promise<UUPropertyValueDTO> {
    const response = await this.post<UUPropertyValueDTO>(
      '/api/UUPropertyValue',
      value
    );
    return response.data;
  }

  /**
   * Soft delete a property value
   */
  async softDeletePropertyValue(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean }>(
      `/api/UUPropertyValue/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // STATEMENT OPERATIONS
  // ============================================================================

  /**
   * Get statements with optional filtering
   */
  async getStatements(
    params?: StatementQueryParams
  ): Promise<UUStatementDTO[]> {
    const response = await this.get<UUStatementDTO[]>(
      '/api/UUStatements',
      params
    );
    return response.data;
  }

  /**
   * Create a new statement
   */
  async createStatement(statement: UUStatementDTO): Promise<UUStatementDTO> {
    const response = await this.post<UUStatementDTO>(
      '/api/UUStatements',
      statement
    );
    return response.data;
  }

  /**
   * Soft delete a statement
   */
  async softDeleteStatement(
    subject: UUID,
    predicate: string,
    object: UUID
  ): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean }>(
      '/api/UUStatements',
      {
        subject,
        predicate,
        object
      }
    );
    return response.data;
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  /**
   * Get all files
   */
  async getFiles(params?: QueryParams): Promise<UUFileDTO[]> {
    const response = await this.get<UUFileDTO[]>('/api/UUFile', params);
    return response.data;
  }

  /**
   * Upload a file
   */
  async uploadFile(
    file: File,
    metadata?: Partial<UUFileDTO>
  ): Promise<UUFileDTO> {
    const formData = new FormData();
    formData.append('file', file);

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    const response = await this.postForm<UUFileDTO>('/api/UUFile', formData);
    return response.data;
  }

  /**
   * Get file by UUID
   */
  async getFile(uuid: UUID): Promise<UUFileDTO> {
    const response = await this.get<UUFileDTO>(`/api/UUFile/${uuid}`);
    return response.data;
  }

  /**
   * Download file content
   */
  async downloadFile(uuid: UUID): Promise<ArrayBuffer> {
    const response = await this.getBinary<ArrayBuffer>(
      `/api/UUFile/${uuid}/download`
    );
    return response.data;
  }

  /**
   * Soft delete a file
   */
  async softDeleteFile(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean }>(
      `/api/UUFile/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // ADDRESS OPERATIONS
  // ============================================================================

  /**
   * Get all addresses
   */
  async getAddresses(params?: QueryParams): Promise<UUAddressDTO[]> {
    const response = await this.get<UUAddressDTO[]>('/api/UUAddress', params);
    return response.data;
  }

  /**
   * Create or update an address
   */
  async createOrUpdateAddress(address: UUAddressDTO): Promise<UUAddressDTO> {
    const response = await this.post<UUAddressDTO>('/api/UUAddress', address);
    return response.data;
  }

  /**
   * Create a new address (without UUID)
   */
  async createAddress(
    address: Omit<UUAddressDTO, 'uuid'>
  ): Promise<UUAddressDTO> {
    const response = await this.post<UUAddressDTO>('/api/UUAddress', address);
    return response.data;
  }

  /**
   * Soft delete an address
   */
  async softDeleteAddress(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean }>(
      `/api/UUAddress/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // AGGREGATE OPERATIONS
  // ============================================================================

  /**
   * Search aggregates with pagination and filtering
   */
  async searchAggregates(
    searchParams: AggregateFindDTO
  ): Promise<PageAggregateEntity> {
    const response = await this.post<PageAggregateEntity>(
      '/api/Aggregate/search',
      searchParams
    );
    return response.data;
  }

  /**
   * Create aggregate entities
   */
  async createAggregates(
    aggregates: AggregateCreateDTO
  ): Promise<AggregateEntity[]> {
    const response = await this.post<AggregateEntity[]>(
      '/api/Aggregate',
      aggregates
    );
    return response.data;
  }

  /**
   * Bulk import aggregate entities
   * Returns only HTTP status (200 for success)
   */
  async importAggregates(
    aggregates: AggregateCreateDTO
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.post<void>(
        '/api/Aggregate/Import',
        aggregates
      );
      return {
        data: undefined,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error: any) {
      logError('importAggregates (NodeServiceClient)', error);
      return {
        data: undefined,
        status: error.status || 500,
        statusText: error.message || 'Error importing aggregates'
      };
    }
  }

  // ============================================================================
  // FILE WORKFLOW METHODS (Complex multi-API operations)
  // ============================================================================

  /**
   * Upload a file by external URL reference
   * This creates a UUFile record with a provided URL and links it to a parent object.
   * Complete workflow: Create UUID → Create file record → Create relationship
   */
  async uploadFileByReference(input: {
    fileReference: string; // Required - external URL or reference
    uuidToAttach: UUID; // Required - UUID of object/property/value to attach to
    label?: string;
    fileName?: string;
    contentType?: string;
    size?: number;
  }): Promise<ApiResponse<UUFileDTO | null>> {
    if (!this.registryClient) {
      throw new Error('Registry client not available for UUID operations');
    }

    try {
      // 1. Always create UUID for the file
      const uuidResponse = await this.registryClient.createUUID();
      const fileUuid = uuidResponse.uuid;

      // 2. Create UUFile record with provided data
      const fileRecord: Omit<UUFileDTO, 'uuid'> = {
        fileReference: input.fileReference,
        fileName: input.fileName,
        label: input.label,
        contentType: input.contentType,
        size: input.size
      };

      // Create the file record
      const created = await this.createObject({
        ...fileRecord,
        uuid: fileUuid
      } as any); // Cast as the file creation might use object endpoint

      // 3. Create statement to link file to parent object
      await this.createStatement({
        subject: input.uuidToAttach,
        predicate: Predicate.HAS_FILE,
        object: fileUuid
      });

      // Return standardized success response
      return {
        data: created as any, // Cast to UUFileDTO
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      return {
        data: null,
        status: error.status || 500,
        statusText: error.message || 'Error uploading file by reference'
      };
    }
  }

  /**
   * Upload a file's binary content directly
   * Complete workflow: Create UUID → Upload file → Create relationship
   */
  async uploadFileDirect(input: {
    file: File;
    uuidToAttach: UUID;
    label?: string;
  }): Promise<ApiResponse<UUFileDTO | null>> {
    if (!this.registryClient) {
      throw new Error('Registry client not available for UUID operations');
    }

    try {
      // 1. Create UUID for the file
      const uuidResponse = await this.registryClient.createUUID();
      const fileUuid = uuidResponse.uuid;

      // 2. Upload the file with metadata
      const uploadedFile = await this.uploadFile(input.file, {
        uuid: fileUuid,
        label: input.label
      });

      // 3. Create statement to link file to parent object
      await this.createStatement({
        subject: input.uuidToAttach,
        predicate: Predicate.HAS_FILE,
        object: fileUuid
      });

      // Return the created file record
      return {
        data: uploadedFile,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      return {
        data: null,
        status: error.status || 500,
        statusText: error.message || 'Error uploading file binary'
      };
    }
  }

  // ============================================================================
  // PROPERTY WORKFLOW METHODS (Complex multi-API operations)
  // ============================================================================

  /**
   * Add a property to an object
   * This high-level operation automatically gets a UUID, creates the property,
   * and establishes the relationship with the object
   * Complete workflow: Validate UUID → Create UUID → Create property → Create relationships
   */
  async addPropertyToObject(
    objectUuid: UUID,
    property: Partial<UUPropertyDTO> & { key: string }
  ): Promise<ApiResponse<UUPropertyDTO>> {
    if (!this.registryClient) {
      throw new Error('Registry client not available for UUID operations');
    }

    try {
      // Validate objectUuid
      const uuidSchema = z.string().uuid();
      const validatedObjectUuid = uuidSchema.parse(objectUuid);

      // Get UUID if needed
      let propertyWithUuid: UUPropertyDTO;

      if ('uuid' in property && property.uuid) {
        propertyWithUuid = property as UUPropertyDTO;
      } else {
        const uuidResponse = await this.registryClient.createUUID();
        propertyWithUuid = {
          ...property,
          uuid: uuidResponse.uuid
        } as UUPropertyDTO;
      }

      // Create property
      const createdProperty = await this.createProperty(propertyWithUuid);

      // Create relationships
      await this.createStatement({
        subject: validatedObjectUuid,
        predicate: Predicate.HAS_PROPERTY,
        object: createdProperty.uuid
      });

      // Create inverse relationship
      await this.createStatement({
        subject: createdProperty.uuid,
        predicate: Predicate.IS_PROPERTY_OF,
        object: validatedObjectUuid
      });

      return {
        data: createdProperty,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      return {
        data: null as any,
        status: error.status || 500,
        statusText: error.message || 'Error adding property to object'
      };
    }
  }

  /**
   * Get all properties for an object
   */
  async getPropertiesForObject(
    objectUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUPropertyDTO[]>> {
    try {
      // Validate objectUuid
      const uuidSchema = z.string().uuid();
      const validatedObjectUuid = uuidSchema.parse(objectUuid);

      // Get property statements
      const statements = await this.getStatements({
        subject: validatedObjectUuid,
        predicate: Predicate.HAS_PROPERTY,
        ...params
      });

      if (!statements || statements.length === 0) {
        return {
          data: [],
          status: 200,
          statusText: 'OK'
        };
      }

      // Get property details for each statement
      const properties: UUPropertyDTO[] = [];

      for (const statement of statements) {
        try {
          const allProperties = await this.getProperties({
            uuid: statement.object,
            ...params
          });
          const property = allProperties.find(p => p.uuid === statement.object);
          if (property) {
            properties.push(property);
          }
        } catch (error) {
          logError(`Failed to retrieve property ${statement.object}`, error);
        }
      }

      return {
        data: properties,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      logError('getPropertiesForObject (NodeServiceClient)', error);
      return {
        data: [],
        status: error.status || 500,
        statusText: error.message || 'Error getting properties for object'
      };
    }
  }

  // ============================================================================
  // COMPLEX PROPERTY VALUE OPERATIONS
  // ============================================================================

  /**
   * Set a value for a property with automatic UUID generation and relationship creation
   * This high-level operation automatically gets a UUID, creates the value,
   * and establishes the relationship with the property
   */
  async setValueForProperty(
    propertyUuid: UUID,
    value: Partial<UUPropertyValueDTO>
  ): Promise<ApiResponse<UUPropertyValueDTO>> {
    if (!this.registryClient) {
      throw new Error('Registry client not available for UUID operations');
    }

    try {
      // Validate propertyUuid
      const uuidSchema = z.string().uuid();
      const validatedPropertyUuid = uuidSchema.parse(propertyUuid);

      // Get UUID if needed
      let valueWithUuid: UUPropertyValueDTO;

      if ('uuid' in value && value.uuid) {
        valueWithUuid = value as UUPropertyValueDTO;
      } else {
        const uuidResponse = await this.registryClient.createUUID();
        valueWithUuid = {
          ...value,
          uuid: uuidResponse.uuid
        } as UUPropertyValueDTO;
      }

      // Create value
      const createdValue = await this.createPropertyValue(valueWithUuid);

      // Create relationships
      await this.createStatement({
        subject: validatedPropertyUuid,
        predicate: Predicate.HAS_VALUE,
        object: createdValue.uuid
      });

      // Create inverse relationship
      await this.createStatement({
        subject: createdValue.uuid,
        predicate: Predicate.IS_VALUE_OF,
        object: validatedPropertyUuid
      });

      return { data: createdValue, status: 200, statusText: 'OK' };
    } catch (error: any) {
      logError('setValueForProperty (NodeServiceClient)', error);
      return {
        data: null as any,
        status: error.status || 500,
        statusText: error.message || 'Error setting value for property'
      };
    }
  }

  /**
   * Get all values for a property
   */
  async getValuesForProperty(
    propertyUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUPropertyValueDTO[]>> {
    try {
      // Validate propertyUuid
      const uuidSchema = z.string().uuid();
      const validatedPropertyUuid = uuidSchema.parse(propertyUuid);

      // Get value statements
      const statements = await this.getStatements({
        subject: validatedPropertyUuid,
        predicate: Predicate.HAS_VALUE,
        ...params
      });

      if (!statements || statements.length === 0) {
        return {
          data: [],
          status: 200,
          statusText: 'OK'
        };
      }

      // Get value details for each statement
      const values: UUPropertyValueDTO[] = [];

      for (const statement of statements) {
        try {
          const allValues = await this.getPropertyValues({
            uuid: statement.object,
            ...params
          });
          const value = allValues.find(v => v.uuid === statement.object);
          if (value) {
            values.push(value);
          }
        } catch (error) {
          logError(`Failed to retrieve value ${statement.object}`, error);
        }
      }

      return {
        data: values,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
      logError('getValuesForProperty (NodeServiceClient)', error);
      return {
        data: [],
        status: error.status || 500,
        statusText: error.message || 'Error getting values for property'
      };
    }
  }

  /**
   * Update error handling configuration
   */
  updateErrorHandling(newConfig: ErrorHandlingConfig): void {
    this.errorHandling = newConfig;
  }
}
