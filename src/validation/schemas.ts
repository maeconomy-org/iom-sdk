import { z } from 'zod';
import { Predicate } from '@/types';

// UUID Validation
export const uuidSchema = z.string().uuid({
  message: 'Invalid UUID format. Must be a valid UUID string.'
});

// Non-empty string that rejects whitespace-only values
const nonEmptyString = z
  .string()
  .refine(val => val === undefined || val.trim().length > 0, {
    message: 'Value cannot be empty or contain only whitespace'
  });

// Object DTO Validation Schema
export const objectDTOSchema = z.object({
  uuid: uuidSchema,
  name: nonEmptyString.optional(),
  abbreviation: z.string().optional(),
  version: z.string().optional(),
  description: z.string().optional(),
  isTemplate: z.boolean().optional()
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

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required');

// Password validation schema
// Requirements: 8+ chars, at least one lowercase, uppercase, number, and symbol
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^a-zA-Z0-9]/,
    'Password must contain at least one special character'
  );

/**
 * Validates email and password for UP auth
 * Throws ValidationError if invalid
 */
export function validateEmailPassword(email: string, password: string): void {
  emailSchema.parse(email);
  passwordSchema.parse(password);
}

// Group Create DTO Validation Schema
export const groupCreateDTOSchema = z.object({
  ownerUserUUID: z.string().optional(),
  groupUUID: z.string().optional(),
  name: z.string().min(1, 'Group name is required'),
  usersShare: z
    .array(
      z.object({
        userUUID: uuidSchema.optional(),
        permissions: z
          .array(z.enum(['READ', 'GROUP_WRITE', 'GROUP_WRITE_RECORDS']))
          .min(1, 'At least one permission is required')
      })
    )
    .optional(),
  publicShare: z
    .object({
      permissions: z
        .array(z.enum(['READ', 'GROUP_WRITE', 'GROUP_WRITE_RECORDS']))
        .min(1, 'At least one permission is required')
    })
    .optional(),
  default: z.boolean().optional()
});

export type GroupCreateDTOSchemaType = z.infer<typeof groupCreateDTOSchema>;

// Group Add Records DTO Validation Schema
export const groupAddRecordsDTOSchema = z.object({
  recordUUIDs: z
    .array(uuidSchema)
    .min(1, 'At least one record UUID is required')
});

export type GroupAddRecordsDTOSchemaType = z.infer<
  typeof groupAddRecordsDTOSchema
>;
