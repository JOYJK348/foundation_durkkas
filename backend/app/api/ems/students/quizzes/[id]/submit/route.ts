/**
 * EMS Student Quiz Submit API
 * Route: /api/ems/students/quizzes/[id]/submit
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { ems } from '@/lib/supabase';
import { QuizService } from '@/lib/services/QuizService';

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
        const { attempt_id, answers } = await req.json();

        if (!attempt_id) {
            return errorResponse(null, 'Attempt ID is required', 400);
        }

        // Get quiz for passing marks
        const { data: quiz } = await ems.quizzes()
            .select('passing_marks, total_marks')
            .eq('id', quizId)
            .single();

        // Update attempt with answers and mark as completed
        const { error: updateError } = await ems.quizAttempts()
            .update({
                answers: answers,
                submitted_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
                status: 'COMPLETED'
            } as any)
            .eq('id', attempt_id)
            .eq('student_id', student.id);

        if (updateError) throw updateError;

        // Auto-grade the attempt
        const gradedAttempt = await QuizService.autoGradeAttempt(attempt_id);

        // Calculate if passed
        const marksObtained = gradedAttempt.marks_obtained || 0;
        const totalMarks = quiz?.total_marks || gradedAttempt.total_marks || 1;
        const percentage = Math.round((marksObtained / totalMarks) * 100);
        const isPassed = marksObtained >= (quiz?.passing_marks || 0);

        // Final update with percentage and pass status
        const { data: finalAttempt, error: finalError } = await ems.quizAttempts()
            .update({
                percentage,
                is_passed: isPassed
            } as any)
            .eq('id', attempt_id)
            .select('id, marks_obtained, total_marks, percentage, is_passed, submitted_at')
            .single();

        if (finalError) throw finalError;

        return successResponse({
            ...finalAttempt,
            score: finalAttempt.marks_obtained // Map for frontend convenience
        }, 'Quiz submitted and graded successfully');

    } catch (error: any) {
        console.error('Submit Student Quiz Error:', error);
        return errorResponse(null, error.message || 'Failed to submit quiz');
    }
}
