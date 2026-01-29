/**
 * EMS API - Quiz Details with Questions
 * Route: /api/ems/quizzes/[id]
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { AssessmentService } from '@/lib/services/AssessmentService';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const data = await AssessmentService.getQuizWithQuestions(parseInt(params.id));

        return successResponse(data, 'Quiz details fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Quiz not found');
    }
}
