import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { AuthRefreshTokenResponse, JWTAuthResponse } from '../../types';
export declare class AuthServiceClient {
    private axiosInstance;
    private refreshAxiosInstance;
    constructor(config: ServiceConfig, _errorHandling: ErrorHandlingConfig, certificate?: {
        cert: string;
        key: string;
    });
    login(): Promise<JWTAuthResponse>;
    refreshToken(refreshToken: string): Promise<AuthRefreshTokenResponse>;
}
