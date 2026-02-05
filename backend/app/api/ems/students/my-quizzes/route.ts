/**
 * EMS API - My Quizzes
 * Route: /api/ems/students/my-quizzes
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { ems } from '@/lib/supabase';

export async function GET(req: NextRequest) {
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

        // Get student enrolled course IDs
        const { data: enrollments } = await ems.enrollments()
            .select('course_id')
            .eq('student_id', student.id)
            .eq('company_id', scope.companyId!)
            .eq('enrollment_status', 'ACTIVE')
            .is('deleted_at', null) as any;

        const courseIds = (enrollments as any[])?.map((e: any) => e.course_id) || [];

        if (courseIds.length === 0) {
            return successResponse([], 'No quizzes found (no enrolled courses)');
        }

        // Get quizzes for these courses
        const { data: quizzes, error } = await ems.quizzes()
            .select(`
                id,
                quiz_title,
                quiz_description,
                quiz_type,
                total_questions,
                total_marks,
                passing_marks,
                duration_minutes,
                start_datetime,
                end_datetime,
                max_attempts,
                course:courses (
                    id,
                    course_name
                )
            `)
            .in('course_id', courseIds)
            .eq('company_id', scope.companyId!)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('start_datetime', { ascending: true }) as any;

        if (error) throw error;

        // Get attempts for these quizzes by this student
        const { data: attempts } = await ems.quizAttempts()
            .select('id, quiz_id, attempt_number, marks_obtained, percentage, status, is_passed')
            .eq('student_id', student.id)
            .in('quiz_id', (quizzes as any[])?.map((q: any) => q.id) || []) as any;

        // Combine data
        const mappedQuizzes = (quizzes as any[] || []).map((quiz: any) => {
            const quizAttempts = (attempts as any[])?.filter((a: any) => a.quiz_id === quiz.id) || [];
            const bestAttempt = quizAttempts.sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0];
            const now = new Date();
            const start = quiz.start_datetime ? new Date(quiz.start_datetime) : null;
            const end = quiz.end_datetime ? new Date(quiz.end_datetime) : null;

            let status = 'active';
            if (start && now < start) status = 'upcoming';
            if (end && now > end) status = 'completed';
            if (quizAttempts.some(a => a.status === 'COMPLETED') && status === 'active') {
                if (quizAttempts.length >= quiz.max_attempts) status = 'completed';
            }

            return {
                ...quiz,
                attempts_taken: quizAttempts.length,
                best_score: bestAttempt?.percentage || null,
                is_passed: bestAttempt?.is_passed || false,
                status: status,
                course_name: quiz.course?.course_name
            };
        });

        return successResponse(mappedQuizzes, 'My quizzes fetched successfully');

    } catch (error: any) {
        console.error('My Quizzes Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch your quizzes');
    }
}
