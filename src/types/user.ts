/**
 * User service types
 *
 * The user service exposes read-only lookups for user accounts. Separate from
 * `AuthResponse` (which models the auth-service login payload) to keep the two
 * concerns independent — the fields overlap but the contracts don't.
 */

export interface UserCertificateInfo {
  certificateSha256: string;
  issuerFields?: Record<string, string>;
  subjectFields?: Record<string, string>;
  serialNumber?: string;
  subjectAlternativeNames?: string[];
  validFrom?: string;
  validTo?: string;
}

export type UserIdentifierType =
  | 'UserAuthUP'
  | 'UserAuthX509Certificate'
  | string;

export interface UserDTO {
  userUUID: string;
  createdAt: string;
  username?: string;
  identifier: string;
  identifierType: UserIdentifierType;
  certificateInfo?: UserCertificateInfo;
}
