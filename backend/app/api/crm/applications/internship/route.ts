import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRoute, getPaginationParams, applyPagination } from '@/lib/apiHelpers';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { internshipApplicationSchema } from '@/lib/validations/crm';

export const GET = apiRoute({
    requireAuth: true,
    requireTenant: true,
    handler: async (req, body, scope) => {
        const params = getPaginationParams(req);
        let query = supabase
            .schema('crm')
            .from('student_internship_applications')
            .select('*', { count: 'exact' })
            .eq('company_id', scope!.companyId)
            .is('deleted_at', null);

        const search = req.nextUrl.searchParams.get('search');
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,college_institution_name.ilike.%${search}%`);
        }

        query = applyPagination(query, params);
        const { data, error, count } = await query;
        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);

        return successResponse(data, 'Internship applications fetched successfully', 200, {
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
    }

    const validatedData = internshipApplicationSchema.safeParse(body);
    if (!validatedData.success) {
        return errorResponse('VALIDATION_ERROR', validatedData.error.errors[0].message, 400);
    }

    // DB INTEGRITY: Ensure age is at least 1 to avoid check constraint violation
    if (validatedData.data.age < 1) {
        validatedData.data.age = 1;
    }

    // 🛡️ SCHEMA GUARD: Define columns that actually exist in the DB table
    const DB_COLUMNS = [
        'company_id', 'branch_id', 'date', 'category', 'categoryname', 'full_name',
        'registration_number', 'address', 'email', 'contact_number', 'blood_group',
        'dob', 'age', 'gender', 'college_institution_name', 'course_type',
        'department', 'internship_domain', 'duration', 'upload_file_url', 'remarks'
    ];

    const finalPayload: Record<string, any> = {};
    const extraData: Record<string, any> = {};

    Object.keys(body).forEach(key => {
        if (DB_COLUMNS.includes(key)) {
            // @ts-ignore
            finalPayload[key] = (validatedData.data as any)[key] ?? body[key];
        } else if (body[key] !== undefined && body[key] !== '' && key !== 'id') {
            extraData[key] = body[key];
        }
    });

    Object.keys(validatedData.data).forEach(key => {
        if (DB_COLUMNS.includes(key)) {
            finalPayload[key] = (validatedData.data as any)[key];
        } else {
            // @ts-ignore
            if (validatedData.data[key] !== undefined && validatedData.data[key] !== '') {
                // @ts-ignore
                extraData[key] = validatedData.data[key];
            }
        }
    });

    let finalRemarks = validatedData.data.remarks || '';
    if (Object.keys(extraData).length > 0) {
        const metadataString = `\n--- Additional High-Fidelity Data ---\n${JSON.stringify(extraData, null, 2)}`;
        finalRemarks = finalRemarks ? `${finalRemarks}\n${metadataString}` : metadataString;
    }
    finalPayload.remarks = finalRemarks;
    finalPayload.created_at = new Date().toISOString();

    const { data, error } = await supabase
        .schema('crm')
        .from('student_internship_applications')
        .insert([finalPayload])
        .select()
        .single();

    if (error) return errorResponse('DATABASE_ERROR', error.message, 500);
    return successResponse(data, 'Internship application submitted successfully', 201);
});
