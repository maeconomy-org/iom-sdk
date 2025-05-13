import {
  ApiResponse,
  Predicate,
  UUPropertyDTO,
  UUID,
  QueryParams
} from '../types';
import { httpClient } from '../core/http-client';
import * as propertyService from '../services/property-service';
import * as statementService from '../services/statement-service';
import * as uuidService from '../services/uuid-service';
import { validate } from '../validation/validate';
import { z } from 'zod';

/**
 * Add a property to an object
 * This high-level operation automatically gets a UUID, creates the property,
 * and establishes the relationship with the object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to add the property to
 * @param property - Property data (UUID will be generated if not provided)
 * @returns The created property
 */
export const addPropertyToObject =
  (client = httpClient) =>
  async (
    objectUuid: UUID,
    property: Partial<UUPropertyDTO> & { key: string }
  ): Promise<ApiResponse<UUPropertyDTO>> => {
    // Validate objectUuid
    const validatedObjectUuid = validate(z.string().uuid(), objectUuid);

    // Get UUID if needed
    let propertyWithUuid: UUPropertyDTO;

    if ('uuid' in property && property.uuid) {
      propertyWithUuid = property as UUPropertyDTO;
    } else {
      const uuidResponse = await uuidService.createUUID(client)();
      if (!uuidResponse.data?.uuid) {
        throw new Error('Failed to obtain UUID for property');
      }
      propertyWithUuid = {
        ...property,
        uuid: uuidResponse.data.uuid
      } as UUPropertyDTO;
    }

    // Create property
    const propertyResponse =
      await propertyService.createOrUpdateProperty(client)(propertyWithUuid);

    if (propertyResponse.data) {
      // Create relationships
      await statementService.createStatement(client)({
        subject: validatedObjectUuid,
        predicate: Predicate.HAS_PROPERTY,
        object: propertyResponse.data.uuid
      });

      // Create inverse relationship
      await statementService.createStatement(client)({
        subject: propertyResponse.data.uuid,
        predicate: Predicate.IS_PROPERTY_OF,
        object: validatedObjectUuid
      });
    }

    return propertyResponse;
  };

/**
 * Get all properties for an object
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object to get properties for
 * @param params - Query parameters
 * @returns List of properties for the object
 */
export const getPropertiesForObject =
  (client = httpClient) =>
  async (
    objectUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUPropertyDTO[]>> => {
    // Validate objectUuid
    const validatedObjectUuid = validate(z.string().uuid(), objectUuid);

    // Get property statements
    const statementsResponse = await statementService.findProperties(client)(
      validatedObjectUuid,
      params
    );

    if (!statementsResponse.data || statementsResponse.data.length === 0) {
      return {
        data: [],
        status: statementsResponse.status,
        statusText: statementsResponse.statusText,
        headers: statementsResponse.headers
      };
    }

    // Get property details for each statement
    const properties: UUPropertyDTO[] = [];

    for (const statement of statementsResponse.data) {
      const propertyUuid = statement.object;
      const propertyResponse = await propertyService.getPropertyByUuid(client)(
        propertyUuid,
        params
      );

      if (propertyResponse.data) {
        properties.push(propertyResponse.data);
      }
    }

    return {
      data: properties,
      status: statementsResponse.status,
      statusText: statementsResponse.statusText,
      headers: statementsResponse.headers
    };
  };
