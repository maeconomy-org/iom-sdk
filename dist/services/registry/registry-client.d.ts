import { AxiosInstance } from 'axios';
import { UUID } from '@/types';
import { ServiceConfig, ErrorHandlingConfig } from '@/config';
export interface UUIDRecord {
    uuid: string;
    createdAt: string;
    createdBy: string;
    lastUpdatedAt: string;
    lastUpdatedBy: string;
    softDeleted: boolean;
    softDeletedAt?: string;
    softDeleteBy?: string;
    meta?: Record<string, any>;
}
export interface UUIDCreationResponse {
    uuid: string;
}
export interface UUIDAuthParams {
    uuid: string;
    userUUID: string;
    resourceId: string;
}
export declare class RegistryServiceClient {
    private axios;
    constructor(_config: ServiceConfig, _errorHandling: ErrorHandlingConfig, axios: AxiosInstance);
    getOwnedUUIDs(): Promise<UUIDRecord[]>;
    createUUID(): Promise<UUIDCreationResponse>;
    getUUIDRecord(uuid: UUID): Promise<UUIDRecord>;
    updateUUIDRecordMeta(uuid: UUID, meta: Record<string, any>): Promise<UUIDRecord>;
    authorizeUUIDRecord(params: UUIDAuthParams): Promise<{
        success: boolean;
    }>;
}
