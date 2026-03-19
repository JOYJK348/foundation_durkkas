/**
 * GST Finance Lab API - Payment Simulation
 * Route: POST /api/ems/practice/student/gst-lab/payment
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { GSTFinanceLabService } from '@/lib/services/GSTFinanceLabService';

export const POST = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { challanId } = await req.json();

    if (!challanId) {
        return errorResponse(null, 'Challan ID is required', 400);
    }

    const payment = await GSTFinanceLabService.makePayment(challanId);

    return successResponse(payment, 'Payment completed successfully. Cash ledger updated.', 201);
});

export const GET = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    const payments = await GSTFinanceLabService.getPayments(parseInt(companyId));

    return successResponse(payments, 'Payment history retrieved successfully');
});
