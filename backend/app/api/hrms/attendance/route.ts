/**
 * HRMS API - Attendance (Multi-Tenant)
 * Route: /api/hrms/attendance
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase } from '@/lib/supabase';
import { applyTenantFilter, autoAssignCompany } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let query = supabase
            .from('attendance')
            .select(`
                *,
                employees:employee_id (
                    id,
                    first_name,
                    last_name,
                    employee_code
                )
            `)
            .order('attendance_date', { ascending: false })
            .limit(100);

        query = await applyTenantFilter(userId, query);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, `Attendance records fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch attendance');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.employee_id || !data.attendance_date) {
            return errorResponse(null, 'employee_id and attendance_date are required', 400);
        }

        const { data: attendance, error } = await supabase
            .from('attendance')
            .insert(data)
            .select('*, employees:employee_id (first_name, last_name)')
            .single();

        if (error) throw new Error(error.message);

        return successResponse(attendance, 'Attendance recorded successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to record attendance');
    }
}
