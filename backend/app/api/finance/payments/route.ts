import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/errorHandler';

export async function GET(req: NextRequest) {
    return successResponse([], 'Records fetched successfully');
}
