/**
 * EMS API - Class Attendance Records
 * Route: /api/ems/attendance/class/[id]
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { ems } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const classId = params.id;

        // Fetch attendance records with student details
        const { data, error } = await ems.attendanceRecords()
            .select(`
                *,
                students:student_id (
                    first_name,
                    last_name,
                    student_code,
                    profile_url
                )
            `)
            .eq('class_id', classId)
            .eq('company_id', scope.companyId!);

        if (error) {
            console.error('[Attendance Class] Error:', error);
            throw error;
        }

        return successResponse(data, 'Attendance records fetched successfully');

    } catch (error: any) {
        console.error('[Attendance Class] Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch attendance');
    }
}
