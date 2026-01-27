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

export class RegistryServiceClient {
  constructor(
    _config: ServiceConfig,
    _errorHandling: ErrorHandlingConfig,
    private axios: AxiosInstance
  ) {}

  async getOwnedUUIDs(): Promise<UUIDRecord[]> {
    const response = await this.axios.get<UUIDRecord[]>('/api/UUID/own');
    return response.data;
  }

  async createUUID(): Promise<UUIDCreationResponse> {
    const response = await this.axios.post<UUIDCreationResponse>('/api/UUID');
    return response.data;
  }

  async getUUIDRecord(uuid: UUID): Promise<UUIDRecord> {
    const response = await this.axios.get<UUIDRecord>(`/api/UUID/${uuid}`);
    return response.data;
  }

  async updateUUIDRecordMeta(
    uuid: UUID,
    meta: Record<string, any>
  ): Promise<UUIDRecord> {
    const response = await this.axios.put<UUIDRecord>(
      `/api/UUID/UUIDRecordMeta`,
      meta
    );
    return response.data;
  }

  async authorizeUUIDRecord(
    params: UUIDAuthParams
  ): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(
      `/api/UUID/authorize`,
      {
        userUUID: params.userUUID,
        resourceId: params.resourceId
      }
    );
    return response.data;
  }
}
