/**
 * CRM API - Leads (Multi-Tenant)
 * Route: /api/crm/leads
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
            .from('leads')
            .select(`
                *,
                assigned_employee:assigned_to (id, first_name, last_name)
            `)
            .order('created_at', { ascending: false });

        query = await applyTenantFilter(userId, query);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, `Leads fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch leads');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.first_name) {
            return errorResponse(null, 'first_name is required', 400);
        }

        const { data: lead, error } = await supabase
            .from('leads')
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return successResponse(lead, 'Lead created successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to create lead');
    }
}
