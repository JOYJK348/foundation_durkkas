/**
 * EMS API - Student Dashboard
 * Route: /api/ems/student/dashboard
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { EnrollmentService } from '@/lib/services/EnrollmentService';
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

        // Get student enrollments with progress
        const enrollments = await EnrollmentService.getStudentEnrollments(
            student.id,
            scope.companyId!
        );

        // Get pending assignments
        const { data: pendingAssignments } = await ems.supabase
            .from('assignments')
            .select(`
                id,
                assignment_title,
                deadline,
                max_marks,
                assignment_submissions!left (
                    id,
                    submission_status
                )
            `)
            .in('course_id', enrollments?.map(e => e.course_id) || [])
            .eq('is_active', true)
            .is('deleted_at', null)
            .gte('deadline', new Date().toISOString())
            .order('deadline', { ascending: true });

        // Filter out already submitted assignments
        const pendingOnly = pendingAssignments?.filter(a =>
            !a.assignment_submissions || a.assignment_submissions.length === 0
        );

        const dashboardData = {
            student: student,
            total_enrollments: enrollments?.length || 0,
            enrollments: enrollments,
            pending_assignments_count: pendingOnly?.length || 0,
            pending_assignments: pendingOnly,
            overall_progress: enrollments?.reduce((acc, e) =>
                acc + (e.completion_percentage || 0), 0
            ) / (enrollments?.length || 1),
        };

        return successResponse(dashboardData, 'Student dashboard data fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch dashboard data');
    }
}
