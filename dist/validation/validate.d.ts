import { z } from 'zod';
/**
 * Validation error class for handling Zod validation errors
 */
export declare class ValidationError extends Error {
    errors: Record<string, string[]>;
    constructor(error: z.ZodError);
}
/**
 * Format Zod error into a more readable format
 * @param error - Zod error object
 * @returns Record of field paths to error messages
 */
export declare function formatZodError(error: z.ZodError): Record<string, string[]>;
/**
 * Generic validation function for validating data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws ValidationError
 */
export declare function validate<T>(schema: z.ZodType<T>, data: unknown): T;
/**
 * Safe validation function that doesn't throw errors but returns a result
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either validated data or validation errors
 */
export declare function validateSafe<T>(schema: z.ZodType<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    errors: Record<string, string[]>;
};
