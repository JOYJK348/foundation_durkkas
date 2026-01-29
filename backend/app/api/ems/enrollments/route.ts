/**
 * EMS API - Enrollments
 * Route: /api/ems/enrollments
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { applyTenantFilter, autoAssignCompany } from '@/middleware/tenantFilter';
import { enrollmentSchema } from '@/lib/validations/ems';
import { EnrollmentService } from '@/lib/services/EnrollmentService';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('student_id');

        if (!studentId) {
            return errorResponse(null, 'student_id is required', 400);
        }

        const scope = await import('@/middleware/tenantFilter').then(m =>
            m.getUserTenantScope(userId)
        );

        const data = await EnrollmentService.getStudentEnrollments(
            parseInt(studentId),
            scope.companyId!
        );

        return successResponse(data, 'Enrollments fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch enrollments');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        const validatedData = enrollmentSchema.parse(data);

        const enrollment = await EnrollmentService.enrollStudent(validatedData);

        return successResponse(enrollment, 'Student enrolled successfully', 201);

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to enroll student');
    }
}
