import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRoute, getPaginationParams, applyPagination } from '@/lib/apiHelpers';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { b2bApplicationSchema } from '@/lib/validations/crm';

export const GET = apiRoute({
    requireAuth: true,
    requireTenant: true,
    handler: async (req, body, scope) => {
        const params = getPaginationParams(req);
        let query = supabase
            .schema('crm')
            .from('b2b_applications')
            .select('*', { count: 'exact' })
            .eq('company_id', scope!.companyId)
            .is('deleted_at', null);

        const search = req.nextUrl.searchParams.get('search');
        if (search) {
            query = query.or(`contact_person_name.ilike.%${search}%,organization_name.ilike.%${search}%,company_website_email.ilike.%${search}%`);
        }

        query = applyPagination(query, params);
        const { data, error, count } = await query;
        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);

        return successResponse(data, 'B2B applications fetched successfully', 200, {
            total: count || 0,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil((count || 0) / params.limit)
        });
    }
});

export const POST = asyncHandler(async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = b2bApplicationSchema.safeParse(body);
    if (!validatedData.success) {
        return errorResponse('VALIDATION_ERROR', validatedData.error.errors[0].message, 400);
    }

    const { data, error } = await supabase
        .schema('crm')
        .from('b2b_applications')
        .insert([validatedData.data])
        .select()
        .single();

    if (error) return errorResponse('DATABASE_ERROR', error.message, 500);
    return successResponse(data, 'B2B application submitted successfully', 201);
});
