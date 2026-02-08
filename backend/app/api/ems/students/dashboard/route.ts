/**
 * Student Dashboard API
 * Returns all enrolled courses, assignments, quizzes, and progress for the logged-in student
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { ems, app_auth } from '@/lib/supabase';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { dataCache } from '@/lib/cache/dataCache';
import { AttendanceService } from '@/lib/services/AttendanceService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        // 🚀 CACHE CHECK
        const cacheKey = `student_dashboard_v2:${userId}:${scope.companyId}`;
        const cachedData = dataCache.get(cacheKey);
        if (cachedData) {
            return successResponse(cachedData, 'Student dashboard (cached)');
        }

        // Get student record from user_id
        const { data: student } = await ems.students()
            .select('id, company_id, first_name, last_name, email, student_code')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single() as any;

        if (!student) {
            console.warn('⚠️ [Student Dashboard] Student record not found for user:', userId);
            return errorResponse(null, 'Student profile not found. Please contact your administrator.', 404);
        }

        const studentId = (student as any).id;
        const companyId = (student as any).company_id;

        // 1. Get Enrolled Courses with Progress
        const { data: enrollments } = await ems.enrollments()
            .select(`
                id,
                course_id,
                batch_id,
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
            .in('course_id', (enrollments as any[])?.map((e: any) => e.course_id) || [])
            .eq('company_id', companyId)
            .eq('is_active', true)
            .is('deleted_at', null)
            .gte('deadline', new Date().toISOString())
            .order('deadline', { ascending: true })
            .limit(10) as any;

        console.log('--- Student Dashboard Debug ---');
        console.log('Current Time:', new Date().toISOString());
        console.log('Enrolled Course IDs (Direct):', (enrollments as any[])?.map((e: any) => e.course_id));
        console.log('Assignments Fetched:', (assignments as any[])?.map((a: any) => ({ id: a.id, title: a.assignment_title, deadline: a.deadline })));


        // 3. Get submission status for all assignments at once (OPTIMIZED)
        const { data: allSubmissions } = await ems.assignmentSubmissions()
            .select('id, assignment_id, submission_status, marks_obtained, submitted_at')
            .in('assignment_id', (assignments as any[])?.map(a => a.id) || [])
            .eq('student_id', studentId) as any;

        const submissionMap = new Map((allSubmissions || []).map((s: any) => [s.assignment_id, s]));

        const assignmentsWithStatus = (assignments as any[])?.map(assignment => ({
            ...assignment,
            submission: submissionMap.get(assignment.id) || null,
            status: (submissionMap.get(assignment.id) as any)?.submission_status || 'NOT_SUBMITTED'
        })) || [];

        // 3. Get Upcoming Quizzes (Assignment-Aware)
        const enrolledCourseIds = (enrollments as any[])?.map((e: any) => e.course_id) || [];
        const enrolledBatchIds = (enrollments as any[])?.map((e: any) => e.batch_id).filter(Boolean) || [];

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

        // 4. Get quiz attempt status (OPTIMIZED)
        const { data: allAttempts } = await ems.quizAttempts()
            .select('id, quiz_id, attempt_number, marks_obtained, percentage, status')
            .in('quiz_id', (quizzes as any[])?.map(q => q.id) || [])
            .eq('student_id', studentId) as any;

        const attemptMap = new Map();
        (allAttempts || []).forEach((a: any) => {
            if (!attemptMap.has(a.quiz_id)) attemptMap.set(a.quiz_id, []);
            attemptMap.get(a.quiz_id).push(a);
        });

        const quizzesWithStatus = (quizzes as any[])?.map(quiz => {
            const quizAttempts = attemptMap.get(quiz.id) || [];
            return {
                ...quiz,
                attempts_taken: quizAttempts.length,
                attempts_remaining: (quiz.max_attempts || 0) - quizAttempts.length,
                best_score: quizAttempts.reduce((max: number, a: any) => Math.max(max, a.percentage || 0), 0),
                last_attempt: quizAttempts[quizAttempts.length - 1] || null
            };
        }) || [];

        // 4. Get Upcoming Live Classes
        // Filter: Course ID must be in enrolled courses AND (batch_id must match student's enrolled batch OR batch_id is NULL)
        const enrolledBatchIdsRaw = (enrollments as any[])?.map((e: any) => e.batch_id).filter(Boolean) || [];

        const { data: rawLiveClasses } = await ems.liveClasses()
            .select(`
                id,
                class_title,
                class_description,
                scheduled_date,
                start_time,
                end_time,
                meeting_link,
                class_status,
                batch_id,
                course:courses (
                    id,
                    course_name
                )
            `)
            .in('course_id', (enrollments as any[])?.map((e: any) => e.course_id) || [])
            .eq('company_id', companyId)
            .gte('scheduled_date', new Date().toISOString().split('T')[0])
            .is('deleted_at', null)
            .order('scheduled_date', { ascending: true })
            .order('start_time', { ascending: true })
            .limit(20) as any;

        // In-memory filter for precise batch matching
        const liveClasses = (rawLiveClasses as any[] || []).filter(c => {
            // If class is for a specific batch, student must be in it
            if (c.batch_id) {
                return enrolledBatchIdsRaw.includes(c.batch_id);
            }
            // If no batch_id, it's global for the course
            return true;
        }).slice(0, 5);

        // 5. Get Active Attendance Sessions for today
        const activeSessions = (await AttendanceService.getStudentActiveSessionsWithStatus(companyId, studentId))
            .filter(s => s.recommended_action !== 'COMPLETED');

        // 6. Calculate Overall Stats
        const stats = {
            total_courses: (enrollments as any[])?.length || 0,
            active_assignments: assignmentsWithStatus?.filter(a => a.status === 'NOT_SUBMITTED').length || 0,
            pending_quizzes: quizzesWithStatus?.filter(q => q.attempts_taken < q.max_attempts).length || 0,
            average_progress: (enrollments as any[])?.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / ((enrollments as any[])?.length || 1) || 0,
            upcoming_classes: (liveClasses as any[])?.length || 0
        };

        const responseData = {
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
            upcoming_live_classes: liveClasses || [],
            active_attendance_sessions: activeSessions
        };

        // 🚀 CACHE SET
        dataCache.set(cacheKey, responseData, 5 * 1000); // 5 seconds cache

        return successResponse(responseData, 'Student dashboard data fetched successfully');

    } catch (error: any) {
        console.error('❌ [Student Dashboard API] Error:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            timestamp: new Date().toISOString()
        });

        // Provide specific error messages based on error type
        let errorMessage = 'Failed to fetch dashboard data';

        if (error.message?.includes('Student record not found')) {
            errorMessage = 'Student profile not found. Please contact your administrator.';
        } else if (error.code === 'PGRST116') {
            errorMessage = 'No data found. Your enrollment may be pending.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return errorResponse(null, errorMessage, error.status || 500);
    }
}
