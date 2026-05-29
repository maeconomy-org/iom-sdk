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
