/**
 * EMS API - Dashboard Statistics (Multi-Tenant)
 * Route: /api/ems/dashboard/stats
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { EMSStatisticsService } from '@/lib/services/EMSStatisticsService';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        if (!scope.companyId) {
            return errorResponse(null, 'Company context required', 400);
        }

        // Fetch comprehensive dashboard statistics
        const stats = await EMSStatisticsService.getDashboardStats(scope.companyId);

        return successResponse(stats, 'Dashboard statistics fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch dashboard statistics');
    }
}
