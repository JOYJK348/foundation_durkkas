import { describe, it, expect, vi } from 'vitest';
import { AppError, ValidationError, handleError } from '@/lib/errorHandler';
import { ZodError } from 'zod';

describe('Backend Error Handling System', () => {
    it('should correctly initialize custom AppError', () => {
        const error = new AppError('AUTH_ERROR', 'Unauthorized access', 401);
        expect(error.code).toBe('AUTH_ERROR');
        expect(error.message).toBe('Unauthorized access');
        expect(error.statusCode).toBe(401);
    });

    it('should correctly handle ValidationError', () => {
        const error = new ValidationError('Invalid email', null, 'email');
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.field).toBe('email');
        expect(error.statusCode).toBe(400);
    });

    it('should map Zod errors correctly in handleError', () => {
        const zodError = new ZodError([
            {
                code: 'invalid_type',
                expected: 'string',
                received: 'undefined',
                path: ['name'],
                message: 'Name is required'
            }
        ]);

        const response: any = handleError(zodError);
        // Next.js NextResponse is a specialized Response object
        // We'll check the structure if possible, but for unit tests 
        // we mainly want to ensure it doesn't throw and behaves as expected
        expect(response).toBeDefined();
        expect(response.status).toBe(400);
    });
});
