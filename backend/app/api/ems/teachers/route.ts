import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { successResponse, errorResponse } from '@/lib/errorHandler';

/**
 * EMS (Education): Teachers API
 * Route: /api/ems/teachers
 */
export async function GET(_req: NextRequest) {
    // Teachers are employees with teacher designation or linked to batches
    const { data, error } = await supabaseService
        .schema(SCHEMAS.HRMS)
        .from('employees')
        .select(`
            *,
            designation:designations(title)
        `)
        .ilike('designation.title', '%teacher%');

    if (error) return errorResponse(null, error.message);
    return successResponse(data, 'Teachers fetched successfully');
}
