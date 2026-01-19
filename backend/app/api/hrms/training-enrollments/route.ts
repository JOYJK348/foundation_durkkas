import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { successResponse, errorResponse } from '@/lib/errorHandler';

/**
 * HRMS: Training Enrollments API
 * Route: /api/hrms/training-enrollments
 */
export async function GET(_req: NextRequest) {
    const { data, error } = await supabaseService
        .schema(SCHEMAS.HRMS)
        .from('training_enrollments')
        .select(`
            *,
            training_program:training_programs(title),
            employee:employees(full_name, employee_code)
        `);

    if (error) return errorResponse(null, error.message);
    return successResponse(data, 'Training enrollments fetched successfully');
}
