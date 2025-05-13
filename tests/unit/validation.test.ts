import {
  validate,
  validateSafe,
  ValidationError
} from '../../src/validation/validate';
import {
  objectDTOSchema,
  statementDTOSchema,
  findStatementsParamsSchema
} from '../../src/validation/schemas';
import { Predicate } from '../../src/types';

describe('Validation System', () => {
  describe('validate function', () => {
    it('should validate and return valid data', () => {
      const validObject = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Object'
      };

      const result = validate(objectDTOSchema, validObject);
      expect(result).toEqual(validObject);
    });

    it('should throw ValidationError for invalid data', () => {
      const invalidObject = {
        uuid: 'not-a-uuid',
        name: 'Test Object'
      };

      expect(() => validate(objectDTOSchema, invalidObject)).toThrow(
        ValidationError
      );
    });

    it('should format error messages correctly', () => {
      const invalidObject = {
        uuid: 'not-a-uuid',
        name: 'Test Object'
      };

      try {
        validate(objectDTOSchema, invalidObject);
        fail('Expected validation to fail');
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.errors).toHaveProperty('uuid');
          expect(error.errors.uuid).toContain(
            'Invalid UUID format. Must be a valid UUID string.'
          );
        } else {
          fail('Wrong error type thrown');
        }
      }
    });
  });

  describe('validateSafe function', () => {
    it('should return success with valid data', () => {
      const validObject = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Object'
      };

      const result = validateSafe(objectDTOSchema, validObject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validObject);
      }
    });

    it('should return error object with invalid data', () => {
      const invalidObject = {
        uuid: 'not-a-uuid',
        name: 'Test Object'
      };

      const result = validateSafe(objectDTOSchema, invalidObject);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty('uuid');
      }
    });
  });

  describe('Schema Validation', () => {
    describe('objectDTOSchema', () => {
      it('should validate valid object data', () => {
        const validObject = {
          uuid: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Object',
          description: 'A test object'
        };

        const result = validateSafe(objectDTOSchema, validObject);
        expect(result.success).toBe(true);
      });

      it('should require a valid UUID', () => {
        const invalidObject = {
          uuid: 'invalid',
          name: 'Test Object'
        };

        const result = validateSafe(objectDTOSchema, invalidObject);
        expect(result.success).toBe(false);
      });
    });

    describe('statementDTOSchema', () => {
      it('should validate valid statement data', () => {
        const validStatement = {
          subject: '123e4567-e89b-12d3-a456-426614174000',
          predicate: Predicate.HAS_PROPERTY,
          object: '223e4567-e89b-12d3-a456-426614174000'
        };

        const result = validateSafe(statementDTOSchema, validStatement);
        expect(result.success).toBe(true);
      });

      it('should require a valid predicate', () => {
        const invalidStatement = {
          subject: '123e4567-e89b-12d3-a456-426614174000',
          predicate: 'INVALID_PREDICATE',
          object: '223e4567-e89b-12d3-a456-426614174000'
        };

        const result = validateSafe(statementDTOSchema, invalidStatement);
        expect(result.success).toBe(false);
      });
    });

    describe('findStatementsParamsSchema', () => {
      it('should validate with at least one parameter', () => {
        const validParams = {
          subject: '123e4567-e89b-12d3-a456-426614174000'
        };

        const result = validateSafe(findStatementsParamsSchema, validParams);
        expect(result.success).toBe(true);
      });

      it('should fail when no parameters are provided', () => {
        const invalidParams = {};

        const result = validateSafe(findStatementsParamsSchema, invalidParams);
        expect(result.success).toBe(false);
      });

      it('should validate with predicate only', () => {
        const validParams = {
          predicate: Predicate.HAS_PROPERTY
        };

        const result = validateSafe(findStatementsParamsSchema, validParams);
        expect(result.success).toBe(true);
      });
    });
  });
});
