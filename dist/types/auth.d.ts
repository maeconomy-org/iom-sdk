/**
 * Authentication-related types
 */
export interface JWTToken {
    token: string;
    expiresAt: Date;
    issuedAt: Date;
}
export interface JWTAuthResponse {
    token: string;
    expiresIn: number;
    tokenType: string;
    user?: AuthResponse;
}
export interface TokenRefreshConfig {
    refreshThresholdMinutes?: number;
    maxRetries?: number;
    retryDelayMs?: number;
}
export interface AuthState {
    token?: JWTToken;
    user?: AuthResponse;
    isAuthenticated: boolean;
    isRefreshing: boolean;
    lastAuthError?: string;
}
/**
 * User details returned from mTLS authentication endpoint
 * Based on actual API response structure with certificate information
 */
export interface AuthResponse {
    userUUID: string;
    credentials: string;
    createdAt: string;
    authorities: string[];
    certificateInfo: {
        certificateSha256: string;
        subjectFields: {
            CN: string;
            [key: string]: string;
        };
        issuerFields: {
            CN: string;
            [key: string]: string;
        };
        serialNumber: string;
        validFrom: string;
        validTo: string;
        subjectAlternativeNames: string[];
    };
    enabled: boolean;
    accountNonExpired: boolean;
    credentialsNonExpired: boolean;
    accountNonLocked: boolean;
}
/**
 * Auth login payload containing user details and access token
 */
export interface AuthLoginResponse {
    user: AuthResponse;
    accessToken: string;
}
