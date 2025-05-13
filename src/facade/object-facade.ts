import { z } from 'zod';

import {
  ApiResponse,
  ComplexObjectCreationInput,
  ComplexObjectOutput,
  Predicate,
  UUFileDTO,
  UUObjectDTO,
  UUObjectWithProperties,
  UUPropertyDTO,
  UUPropertyValueDTO,
  UUID,
  QueryParams
} from '../types';
import { httpClient } from '../core/http-client';
import * as objectService from '../services/object-service';
import * as statementService from '../services/statement-service';
import * as propertyService from '../services/property-service';
import * as propertyValueService from '../services/property-value-service';
import * as fileService from '../services/file-service';
import * as uuidService from '../services/uuid-service';
import { validate } from '../validation/validate';
import {
  complexObjectCreationSchema,
  objectDTOSchema,
  propertyDTOSchema,
  propertyValueDTOSchema,
  uuidSchema
} from '../validation/schemas';
import { logError } from '../core/logger';

/**
 * Get a complete object with all its properties, values, and relationships
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the object to get
 * @returns The object with all its properties and related data
 */
export const getObjectWithProperties =
  (client = httpClient) =>
  async (uuid: UUID): Promise<ApiResponse<UUObjectWithProperties | null>> => {
    try {
      // Validate UUID
      const validatedUuid = validate(z.string().uuid(), uuid);

      // Get the base object
      const objectResponse =
        await objectService.getObjectByUuid(client)(validatedUuid);

      if (!objectResponse.data) {
        return {
          data: null,
          status: 404,
          statusText: 'Not Found'
        };
      }

      // Get all properties related to this object through statements
      const propertyStatementsResponse =
        await statementService.findProperties(client)(validatedUuid);

      const properties: Array<{
        property: UUPropertyDTO;
        value?: UUPropertyValueDTO;
      }> = [];

      // For each property statement, get the property details and values
      for (const statement of propertyStatementsResponse.data || []) {
        const propertyUuid = statement.object;

        // Get the property details
        const propertyResponse =
          await propertyService.getPropertyByUuid(client)(propertyUuid);

        if (propertyResponse.data) {
          // Get the property values
          const valueStatementsResponse =
            await statementService.findPropertyValues(client)(propertyUuid);

          let propertyValue: UUPropertyValueDTO | undefined = undefined;

          // If there are values, get the first one (most use cases have one value per property)
          if (
            valueStatementsResponse.data &&
            valueStatementsResponse.data.length > 0
          ) {
            const valueUuid = valueStatementsResponse.data[0].object;
            const valueResponse =
              await propertyValueService.getPropertyValueByUuid(client)(
                valueUuid
              );

            if (valueResponse.data) {
              propertyValue = valueResponse.data;
            }
          }

          // Add the property and its value to the result
          properties.push({
            property: propertyResponse.data,
            value: propertyValue
          });
        }
      }

      // Get child objects
      const childrenStatementsResponse =
        await statementService.findChildren(client)(validatedUuid);

      const children: UUObjectDTO[] = [];

      for (const statement of childrenStatementsResponse.data || []) {
        const childUuid = statement.object;
        const childResponse =
          await objectService.getObjectByUuid(client)(childUuid);

        if (childResponse.data) {
          children.push(childResponse.data);
        }
      }

      // Get files
      const fileStatementsResponse =
        await statementService.findFiles(client)(validatedUuid);

      const files: UUFileDTO[] = [];

      for (const statement of fileStatementsResponse.data || []) {
        const fileUuid = statement.object;
        const fileResponse = await fileService.getFileByUuid(client)(fileUuid);

        if (fileResponse.data) {
          files.push(fileResponse.data);
        }
      }

      // Combine everything into the result
      return {
        data: {
          object: objectResponse.data,
          properties,
          children,
          files
        },
        status: objectResponse.status,
        statusText: objectResponse.statusText,
        headers: objectResponse.headers
      };
    } catch (error: any) {
      logError('getObjectWithProperties', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error retrieving object with properties'
      };
    }
  };

