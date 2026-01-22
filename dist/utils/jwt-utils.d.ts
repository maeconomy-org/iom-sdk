/**
 * JWT utility functions for token parsing and validation
 */
/**
 * Calculate expiry duration from JWT token
 * @param tokenString - JWT token string
 * @returns Expiry duration in seconds (defaults to 3600 if parsing fails)
 */
export declare function calculateJWTExpiresIn(tokenString: string): number;
/**
 * Decode JWT token payload without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export declare function decodeJWTPayload(token: string): {
    userUUID?: string;
    credentials?: string;
    createdAt?: number;
    authorities?: string[];
    certificateInfo?: {
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
        validFrom: number;
        validTo: number;
        subjectAlternativeNames: string[];
    };
    enabled?: boolean;
    accountNonExpired?: boolean;
    credentialsNonExpired?: boolean;
    accountNonLocked?: boolean;
    iat?: number;
    exp?: number;
    [key: string]: any;
} | null;
