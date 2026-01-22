import { ServiceConfig, ErrorHandlingConfig } from '../../config';
import { JWTAuthResponse } from '../../types';
export declare class AuthServiceClient {
    private axiosInstance;
    constructor(config: ServiceConfig, _errorHandling: ErrorHandlingConfig, certificate?: {
        cert: string;
        key: string;
    });
    login(): Promise<JWTAuthResponse>;
}
