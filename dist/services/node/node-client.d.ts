/**
 * Node service client for all data operations
 * Handles objects, properties, statements, files, and addresses
 */
import { BaseServiceClient } from '../../core/base-service-client';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { AuthManager } from '../../core/auth-manager';
import { RegistryServiceClient } from '../registry';
import { UUID, UUObjectDTO, UUPropertyDTO, UUPropertyValueDTO, UUStatementDTO, UUFileDTO, UUAddressDTO, QueryParams, StatementQueryParams, AggregateCreateDTO, AggregateEntity, AggregateFindDTO, PageAggregateEntity, ApiResponse } from '../../types';
/**
 * Node service client for all data operations
 */
export declare class NodeServiceClient extends BaseServiceClient {
    private authManager;
    private registryClient?;
    constructor(config: ServiceConfig, errorHandling: ErrorHandlingConfig, authManager: AuthManager, registryClient?: RegistryServiceClient);
    /**
     * Setup authentication interceptor for JWT token injection
     */
    private setupAuthInterceptor;
    /**
     * Get all objects
     */
    getObjects(params?: QueryParams): Promise<UUObjectDTO[]>;
    /**
     * Create or update an object
     */
    createOrUpdateObject(object: UUObjectDTO): Promise<UUObjectDTO>;
    /**
     * Create a new object (without UUID)
     */
    createObject(object: Omit<UUObjectDTO, 'uuid'>): Promise<UUObjectDTO>;
    /**
     * Update an existing object
     */
    updateObject(object: UUObjectDTO): Promise<UUObjectDTO>;
    /**
     * Soft delete an object
     */
    softDeleteObject(uuid: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Get all properties
     */
    getProperties(params?: QueryParams): Promise<UUPropertyDTO[]>;
    /**
     * Create or update a property
     */
    createOrUpdateProperty(property: UUPropertyDTO): Promise<UUPropertyDTO>;
    /**
     * Create a new property (without UUID)
     */
    createProperty(property: Omit<UUPropertyDTO, 'uuid'>): Promise<UUPropertyDTO>;
    /**
     * Soft delete a property
     */
    softDeleteProperty(uuid: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Get all property values
     */
    getPropertyValues(params?: QueryParams): Promise<UUPropertyValueDTO[]>;
    /**
     * Create or update a property value
     */
    createOrUpdatePropertyValue(value: UUPropertyValueDTO): Promise<UUPropertyValueDTO>;
    /**
     * Create a new property value (without UUID)
     */
    createPropertyValue(value: Omit<UUPropertyValueDTO, 'uuid'>): Promise<UUPropertyValueDTO>;
    /**
     * Soft delete a property value
     */
    softDeletePropertyValue(uuid: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Get statements with optional filtering
     */
    getStatements(params?: StatementQueryParams): Promise<UUStatementDTO[]>;
    /**
     * Create a new statement
     */
    createStatement(statement: UUStatementDTO): Promise<UUStatementDTO>;
    /**
     * Soft delete a statement
     */
    softDeleteStatement(subject: UUID, predicate: string, object: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Get all files
     */
    getFiles(params?: QueryParams): Promise<UUFileDTO[]>;
    /**
     * Upload a file
     */
    uploadFile(file: File, metadata?: Partial<UUFileDTO>): Promise<UUFileDTO>;
    /**
     * Get file by UUID
     */
    getFile(uuid: UUID): Promise<UUFileDTO>;
    /**
     * Download file content
     */
    downloadFile(uuid: UUID): Promise<ArrayBuffer>;
    /**
     * Soft delete a file
     */
    softDeleteFile(uuid: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Get all addresses
     */
    getAddresses(params?: QueryParams): Promise<UUAddressDTO[]>;
    /**
     * Create or update an address
     */
    createOrUpdateAddress(address: UUAddressDTO): Promise<UUAddressDTO>;
    /**
     * Create a new address (without UUID)
     */
    createAddress(address: Omit<UUAddressDTO, 'uuid'>): Promise<UUAddressDTO>;
    /**
     * Soft delete an address
     */
    softDeleteAddress(uuid: UUID): Promise<{
        success: boolean;
    }>;
    /**
     * Search aggregates with pagination and filtering
     */
    searchAggregates(searchParams: AggregateFindDTO): Promise<PageAggregateEntity>;
    /**
     * Create aggregate entities
     */
    createAggregates(aggregates: AggregateCreateDTO): Promise<AggregateEntity[]>;
    /**
     * Bulk import aggregate entities
     * Returns only HTTP status (200 for success)
     */
    importAggregates(aggregates: AggregateCreateDTO): Promise<ApiResponse<void>>;
    /**
     * Upload a file by external URL reference
     * This creates a UUFile record with a provided URL and links it to a parent object.
     * Complete workflow: Create UUID → Create file record → Create relationship
     */
    uploadFileByReference(input: {
        fileReference: string;
        uuidToAttach: UUID;
        label?: string;
        fileName?: string;
        contentType?: string;
        size?: number;
    }): Promise<ApiResponse<UUFileDTO | null>>;
    /**
     * Upload a file's binary content directly
     * Complete workflow: Create UUID → Upload file → Create relationship
     */
    uploadFileDirect(input: {
        file: File;
        uuidToAttach: UUID;
        label?: string;
    }): Promise<ApiResponse<UUFileDTO | null>>;
    /**
     * Add a property to an object
     * This high-level operation automatically gets a UUID, creates the property,
     * and establishes the relationship with the object
     * Complete workflow: Validate UUID → Create UUID → Create property → Create relationships
     */
    addPropertyToObject(objectUuid: UUID, property: Partial<UUPropertyDTO> & {
        key: string;
    }): Promise<ApiResponse<UUPropertyDTO>>;
    /**
     * Get all properties for an object
     */
    getPropertiesForObject(objectUuid: UUID, params?: QueryParams): Promise<ApiResponse<UUPropertyDTO[]>>;
    /**
     * Set a value for a property with automatic UUID generation and relationship creation
     * This high-level operation automatically gets a UUID, creates the value,
     * and establishes the relationship with the property
     */
    setValueForProperty(propertyUuid: UUID, value: Partial<UUPropertyValueDTO>): Promise<ApiResponse<UUPropertyValueDTO>>;
    /**
     * Get all values for a property
     */
    getValuesForProperty(propertyUuid: UUID, params?: QueryParams): Promise<ApiResponse<UUPropertyValueDTO[]>>;
    /**
     * Update error handling configuration
     */
    updateErrorHandling(newConfig: ErrorHandlingConfig): void;
}
