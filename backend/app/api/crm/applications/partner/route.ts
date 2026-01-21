import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRoute, getPaginationParams, applyPagination } from '@/lib/apiHelpers';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { z } from 'zod';

// Simple validation for partner
const partnerSchema = z.object({
    date: z.string(),
    company_id: z.number(),
    branch_id: z.number().optional().nullable(),
    category: z.string().min(1),
    categoryname: z.string().optional().nullable(),
    contact_person_name: z.string().min(1),
    organization_name: z.string().min(1),
    organization_address: z.string().min(1),
    email: z.string().email(),
    phone_number: z.string().min(10),
    upload_file_url: z.string().optional().nullable(),
    remarks: z.string().optional().nullable(),
});

export const GET = apiRoute({
    requireAuth: true,
    requireTenant: true,
    handler: async (req, body, scope) => {
        const params = getPaginationParams(req);
        let query = supabase
            .schema('crm')
            .from('partner')
            .select('*', { count: 'exact' })
            .eq('company_id', scope!.companyId)
            .is('deleted_at', null);

        const search = req.nextUrl.searchParams.get('search');
        if (search) {
            query = query.or(`contact_person_name.ilike.%${search}%,organization_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        query = applyPagination(query, params);
        const { data, error, count } = await query;
        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);

        return successResponse(data, 'Partners fetched successfully', 200, {
            total: count || 0,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil((count || 0) / params.limit)
        });
    }
});

export const POST = asyncHandler(async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = partnerSchema.safeParse(body);
    if (!validatedData.success) {
        return errorResponse('VALIDATION_ERROR', validatedData.error.errors[0].message, 400);
    }

    const { data, error } = await supabase
        .schema('crm')
        .from('partner')
        .insert([validatedData.data])
        .select()
        .single();

    if (error) return errorResponse('DATABASE_ERROR', error.message, 500);
    return successResponse(data, 'Partner registration submitted successfully', 201);
});