/**
 * Create a complete object with properties and values in a single operation
 * This version first obtains a UUID from the UUID service before creating the object
 *
 * @param client - HTTP client instance
 * @param object - The object data to create (UUID will be automatically assigned)
 * @param properties - Array of properties and their values to associate with the object
 * @returns The created object
 */
export const createObjectWithProperties =
  (client = httpClient) =>
  async (
    object: Omit<UUObjectDTO, 'uuid'>,
    properties: Array<{
      property: Omit<UUPropertyDTO, 'uuid'>;
      value?: Omit<UUPropertyValueDTO, 'uuid'>;
    }>
  ): Promise<ApiResponse<UUObjectWithProperties | null>> => {
    try {
      // Validate input object (without UUID)
      const objectSchema = objectDTOSchema.omit({ uuid: true });
      const validatedObject = validate(objectSchema, object);

      // Validate properties array
      const propertySchema = z.array(
        z.object({
          property: propertyDTOSchema.omit({ uuid: true }),
          value: propertyValueDTOSchema.omit({ uuid: true }).optional()
        })
      );
      const validatedProperties = validate(propertySchema, properties);

      // First, obtain a UUID for the object
      const objectUuidResponse = await uuidService.createUUID(client)();

      if (!objectUuidResponse.data || !objectUuidResponse.data.uuid) {
        return {
          data: null,
          status: 500,
          statusText: 'Error obtaining UUID for object'
        };
      }

      // Create the object with the obtained UUID
      const objectWithUuid = {
        ...validatedObject,
        uuid: objectUuidResponse.data.uuid
      } as UUObjectDTO;

      const objectResponse =
        await objectService.createOrUpdateObject(client)(objectWithUuid);

      if (!objectResponse.data) {
        return {
          data: null,
          status: 500,
          statusText: 'Error creating object'
        };
      }

      const objectUuid = objectResponse.data.uuid;
      const createdProperties: Array<{
        property: UUPropertyDTO;
        value?: UUPropertyValueDTO;
      }> = [];

      // Create each property and its value, then link them to the object
      for (const prop of validatedProperties) {
        // Obtain a UUID for the property
        const propertyUuidResponse = await uuidService.createUUID(client)();

        if (!propertyUuidResponse.data || !propertyUuidResponse.data.uuid) {
          continue; // Skip this property if we can't get a UUID
        }

        // Create or update the property with the obtained UUID
        const propertyWithUuid = {
          ...prop.property,
          uuid: propertyUuidResponse.data.uuid
        } as UUPropertyDTO;

        const propertyResponse =
          await propertyService.createOrUpdateProperty(client)(
            propertyWithUuid
          );

        if (propertyResponse.data) {
          const propertyUuid = propertyResponse.data.uuid;
          let propertyValue: UUPropertyValueDTO | undefined = undefined;

          // Create the property value if provided
          if (prop.value) {
            // Obtain a UUID for the value
            const valueUuidResponse = await uuidService.createUUID(client)();

            if (!valueUuidResponse.data || !valueUuidResponse.data.uuid) {
              continue; // Skip this value if we can't get a UUID
            }

            // Create the value with the obtained UUID
            const valueWithUuid = {
              ...prop.value,
              uuid: valueUuidResponse.data.uuid
            } as UUPropertyValueDTO;

            const valueResponse =
              await propertyValueService.createOrUpdatePropertyValue(client)(
                valueWithUuid
              );

            if (valueResponse.data) {
              propertyValue = valueResponse.data;

              // Link property to value
              await statementService.createOrFindStatements(client)([
                {
                  subject: propertyUuid,
                  predicate: Predicate.HAS_VALUE,
                  object: valueResponse.data.uuid
                }
              ]);
            }
          }

          // Link object to property
          await statementService.createOrFindStatements(client)([
            {
              subject: objectUuid,
              predicate: Predicate.HAS_PROPERTY,
              object: propertyUuid
            }
          ]);

          createdProperties.push({
            property: propertyResponse.data,
            value: propertyValue
          });
        }
      }

      // Return the created object with properties
      return {
        data: {
          object: objectResponse.data,
          properties: createdProperties,
          children: [],
          files: []
        },
        status: objectResponse.status,
        statusText: objectResponse.statusText,
        headers: objectResponse.headers
      };
    } catch (error: any) {
      logError('createObjectWithProperties', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error creating object with properties'
      };
    }
  };

