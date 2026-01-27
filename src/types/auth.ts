/**
 * Authentication-related types
 */

// JWT Token interface for authentication
export interface JWTToken {
  token: string;
  expiresAt: Date;
  issuedAt: Date;
}

// JWT Authentication response from auth service
export interface JWTAuthResponse {
  token: string;
  expiresIn: number; // seconds until expiry
  tokenType: string; // typically "Bearer"
  user?: AuthResponse;
  refreshToken: string; // refresh token for token renewal
}

// Token refresh configuration
export interface TokenRefreshConfig {
  refreshThresholdMinutes?: number; // Default: 5 minutes before expiry
  maxRetries?: number; // Default: 3
  retryDelayMs?: number; // Default: 1000ms
}

// Authentication state for token management
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
  refreshToken: string;
}

/**
 * Auth login payload containing user details and access token
 */
export interface AuthRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token request payload
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token error response (403 when expired)
 */
export interface RefreshTokenError {
  detail: string;
  status: number;
  title: string;
  errors: Record<string, any>;
}
