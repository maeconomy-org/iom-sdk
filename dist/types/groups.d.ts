/**
 * Group access types (from node.swagger.json)
 */
import { UUID, AuditUser } from './';
export declare enum GroupPermission {
    READ = "READ",
    GROUP_WRITE = "GROUP_WRITE",
    GROUP_WRITE_RECORDS = "GROUP_WRITE_RECORDS"
}
export interface GroupShareToUserDTO {
    userUUID?: UUID;
    permissions: GroupPermission[];
}
export interface GroupShareToPublicDTO {
    permissions: GroupPermission[];
}
export interface GroupCreateDTO {
    ownerUserUUID?: string;
    groupUUID?: string;
    name: string;
    usersShare?: GroupShareToUserDTO[];
    publicShare?: GroupShareToPublicDTO;
    default?: boolean;
}
export interface GroupAddRecordsDTO {
    recordUUIDs: UUID[];
}
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
