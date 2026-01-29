/**
 * EMS API - Live Classes
 * Route: /api/ems/live-classes
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { autoAssignCompany, getUserTenantScope } from '@/middleware/tenantFilter';
import { liveClassSchema } from '@/lib/validations/ems';
import { LiveClassService } from '@/lib/services/LiveClassService';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const { searchParams } = new URL(req.url);
        const tutorId = searchParams.get('tutor_id');

        const data = await LiveClassService.getAllLiveClasses(
            scope.companyId!,
            tutorId ? parseInt(tutorId) : undefined
        );

        return successResponse(data, `Live classes fetched successfully`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch live classes');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        const validatedData = liveClassSchema.parse(data);

        const liveClass = await LiveClassService.createLiveClass(validatedData);

        return successResponse(liveClass, 'Live class scheduled successfully', 201);

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to schedule live class');
    }
}
