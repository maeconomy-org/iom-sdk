import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import {
  AuthLoginResponse,
  AuthRefreshTokenResponse,
  JWTAuthResponse,
  RefreshTokenRequest
} from '../../types';
import { calculateJWTExpiresIn } from '../../utils/jwt-utils';

export class AuthServiceClient {
  private axiosInstance: AxiosInstance;
  private refreshAxiosInstance: AxiosInstance;

  constructor(
    config: ServiceConfig,
    _errorHandling: ErrorHandlingConfig,
    certificate?: { cert: string; key: string }
  ) {
    const axiosConfig: any = {
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000
    };

    if (certificate) {
      axiosConfig.httpsAgent = new https.Agent({
        cert: certificate.cert,
        key: certificate.key,
        rejectUnauthorized: true
      });
    }

    this.axiosInstance = axios.create(axiosConfig);

    // Create separate instance for refresh token (without certificate)
    const refreshAxiosConfig: any = {
      baseURL: config.refreshBaseUrl || config.baseUrl,
      timeout: config.timeout || 30000
    };

    this.refreshAxiosInstance = axios.create(refreshAxiosConfig);
  }

  async login(): Promise<JWTAuthResponse> {
    const response =
      await this.axiosInstance.get<AuthLoginResponse>('/api/auth/login');
    const { accessToken, refreshToken, user } = response.data;

    const tokenString = accessToken.trim();
    const expiresIn = calculateJWTExpiresIn(tokenString);

    return {
      token: tokenString,
      expiresIn,
      tokenType: 'Bearer',
      refreshToken,
      user
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthRefreshTokenResponse> {
    const payload: RefreshTokenRequest = { refreshToken };
    const response =
      await this.refreshAxiosInstance.post<AuthRefreshTokenResponse>(
        '/api/auth/refreshToken',
        payload
      );

    return response.data;
  }
}
