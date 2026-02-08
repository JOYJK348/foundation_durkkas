/**
 * EMS API - Batches
 * Route: /api/ems/batches
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { autoAssignCompany, getUserTenantScope } from '@/middleware/tenantFilter';
import { batchSchema } from '@/lib/validations/ems';
import { BatchService } from '@/lib/services/BatchService';
import { dataCache } from '@/lib/cache/dataCache';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('course_id');

        // 🚀 CACHE CHECK (Only for "all batches" query which we use for prefetching)
        const isAllBatchesByCompany = !courseId;
        const cacheKey = `ems_batches:${scope.companyId}:${scope.branchId || 'global'}`;

        if (isAllBatchesByCompany) {
            const cachedData = dataCache.get(cacheKey);
            if (cachedData) {
                return successResponse(cachedData, 'Batches fetched successfully (cached)');
            }
        }

        const data = await BatchService.getAllBatches(
            scope.companyId!,
            scope.branchId || undefined,
            courseId ? parseInt(courseId) : undefined
        );

        // 🚀 CACHE SET
        if (isAllBatchesByCompany) {
            dataCache.set(cacheKey, data, 2 * 60 * 1000); // 2 minutes cache
        }

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
