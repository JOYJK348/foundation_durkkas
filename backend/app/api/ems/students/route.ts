/**
 * EMS API - Students (Multi-Tenant)
 * Route: /api/ems/students
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
            .from('students')
            .select(`
                *,
                companies:company_id (id, name),
                branches:branch_id (id, name)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        query = await applyTenantFilter(userId, query);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, `Students fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch students');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.first_name || !data.student_code) {
            return errorResponse(null, 'first_name and student_code are required', 400);
        }

        const { data: student, error } = await supabase
            .from('students')
            .insert(data)
            .select('*, companies:company_id (id, name)')
            .single();

        if (error) throw new Error(error.message);

        return successResponse(student, 'Student created successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to create student');
    }
}
