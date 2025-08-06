import { ApiResponse, UUAddressDTO, UUID, QueryParams } from '@/types';
import { httpClient, logError } from '@/core';
import {
  validateQueryParams,
  validateUuid,
  validate,
  addressDTOSchema
} from '@/validation';

const basePath = '/api/UUAddress';

/**
 * Get addresses with optional filtering
 * This unified function handles all address retrieval scenarios including by UUID
 *
 * @param client - HTTP client instance
 * @param params - Query parameters for filtering (uuid, softDeleted, createdBy)
 * @returns List of addresses matching the criteria, or single address if uuid is provided
 */
export const getAddresses =
  (client = httpClient) =>
  async (params?: QueryParams): Promise<ApiResponse<UUAddressDTO[]>> => {
    try {
      const cleanParams = validateQueryParams(params);
      return await client.get<UUAddressDTO[]>(basePath, cleanParams);
    } catch (error: any) {
      logError('getAddresses', error);
      throw error;
    }
  };

/**
 * Create a new address (generates UUID automatically)
 *
 * @param client - HTTP client instance
 * @param address - The address data (without UUID)
 * @returns The created address with generated UUID
 */
export const createAddress =
  (client = httpClient) =>
  async (
    address: Omit<UUAddressDTO, 'uuid'>
  ): Promise<ApiResponse<UUAddressDTO>> => {
    try {
      // Import uuid service here to avoid circular dependencies
      const { createUUID } = await import('./uuid-service');

      // Generate UUID for the address
      const uuidResponse = await createUUID(client)();
      if (!uuidResponse.data?.uuid) {
        throw new Error('Failed to generate UUID for address');
      }

      // Create address with generated UUID
      const addressWithUuid: UUAddressDTO = {
        uuid: uuidResponse.data.uuid,
        ...address
      };

      // Validate address data
      const validatedAddress = validate(addressDTOSchema, addressWithUuid);

      return await client.post<UUAddressDTO>(basePath, validatedAddress);
    } catch (error: any) {
      logError('createAddress', error);
      throw error;
    }
  };

/**
 * Update an existing address
 *
 * @param client - HTTP client instance
 * @param address - The address to update (must include UUID)
 * @returns The updated address
 */
export const updateAddress =
  (client = httpClient) =>
  async (address: UUAddressDTO): Promise<ApiResponse<UUAddressDTO>> => {
    try {
      // Validate address data
      const validatedAddress = validate(addressDTOSchema, address);

      return await client.post<UUAddressDTO>(basePath, validatedAddress);
    } catch (error: any) {
      logError('updateAddress', error);
      throw error;
    }
  };

/**
 * Create an address for an object and establish the relationship
 * This is a convenience method that combines address creation with statement creation
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to associate the address with
 * @param addressData - Address data (without UUID, will be generated)
 * @returns The created address and relationship statement
 */
export const createAddressForObject =
  (client = httpClient) =>
  async (
    objectUuid: string,
    addressData: Omit<UUAddressDTO, 'uuid'>
  ): Promise<
    ApiResponse<{
      address: UUAddressDTO;
      statement: any;
    }>
  > => {
    try {
      // Import statement service to avoid circular dependencies
      const { createStatement } = await import('./statement-service');
      // Import predicate
      const { Predicate } = await import('@/types');

      // Create the address (UUID will be auto-generated)
      const addressResponse = await createAddress(client)(addressData);

      if (!addressResponse.data) {
        throw new Error('Failed to create address');
      }

      // Create the relationship statement (object HAS_ADDRESS address)
      const statement = {
        subject: objectUuid,
        predicate: Predicate.HAS_ADDRESS,
        object: addressResponse.data.uuid
      };

      const statementResponse = await createStatement(client)(statement);

      return {
        data: {
          address: addressResponse.data,
          statement: statementResponse.data
        },
        status: addressResponse.status,
        statusText: addressResponse.statusText,
        headers: addressResponse.headers
      };
    } catch (error: any) {
      logError('createAddressForObject', error);
      throw error;
    }
  };

/**
 * Soft delete an address by UUID
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the address to soft delete
 * @returns The API response
 */
export const softDeleteAddress =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<any>> => {
    try {
      // Validate UUID
      const validatedUuid = validateUuid(uuid);

      return await client.delete<any>(`${basePath}/${validatedUuid}`);
    } catch (error: any) {
      logError('softDeleteAddress', error);
      throw error;
    }
  };
