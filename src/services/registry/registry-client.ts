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

export class RegistryServiceClient {
  constructor(
    _config: ServiceConfig,
    _errorHandling: ErrorHandlingConfig,
    private axios: AxiosInstance
  ) {}

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
      `/api/UUID/${uuid}/UUIDRecordMeta`,
      meta
    );
    return response.data;
  }
}
