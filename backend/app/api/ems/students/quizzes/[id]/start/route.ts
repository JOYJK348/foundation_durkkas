/**
 * EMS Student Quiz Start API
 * Route: /api/ems/students/quizzes/[id]/start
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { ems } from '@/lib/supabase';

export async function POST(
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

        // Check for existing active attempt or max attempts
        const { data: quiz } = await ems.quizzes()
            .select('max_attempts, duration_minutes')
            .eq('id', quizId)
            .single();

        const { count } = await ems.quizAttempts()
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quizId)
            .eq('student_id', student.id);

        if (quiz?.max_attempts && (count || 0) >= quiz.max_attempts) {
            return errorResponse(null, 'Maximum attempts reached for this quiz', 400);
        }

        // Create new attempt
        const { data: attempt, error } = await ems.quizAttempts()
            .insert({
                company_id: scope.companyId,
                quiz_id: quizId,
                student_id: student.id,
                attempt_number: (count || 0) + 1,
                started_at: new Date().toISOString(),
                status: 'IN_PROGRESS',
            } as any)
            .select()
            .single();

        if (error) throw error;

        return successResponse(attempt, 'Quiz attempt started');

    } catch (error: any) {
        console.error('Start Student Quiz Error:', error);
        return errorResponse(null, error.message || 'Failed to start quiz');
    }
}
