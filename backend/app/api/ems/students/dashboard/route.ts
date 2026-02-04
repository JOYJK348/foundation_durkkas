/**
 * Student Dashboard API
 * Returns all enrolled courses, assignments, quizzes, and progress for the logged-in student
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { ems, app_auth } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        // Get student record from user_id
        const { data: student } = await ems.students()
            .select('id, company_id, first_name, last_name, email, student_code')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single() as any;

        if (!student) {
            return errorResponse(null, 'Student record not found', 404);
        }

        const studentId = (student as any).id;
        const companyId = (student as any).company_id;

        // 1. Get Enrolled Courses with Progress
        const { data: enrollments } = await ems.enrollments()
            .select(`
                id,
                enrollment_date,
                enrollment_status,
                completion_percentage,
                total_lessons,
                lessons_completed,
                course:courses (
                    id,
                    course_code,
                    course_name,
                    course_description,
                    course_level,
                    thumbnail_url,
                    duration_hours,
                    total_lessons
                ),
                batch:batches (
                    id,
                    batch_code,
                    batch_name,
                    start_time,
                    end_time
                )
            `)
            .eq('student_id', studentId)
            .eq('company_id', companyId)
            .eq('enrollment_status', 'ACTIVE')
            .is('deleted_at', null) as any;

        // 2. Get Pending Assignments
        const { data: assignments } = await ems.assignments()
            .select(`
                id,
                assignment_title,
                assignment_description,
                deadline,
                max_marks,
                course:courses (
                    id,
                    course_name
                )
            `)
            .in('course_id', (enrollments as any[])?.map((e: any) => e.course?.id) || [])
            .eq('company_id', companyId)
            .eq('is_active', true)
            .is('deleted_at', null)
            .gte('deadline', new Date().toISOString())
            .order('deadline', { ascending: true })
            .limit(10) as any;

        // Get submission status for each assignment
        const assignmentsWithStatus = await Promise.all(
            ((assignments as any[]) || []).map(async (assignment: any) => {
                const { data: submission } = await ems.assignmentSubmissions()
                    .select('id, submission_status, marks_obtained, submitted_at')
                    .eq('assignment_id', assignment.id)
                    .eq('student_id', studentId)
                    .single() as any;

                return {
                    ...assignment,
                    submission: submission || null,
                    status: submission ? submission.submission_status : 'NOT_SUBMITTED'
                };
            })
        );

        // 3. Get Upcoming Quizzes (Assignment-Aware)
        const enrolledCourseIds = (enrollments as any[])?.map((e: any) => e.course?.id) || [];
        const enrolledBatchIds = (enrollments as any[])?.map((e: any) => e.batch?.id).filter(Boolean) || [];

        // Fetch specifically assigned quiz IDs
        let assignmentQuery = ems.quizAssignments()
            .select('quiz_id, batch_id, student_id')
            .eq('company_id', companyId);

        if (enrolledBatchIds.length > 0) {
            assignmentQuery = assignmentQuery.or(`batch_id.in.(${enrolledBatchIds.join(',')}),student_id.eq.${studentId}`);
        } else {
            assignmentQuery = assignmentQuery.eq('student_id', studentId);
        }

        const { data: assignmentsList } = await assignmentQuery;

        const specificAssignedIds = assignmentsList?.map(a => a.quiz_id) || [];

        // Fetch all quizzes for the courses
        const { data: rawQuizzes } = await ems.quizzes()
            .select(`
                id,
                quiz_title,
                quiz_description,
                total_questions,
                total_marks,
                duration_minutes,
                start_datetime,
                end_datetime,
                max_attempts,
                course:courses (
                    id,
                    course_name
                ),
                quiz_assignments!quiz_id (
                    id,
                    batch_id,
                    student_id
                )
            `)
            .in('course_id', enrolledCourseIds)
            .eq('company_id', companyId)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('start_datetime', { ascending: true }) as any;

        const now = new Date();
        const quizzes = (rawQuizzes as any[] || []).filter(quiz => {
            const isSpecificallyAssigned = specificAssignedIds.includes(quiz.id);
            const hasNoSpecificAssignments = !quiz.quiz_assignments || quiz.quiz_assignments.length === 0;

            // Time check: If end_datetime exists, must be in future/now
            const inTime = !quiz.end_datetime || new Date(quiz.end_datetime) >= now;

            return inTime && (isSpecificallyAssigned || hasNoSpecificAssignments);
        });

        // Get quiz attempt status
        const quizzesWithStatus = await Promise.all(
            ((quizzes as any[]) || []).map(async (quiz: any) => {
                const { data: attempts, count } = await ems.quizAttempts()
                    .select('id, attempt_number, marks_obtained, percentage, status', { count: 'exact' })
                    .eq('quiz_id', quiz.id)
                    .eq('student_id', studentId) as any;

                return {
                    ...quiz,
                    attempts_taken: count || 0,
                    attempts_remaining: (quiz.max_attempts || 0) - (count || 0),
                    best_score: (attempts as any[])?.reduce((max, a) => Math.max(max, a.percentage || 0), 0) || 0,
                    last_attempt: (attempts as any[])?.[(attempts as any[]).length - 1] || null
                };
            })
        );

        // 4. Get Upcoming Live Classes
        const { data: liveClasses } = await ems.liveClasses()
            .select(`
                id,
                class_title,
                class_description,
                scheduled_date,
                start_time,
                end_time,
                meeting_link,
                class_status,
                course:courses (
                    id,
                    course_name
                )
            `)
            .in('course_id', (enrollments as any[])?.map((e: any) => e.course?.id) || [])
            .eq('company_id', companyId)
            .gte('scheduled_date', new Date().toISOString().split('T')[0])
            .is('deleted_at', null)
            .order('scheduled_date', { ascending: true })
            .order('start_time', { ascending: true })
            .limit(5) as any;

        // 5. Calculate Overall Stats
        const stats = {
            total_courses: (enrollments as any[])?.length || 0,
            active_assignments: assignmentsWithStatus?.filter(a => a.status === 'NOT_SUBMITTED').length || 0,
            pending_quizzes: quizzesWithStatus?.filter(q => q.attempts_taken < q.max_attempts).length || 0,
            average_progress: (enrollments as any[])?.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / ((enrollments as any[])?.length || 1) || 0,
            upcoming_classes: (liveClasses as any[])?.length || 0
        };

        return successResponse({
            student: {
                id: (student as any).id,
                name: `${(student as any).first_name} ${(student as any).last_name}`,
                email: (student as any).email,
                student_code: (student as any).student_code
            },
            stats,
            enrolled_courses: enrollments || [],
            pending_assignments: assignmentsWithStatus || [],
            upcoming_quizzes: quizzesWithStatus || [],
            upcoming_live_classes: liveClasses || []
        }, 'Student dashboard data fetched successfully');

    } catch (error: any) {
        console.error('Student Dashboard Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch dashboard data');
    }
}
