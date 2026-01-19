/**
 * HRMS API - Leaves (Multi-Tenant)
 * Route: /api/hrms/leaves
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
            .from('leaves')
            .select(`
                *,
                employees:employee_id (id, first_name, last_name, employee_code),
                leave_types:leave_type_id (id, name, is_paid)
            `)
            .order('created_at', { ascending: false });

        query = await applyTenantFilter(userId, query);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, `Leave requests fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch leaves');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.employee_id || !data.leave_type_id || !data.from_date || !data.to_date) {
            return errorResponse(null, 'employee_id, leave_type_id, from_date, and to_date are required', 400);
        }

        const { data: leave, error } = await supabase
            .from('leaves')
            .insert(data)
            .select(`
                *,
                employees:employee_id (first_name, last_name),
                leave_types:leave_type_id (name)
            `)
            .single();

        if (error) throw new Error(error.message);

        return successResponse(leave, 'Leave request created successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to create leave request');
    }
}
