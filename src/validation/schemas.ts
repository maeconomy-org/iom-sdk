import { z } from 'zod';
import { Predicate } from '@/types';

// UUID Validation
export const uuidSchema = z.string().uuid({
  message: 'Invalid UUID format. Must be a valid UUID string.'
});

// Object DTO Validation Schema
export const objectDTOSchema = z.object({
  uuid: uuidSchema,
  name: z.string().optional(),
  abbreviation: z.string().optional(),
  version: z.string().optional(),
  description: z.string().optional()
});

export type ObjectDTOSchemaType = z.infer<typeof objectDTOSchema>;

// UUStatementsPropertyValue Validation Schema
export const statementsPropertyValueSchema = z.object({
  value: z.string().optional()
});

export type StatementsPropertyValueSchemaType = z.infer<
  typeof statementsPropertyValueSchema
>;

// UUStatementsProperty Validation Schema
export const statementsPropertySchema = z.object({
  key: z.string().optional(),
  values: z.array(statementsPropertyValueSchema).optional()
});

export type StatementsPropertySchemaType = z.infer<
  typeof statementsPropertySchema
>;

// Statement DTO Validation Schema
export const statementDTOSchema = z.object({
  subject: uuidSchema,
  predicate: z.nativeEnum(Predicate, {
    errorMap: (_issue, _ctx) => {
      return {
        message: `Invalid predicate value. Must be one of: ${Object.values(Predicate).join(', ')}`
      };
    }
  }),
  object: uuidSchema,
  properties: z.array(statementsPropertySchema).optional()
});

export type StatementDTOSchemaType = z.infer<typeof statementDTOSchema>;

// Property DTO Validation Schema
export const propertyDTOSchema = z.object({
  uuid: uuidSchema,
  key: z.string().min(1, 'Property key is required'),
  version: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  inputType: z.string().optional(),
  formula: z.string().optional(),
  inputOrderPosition: z.number().optional(),
  processingOrderPosition: z.number().optional(),
  viewOrderPosition: z.number().optional()
});

export type PropertyDTOSchemaType = z.infer<typeof propertyDTOSchema>;

// Property Value DTO Validation Schema
export const propertyValueDTOSchema = z.object({
  uuid: uuidSchema,
  value: z.string().optional(),
  valueTypeCast: z.string().optional(),
  sourceType: z.string().optional()
});

export type PropertyValueDTOSchemaType = z.infer<typeof propertyValueDTOSchema>;

// File DTO Validation Schema
export const fileDTOSchema = z.object({
  uuid: uuidSchema,
  fileName: z.string().optional(),
  fileReference: z.string().min(1, 'File reference is required'),
  label: z.string().optional()
});

export type FileDTOSchemaType = z.infer<typeof fileDTOSchema>;

// Address DTO Validation Schema
export const addressDTOSchema = z.object({
  uuid: uuidSchema,
  fullAddress: z.string().optional(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional()
});

export type AddressDTOSchemaType = z.infer<typeof addressDTOSchema>;

// Find Statements Params Validation Schema
export const findStatementsParamsSchema = z
  .object({
    subject: uuidSchema.optional(),
    predicate: z.nativeEnum(Predicate).optional(),
    object: uuidSchema.optional()
  })
  .refine(data => data.subject || data.predicate || data.object, {
    message:
      'At least one search parameter (subject, predicate, or object) must be provided'
  });

export type FindStatementsParamsType = z.infer<
  typeof findStatementsParamsSchema
>;

// Object With Properties Validation Schema
export const objectWithPropertiesSchema = z.object({
  object: objectDTOSchema,
  properties: z.array(
    z.object({
      property: propertyDTOSchema,
      value: propertyValueDTOSchema.optional()
    })
  ),
  children: z.array(objectDTOSchema).optional(),
  files: z.array(fileDTOSchema).optional()
});

export type ObjectWithPropertiesType = z.infer<
  typeof objectWithPropertiesSchema
>;

// File Input for Complex Object Schema
export const fileInputSchema = z.object({
  file: z.object({
    fileName: z.string().min(1, 'Filename is required'),
    fileReference: z.string().min(1, 'File reference is required'),
    label: z.string().optional()
  })
});

// Value With Files Schema for Complex Object
export const valueWithFilesSchema = z.object({
  value: propertyValueDTOSchema.omit({ uuid: true }),
  files: z.array(fileInputSchema).optional()
});

// Property With Values and Files Schema for Complex Object
export const propertyWithValuesFilesSchema = z.object({
  property: propertyDTOSchema.omit({ uuid: true }).extend({
    key: z.string().min(1, 'Property key is required')
  }),
  values: z.array(valueWithFilesSchema).optional(),
  files: z.array(fileInputSchema).optional()
});

// Complex Object Creation Input Schema
export const complexObjectCreationSchema = z.object({
  object: objectDTOSchema.omit({ uuid: true }),
  parents: z.array(uuidSchema).optional(),
  files: z.array(fileInputSchema).optional(),
  properties: z.array(propertyWithValuesFilesSchema).optional(),
  address: addressDTOSchema.omit({ uuid: true }).optional()
});

export type ComplexObjectCreationSchemaType = z.infer<
  typeof complexObjectCreationSchema
>;
