/**
 * HRMS API - Job Openings (Multi-Tenant)
 * Route: /api/hrms/job-openings
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
            .from('job_openings')
            .select(`
                *,
                departments:department_id (id, name),
                designations:designation_id (id, title)
            `)
            .order('posted_at', { ascending: false });

        query = await applyTenantFilter(userId, query);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, `Job openings fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch job openings');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.title) {
            return errorResponse(null, 'title is required', 400);
        }

        const { data: jobOpening, error } = await supabase
            .from('job_openings')
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return successResponse(jobOpening, 'Job opening created successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to create job opening');
    }
}
