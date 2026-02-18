/**
 * Group access types (from node.swagger.json)
 */

import { UUID, AuditUser } from './';

// Group permission types
export enum GroupPermission {
  READ = 'READ',
  GROUP_WRITE = 'GROUP_WRITE',
  GROUP_WRITE_RECORDS = 'GROUP_WRITE_RECORDS'
}

// Share group to a specific user
export interface GroupShareToUserDTO {
  userUUID?: UUID;
  permissions: GroupPermission[];
}

// Share group publicly
export interface GroupShareToPublicDTO {
  permissions: GroupPermission[];
}

// Group creation/response DTO
export interface GroupCreateDTO {
  ownerUserUUID?: string;
  groupUUID?: string;
  name: string;
  usersShare?: GroupShareToUserDTO[];
  publicShare?: GroupShareToPublicDTO;
  default?: boolean;
}

// Add records to a group
export interface GroupAddRecordsDTO {
  recordUUIDs: UUID[];
}

// Group record entity (with audit fields)
export interface GroupRecord {
  createdAt?: string;
  createdBy?: AuditUser;
  lastUpdatedAt?: string;
  lastUpdatedBy?: AuditUser;
  softDeletedAt?: string;
  softDeleteBy?: AuditUser;
  softDeleted?: boolean;
  groupUUID?: string;
  recordUUID?: string;
}
