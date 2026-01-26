import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRoute, getPaginationParams, applyPagination } from '@/lib/apiHelpers';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { jobSeekerApplicationSchema } from '@/lib/validations/crm';

export const GET = apiRoute({
    requireAuth: true,
    requireTenant: true,
    handler: async (req, body, scope) => {
        const params = getPaginationParams(req);
        let query = supabase
            .schema('crm')
            .from('job_seeker_applications')
            .select('*', { count: 'exact' })
            .eq('company_id', scope!.companyId)
            .is('deleted_at', null);

        const search = req.nextUrl.searchParams.get('search');
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,contact_number.ilike.%${search}%`);
        }

        query = applyPagination(query, params);
        const { data, error, count } = await query;
        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);

        return successResponse(data, 'Job seeker applications fetched successfully', 200, {
            total: count || 0,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil((count || 0) / params.limit)
        });
    }
});

export const POST = asyncHandler(async (req: NextRequest) => {
    let body = await req.json();

    // CRM PROTECTION: If user is logged in, auto-attribute to their company/branch
    try {
        const { getUserIdFromToken } = require('@/lib/jwt');
        const { autoAssignCompany } = require('@/middleware/tenantFilter');
        const userId = await getUserIdFromToken(req);
        if (userId) {
            body = await autoAssignCompany(userId, body);
        }
    } catch (e) {
        // Fallback for public submissions
        console.log('[CRM] Public submission detected');
    }

    const validatedData = jobSeekerApplicationSchema.safeParse(body);
    if (!validatedData.success) {
        console.error('[VALIDATION ERROR] Job Seeker:', validatedData.error.errors);
        return errorResponse('VALIDATION_ERROR', validatedData.error.errors[0].message, 400);
    }

    const { data, error } = await supabase
        .schema('crm')
        .from('job_seeker_applications')
        .insert([{
            ...validatedData.data,
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) return errorResponse('DATABASE_ERROR', error.message, 500);
    return successResponse(data, 'Job seeker application submitted successfully', 201);
});
