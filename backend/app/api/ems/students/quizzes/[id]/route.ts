/**
 * EMS Student Quiz Detail API
 * Route: /api/ems/students/quizzes/[id]
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { ems } from '@/lib/supabase';
import { QuizService } from '@/lib/services/QuizService';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await import('@/middleware/tenantFilter').then(m =>
            m.getUserTenantScope(userId)
        );

        // Get student record
        const { data: student } = await ems.students()
            .select('id')
            .eq('user_id', userId)
            .eq('company_id', scope.companyId!)
            .is('deleted_at', null)
            .single();

        if (!student) {
            return errorResponse(null, 'Student record not found', 404);
        }

        const quizId = parseInt(params.id);

        // Get quiz basic details (without questions/answers yet)
        const quiz = await QuizService.getQuizById(quizId, scope.companyId!);

        // Check if student has an active or completed attempt
        const { data: attempt } = await ems.quizAttempts()
            .select('id, score:marks_obtained, is_passed, submitted_at')
            .eq('quiz_id', quizId)
            .eq('student_id', student.id)
            .order('attempt_number', { ascending: false })
            .limit(1)
            .single();

        return successResponse({
            ...quiz,
            attempt: attempt || null
        }, 'Quiz details fetched successfully');

    } catch (error: any) {
        console.error('Fetch Student Quiz Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch quiz details');
    }
}
