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

// Pagination parameters for listing groups
export interface GroupListParams {
  page?: number;
  size?: number;
}

// Paginated response for groups (matches Spring PageImpl)
export interface PageImplGroupFullDTO {
  totalPages: number;
  totalElements: number;
  size: number;
  content: GroupCreateDTO[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable: {
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
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

// Paginated response for group records (matches Spring PageImpl)
export interface PageImplGroupRecord {
  totalPages: number;
  totalElements: number;
  size: number;
  content: GroupRecord[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable: {
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
}
