import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { successResponse, errorResponse } from '@/lib/errorHandler';

/**
 * HRMS: Candidates API
 * Route: /api/hrms/candidates
 */
export async function GET(_req: NextRequest) {
    const { data, error } = await supabaseService
        .schema(SCHEMAS.HRMS)
        .from('candidates')
        .select('*');

    if (error) return errorResponse(null, error.message);
    return successResponse(data, 'Candidates fetched successfully');
}
