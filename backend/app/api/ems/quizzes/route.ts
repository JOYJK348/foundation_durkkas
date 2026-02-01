/**
 * EMS API - Quizzes
 * Route: /api/ems/quizzes
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { autoAssignCompany } from '@/middleware/tenantFilter';
import { quizSchema } from '@/lib/validations/ems';
import { AssessmentService } from '@/lib/services/AssessmentService';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('course_id');

        const scope = await import('@/middleware/tenantFilter').then(m =>
            m.getUserTenantScope(userId)
        );

        const data = await AssessmentService.getQuizzes(
            scope.companyId!,
            courseId ? parseInt(courseId) : undefined,
            scope.emsProfile
        );

        return successResponse(data, `Quizzes fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch quizzes');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        const validatedData = quizSchema.parse(data);

        const quiz = await AssessmentService.createQuiz(validatedData);

        return successResponse(quiz, 'Quiz created successfully', 201);

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to create quiz');
    }
}
