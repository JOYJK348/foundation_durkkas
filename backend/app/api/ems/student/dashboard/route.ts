/**
 * EMS API - Student Dashboard
 * Route: /api/ems/student/dashboard
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
            .select('id, student_code, first_name, last_name, email')
            .eq('user_id', userId)
            .eq('company_id', scope.companyId!)
            .single();

        if (!student) {
            return errorResponse(null, 'Student record not found', 404);
        }

        // Get student enrollments (simplified query)
        const { data: enrollments, error: enrollError } = await ems.enrollments()
            .select('*')
            .eq('student_id', student.id)
            .eq('company_id', scope.companyId!)
            .is('deleted_at', null)
            .order('enrollment_date', { ascending: false });

        if (enrollError) {
            console.error('Enrollment fetch error:', enrollError);
        }

        // Get course names for enrollments
        const enrollmentsWithCourses = await Promise.all(
            (enrollments || []).map(async (enrollment) => {
                const { data: course } = await ems.courses()
                    .select('course_name, course_code')
                    .eq('id', enrollment.course_id)
                    .single();

                return {
                    ...enrollment,
                    course_name: course?.course_name || 'Unknown Course',
                    course_code: course?.course_code || 'N/A'
                };
            })
        );

        // Get pending assignments (only if student has enrollments)
        let pendingAssignments: any[] = [];
        if (enrollmentsWithCourses && enrollmentsWithCourses.length > 0) {
            const courseIds = enrollmentsWithCourses.map(e => e.course_id);
            const { data } = await ems.supabase
                .schema('ems')
                .from('assignments')
                .select(`
                    id,
                    assignment_title,
                    deadline,
                    max_marks
                `)
                .in('course_id', courseIds)
                .eq('is_active', true)
                .is('deleted_at', null)
                .gte('deadline', new Date().toISOString())
                .order('deadline', { ascending: true });

            pendingAssignments = data || [];
        }

        const dashboardData = {
            student: student,
            total_enrollments: enrollmentsWithCourses?.length || 0,
            enrollments: enrollmentsWithCourses,
            pending_assignments_count: pendingAssignments?.length || 0,
            pending_assignments: pendingAssignments,
            overall_progress: enrollmentsWithCourses?.reduce((acc, e) =>
                acc + (e.completion_percentage || 0), 0
            ) / (enrollmentsWithCourses?.length || 1),
        };

        return successResponse(dashboardData, 'Student dashboard data fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch dashboard data');
    }
}
