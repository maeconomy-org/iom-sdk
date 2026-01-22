/**
 * Auth service client for mTLS authentication
 * Handles login and token acquisition from the auth service
 */
import { BaseServiceClient } from '../../core/base-service-client';
import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { JWTAuthResponse } from '../../types';
/**
 * Auth service client for mTLS authentication
 */
export declare class AuthServiceClient extends BaseServiceClient {
    constructor(config: ServiceConfig, errorHandling: ErrorHandlingConfig, certificate?: {
        cert: string;
        key: string;
    });
    /**
     * Perform mTLS login to get JWT token
     * Expects AuthLoginResponse with user details and accessToken
     */
    login(): Promise<JWTAuthResponse>;
    /**
     * Update error handling configuration
     */
    updateErrorHandling(newConfig: ErrorHandlingConfig): void;
}
