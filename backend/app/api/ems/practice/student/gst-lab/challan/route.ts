/**
 * GST Finance Lab API - Challan Generation (PMT-06)
 * Route: POST /api/ems/practice/student/gst-lab/challan
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { GSTFinanceLabService } from '@/lib/services/GSTFinanceLabService';

export const POST = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { returnId } = await req.json();

    if (!returnId) {
        return errorResponse(null, 'Return ID is required', 400);
    }

    const challan = await GSTFinanceLabService.generateChallan(returnId);

    return successResponse(challan, 'Payment challan generated successfully', 201);
});

export const GET = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    const challans = await GSTFinanceLabService.getChallans(parseInt(companyId));

    return successResponse(challans, 'Challans retrieved successfully');
});
