/**
 * GST Finance Lab API - Dashboard
 * Route: GET /api/ems/practice/student/gst-lab/dashboard
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { GSTFinanceLabService } from '@/lib/services/GSTFinanceLabService';

export const GET = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    const dashboard = await GSTFinanceLabService.getDashboard(parseInt(companyId));

    return successResponse(dashboard, 'Dashboard data retrieved successfully');
});
