/**
 * EMS API - Live Classes
 * Route: /api/ems/live-classes
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope, autoAssignCompany } from '@/middleware/tenantFilter';
import { ems } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        // Only show live classes for PUBLISHED courses as per requirement
        let query = ems.liveClasses()
            .select(`
                *,
                courses!inner (
                    course_name,
                    course_code,
                    is_published
                )
            `)
            .eq('courses.is_published', true)
            .eq('company_id', scope.companyId!)
            .is('deleted_at', null)
            .order('scheduled_date', { ascending: true });

        const { data, error } = await query;

        if (error) {
            console.error('❌ [Live Classes GET] Supabase Error:', error);
            // If column doesn't exist, we send a clear message
            if (error.code === '42703') {
                return errorResponse(null, 'Database schema mismatch: status column missing. Please run repair SQL.', 500);
            }
            throw error;
        }

        return successResponse(data, 'Live classes fetched successfully');

    } catch (error: any) {
        console.error('💥 [Live Classes GET] Catch Block:', error);
        return errorResponse(null, error.message || 'Failed to fetch live classes');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);
        const scope = await getUserTenantScope(userId);

        if (data.meeting_platform === 'JITSI' && !data.meeting_id) {
            const timestamp = Date.now().toString(36);
            data.meeting_id = `Durkkas-C${scope.companyId}-${data.course_id}-${timestamp}`;
        }

        // Clean data before insert - convert "" to null for BIGINT columns
        const toInsert: any = {
            ...data,
            company_id: scope.companyId,
            status: 'SCHEDULED', // explicitly set
            batch_id: data.batch_id === "" ? null : parseInt(data.batch_id),
            course_id: parseInt(data.course_id),
            tutor_id: parseInt(data.tutor_id)
        };

        console.log('🚀 [Live Classes] Sanitized data:', JSON.stringify(toInsert, null, 2));

        const { data: liveClass, error } = await ems.liveClasses()
            .insert(toInsert as any)
            .select()
            .single();

        if (error) {
            console.error('❌ [Live Classes POST] Supabase Error:', error);
            throw error;
        }

        return successResponse(liveClass, 'Live class scheduled successfully', 201);

    } catch (error: any) {
        console.error('💥 [Live Classes POST] Catch Block:', error);
        return errorResponse(null, error.message || 'Failed to schedule live class');
    }
}
