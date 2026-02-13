/**
 * GST Finance Lab API - Sales Entry
 * Route: POST /api/ems/practice/student/gst-lab/sales
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { GSTFinanceLabService } from '@/lib/services/GSTFinanceLabService';

export const POST = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { companyId, ...salesData } = await req.json();

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    const sales = await GSTFinanceLabService.addSales(companyId, salesData);

    return successResponse(sales, 'Sales entry added successfully. Output GST updated.', 201);
});

export const GET = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const month = searchParams.get('month'); // Optional: YYYY-MM format

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    const sales = await GSTFinanceLabService.getSales(
        parseInt(companyId),
        month || undefined
    );

    return successResponse(sales, 'Sales retrieved successfully');
});
