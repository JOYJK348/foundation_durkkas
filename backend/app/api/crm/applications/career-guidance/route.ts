import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRoute, getPaginationParams, applyPagination } from '@/lib/apiHelpers';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { careerGuidanceSchema } from '@/lib/validations/crm';

export const GET = apiRoute({
    requireAuth: true,
    requireTenant: true,
    handler: async (req, body, scope) => {
        const params = getPaginationParams(req);
        let query = supabase
            .schema('crm')
            .from('career_guidance_applications')
            .select('*', { count: 'exact' })
            .eq('company_id', scope!.companyId)
            .is('deleted_at', null);

        const search = req.nextUrl.searchParams.get('search');
        if (search) {
            query = query.or(`student_name.ilike.%${search}%,email.ilike.%${search}%,contact_number.ilike.%${search}%`);
        }

        query = applyPagination(query, params);
        const { data, error, count } = await query;
        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);

        return successResponse(data, 'Career guidance applications fetched successfully', 200, {
            total: count || 0,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil((count || 0) / params.limit)
        });
    }
});

export const POST = asyncHandler(async (req: NextRequest) => {
    let body = await req.json();
    console.log('🚀 [CRM] Career Guidance Submission Body:', body);

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

    const validatedData = careerGuidanceSchema.safeParse(body);
    if (!validatedData.success) {
        console.error('❌ [CRM] Validation Error:', validatedData.error.errors);
        return errorResponse('VALIDATION_ERROR', validatedData.error.errors[0].message, 400);
    }

    // DB INTEGRITY: Ensure age is at least 1 to avoid check constraint violation
    if (validatedData.data.age < 1) {
        validatedData.data.age = 1;
    }

    // 🛡️ SCHEMA GUARD: Define columns that actually exist in the DB table
    // Based on database audit, these are the safe columns.
    const DB_COLUMNS = [
        'company_id', 'branch_id', 'date', 'category', 'categoryname', 'student_name',
        'standard_year', 'date_of_birth', 'age', 'gender', 'location', 'contact_number',
        'email', 'parent_guardian_name', 'studies_preference', 'abroad_local',
        'preferred_country', 'city_if_abroad', 'preferred_university', 'career_interest',
        'skills_strengths', 'academic_performance', 'hobbies_extracurricular',
        'preferred_mode_of_study', 'career_support_duration', 'mentorship_required',
        'remarks_notes', 'candidate_name', 'education_level', 'pincode', 'city',
        'well_performing_subjects', 'enjoyed_activities', 'prefer_working_with',
        'solve_problems_logically', 'enjoy_creative_tasks', 'test_reason',
        'comfortable_with_assessments', 'current_qualification',
        'highest_qualification_completed', 'academic_score_gpa',
        'medium_of_instruction', 'intended_level_of_study', 'english_test_status',
        'target_intake_year', 'budget_range'
    ];

    const finalPayload: Record<string, any> = {};
    const extraData: Record<string, any> = {};

    // First, process everything in the request body
    Object.keys(body).forEach(key => {
        if (DB_COLUMNS.includes(key)) {
            // If it's a DB column and in validatedData, use validated version (coerced)
            // @ts-ignore
            finalPayload[key] = (validatedData.data as any)[key] ?? body[key];
        } else if (body[key] !== undefined && body[key] !== '' && key !== 'id') {
            // It's extra data
            extraData[key] = body[key];
        }
    });

    // Second, ensure all validated fields that ARE DB columns are included
    Object.keys(validatedData.data).forEach(key => {
        if (DB_COLUMNS.includes(key)) {
            finalPayload[key] = (validatedData.data as any)[key];
        } else {
            // A validated field that isn't a DB column (like career_goal)
            // @ts-ignore
            if (validatedData.data[key] !== undefined && validatedData.data[key] !== '') {
                // @ts-ignore
                extraData[key] = validatedData.data[key];
            }
        }
    });

    // Handle Remarks / Metadata Fusion
    let finalRemarks = validatedData.data.remarks_notes || '';
    if (Object.keys(extraData).length > 0) {
        const metadataString = `\n--- Additional High-Fidelity Data ---\n${JSON.stringify(extraData, null, 2)}`;
        finalRemarks = finalRemarks ? `${finalRemarks}\n${metadataString}` : metadataString;
    }
    finalPayload.remarks_notes = finalRemarks;
    finalPayload.created_at = new Date().toISOString();

    console.log('🚀 [CRM] Ingesting Schema-Aware Payload:', Object.keys(finalPayload));

    const { data, error } = await supabase
        .schema('crm')
        .from('career_guidance_applications')
        .insert([finalPayload])
        .select()
        .single();

    if (error) {
        console.error('❌ [CRM] Database Error:', error);
        return errorResponse('DATABASE_ERROR', error.message, 500);
    }

    console.log('✅ [CRM] Submission Success:', data.id);
    return successResponse(data, 'Career guidance application submitted successfully', 201);
});
