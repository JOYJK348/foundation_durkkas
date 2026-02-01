/**
 * EMS API - Tutor Dashboard
 * Route: /api/ems/tutor/dashboard
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { AssessmentService } from '@/lib/services/AssessmentService';
import { ems } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await import('@/middleware/tenantFilter').then(m =>
            m.getUserTenantScope(userId)
        );

        const { core } = require('@/lib/supabase');

        // Get tutor's employee record
        const { data: employee } = await core.employees()
            .select('id')
            .eq('user_id', userId)
            .eq('company_id', scope.companyId!)
            .single();

        if (!employee) {
            return errorResponse(null, 'Employee record not found', 404);
        }

        // Get pending assignments for grading
        const pendingAssignments = await AssessmentService.getPendingAssignments(
            employee.id,
            scope.companyId!
        );

        // Get tutor's courses (Including Drafts so they can work on them)
        const { data: courses } = await ems.courses()
            .select(`
                id, 
                course_name, 
                course_code, 
                total_lessons, 
                is_published,
                course_modules(count)
            `)
            .eq('tutor_id', employee.id)
            .eq('company_id', scope.companyId!)
            .eq('is_active', true);

        // Transform module count
        const coursesWithStats = courses?.map((c: any) => ({
            ...c,
            modules_count: c.course_modules?.[0]?.count || 0
        }));

        // Get today's live classes (if implemented)
        const today = new Date().toISOString().split('T')[0];
        const { data: liveClasses } = await ems.supabase
            .from('live_classes')
            .select('*')
            .eq('tutor_id', employee.id)
            .eq('company_id', scope.companyId!)
            .gte('scheduled_date', today)
            .order('scheduled_date', { ascending: true })
            .limit(5);

        const dashboardData = {
            tutor_id: employee.id,
            pending_grading_count: pendingAssignments?.length || 0,
            pending_assignments: pendingAssignments,
            total_courses: coursesWithStats?.length || 0,
            courses: coursesWithStats || [],
            upcoming_classes: liveClasses || [],
        };

        return successResponse(dashboardData, 'Tutor dashboard data fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch dashboard data');
    }
}
