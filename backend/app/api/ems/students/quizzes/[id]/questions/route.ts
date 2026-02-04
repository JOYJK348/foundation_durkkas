/**
 * EMS Student Quiz Questions API
 * Route: /api/ems/students/quizzes/[id]/questions
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

        // Verify enrollment/eligibility (Optional but recommended)
        // For now, assume if the tutor assigned it, they are eligible.

        // Get questions
        const questions = await QuizService.getQuestions(quizId);

        // IMPORTANT: Strip correct answers for students!
        const sanitizedQuestions = questions.map((q: any) => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options, // Ensure options is an array
            marks: q.marks,
            question_order: q.question_order
        }));

        return successResponse(sanitizedQuestions, 'Quiz questions fetched successfully');

    } catch (error: any) {
        console.error('Fetch Student Quiz Questions Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch quiz questions');
    }
}