/**
 * Add a child object to a parent object
 *
 * @param client - HTTP client instance
 * @param parentUuid - UUID of the parent object
 * @param childUuid - UUID of the child object
 * @returns Success status
 */
export const addChildToObject =
  (client = httpClient) =>
  async (parentUuid: UUID, childUuid: UUID): Promise<ApiResponse<boolean>> => {
    // Create parent-child relationship in both directions
    const statements = [
      {
        subject: parentUuid,
        predicate: Predicate.IS_PARENT_OF,
        object: childUuid
      },
      {
        subject: childUuid,
        predicate: Predicate.IS_CHILD_OF,
        object: parentUuid
      }
    ];

    const response =
      await statementService.createOrFindStatements(client)(statements);

    return {
      data: !!response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  };

/**
 * Add a file to an object
 * This version first obtains a UUID from the UUID service before creating the file
 *
 * @param client - HTTP client instance
 * @param objectUuid - UUID of the object
 * @param file - File data to add (UUID will be automatically assigned)
 * @returns Success status
 */
export const addFileToObject =
  (client = httpClient) =>
  async (
    objectUuid: UUID,
    file: Omit<UUFileDTO, 'uuid'>
  ): Promise<ApiResponse<boolean>> => {
    // Obtain a UUID for the file
    const fileUuidResponse = await uuidService.createUUID(client)();

    if (!fileUuidResponse.data || !fileUuidResponse.data.uuid) {
      return {
        data: false,
        status: 500,
        statusText: 'Error obtaining UUID for file'
      };
    }

    // Create the file with the obtained UUID
    const fileWithUuid = {
      ...file,
      uuid: fileUuidResponse.data.uuid
    } as UUFileDTO;

    const fileResponse =
      await fileService.createOrUpdateFile(client)(fileWithUuid);

    if (!fileResponse.data) {
      return {
        data: false,
        status: 500,
        statusText: 'Error creating file'
      };
    }

    // Link object to file
    const statementResponse = await statementService.createOrFindStatements(
      client
    )([
      {
        subject: objectUuid,
        predicate: Predicate.HAS_FILE,
        object: fileResponse.data.uuid
      }
    ]);

    return {
      data: !!statementResponse.data,
      status: statementResponse.status,
      statusText: statementResponse.statusText,
      headers: statementResponse.headers
    };
  };

/**
 * Create a complex object with multiple properties, multiple values per property,
 * and files attached to the object, properties, and values.
 * This high-level operation handles creating the complete object hierarchy in a single function call.
 *
 * @param client - HTTP client instance
 * @param objectData - The complex object data including properties, values, files, and optional parent
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

      // 1. Create the main object
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

      // 2. Establish parent relationship if parentUuid is provided
      let parentObject: UUObjectDTO | undefined;

      if (validatedObjectData.parentUuid) {
        // Get parent object details
        const parentResponse = await objectService.getObjectByUuid(client)(
          validatedObjectData.parentUuid
        );

        if (parentResponse.data) {
          parentObject = parentResponse.data;

          // Create parent-child relationships
          await statementService.createStatement(client)({
            subject: validatedObjectData.parentUuid,
            predicate: Predicate.IS_PARENT_OF,
            object: objectUuid
          });

          await statementService.createStatement(client)({
            subject: objectUuid,
            predicate: Predicate.IS_CHILD_OF,
            object: validatedObjectData.parentUuid
          });
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
      const processedProperties: Array<{
        property: UUPropertyDTO;
        values: Array<{
          value: UUPropertyValueDTO;
          files: UUFileDTO[];
        }>;
        files: UUFileDTO[];
      }> = [];

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
          parent: parentObject
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

/**
 * Update an existing object with selectively changed properties, values, or files.
 * Unlike editFullObject which requires full object data, this method accepts partial updates
 * and only modifies what was provided.
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the object to update
 * @param updates - The partial updates to apply to the object
 * @returns The updated object with its modified relationships
 */
export const updateObject =
  (client = httpClient) =>
  async (
    uuid: UUID,
    updates: {
      object?: Partial<Omit<UUObjectDTO, 'uuid'>>;
      parentUuid?: UUID | null;
      addFiles?: Array<{
        file: Omit<UUFileDTO, 'uuid'>;
      }>;
      removeFiles?: UUID[];
      properties?: Array<{
        key: string;
        property?: Partial<Omit<UUPropertyDTO, 'uuid'>>;
        addValues?: Array<{
          value: Omit<UUPropertyValueDTO, 'uuid'>;
          addFiles?: Array<{
            file: Omit<UUFileDTO, 'uuid'>;
          }>;
        }>;
        removeValues?: UUID[];
        addFiles?: Array<{
          file: Omit<UUFileDTO, 'uuid'>;
        }>;
        removeFiles?: UUID[];
      }>;
      removeProperties?: string[];
    }
  ): Promise<ApiResponse<ComplexObjectOutput | null>> => {
    try {
      // Validate UUID
      const validatedUuid = validate(uuidSchema, uuid);

      // First, get the existing object with all its properties
      const existingObjectResponse =
        await getObjectWithProperties(client)(validatedUuid);

      if (!existingObjectResponse.data) {
        return {
          data: null,
          status: 404,
          statusText: 'Object not found'
        };
      }

      const existingObject = existingObjectResponse.data;

      // 1. Update object properties if provided
      if (updates.object) {
        const updatedObject = {
          ...existingObject.object,
          ...updates.object
        };

        await objectService.createOrUpdateObject(client)(updatedObject);
      }

      // 2. Update parent relationship if provided
      if (updates.parentUuid !== undefined) {
        // First, find and remove any existing parent relationships
        const existingParentStatements = await statementService.findStatements(
          client
        )({
          subject: validatedUuid,
          predicate: Predicate.IS_CHILD_OF
        });

        // Delete the existing parent relationship
        if (existingParentStatements.data?.length) {
          for (const statement of existingParentStatements.data) {
            await statementService.deleteStatement(client)(statement);

            // Also delete the inverse relationship
            await statementService.deleteStatement(client)({
              subject: statement.object,
              predicate: Predicate.IS_PARENT_OF,
              object: validatedUuid
            });
          }
        }

        // If a new parent is provided (not null), create new relationship
        if (updates.parentUuid) {
          await statementService.createOrFindStatements(client)([
            {
              subject: updates.parentUuid,
              predicate: Predicate.IS_PARENT_OF,
              object: validatedUuid
            },
            {
              subject: validatedUuid,
              predicate: Predicate.IS_CHILD_OF,
              object: updates.parentUuid
            }
          ]);
        }
      }

      // 3. Add new files to object if provided
      if (updates.addFiles?.length) {
        for (const fileData of updates.addFiles) {
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
            // Create relationships
            await statementService.createOrFindStatements(client)([
              {
                subject: validatedUuid,
                predicate: Predicate.HAS_FILE,
                object: fileResponse.data.uuid
              },
              {
                subject: fileResponse.data.uuid,
                predicate: Predicate.IS_FILE_OF,
                object: validatedUuid
              }
            ]);
          }
        }
      }

      // 4. Remove files from object if provided
      if (updates.removeFiles?.length) {
        for (const fileUuid of updates.removeFiles) {
          // Delete the file statement
          await statementService.deleteStatement(client)({
            subject: validatedUuid,
            predicate: Predicate.HAS_FILE,
            object: fileUuid
          });

          // Delete the inverse statement
          await statementService.deleteStatement(client)({
            subject: fileUuid,
            predicate: Predicate.IS_FILE_OF,
            object: validatedUuid
          });

          // Optionally, soft delete the file itself (uncomment if desired)
          await fileService.softDeleteFile(client)(fileUuid);
        }
      }

      // 5. Process property updates
      if (updates.properties?.length) {
        for (const propertyUpdate of updates.properties) {
          // Find or create the property by key
          let property: UUPropertyDTO | undefined;

          // Try to find the property by key in the existing properties
          const existingProperty = existingObject.properties.find(
            p => p.property.key === propertyUpdate.key
          );

          if (existingProperty) {
            // Update the existing property if updates are provided
            if (propertyUpdate.property) {
              property = {
                ...existingProperty.property,
                ...propertyUpdate.property
              };

              // Update the property
              await propertyService.createOrUpdateProperty(client)(property);
            } else {
              property = existingProperty.property;
            }
          } else {
            // Create a new property
            const propertyUuidResponse = await uuidService.createUUID(client)();
            if (!propertyUuidResponse.data?.uuid) {
              continue; // Skip if we can't get a UUID
            }

            property = {
              uuid: propertyUuidResponse.data.uuid,
              key: propertyUpdate.key,
              ...(propertyUpdate.property || {})
            } as UUPropertyDTO;

            // Create the property
            const propertyResponse =
              await propertyService.createOrUpdateProperty(client)(property);
            if (!propertyResponse.data) {
              continue; // Skip if property creation failed
            }

            property = propertyResponse.data;

            // Link property to object
            await statementService.createOrFindStatements(client)([
              {
                subject: validatedUuid,
                predicate: Predicate.HAS_PROPERTY,
                object: property.uuid
              },
              {
                subject: property.uuid,
                predicate: Predicate.IS_PROPERTY_OF,
                object: validatedUuid
              }
            ]);
          }

          // Process property value additions if provided
          if (propertyUpdate.addValues?.length && property) {
            for (const valueData of propertyUpdate.addValues) {
              // Get a UUID for the value
              const valueUuidResponse = await uuidService.createUUID(client)();
              if (!valueUuidResponse.data?.uuid) {
                continue; // Skip if we can't get a UUID
              }

              const valueWithUuid = {
                ...valueData.value,
                uuid: valueUuidResponse.data.uuid
              } as UUPropertyValueDTO;

              // Create value
              const valueResponse =
                await propertyValueService.createOrUpdatePropertyValue(client)(
                  valueWithUuid
                );

              if (!valueResponse.data) {
                continue; // Skip if value creation failed
              }

              // Link property to value
              await statementService.createOrFindStatements(client)([
                {
                  subject: property.uuid,
                  predicate: Predicate.HAS_VALUE,
                  object: valueResponse.data.uuid
                },
                {
                  subject: valueResponse.data.uuid,
                  predicate: Predicate.IS_VALUE_OF,
                  object: property.uuid
                }
              ]);

              // Process value files if provided
              if (valueData.addFiles?.length) {
                for (const fileData of valueData.addFiles) {
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
                    await fileService.createOrUpdateFile(client)(fileWithUuid);

                  if (fileResponse.data) {
                    // Create relationships
                    await statementService.createOrFindStatements(client)([
                      {
                        subject: valueResponse.data.uuid,
                        predicate: Predicate.HAS_FILE,
                        object: fileResponse.data.uuid
                      },
                      {
                        subject: fileResponse.data.uuid,
                        predicate: Predicate.IS_FILE_OF,
                        object: valueResponse.data.uuid
                      }
                    ]);
                  }
                }
              }
            }
          }

          // Process property value removals if provided
          if (propertyUpdate.removeValues?.length && property) {
            for (const valueUuid of propertyUpdate.removeValues) {
              // Delete the value statement
              await statementService.deleteStatement(client)({
                subject: property.uuid,
                predicate: Predicate.HAS_VALUE,
                object: valueUuid
              });

              // Delete the inverse statement
              await statementService.deleteStatement(client)({
                subject: valueUuid,
                predicate: Predicate.IS_VALUE_OF,
                object: property.uuid
              });

              // Optionally, soft delete the value itself (uncomment if desired)
              await propertyValueService.softDeletePropertyValue(client)(
                valueUuid
              );
            }
          }

          // Process property file additions if provided
          if (propertyUpdate.addFiles?.length && property) {
            for (const fileData of propertyUpdate.addFiles) {
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
                // Create relationships
                await statementService.createOrFindStatements(client)([
                  {
                    subject: property.uuid,
                    predicate: Predicate.HAS_FILE,
                    object: fileResponse.data.uuid
                  },
                  {
                    subject: fileResponse.data.uuid,
                    predicate: Predicate.IS_FILE_OF,
                    object: property.uuid
                  }
                ]);
              }
            }
          }

          // Process property file removals if provided
          if (propertyUpdate.removeFiles?.length && property) {
            for (const fileUuid of propertyUpdate.removeFiles) {
              // Delete the file statement
              await statementService.deleteStatement(client)({
                subject: property.uuid,
                predicate: Predicate.HAS_FILE,
                object: fileUuid
              });

              // Delete the inverse statement
              await statementService.deleteStatement(client)({
                subject: fileUuid,
                predicate: Predicate.IS_FILE_OF,
                object: property.uuid
              });

              // Optionally, soft delete the file itself (uncomment if desired)
              await fileService.softDeleteFile(client)(fileUuid);
            }
          }
        }
      }

      // 6. Process property removals if provided
      if (updates.removeProperties?.length) {
        for (const propertyKey of updates.removeProperties) {
          // Find the property by key
          const existingProperty = existingObject.properties.find(
            p => p.property.key === propertyKey
          );

          if (existingProperty) {
            // Delete the property statement
            await statementService.deleteStatement(client)({
              subject: validatedUuid,
              predicate: Predicate.HAS_PROPERTY,
              object: existingProperty.property.uuid
            });

            // Delete the inverse statement
            await statementService.deleteStatement(client)({
              subject: existingProperty.property.uuid,
              predicate: Predicate.IS_PROPERTY_OF,
              object: validatedUuid
            });

            // Optionally, soft delete the property itself (uncomment if desired)
            await propertyService.softDeleteProperty(client)(
              existingProperty.property.uuid
            );
          }
        }
      }

      // 7. Get the updated object with all its properties and return it
      return getFullObject(client)(validatedUuid);
    } catch (error: any) {
      logError('updateObject', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error updating object'
      };
    }
  };

