import { z } from 'zod';
import { logError } from '@/core';

/**
 * Validation error class for handling Zod validation errors
 */
export class ValidationError extends Error {
  public errors: Record<string, string[]>;

  constructor(error: z.ZodError) {
    super('Validation Error');
    this.name = 'ValidationError';
    this.errors = formatZodError(error);
  }
}

/**
 * Format Zod error into a more readable format
 * @param error - Zod error object
 * @returns Record of field paths to error messages
 */
export function formatZodError(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.errors) {
    const path = issue.path.join('.');
    const key = path || 'general';

    if (!errors[key]) {
      errors[key] = [];
    }

    errors[key].push(issue.message);
  }

  return errors;
}

/**
 * Generic validation function for validating data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws ValidationError
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new ValidationError(error);
      logError('validation', { errors: validationError.errors });
      throw validationError;
    }
    throw error;
  }
}

/**
 * Safe validation function that doesn't throw errors but returns a result
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either validated data or validation errors
 */
export function validateSafe<T>(
  schema: z.ZodType<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = formatZodError(result.error);
  logError('validation', { errors });

  return {
    success: false,
    errors
  };
}
