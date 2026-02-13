/**
 * GST Finance Lab API - Monthly Returns (GSTR-3B)
 * Route: POST /api/ems/practice/student/gst-lab/return
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { GSTFinanceLabService } from '@/lib/services/GSTFinanceLabService';

export const POST = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const body = await req.json();
    const { companyId, month, year, action } = body;

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    if (action === 'file') {
        const { returnId } = body;
        if (!returnId) {
            return errorResponse(null, 'Return ID is required for filing', 400);
        }

        const filedReturn = await GSTFinanceLabService.fileReturn(parseInt(returnId as any));
        return successResponse(filedReturn, 'Return filed successfully');
    } else {
        // Generate new return
        if (!month || !year) {
            return errorResponse(null, 'Month and year are required', 400);
        }

        const returnData = await GSTFinanceLabService.generateMonthlyReturn(
            parseInt(companyId as any),
            month,
            year
        );
        return successResponse(returnData, 'Monthly return generated successfully', 201);
    }
});

export const GET = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    const returns = await GSTFinanceLabService.getReturns(parseInt(companyId));

    return successResponse(returns, 'Returns retrieved successfully');
});
