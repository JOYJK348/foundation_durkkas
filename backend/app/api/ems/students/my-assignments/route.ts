/**
 * EMS API - My Assignments
 * Route: /api/ems/students/my-assignments
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
            return successResponse([], 'No assignments found (no enrolled courses)');
        }

        // Get assignments for these courses
        const { data: assignments, error } = await ems.assignments()
            .select(`
                id,
                assignment_title,
                assignment_description,
                deadline,
                max_marks,
                passing_marks,
                course:courses (
                    id,
                    course_name
                )
            `)
            .in('course_id', courseIds)
            .eq('company_id', scope.companyId!)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('deadline', { ascending: true }) as any;

        if (error) throw error;

        // Get submissions for these assignments by this student
        const { data: submissions } = await ems.assignmentSubmissions()
            .select('assignment_id, submission_status, marks_obtained, grade')
            .eq('student_id', student.id)
            .in('assignment_id', (assignments as any[])?.map((a: any) => a.id) || []) as any;

        // Combine data
        const mappedAssignments = (assignments as any[] || []).map((assignment: any) => {
            const submission = (submissions as any[])?.find((s: any) => s.assignment_id === assignment.id);
            return {
                ...assignment,
                status: submission ? (submission.marks_obtained !== null ? 'graded' : 'submitted') : 'pending',
                score: submission?.marks_obtained || null,
                submission_status: submission?.submission_status || null,
                course_name: assignment.course?.course_name
            };
        });

        return successResponse(mappedAssignments, 'My assignments fetched successfully');

    } catch (error: any) {
        console.error('My Assignments Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch your assignments');
    }
}
