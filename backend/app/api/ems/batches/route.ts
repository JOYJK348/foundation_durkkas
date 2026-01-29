/**
 * EMS API - Batches
 * Route: /api/ems/batches
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { autoAssignCompany } from '@/middleware/tenantFilter';
import { batchSchema } from '@/lib/validations/ems';
import { BatchService } from '@/lib/services/BatchService';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await import('@/middleware/tenantFilter').then(m =>
            m.getUserTenantScope(userId)
        );

        const data = await BatchService.getAllBatches(
            scope.companyId!,
            scope.branchId || undefined
        );

        return successResponse(data, `Batches fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch batches');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        const validatedData = batchSchema.parse(data);

        const batch = await BatchService.createBatch(validatedData);

        return successResponse(batch, 'Batch created successfully', 201);

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to create batch');
    }
}
