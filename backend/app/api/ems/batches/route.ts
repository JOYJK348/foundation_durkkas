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
    console.log('[BatchesRoute] POST request received');
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        console.log('[BatchesRoute] Raw payload:', data);

        data = await autoAssignCompany(userId, data);
        console.log('[BatchesRoute] Payload after autoAssignCompany:', data);

        try {
            const validatedData = batchSchema.parse(data);
            console.log('[BatchesRoute] Validation successful');

            const batch = await BatchService.createBatch(validatedData);
            console.log('[BatchesRoute] Batch created successfully:', batch.id);

            // 🚀 INVALIDATE CACHE
            try {
                const scope = await getUserTenantScope(userId);
                const cacheKey = `ems_batches:${scope.companyId}`;
                dataCache.invalidate(cacheKey);
                console.log('[BatchesRoute] Cache invalidated with pattern:', cacheKey);
            } catch (cacheErr) {
                console.warn('[BatchesRoute] Cache invalidation failed (non-critical):', cacheErr);
            }

            return successResponse(batch, 'Batch created successfully', 201);
        } catch (valErr: any) {
            if (valErr.name === 'ZodError') {
                console.error('[BatchesRoute] Validation Error:', valErr.errors);
                return errorResponse('VALIDATION_ERROR', valErr.errors[0]?.message || 'Validation failed', 400, valErr.errors);
            }
            throw valErr;
        }

    } catch (error: any) {
        console.error('[BatchesRoute] Fatal Error:', error.message, error.stack);
        return errorResponse('INTERNAL_SERVER_ERROR', error.message || 'Failed to create batch', 500);
    }
}
