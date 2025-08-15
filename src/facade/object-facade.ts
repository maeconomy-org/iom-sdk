import { httpClient, logError } from '@/core';
import * as objectService from '@/services/object-service';
import * as statementService from '@/services/statement-service';
import * as propertyService from '@/services/property-service';
import * as propertyValueService from '@/services/property-value-service';
import * as fileService from '@/services/file-service';
import * as addressService from '@/services/address-service';
import * as uuidService from '@/services/uuid-service';
import { validate, complexObjectCreationSchema } from '@/validation';
import {
  ApiResponse,
  ComplexObjectCreationInput,
  ComplexObjectOutput,
  Predicate,
  UUFileDTO,
  UUObjectDTO,
  UUPropertyDTO,
  UUPropertyValueDTO,
  UUAddressDTO,
  UUStatementDTO
} from '@/types';

/**
 * Create a complex object with multiple properties, multiple values per property,
 * and files attached to the object, properties, and values.
 * This high-level operation handles creating the complete object hierarchy in a single function call.
 *
 * @param client - HTTP client instance
 * @param objectData - The complex object data including properties, values, files, and optional parents
 * @returns The created complex object with all its relationships
 */
export const createFullObject =
  (client = httpClient) =>
  async (
    objectData: ComplexObjectCreationInput
  ): Promise<ApiResponse<ComplexObjectOutput | null>> => {
    try {
      // Validate input
      const validatedObjectData = validate(
        complexObjectCreationSchema,
        objectData
      );

      // Process object creation step by step
      const processedProperties: Array<{
        property: UUPropertyDTO;
        values: Array<{
          value: UUPropertyValueDTO;
          files: UUFileDTO[];
        }>;
        files: UUFileDTO[];
      }> = [];

      const parentObjects: UUObjectDTO[] = [];
      let createdAddress: UUAddressDTO | undefined;

      // 1. Create the object first
      // Get a UUID for the object
      const objectUuidResponse = await uuidService.createUUID(client)();
      if (!objectUuidResponse.data?.uuid) {
        throw new Error('Failed to obtain UUID for object');
      }

      const objectWithUuid = {
        ...validatedObjectData.object,
        uuid: objectUuidResponse.data.uuid
      } as UUObjectDTO;

      const objectResponse =
        await objectService.createOrUpdateObject(client)(objectWithUuid);

      if (!objectResponse.data) {
        throw new Error('Failed to create object');
      }

      const createdObject = objectResponse.data;
      const objectUuid = createdObject.uuid;

      // 2. Establish parent relationships if parents are provided
      if (
        validatedObjectData.parents &&
        validatedObjectData.parents.length > 0
      ) {
        for (const parentUuid of validatedObjectData.parents) {
          // Get parent object details
          const parentResponse = await objectService.getObjects(client)({
            uuid: parentUuid
          });

          if (parentResponse.data && parentResponse.data.length > 0) {
            parentObjects.push(parentResponse.data[0]);

            // Create parent-child relationships
            await statementService.createStatement(client)({
              subject: parentUuid,
              predicate: Predicate.IS_PARENT_OF,
              object: objectUuid
            });

            await statementService.createStatement(client)({
              subject: objectUuid,
              predicate: Predicate.IS_CHILD_OF,
              object: parentUuid
            });
          }
        }
      }

      if (validatedObjectData.address) {
        // Create the address (UUID will be auto-generated)
        const addressResponse = await addressService.createAddress(client)(
          validatedObjectData.address
        );

        if (addressResponse.data) {
          // Create the relationship statement (object HAS_ADDRESS address)
          const addressStatement: UUStatementDTO = {
            subject: objectUuid,
            predicate: Predicate.HAS_ADDRESS,
            object: addressResponse.data.uuid
          };

          await statementService.createStatement(client)(addressStatement);

          // Store the created address for return data
          createdAddress = addressResponse.data;
        }
      }

      // 3. Process object files
      const objectFiles: UUFileDTO[] = [];

      if (validatedObjectData.files && validatedObjectData.files.length > 0) {
        for (const fileData of validatedObjectData.files) {
          // Get a UUID for the file
          const fileUuidResponse = await uuidService.createUUID(client)();
          if (!fileUuidResponse.data?.uuid) {
            continue; // Skip if we can't get a UUID
          }

          const fileWithUuid = {
            ...fileData.file,
            uuid: fileUuidResponse.data.uuid
          } as UUFileDTO;

          // Create file
          const fileResponse =
            await fileService.createOrUpdateFile(client)(fileWithUuid);

          if (fileResponse.data) {
            objectFiles.push(fileResponse.data);

            // Create relationships
            await statementService.createStatement(client)({
              subject: objectUuid,
              predicate: Predicate.HAS_FILE,
              object: fileResponse.data.uuid
            });

            await statementService.createStatement(client)({
              subject: fileResponse.data.uuid,
              predicate: Predicate.IS_FILE_OF,
              object: objectUuid
            });
          }
        }
      }

      // 4. Process properties and their values and files
      if (
        validatedObjectData.properties &&
        validatedObjectData.properties.length > 0
      ) {
        for (const propertyData of validatedObjectData.properties) {
          // Get a UUID for the property
          const propertyUuidResponse = await uuidService.createUUID(client)();
          if (!propertyUuidResponse.data?.uuid) {
            continue; // Skip if we can't get a UUID
          }

          const propertyWithUuid = {
            ...propertyData.property,
            uuid: propertyUuidResponse.data.uuid
          } as UUPropertyDTO;

          // Create property
          const propertyResponse =
            await propertyService.createOrUpdateProperty(client)(
              propertyWithUuid
            );

          if (propertyResponse.data) {
            const propertyUuid = propertyResponse.data.uuid;
            const createdProperty = propertyResponse.data;

            // Link object to property
            await statementService.createStatement(client)({
              subject: objectUuid,
              predicate: Predicate.HAS_PROPERTY,
              object: propertyUuid
            });

            await statementService.createStatement(client)({
              subject: propertyUuid,
              predicate: Predicate.IS_PROPERTY_OF,
              object: objectUuid
            });

            // Process property files
            const propertyFiles: UUFileDTO[] = [];

            if (propertyData.files && propertyData.files.length > 0) {
              for (const fileData of propertyData.files) {
                // Get a UUID for the file
                const fileUuidResponse = await uuidService.createUUID(client)();
                if (!fileUuidResponse.data?.uuid) {
                  continue; // Skip if we can't get a UUID
                }

                const fileWithUuid = {
                  ...fileData.file,
                  uuid: fileUuidResponse.data.uuid
                } as UUFileDTO;

                // Create file
                const fileResponse =
                  await fileService.createOrUpdateFile(client)(fileWithUuid);

                if (fileResponse.data) {
                  propertyFiles.push(fileResponse.data);

                  // Create relationships
                  await statementService.createStatement(client)({
                    subject: propertyUuid,
                    predicate: Predicate.HAS_FILE,
                    object: fileResponse.data.uuid
                  });

                  await statementService.createStatement(client)({
                    subject: fileResponse.data.uuid,
                    predicate: Predicate.IS_FILE_OF,
                    object: propertyUuid
                  });
                }
              }
            }

            // Process property values and their files
            const propertyValues: Array<{
              value: UUPropertyValueDTO;
              files: UUFileDTO[];
            }> = [];

            if (propertyData.values && propertyData.values.length > 0) {
              for (const valueData of propertyData.values) {
                // Get a UUID for the value
                const valueUuidResponse =
                  await uuidService.createUUID(client)();
                if (!valueUuidResponse.data?.uuid) {
                  continue; // Skip if we can't get a UUID
                }

                const valueWithUuid = {
                  ...valueData.value,
                  uuid: valueUuidResponse.data.uuid
                } as UUPropertyValueDTO;

                // Create value
                const valueResponse =
                  await propertyValueService.createOrUpdatePropertyValue(
                    client
                  )(valueWithUuid);

                if (valueResponse.data) {
                  const valueUuid = valueResponse.data.uuid;
                  const createdValue = valueResponse.data;

                  // Link property to value
                  await statementService.createStatement(client)({
                    subject: propertyUuid,
                    predicate: Predicate.HAS_VALUE,
                    object: valueUuid
                  });

                  await statementService.createStatement(client)({
                    subject: valueUuid,
                    predicate: Predicate.IS_VALUE_OF,
                    object: propertyUuid
                  });

                  // Process value files
                  const valueFiles: UUFileDTO[] = [];

                  if (valueData.files && valueData.files.length > 0) {
                    for (const fileData of valueData.files) {
                      // Get a UUID for the file
                      const fileUuidResponse =
                        await uuidService.createUUID(client)();
                      if (!fileUuidResponse.data?.uuid) {
                        continue; // Skip if we can't get a UUID
                      }

                      const fileWithUuid = {
                        ...fileData.file,
                        uuid: fileUuidResponse.data.uuid
                      } as UUFileDTO;

                      // Create file
                      const fileResponse =
                        await fileService.createOrUpdateFile(client)(
                          fileWithUuid
                        );

                      if (fileResponse.data) {
                        valueFiles.push(fileResponse.data);

                        // Create relationships
                        await statementService.createStatement(client)({
                          subject: valueUuid,
                          predicate: Predicate.HAS_FILE,
                          object: fileResponse.data.uuid
                        });

                        await statementService.createStatement(client)({
                          subject: fileResponse.data.uuid,
                          predicate: Predicate.IS_FILE_OF,
                          object: valueUuid
                        });
                      }
                    }
                  }

                  // Add value with its files to the result
                  propertyValues.push({
                    value: createdValue,
                    files: valueFiles
                  });
                }
              }
            }

            // Add property with its values and files to the result
            processedProperties.push({
              property: createdProperty,
              values: propertyValues,
              files: propertyFiles
            });
          }
        }
      }

      // 5. Return the complete structure
      return {
        data: {
          object: createdObject,
          properties: processedProperties,
          files: objectFiles,
          address: createdAddress,
          parents: parentObjects
        },
        status: objectResponse.status,
        statusText: objectResponse.statusText,
        headers: objectResponse.headers
      };
    } catch (error: any) {
      logError('createFullObject', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error creating complex object'
      };
    }
  };
