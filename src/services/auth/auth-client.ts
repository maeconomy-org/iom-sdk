/**
 * Auth service client for mTLS authentication
 * Handles login and token acquisition from the auth service
 */

import { BaseServiceClient } from '../../core/base-service-client';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { AuthLoginResponse, JWTAuthResponse } from '../../types';
import { logError } from '../../core/logger';
import { calculateJWTExpiresIn } from '../../utils/jwt-utils';

/**
 * Auth service client for mTLS authentication
 */
export class AuthServiceClient extends BaseServiceClient {
  constructor(
    config: ServiceConfig,
    errorHandling: ErrorHandlingConfig,
    certificate?: { cert: string; key: string }
  ) {
    super(config, errorHandling, 'auth', certificate);
  }

  /**
   * Perform mTLS login to get JWT token
   * Expects AuthLoginResponse with user details and accessToken
   */
  async login(): Promise<JWTAuthResponse> {
    try {
      const response = await this.get<AuthLoginResponse>('/api/auth/login');
      const { accessToken, user } = response.data;

      const tokenString = accessToken.trim();
      const expiresIn = calculateJWTExpiresIn(tokenString);

      return {
        token: tokenString,
        expiresIn,
        tokenType: 'Bearer',
        user
      };
    } catch (error: any) {
      logError('Login failed', error);
      throw error;
    }
  }

  /**
   * Update error handling configuration
   */
  updateErrorHandling(newConfig: ErrorHandlingConfig): void {
    this.errorHandling = newConfig;
  }
}
