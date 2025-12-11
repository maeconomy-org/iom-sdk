import { ClientConfig, UUID, QueryParams, UUObjectDTO, UUPropertyDTO, UUPropertyValueDTO, UUFileDTO, UUStatementDTO, ComplexObjectCreationInput, AggregateFindDTO, AggregateCreateDTO, StatementQueryParams, UUAddressDTO } from './types';
/**
 * Initialize the client with the given configuration
 *
 * @param config - Client configuration including baseUrl and optional certificate
 */
export declare const initializeClient: (config: ClientConfig) => void;
export declare const createClient: (config: ClientConfig) => {
    debug: {
        /**
         * Enable or disable debug mode at runtime
         */
        configure: (options: ClientConfig["debug"]) => void;
    };
    auth: {
        requestBaseAuth: () => Promise<import("./types").ApiResponse<import("./types").AuthResponse | null>>;
        requestUuidAuth: () => Promise<import("./types").ApiResponse<import("./types").AuthResponse | null>>;
    };
    aggregate: {
        findByUUID: (uuid: UUID) => Promise<import("./types").ApiResponse<import("./types").AggregateEntity[] | null>>;
        getAggregateEntities: (params?: AggregateFindDTO) => Promise<import("./types").ApiResponse<import("./types").PageAggregateEntity>>;
        createAggregateObject: (data: AggregateCreateDTO) => Promise<import("./types").ApiResponse<any>>;
        importAggregateObjects: (data: AggregateCreateDTO) => Promise<import("./types").ApiResponse<any>>;
    };
    objects: {
        create: (object: UUObjectDTO) => Promise<import("./types").ApiResponse<UUObjectDTO>>;
        createFullObject: (objectData: ComplexObjectCreationInput) => Promise<import("./types").ApiResponse<import("./types").ComplexObjectOutput | null>>;
        getObjects: (params?: QueryParams) => Promise<import("./types").ApiResponse<UUObjectDTO[]>>;
        delete: (uuid: UUID) => Promise<import("./types").ApiResponse<any>>;
    };
    properties: {
        addToObject: (objectUuid: UUID, property: Partial<UUPropertyDTO> & {
            key: string;
        }) => Promise<import("./types").ApiResponse<UUPropertyDTO>>;
        create: (property: UUPropertyDTO) => Promise<import("./types").ApiResponse<UUPropertyDTO>>;
        getProperties: (params?: QueryParams) => Promise<import("./types").ApiResponse<UUPropertyDTO[]>>;
        getPropertyByKey: (key: string, params?: QueryParams) => Promise<import("./types").ApiResponse<UUPropertyDTO | null>>;
        delete: (uuid: UUID) => Promise<import("./types").ApiResponse<any>>;
    };
    values: {
        setForProperty: (propertyUuid: UUID, value: Partial<UUPropertyValueDTO>) => Promise<import("./types").ApiResponse<UUPropertyValueDTO>>;
        create: (value: UUPropertyValueDTO) => Promise<import("./types").ApiResponse<UUPropertyValueDTO>>;
        getPropertyValues: (params?: QueryParams) => Promise<import("./types").ApiResponse<UUPropertyValueDTO[]>>;
        delete: (uuid: UUID) => Promise<import("./types").ApiResponse<any>>;
    };
    files: {
        create: (file: UUFileDTO) => Promise<import("./types").ApiResponse<UUFileDTO>>;
        getFiles: (params?: QueryParams) => Promise<import("./types").ApiResponse<UUFileDTO[]>>;
        delete: (uuid: UUID) => Promise<import("./types").ApiResponse<any>>;
        uploadByReference: (input: {
            fileReference: string;
            uuidToAttach: UUID;
            label?: string;
        }) => Promise<import("./types").ApiResponse<UUFileDTO | null>>;
        uploadDirect: (input: {
            file: File | Blob | ArrayBuffer | FormData;
            uuidToAttach: UUID;
        }) => Promise<import("./types").ApiResponse<UUFileDTO | null>>;
        uploadFormData: (input: {
            formData: FormData;
            uuidFile: UUID;
            uuidToAttach: UUID;
        }) => Promise<import("./types").ApiResponse<any>>;
        download: (uuid: UUID) => Promise<import("./types").ApiResponse<ArrayBuffer>>;
    };
    statements: {
        getStatements: (params?: StatementQueryParams) => Promise<import("./types").ApiResponse<UUStatementDTO[]>>;
        create: (statement: UUStatementDTO) => Promise<import("./types").ApiResponse<UUStatementDTO>>;
        delete: (statement: UUStatementDTO) => Promise<import("./types").ApiResponse<any>>;
    };
    uuid: {
        create: () => Promise<import("./types").ApiResponse<{
            uuid: UUID;
        }>>;
        getOwned: () => Promise<import("./types").ApiResponse<any>>;
        getRecord: (uuid: UUID) => Promise<import("./types").ApiResponse<any>>;
        updateRecordMeta: (params: {
            uuid?: UUID;
            nodeType: string;
        }) => Promise<import("./types").ApiResponse<any>>;
        authorize: (params: {
            userUUID: UUID;
            resourceId: UUID;
        }) => Promise<import("./types").ApiResponse<any>>;
    };
    addresses: {
        create: (address: Omit<UUAddressDTO, "uuid">) => Promise<import("./types").ApiResponse<UUAddressDTO>>;
        update: (address: UUAddressDTO) => Promise<import("./types").ApiResponse<UUAddressDTO>>;
        get: (params?: QueryParams) => Promise<import("./types").ApiResponse<UUAddressDTO[]>>;
        delete: (uuid: UUID) => Promise<import("./types").ApiResponse<any>>;
        createForObject: (objectUuid: UUID, address: Omit<UUAddressDTO, "uuid">) => Promise<import("./types").ApiResponse<{
            address: UUAddressDTO;
            statement: any;
        }>>;
    };
};
