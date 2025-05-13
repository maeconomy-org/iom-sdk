import {
  ApiResponse,
  Predicate,
  UUPropertyValueDTO,
  UUID,
  QueryParams
} from '../types';
import { httpClient } from '../core/http-client';
import * as propertyValueService from '../services/property-value-service';
import * as statementService from '../services/statement-service';
import * as uuidService from '../services/uuid-service';
import { validate } from '../validation/validate';
import { z } from 'zod';

/**
 * Set a value for a property
 * This high-level operation automatically gets a UUID, creates the value,
 * and establishes the relationship with the property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - UUID of the property to set the value for
 * @param value - Value data (UUID will be generated if not provided)
 * @returns The created property value
 */
export const setValueForProperty =
  (client = httpClient) =>
  async (
    propertyUuid: UUID,
    value: Partial<UUPropertyValueDTO>
  ): Promise<ApiResponse<UUPropertyValueDTO>> => {
    // Validate propertyUuid
    const validatedPropertyUuid = validate(z.string().uuid(), propertyUuid);

    // Get UUID if needed
    let valueWithUuid: UUPropertyValueDTO;

    if ('uuid' in value && value.uuid) {
      valueWithUuid = value as UUPropertyValueDTO;
    } else {
      const uuidResponse = await uuidService.createUUID(client)();
      if (!uuidResponse.data?.uuid) {
        throw new Error('Failed to obtain UUID for property value');
      }
      valueWithUuid = {
        ...value,
        uuid: uuidResponse.data.uuid
      } as UUPropertyValueDTO;
    }

    // Create value
    const valueResponse =
      await propertyValueService.createOrUpdatePropertyValue(client)(
        valueWithUuid
      );

    if (valueResponse.data) {
      // Create relationships
      await statementService.createStatement(client)({
        subject: validatedPropertyUuid,
        predicate: Predicate.HAS_VALUE,
        object: valueResponse.data.uuid
      });

      // Create inverse relationship
      await statementService.createStatement(client)({
        subject: valueResponse.data.uuid,
        predicate: Predicate.IS_VALUE_OF,
        object: validatedPropertyUuid
      });
    }

    return valueResponse;
  };

/**
 * Get all values for a property
 *
 * @param client - HTTP client instance
 * @param propertyUuid - UUID of the property to get values for
 * @param params - Query parameters
 * @returns List of values for the property
 */
export const getValuesForProperty =
  (client = httpClient) =>
  async (
    propertyUuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<UUPropertyValueDTO[]>> => {
    // Validate propertyUuid
    const validatedPropertyUuid = validate(z.string().uuid(), propertyUuid);

    // Get value statements
    const statementsResponse = await statementService.findPropertyValues(
      client
    )(validatedPropertyUuid, params);

    if (!statementsResponse.data || statementsResponse.data.length === 0) {
      return {
        data: [],
        status: statementsResponse.status,
        statusText: statementsResponse.statusText,
        headers: statementsResponse.headers
      };
    }

    // Get value details for each statement
    const values: UUPropertyValueDTO[] = [];

    for (const statement of statementsResponse.data) {
      const valueUuid = statement.object;
      const valueResponse = await propertyValueService.getPropertyValueByUuid(
        client
      )(valueUuid, params);

      if (valueResponse.data) {
        values.push(valueResponse.data);
      }
    }

    return {
      data: values,
      status: statementsResponse.status,
      statusText: statementsResponse.statusText,
      headers: statementsResponse.headers
    };
  };
