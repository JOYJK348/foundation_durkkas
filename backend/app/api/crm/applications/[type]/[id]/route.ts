import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';

/**
 * DYNAMIC CRM APPLICATION HANDLER
 * Supports generic View, Edit, and Soft-Delete for all CRM tracks
 */

const TABLE_MAP: Record<string, string> = {
    'vendor': 'vendor_applications',
    'partner': 'partner',
    'job-seeker': 'job_seeker_applications',
    'internship': 'student_internship_applications',
    'course-enquiry': 'course_enquiry_registrations',
    'career-guidance': 'career_guidance_applications'
};

export async function GET(req: NextRequest, { params }: { params: { type: string, id: string } }) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const { type, id } = params;
        const tableName = TABLE_MAP[type];
        if (!tableName) return errorResponse('INVALID_REQUEST', 'Invalid application type', 400);

        const { data, error } = await supabase
            .schema('crm')
            .from(tableName)
            .select('*')
            .eq('id', id)
            .eq('company_id', scope.companyId)
            .single();

        if (error) throw new Error(error.message);
        if (!data) return errorResponse('NOT_FOUND', 'Lead not found', 404);

        return successResponse(data, 'Lead details fetched');
    } catch (error: any) {
        return errorResponse('DATABASE_ERROR', error.message);
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { type: string, id: string } }) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const { type, id } = params;
        const tableName = TABLE_MAP[type];
        if (!tableName) return errorResponse('INVALID_REQUEST', 'Invalid application type', 400);

        const body = await req.json();

        // Remove restricted fields
        const { id: _, created_at: __, company_id: ___, ...updateData } = body;

        const { data, error } = await supabase
            .schema('crm')
            .from(tableName)
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('company_id', scope.companyId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return successResponse(data, 'Lead updated successfully');
    } catch (error: any) {
        return errorResponse('DATABASE_ERROR', error.message);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { type: string, id: string } }) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const { type, id } = params;
        const tableName = TABLE_MAP[type];
        if (!tableName) return errorResponse('INVALID_REQUEST', 'Invalid application type', 400);

        // Extract reason
        const { searchParams } = new URL(req.url);
        const reason = searchParams.get('reason') || 'No reason provided';

        // 🏗️ SOFT DELETE LOGIC
        const { error } = await supabase
            .schema('crm')
            .from(tableName)
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: userId,
                delete_reason: reason
            })
            .eq('id', id)
            .eq('company_id', scope.companyId);

        if (error) throw new Error(error.message);

        return successResponse(null, 'Lead moved to archives with audit reason');
    } catch (error: any) {
        return errorResponse('DATABASE_ERROR', error.message);
    }
}
