import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { JWTAuthResponse, EmailPasswordLoginRequest, EmailPasswordRegisterRequest } from '../../types';
export declare class UpAuthServiceClient {
    private axiosInstance;
    constructor(config: ServiceConfig, _errorHandling: ErrorHandlingConfig);
    /**
     * Register a new user with email and password
     * POST /api/auth/up/register?username={email}&password={password}
     */
    register(request: EmailPasswordRegisterRequest): Promise<string>;
    /**
     * Login with email and password
     * POST /api/auth/up/login?username={email}&password={password}
     */
    login(request: EmailPasswordLoginRequest): Promise<JWTAuthResponse>;
}
