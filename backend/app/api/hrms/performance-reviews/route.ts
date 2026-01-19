import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { successResponse, errorResponse } from '@/lib/errorHandler';

/**
 * HRMS: Performance Reviews API
 * Route: /api/hrms/performance-reviews
 */
export async function GET(_req: NextRequest) {
    const { data, error } = await supabaseService
        .schema(SCHEMAS.HRMS)
        .from('performance_reviews')
        .select(`
            *,
            employee:employees!performance_reviews_employee_id_fkey(full_name, employee_code),
            reviewer:employees!performance_reviews_reviewer_id_fkey(full_name, email),
            appraisal_cycle:appraisal_cycles(title)
        `);

    if (error) return errorResponse(null, error.message);
    return successResponse(data, 'Performance reviews fetched successfully');
}
