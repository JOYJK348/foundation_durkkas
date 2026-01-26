import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 🔍 SECURITY DEBUG ENDPOINT
 * High-visibility endpoint to check registered sessions in Redis
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return errorResponse('MISSING_USER_ID', 'User ID required', 400);
        }

        const key = `user:${userId}:sessions`;
        const sessions = await redis.lrange(key, 0, -1);

        return successResponse({
            userId,
            key,
            count: sessions.length,
            sessions
        });
    } catch (error: any) {
        return errorResponse('DEBUG_ERROR', error.message, 500);
    }
}
