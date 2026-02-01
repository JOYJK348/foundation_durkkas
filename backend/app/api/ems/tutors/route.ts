/**
 * EMS API - Tutors
 * Route: /api/ems/tutors
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { autoAssignCompany, getUserTenantScope } from '@/middleware/tenantFilter';
import { TutorService } from '@/lib/services/TutorService';

export async function GET(req: NextRequest) {
    try {
        const userIdHeader = req.headers.get('x-user-id');
        const userId = userIdHeader ? parseInt(userIdHeader) : null;

        if (!userId) {
            console.error('🚨 [Tutors API] No User ID found in headers');
            return errorResponse(null, 'Unauthorized', 401);
        }

        const scope = await getUserTenantScope(userId);
        if (!scope.companyId) return errorResponse(null, 'Company context required', 400);

        const data = await TutorService.getAllTutors(scope.companyId);
        return successResponse(data, `Tutors fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch tutors');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userIdHeader = req.headers.get('x-user-id');
        const userId = userIdHeader ? parseInt(userIdHeader) : null;

        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();

        // Auto-assign company and branch context
        data = await autoAssignCompany(userId, data);

        const tutor = await TutorService.createTutor(data);

        return successResponse(tutor, 'Tutor added successfully', 201);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to add tutor');
    }
}
