/**
 * EMS API - Single Quiz
 * Route: /api/ems/quizzes/[id]
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { ems } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { id } = await context.params;
        const quizId = parseInt(id);
        const scope = await getUserTenantScope(userId);

        const { data, error } = await ems.quizzes()
            .select(`
                *,
                courses:course_id (
                    course_name,
                    course_code
                )
            `)
            .eq('id', quizId)
            .eq('company_id', scope.companyId!)
            .is('deleted_at', null)
            .single();

        if (error) throw error;

        return successResponse(data, 'Quiz fetched successfully');

    } catch (error: any) {
        console.error('[Quiz GET] Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch quiz');
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { id } = await context.params;
        const quizId = parseInt(id);
        const scope = await getUserTenantScope(userId);
        const updateData = await req.json();

        const { data, error } = await ems.quizzes()
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
                updated_by: userId,
            })
            .eq('id', quizId)
            .eq('company_id', scope.companyId!)
            .select()
            .single();

        if (error) throw error;

        return successResponse(data, 'Quiz updated successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to update quiz');
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { id } = await context.params;
        const quizId = parseInt(id);
        const scope = await getUserTenantScope(userId);

        const { error } = await ems.quizzes()
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: userId,
            })
            .eq('id', quizId)
            .eq('company_id', scope.companyId!);

        if (error) throw error;

        return successResponse(null, 'Quiz deleted successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to delete quiz');
    }
}
