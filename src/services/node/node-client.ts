import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { RegistryServiceClient } from '../registry/registry-client';
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

export class NodeServiceClient {
  constructor(
    _config: ServiceConfig,
    private errorHandling: ErrorHandlingConfig,
    private axios: AxiosInstance,
    private registryClient?: RegistryServiceClient
  ) {}

  public getAxios(): AxiosInstance {
    return this.axios;
  }

  private async request<T>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axios.request<T>(config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as any
    };
  }

  // ============================================================================
  // OBJECT OPERATIONS
  // ============================================================================

  async getObjects(params?: QueryParams): Promise<UUObjectDTO[]> {
    const response = await this.axios.get<UUObjectDTO[]>('/api/UUObject', {
      params
    });
    return response.data;
  }

  async createOrUpdateObject(object: UUObjectDTO): Promise<UUObjectDTO> {
    const response = await this.axios.post<UUObjectDTO>(
      '/api/UUObject',
      object
    );
    return response.data;
  }

  async softDeleteObject(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.axios.delete<{ success: boolean }>(
      `/api/UUObject/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // PROPERTY OPERATIONS
  // ============================================================================

  async getProperties(params?: QueryParams): Promise<UUPropertyDTO[]> {
    const response = await this.axios.get<UUPropertyDTO[]>('/api/UUProperty', {
      params
    });
    return response.data;
  }

  async createOrUpdateProperty(
    property: UUPropertyDTO
  ): Promise<UUPropertyDTO> {
    const response = await this.axios.post<UUPropertyDTO>(
      '/api/UUProperty',
      property
    );
    return response.data;
  }

  async createProperty(
    property: Omit<UUPropertyDTO, 'uuid'>
  ): Promise<UUPropertyDTO> {
    const response = await this.axios.post<UUPropertyDTO>(
      '/api/UUProperty',
      property
    );
    return response.data;
  }

  async softDeleteProperty(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.axios.delete<{ success: boolean }>(
      `/api/UUProperty/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // PROPERTY VALUE OPERATIONS
  // ============================================================================

  async getPropertyValues(params?: QueryParams): Promise<UUPropertyValueDTO[]> {
    const response = await this.axios.get<UUPropertyValueDTO[]>(
      '/api/UUPropertyValue',
      { params }
    );
    return response.data;
  }

  async createOrUpdatePropertyValue(
    value: UUPropertyValueDTO
  ): Promise<UUPropertyValueDTO> {
    const response = await this.axios.post<UUPropertyValueDTO>(
      '/api/UUPropertyValue',
      value
    );
    return response.data;
  }

  async createPropertyValue(
    value: Omit<UUPropertyValueDTO, 'uuid'>
  ): Promise<UUPropertyValueDTO> {
    const response = await this.axios.post<UUPropertyValueDTO>(
      '/api/UUPropertyValue',
      value
    );
    return response.data;
  }

  async softDeletePropertyValue(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.axios.delete<{ success: boolean }>(
      `/api/UUPropertyValue/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // STATEMENT OPERATIONS
  // ============================================================================

  async getStatements(
    params?: StatementQueryParams
  ): Promise<UUStatementDTO[]> {
    const response = await this.axios.get<UUStatementDTO[]>(
      '/api/UUStatements',
      { params }
    );
    return response.data;
  }

  /**
   * Create one or more statements
   * API expects an array of statements
   */
  async createStatements(
    statements: UUStatementDTO[]
  ): Promise<UUStatementDTO[]> {
    const response = await this.axios.post<UUStatementDTO[]>(
      '/api/UUStatements',
      statements
    );
    return response.data;
  }

  /**
   * Create a single statement (convenience wrapper)
   * Wraps the statement in an array as required by the API
   */
  async createStatement(statement: UUStatementDTO): Promise<UUStatementDTO> {
    const results = await this.createStatements([statement]);
    return results[0];
  }

  async softDeleteStatement(
    subject: UUID,
    predicate: string,
    object: UUID
  ): Promise<{ success: boolean }> {
    const response = await this.axios.delete<{ success: boolean }>(
      '/api/UUStatements',
      {
        data: { subject, predicate, object }
      }
    );
    return response.data;
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  async getFiles(params?: QueryParams): Promise<UUFileDTO[]> {
    const response = await this.axios.get<UUFileDTO[]>('/api/UUFile', {
      params
    });
    return response.data;
  }

  /**
   * Upload a file's binary content via multipart/form-data
   * Swagger: POST /api/UUFile/upload?uuidFile={uuidFile}&uuidToAttach={uuidToAttach}
   */
  async uploadFileBinary(
    uuidFile: UUID,
    uuidToAttach: UUID,
    file: File | Blob,
    fieldName: string = 'file'
  ): Promise<UUFileDTO> {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Build URL with query parameters - this is the correct endpoint for binary upload
    const url = `/api/UUFile/upload?uuidFile=${uuidFile}&uuidToAttach=${uuidToAttach}`;

    // Don't set Content-Type manually - let axios/browser auto-detect it with proper boundary
    const response = await this.axios.post<UUFileDTO>(url, formData);
    return response.data;
  }

  /**
   * Create or update a UUFile record (metadata only, no binary)
   */
  async createOrUpdateFile(file: UUFileDTO): Promise<UUFileDTO> {
    const response = await this.axios.post<UUFileDTO>('/api/UUFile', file);
    return response.data;
  }

  async getFile(uuid: UUID): Promise<UUFileDTO> {
    const response = await this.axios.get<UUFileDTO>(`/api/UUFile/${uuid}`);
    return response.data;
  }

  async downloadFile(uuid: UUID): Promise<ArrayBuffer> {
    const response = await this.axios.get<ArrayBuffer>(
      `/api/UUFile/download/${uuid}`,
      {
        responseType: 'arraybuffer'
      }
    );
    return response.data;
  }

  async softDeleteFile(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.axios.delete<{ success: boolean }>(
      `/api/UUFile/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // ADDRESS OPERATIONS
  // ============================================================================

  async getAddresses(params?: QueryParams): Promise<UUAddressDTO[]> {
    const response = await this.axios.get<UUAddressDTO[]>('/api/UUAddress', {
      params
    });
    return response.data;
  }

  async createOrUpdateAddress(address: UUAddressDTO): Promise<UUAddressDTO> {
    const response = await this.axios.post<UUAddressDTO>(
      '/api/UUAddress',
      address
    );
    return response.data;
  }

  async createAddress(
    address: Omit<UUAddressDTO, 'uuid'>
  ): Promise<UUAddressDTO> {
    const response = await this.axios.post<UUAddressDTO>(
      '/api/UUAddress',
      address
    );
    return response.data;
  }

  async softDeleteAddress(uuid: UUID): Promise<{ success: boolean }> {
    const response = await this.axios.delete<{ success: boolean }>(
      `/api/UUAddress/${uuid}`
    );
    return response.data;
  }

  // ============================================================================
  // AGGREGATE OPERATIONS
  // ============================================================================

  async searchAggregates(
    searchParams: AggregateFindDTO
  ): Promise<PageAggregateEntity> {
    const response = await this.axios.post<PageAggregateEntity>(
      '/api/Aggregate/search',
      searchParams
    );
    return response.data;
  }

  async createAggregates(
    aggregates: AggregateCreateDTO
  ): Promise<AggregateEntity[]> {
    const response = await this.axios.post<AggregateEntity[]>(
      '/api/Aggregate',
      aggregates
    );
    return response.data;
  }

  async importAggregates(
    aggregates: AggregateCreateDTO
  ): Promise<ApiResponse<void>> {
    const response = await this.axios.post<void>(
      '/api/Aggregate/Import',
      aggregates
    );
    return {
      data: undefined,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as any
    };
  }

  // ============================================================================
  // FILE WORKFLOW METHODS
  // ============================================================================

  /**
   * Upload a file by external URL reference
   * Creates file record and links it to a parent object
   */
  async uploadFileByReference(input: {
    fileReference: string;
    uuidToAttach: UUID;
    label?: string;
    fileName?: string;
    contentType?: string;
    size?: number;
  }): Promise<ApiResponse<UUFileDTO | null>> {
    if (!this.registryClient) {
      throw new Error('Registry client not available for UUID operations');
    }

    try {
      // 1. Create UUID for the file
      const uuidResponse = await this.registryClient.createUUID();
      const fileUuid = uuidResponse.uuid;

      // 2. Create UUFile record with provided data (metadata only)
      const fileRecord: UUFileDTO = {
        uuid: fileUuid,
        fileReference: input.fileReference,
        fileName: input.fileName,
        label: input.label,
        contentType: input.contentType,
        size: input.size
      };

      // Create the file record via /api/UUFile
      const created = await this.createOrUpdateFile(fileRecord);

      // 3. Create statement to link file to parent object
      await this.createStatement({
        subject: input.uuidToAttach,
        predicate: Predicate.HAS_FILE,
        object: fileUuid
      });

      return {
        data: created,
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
   * Complete flow:
   * 1) Create UUID for the file
   * 2) POST binary to /api/UUFile/upload with uuidFile and uuidToAttach
   * 3) Create statement to link file to parent object
   */
  async uploadFileDirect(input: {
    file: File | Blob;
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

      // 2. Upload the binary content to /api/UUFile/upload
      const uploadedFile = await this.uploadFileBinary(
        fileUuid,
        input.uuidToAttach,
        input.file
      );

      // 3. Create statement to link file to parent object
      await this.createStatement({
        subject: input.uuidToAttach,
        predicate: Predicate.HAS_FILE,
        object: fileUuid
      });

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
  // PROPERTY WORKFLOW METHODS
  // ============================================================================

  async addPropertyToObject(
    objectUuid: UUID,
    property: Partial<UUPropertyDTO> & { key: string }
  ): Promise<ApiResponse<UUPropertyDTO>> {
    if (!this.registryClient) {
      throw new Error('Registry client not available');
    }

    // Simple validation
    const validatedObjectUuid = z.string().uuid().parse(objectUuid);

    let propertyWithUuid: UUPropertyDTO;
    if (property.uuid) {
      propertyWithUuid = property as UUPropertyDTO;
    } else {
      const { uuid } = await this.registryClient.createUUID();
      propertyWithUuid = { ...property, uuid } as UUPropertyDTO;
    }

    const createdProperty = await this.createProperty(propertyWithUuid);
    await this.createStatement({
      subject: validatedObjectUuid,
      predicate: Predicate.HAS_PROPERTY,
      object: createdProperty.uuid
    });
    await this.createStatement({
      subject: createdProperty.uuid,
      predicate: Predicate.IS_PROPERTY_OF,
      object: validatedObjectUuid
    });

    return { data: createdProperty, status: 200, statusText: 'OK' };
  }

  async getPropertiesForObject(
    objectUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUPropertyDTO[]>> {
    const statements = await this.getStatements({
      subject: objectUuid,
      predicate: Predicate.HAS_PROPERTY,
      ...params
    });
    if (!statements.length) {
      return { data: [], status: 200, statusText: 'OK' };
    }

    const properties: UUPropertyDTO[] = [];
    for (const statement of statements) {
      try {
        const p = await this.getProperties({
          uuid: statement.object,
          ...params
        });
        if (p[0]) {
          properties.push(p[0]);
        }
      } catch (e) {}
    }
    return { data: properties, status: 200, statusText: 'OK' };
  }

  async setValueForProperty(
    propertyUuid: UUID,
    value: Partial<UUPropertyValueDTO>
  ): Promise<ApiResponse<UUPropertyValueDTO>> {
    if (!this.registryClient) {
      throw new Error('Registry client not available');
    }

    const validatedPropertyUuid = z.string().uuid().parse(propertyUuid);

    let valueWithUuid: UUPropertyValueDTO;
    if (value.uuid) {
      valueWithUuid = value as UUPropertyValueDTO;
    } else {
      const { uuid } = await this.registryClient.createUUID();
      valueWithUuid = { ...value, uuid } as UUPropertyValueDTO;
    }

    const createdValue = await this.createPropertyValue(valueWithUuid);
    await this.createStatement({
      subject: validatedPropertyUuid,
      predicate: Predicate.HAS_VALUE,
      object: createdValue.uuid
    });
    await this.createStatement({
      subject: createdValue.uuid,
      predicate: Predicate.IS_VALUE_OF,
      object: validatedPropertyUuid
    });

    return { data: createdValue, status: 200, statusText: 'OK' };
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
          // Ignore errors for individual values
        }
      }

      return {
        data: values,
        status: 200,
        statusText: 'OK'
      };
    } catch (error: any) {
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
