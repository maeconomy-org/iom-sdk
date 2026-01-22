/**
 * Service-related types and DTOs
 */
export type UUID = string;
export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
}
export interface ApiError {
    status: number;
    statusText: string;
    message: string;
    details?: any;
}
export declare enum Predicate {
    IS_PARENT_OF = "IS_PARENT_OF",
    IS_CHILD_OF = "IS_CHILD_OF",
    IS_INPUT_OF = "IS_INPUT_OF",
    IS_OUTPUT_OF = "IS_OUTPUT_OF",
    IS_SOURCE_TEMPLATE_OF = "IS_SOURCE_TEMPLATE_OF",
    IS_TEMPLATE_INSTANCE_OF = "IS_TEMPLATE_INSTANCE_OF",
    IS_PROPERTY_OF = "IS_PROPERTY_OF",
    HAS_PROPERTY = "HAS_PROPERTY",
    IS_VALUE_OF = "IS_VALUE_OF",
    HAS_VALUE = "HAS_VALUE",
    IS_FILE_OF = "IS_FILE_OF",
    HAS_FILE = "HAS_FILE",
    HAS_ADDRESS = "HAS_ADDRESS",
    IS_ADDRESS_OF = "IS_ADDRESS_OF"
}
export interface QueryParams {
    uuid?: UUID;
    softDeleted?: boolean;
}
export interface UUStatementFindDTO {
    subject?: UUID;
    predicate?: Predicate;
    object?: UUID;
    softDeleted?: boolean;
}
export interface StatementQueryParams extends UUStatementFindDTO {
}
export interface UUStatementsPropertyValue {
    value?: string;
}
export interface UUStatementsProperty {
    key?: string;
    values?: UUStatementsPropertyValue[];
}
export interface UUStatementDTO {
    subject: UUID;
    predicate: Predicate;
    object: UUID;
    properties?: UUStatementsProperty[];
}
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
export interface UUPropertyValueDTO {
    uuid: UUID;
    value?: string;
    valueTypeCast?: string;
    sourceType?: string;
}
export interface UUObjectDTO {
    uuid: UUID;
    version?: string;
    name?: string;
    abbreviation?: string;
    description?: string;
    isTemplate?: boolean;
}
export interface UUFileDTO {
    uuid: UUID;
    fileName?: string;
    fileReference?: string;
    label?: string;
    contentType?: string;
    size?: number;
}
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
export interface UUObjectWithProperties {
    object: UUObjectDTO;
    properties: Array<{
        property: UUPropertyDTO;
        value?: UUPropertyValueDTO;
    }>;
    children?: UUObjectDTO[];
    files?: UUFileDTO[];
}
export interface ComplexObjectCreationInput {
    object: Omit<UUObjectDTO, 'uuid'>;
    parents?: UUID[];
    files?: Array<{
        file: Omit<UUFileDTO, 'uuid'>;
    }>;
    properties?: Array<{
        property: Omit<UUPropertyDTO, 'uuid'> & {
            key: string;
        };
        values?: Array<{
            value: Omit<UUPropertyValueDTO, 'uuid'>;
            files?: Array<{
                file: Omit<UUFileDTO, 'uuid'>;
            }>;
        }>;
        files?: Array<{
            file: Omit<UUFileDTO, 'uuid'>;
        }>;
    }>;
    address?: Omit<UUAddressDTO, 'uuid'>;
}
export interface ComplexObjectOutput {
    object: UUObjectDTO;
    properties: Array<{
        property: UUPropertyDTO;
        values: Array<{
            value: UUPropertyValueDTO;
            files: UUFileDTO[];
        }>;
        files: UUFileDTO[];
    }>;
    files: UUFileDTO[];
    address?: UUAddressDTO;
    parents?: UUObjectDTO[];
}
