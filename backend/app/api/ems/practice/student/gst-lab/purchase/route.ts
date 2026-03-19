/**
 * GST Finance Lab API - Purchase Entry
 * Route: POST /api/ems/practice/student/gst-lab/purchase
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { GSTFinanceLabService } from '@/lib/services/GSTFinanceLabService';

export const POST = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { companyId, ...purchaseData } = await req.json();

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    const purchase = await GSTFinanceLabService.addPurchase(companyId, purchaseData);

    return successResponse(purchase, 'Purchase entry added successfully. ITC updated.', 201);
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

    const purchases = await GSTFinanceLabService.getPurchases(
        parseInt(companyId),
        month || undefined
    );

    return successResponse(purchases, 'Purchases retrieved successfully');
});
