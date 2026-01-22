import { AxiosInstance } from 'axios';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { RegistryServiceClient } from '../registry/registry-client';
import { UUID, UUObjectDTO, UUPropertyDTO, UUPropertyValueDTO, UUStatementDTO, UUFileDTO, UUAddressDTO, QueryParams, StatementQueryParams, AggregateCreateDTO, AggregateEntity, AggregateFindDTO, PageAggregateEntity, ApiResponse } from '../../types';
export declare class NodeServiceClient {
    private errorHandling;
    private axios;
    private registryClient?;
    constructor(_config: ServiceConfig, errorHandling: ErrorHandlingConfig, axios: AxiosInstance, registryClient?: RegistryServiceClient | undefined);
    getAxios(): AxiosInstance;
    private request;
    getObjects(params?: QueryParams): Promise<UUObjectDTO[]>;
    createOrUpdateObject(object: UUObjectDTO): Promise<UUObjectDTO>;
    createObject(object: Omit<UUObjectDTO, 'uuid'>): Promise<UUObjectDTO>;
    updateObject(object: UUObjectDTO): Promise<UUObjectDTO>;
    softDeleteObject(uuid: UUID): Promise<{
        success: boolean;
    }>;
    getProperties(params?: QueryParams): Promise<UUPropertyDTO[]>;
    createOrUpdateProperty(property: UUPropertyDTO): Promise<UUPropertyDTO>;
    createProperty(property: Omit<UUPropertyDTO, 'uuid'>): Promise<UUPropertyDTO>;
    softDeleteProperty(uuid: UUID): Promise<{
        success: boolean;
    }>;
    getPropertyValues(params?: QueryParams): Promise<UUPropertyValueDTO[]>;
    createOrUpdatePropertyValue(value: UUPropertyValueDTO): Promise<UUPropertyValueDTO>;
    createPropertyValue(value: Omit<UUPropertyValueDTO, 'uuid'>): Promise<UUPropertyValueDTO>;
    softDeletePropertyValue(uuid: UUID): Promise<{
        success: boolean;
    }>;
    getStatements(params?: StatementQueryParams): Promise<UUStatementDTO[]>;
    createStatement(statement: UUStatementDTO): Promise<UUStatementDTO>;
    softDeleteStatement(subject: UUID, predicate: string, object: UUID): Promise<{
        success: boolean;
    }>;
    getFiles(params?: QueryParams): Promise<UUFileDTO[]>;
    uploadFile(file: any, metadata?: Partial<UUFileDTO>): Promise<UUFileDTO>;
    getFile(uuid: UUID): Promise<UUFileDTO>;
    downloadFile(uuid: UUID): Promise<ArrayBuffer>;
    softDeleteFile(uuid: UUID): Promise<{
        success: boolean;
    }>;
    getAddresses(params?: QueryParams): Promise<UUAddressDTO[]>;
    createOrUpdateAddress(address: UUAddressDTO): Promise<UUAddressDTO>;
    createAddress(address: Omit<UUAddressDTO, 'uuid'>): Promise<UUAddressDTO>;
    softDeleteAddress(uuid: UUID): Promise<{
        success: boolean;
    }>;
    searchAggregates(searchParams: AggregateFindDTO): Promise<PageAggregateEntity>;
    createAggregates(aggregates: AggregateCreateDTO): Promise<AggregateEntity[]>;
    importAggregates(aggregates: AggregateCreateDTO): Promise<ApiResponse<void>>;
    /**
     * Upload a file by external URL reference
     * Creates file record and links it to a parent object
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
     * Creates UUID, uploads file, and links to parent object
     */
    uploadFileDirect(input: {
        file: File;
        uuidToAttach: UUID;
        label?: string;
    }): Promise<ApiResponse<UUFileDTO | null>>;
    addPropertyToObject(objectUuid: UUID, property: Partial<UUPropertyDTO> & {
        key: string;
    }): Promise<ApiResponse<UUPropertyDTO>>;
    getPropertiesForObject(objectUuid: UUID, params?: QueryParams): Promise<ApiResponse<UUPropertyDTO[]>>;
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
