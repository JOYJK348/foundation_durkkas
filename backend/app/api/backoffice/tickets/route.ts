import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/errorHandler';

export async function GET(_req: NextRequest) {
    return successResponse([], 'Records fetched successfully');
}
