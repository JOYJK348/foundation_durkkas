import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { successResponse, errorResponse } from '@/lib/errorHandler';

/**
 * HRMS: Training Programs API
 * Route: /api/hrms/training-programs
 */
export async function GET(_req: NextRequest) {
    const { data, error } = await supabaseService
        .schema(SCHEMAS.HRMS)
        .from('training_programs')
        .select(`
            *,
            trainer:employees(full_name, email)
        `);

    if (error) return errorResponse(null, error.message);
    return successResponse(data, 'Training programs fetched successfully');
}
