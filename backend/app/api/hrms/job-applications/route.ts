import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { successResponse, errorResponse } from '@/lib/errorHandler';

/**
 * HRMS: Job Applications API
 * Route: /api/hrms/job-applications
 */
export async function GET(_req: NextRequest) {
    const { data, error } = await supabaseService
        .schema(SCHEMAS.HRMS)
        .from('job_applications')
        .select(`
            *,
            job_opening:job_openings(title),
            candidate:candidates(first_name, last_name, email)
        `);

    if (error) return errorResponse(null, error.message);
    return successResponse(data, 'Job applications fetched successfully');
}
