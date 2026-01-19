/**
 * FINANCE API - Invoices (Multi-Tenant)
 * Route: /api/finance/invoices
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
            .from('invoices')
            .select(`
                *,
                students:student_id (id, first_name, last_name, student_code)
            `)
            .order('invoice_date', { ascending: false });

        query = await applyTenantFilter(userId, query);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return successResponse(data, `Invoices fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch invoices');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (!data.invoice_number || !data.total_amount) {
            return errorResponse(null, 'invoice_number and total_amount are required', 400);
        }

        const { data: invoice, error } = await supabase
            .from('invoices')
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return successResponse(invoice, 'Invoice created successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to create invoice');
    }
}
