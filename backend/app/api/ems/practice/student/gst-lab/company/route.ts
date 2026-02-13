/**
 * GST Finance Lab API - Company Setup
 * Route: POST /api/ems/practice/student/gst-lab/company
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { GSTFinanceLabService } from '@/lib/services/GSTFinanceLabService';

export const POST = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { allocationId, ...companyData } = await req.json();

    if (!allocationId) {
        return errorResponse(null, 'Allocation ID is required', 400);
    }

    const company = await GSTFinanceLabService.createCompany(allocationId, companyData);

    return successResponse(company, 'GST Company registered successfully', 201);
});

export const GET = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { searchParams } = new URL(req.url);
    const allocationId = searchParams.get('allocationId');

    if (!allocationId) {
        return errorResponse(null, 'Allocation ID is required', 400);
    }

    const company = await GSTFinanceLabService.getCompany(parseInt(allocationId));

    return successResponse(company, 'Company details retrieved');
});
