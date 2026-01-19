/**
 * HRMS API - Payroll (Multi-Tenant)
 * Route: /api/hrms/payroll
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
            .from('payroll')
            .select(`
                *,
                employees:employee_id (
                    id,
                    first_name,
                    last_name,
                    employee_code
                )
            `)
            .order('pay_period_start', { ascending: false });

        query = await applyTenantFilter(userId, query);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, `Payroll records fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch payroll');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.employee_id || !data.pay_period_start || !data.pay_period_end) {
            return errorResponse(null, 'employee_id, pay_period_start, and pay_period_end are required', 400);
        }

        const { data: payroll, error } = await supabase
            .from('payroll')
            .insert(data)
            .select('*, employees:employee_id (first_name, last_name)')
            .single();

        if (error) throw new Error(error.message);

        return successResponse(payroll, 'Payroll record created successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to create payroll');
    }
}
