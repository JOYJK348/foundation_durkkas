/**
 * EMS API - Update Live Class Status
 * Route: /api/ems/live-classes/[id]/status
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { ems } from '@/lib/supabase';

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { id } = await context.params;
        const classId = parseInt(id);
        const scope = await getUserTenantScope(userId);
        const { status, recording_url } = await req.json();

        if (!status) {
            return errorResponse(null, 'Status is required', 400);
        }

        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (recording_url) {
            updateData.recording_url = recording_url;
        }

        const { data, error } = await ems.liveClasses()
            .update(updateData)
            .eq('id', classId)
            .eq('company_id', scope.companyId!)
            .select()
            .single();

        if (error) throw error;

        return successResponse(data, `Class status updated to ${status}`);

    } catch (error: any) {
        console.error('[Live Class Status] Error:', error);
        return errorResponse(null, error.message || 'Failed to update status');
    }
}
