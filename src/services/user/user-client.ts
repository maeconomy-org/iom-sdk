import { AxiosInstance } from 'axios';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { RequestOptions, UserDTO } from '../../types';

export class UserServiceClient {
  private axiosInstance: AxiosInstance;

  constructor(
    _config: ServiceConfig,
    _errorHandling: ErrorHandlingConfig,
    axiosInstance: AxiosInstance
  ) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * Fetch the currently authenticated user's record.
   * GET /api/User
   */
  async getCurrentUser(options?: RequestOptions): Promise<UserDTO> {
    const response = await this.axiosInstance.get<UserDTO>('/api/User', {
      signal: options?.signal
    });
    return response.data;
  }

  /**
   * Look up users by credential identifier (email for UP users, certificate
   * CN or sha256 for X.509 users). Returns an array — empty if no match.
   * GET /api/User/find?identifier=<value>
   */
  async findByIdentifier(
    identifier: string,
    options?: RequestOptions
  ): Promise<UserDTO[]> {
    const response = await this.axiosInstance.get<UserDTO[]>('/api/User/find', {
      params: { identifier },
      signal: options?.signal
    });
    return response.data ?? [];
  }
}
