import axios, { AxiosInstance } from 'axios';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import {
  AuthLoginResponse,
  JWTAuthResponse,
  EmailPasswordLoginRequest,
  EmailPasswordRegisterRequest
} from '../../types';
import { calculateJWTExpiresIn } from '../../utils/jwt-utils';
import { validateEmailPassword } from '../../validation';

export class UpAuthServiceClient {
  private axiosInstance: AxiosInstance;

  constructor(config: ServiceConfig, _errorHandling: ErrorHandlingConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000
    });
  }

  /**
   * Register a new user with email and password
   * POST /api/auth/up/register?username={email}&password={password}
   */
  async register(request: EmailPasswordRegisterRequest): Promise<string> {
    validateEmailPassword(request.email, request.password);

    const response = await this.axiosInstance.post<string>(
      '/api/auth/up/register',
      null,
      {
        params: {
          username: request.email,
          password: request.password
        }
      }
    );
    return response.data;
  }

  /**
   * Login with email and password
   * POST /api/auth/up/login?username={email}&password={password}
   */
  async login(request: EmailPasswordLoginRequest): Promise<JWTAuthResponse> {
    validateEmailPassword(request.email, request.password);

    const response = await this.axiosInstance.post<AuthLoginResponse>(
      '/api/auth/up/login',
      null,
      {
        params: {
          username: request.email,
          password: request.password
        }
      }
    );

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
}