/**
 * Get a complete object with all its relationships, including properties, values,
 * and files at all levels (object, property, and value).
 *
 * @param client - HTTP client instance
 * @param uuid - UUID of the object to retrieve
 * @param params - Query parameters (like softDeleted)
 * @returns The complete object with all its properties, values, and relationships
 */
export const getFullObject =
  (client = httpClient) =>
  async (
    uuid: UUID,
    params?: QueryParams
  ): Promise<ApiResponse<ComplexObjectOutput | null>> => {
    try {
      // Validate UUID
      const validatedUuid = validate(uuidSchema, uuid);

      // Get the base object
      const objectResponse = await objectService.getObjectByUuid(client)(
        validatedUuid,
        params
      );

      if (!objectResponse.data) {
        return {
          data: null,
          status: 404,
          statusText: 'Not Found'
        };
      }

      const object = objectResponse.data;

      // 1. Get direct files attached to the object
      const objectFilesResponse = await statementService.findStatements(client)(
        {
          subject: validatedUuid,
          predicate: Predicate.HAS_FILE
        },
        params
      );

      const objectFiles: UUFileDTO[] = [];

      if (objectFilesResponse.data?.length) {
        for (const statement of objectFilesResponse.data) {
          const fileResponse = await fileService.getFileByUuid(client)(
            statement.object,
            params
          );

          if (fileResponse.data) {
            objectFiles.push(fileResponse.data);
          }
        }
      }

      // 2. Get parent (if any)
      const parentStatementResponse = await statementService.findStatements(
        client
      )(
        {
          subject: validatedUuid,
          predicate: Predicate.IS_CHILD_OF
        },
        params
      );

      let parent: UUObjectDTO | undefined;

      if (parentStatementResponse.data?.length) {
        const parentResponse = await objectService.getObjectByUuid(client)(
          parentStatementResponse.data[0].object,
          params
        );

        if (parentResponse.data) {
          parent = parentResponse.data;
        }
      }

      // 3. Get all properties associated with this object
      const propertiesResponse = await statementService.findStatements(client)(
        {
          subject: validatedUuid,
          predicate: Predicate.HAS_PROPERTY
        },
        params
      );

      const processedProperties: Array<{
        property: UUPropertyDTO;
        values: Array<{
          value: UUPropertyValueDTO;
          files: UUFileDTO[];
        }>;
        files: UUFileDTO[];
      }> = [];

      if (propertiesResponse.data?.length) {
        for (const propStatement of propertiesResponse.data) {
          const propertyUuid = propStatement.object;

          // 3.1. Get property details
          const propertyResponse = await propertyService.getPropertyByUuid(
            client
          )(propertyUuid, params);

          if (!propertyResponse.data) {
            continue;
          }

          const property = propertyResponse.data;

          // 3.2. Get property files
          const propertyFilesResponse = await statementService.findStatements(
            client
          )(
            {
              subject: propertyUuid,
              predicate: Predicate.HAS_FILE
            },
            params
          );

          const propertyFiles: UUFileDTO[] = [];

          if (propertyFilesResponse.data?.length) {
            for (const fileStatement of propertyFilesResponse.data) {
              const fileResponse = await fileService.getFileByUuid(client)(
                fileStatement.object,
                params
              );

              if (fileResponse.data) {
                propertyFiles.push(fileResponse.data);
              }
            }
          }

          // 3.3. Get property values
          const valuesResponse = await statementService.findStatements(client)(
            {
              subject: propertyUuid,
              predicate: Predicate.HAS_VALUE
            },
            params
          );

          const propertyValues: Array<{
            value: UUPropertyValueDTO;
            files: UUFileDTO[];
          }> = [];

          if (valuesResponse.data?.length) {
            for (const valueStatement of valuesResponse.data) {
              const valueUuid = valueStatement.object;

              // 3.3.1 Get value details
              const valueResponse =
                await propertyValueService.getPropertyValueByUuid(client)(
                  valueUuid,
                  params
                );

              if (!valueResponse.data) {
                continue;
              }

              const value = valueResponse.data;

              // 3.3.2 Get value files
              const valueFilesResponse = await statementService.findStatements(
                client
              )(
                {
                  subject: valueUuid,
                  predicate: Predicate.HAS_FILE
                },
                params
              );

              const valueFiles: UUFileDTO[] = [];

              if (valueFilesResponse.data?.length) {
                for (const fileStatement of valueFilesResponse.data) {
                  const fileResponse = await fileService.getFileByUuid(client)(
                    fileStatement.object,
                    params
                  );

                  if (fileResponse.data) {
                    valueFiles.push(fileResponse.data);
                  }
                }
              }

              // Add value with its files to the result
              propertyValues.push({
                value,
                files: valueFiles
              });
            }
          }

          // Add property with its values and files to the result
          processedProperties.push({
            property,
            values: propertyValues,
            files: propertyFiles
          });
        }
      }

      // 4. Return the complete structure
      return {
        data: {
          object,
          properties: processedProperties,
          files: objectFiles,
          parent
        },
        status: objectResponse.status,
        statusText: objectResponse.statusText,
        headers: objectResponse.headers
      };
    } catch (error: any) {
      logError('getFullObject', error);
      return {
        data: null,
        status: 500,
        statusText: error.message || 'Error retrieving object'
      };
    }
  };
