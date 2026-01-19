import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { successResponse, errorResponse } from '@/lib/errorHandler';

/**
 * HRMS: Interviews API
 * Route: /api/hrms/interviews
 */
export async function GET(_req: NextRequest) {
    const { data, error } = await supabaseService
        .schema(SCHEMAS.HRMS)
        .from('interviews')
        .select(`
            *,
            job_application:job_applications(status),
            interviewer:employees(full_name, email)
        `);

    if (error) return errorResponse(null, error.message);
    return successResponse(data, 'Interviews fetched successfully');
}
