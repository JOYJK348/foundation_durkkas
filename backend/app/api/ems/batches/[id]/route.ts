/**
 * EMS API - Batch Details
 * Route: /api/ems/batches/[id]
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { BatchService } from '@/lib/services/BatchService';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const data = await BatchService.getBatchDetails(parseInt(params.id));

        return successResponse(data, 'Batch details fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Batch not found');
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const body = await req.json();
        const batch = await BatchService.updateBatch(parseInt(params.id), body);

        return successResponse(batch, 'Batch updated successfully');
    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to update batch');
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        await BatchService.softDeleteBatch(parseInt(params.id), userId);

        return successResponse(null, 'Batch deleted successfully');
    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to delete batch');
    }
}
