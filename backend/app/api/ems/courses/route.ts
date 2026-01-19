/**
 * EMS API - Courses (Multi-Tenant)
 * Route: /api/ems/courses
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
            .from('courses')
            .select('*')
            .eq('is_active', true)
            .order('name');

        query = await applyTenantFilter(userId, query);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, `Courses fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch courses');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.name || !data.code) {
            return errorResponse(null, 'name and code are required', 400);
        }

        const { data: course, error } = await supabase
            .from('courses')
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return successResponse(course, 'Course created successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to create course');
    }
}
