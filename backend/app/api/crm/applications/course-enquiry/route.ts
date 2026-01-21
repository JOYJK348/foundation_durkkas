import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRoute, getPaginationParams, applyPagination } from '@/lib/apiHelpers';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { courseEnquirySchema } from '@/lib/validations/crm';

export const GET = apiRoute({
    requireAuth: true,
    requireTenant: true,
    handler: async (req, body, scope) => {
        const params = getPaginationParams(req);
        let query = supabase
            .schema('crm')
            .from('course_enquiry_registrations')
            .select('*', { count: 'exact' })
            .eq('company_id', scope!.companyId)
            .is('deleted_at', null);

        const search = req.nextUrl.searchParams.get('search');
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`);
        }

        query = applyPagination(query, params);
        const { data, error, count } = await query;
        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);

        return successResponse(data, 'Course enquiries fetched successfully', 200, {
            total: count || 0,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil((count || 0) / params.limit)
        });
    }
});

export const POST = asyncHandler(async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = courseEnquirySchema.safeParse(body);
    if (!validatedData.success) {
        return errorResponse('VALIDATION_ERROR', validatedData.error.errors[0].message, 400);
    }

    const { data, error } = await supabase
        .schema('crm')
        .from('course_enquiry_registrations')
        .insert([validatedData.data])
        .select()
        .single();

    if (error) return errorResponse('DATABASE_ERROR', error.message, 500);
    return successResponse(data, 'Course enquiry submitted successfully', 201);
});
