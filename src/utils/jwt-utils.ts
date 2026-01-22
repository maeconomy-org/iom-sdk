/**
 * JWT utility functions for token parsing and validation
 */

import { logError } from '../core/logger';

/**
 * Calculate expiry duration from JWT token
 * @param tokenString - JWT token string
 * @returns Expiry duration in seconds (defaults to 3600 if parsing fails)
 */
export function calculateJWTExpiresIn(tokenString: string): number {
  let expiresIn = 3600; // Default 1 hour

  try {
    const parts = tokenString.split('.');
    if (parts.length === 3) {
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

      const decodedPayload =
        typeof atob !== 'undefined'
          ? atob(paddedBase64)
          : Buffer.from(paddedBase64, 'base64').toString('utf-8');

      const jwtPayload = JSON.parse(decodedPayload);
      if (jwtPayload.exp && jwtPayload.iat) {
        expiresIn = jwtPayload.exp - jwtPayload.iat;
      }
    }
  } catch (decodeError) {
    logError(
      'Failed to decode JWT payload for expiry calculation',
      decodeError
    );
  }

  return expiresIn;
}

/**
 * Decode JWT token payload without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWTPayload(token: string): {
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
} | null {
  try {
    // JWT has 3 parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // JWT uses base64url encoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    let decodedPayload: string;

    // Use atob for browser environments
    if (typeof atob !== 'undefined') {
      decodedPayload = atob(paddedBase64);
    } else {
      // For Node.js environments
      decodedPayload = Buffer.from(paddedBase64, 'base64').toString('utf-8');
    }

    const parsed = JSON.parse(decodedPayload);

    // Validate that we have the expected JWT structure
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid JWT payload structure');
    }

    return parsed;
  } catch (error) {
    logError('Failed to decode JWT payload', error);
    return null;
  }
}
