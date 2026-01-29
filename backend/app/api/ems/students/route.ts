/**
 * EMS API - Students (Multi-Tenant)
 * Route: /api/ems/students
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserTenantScope, autoAssignCompany } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { studentSchema } from '@/lib/validations/ems';
import { StudentService } from '@/lib/services/StudentService';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        const data = await StudentService.getAllStudents(scope.companyId!);

        return successResponse(data, `Students fetched successfully (${data?.length || 0} records)`);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch students');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();

        // 1. Auto-assign company_id and branch_id based on user session
        data = await autoAssignCompany(userId, data);

        // 2. Validate input using Zod
        const validatedData = studentSchema.parse(data);

        // 3. Insert into database using Service
        const student = await StudentService.createStudent(validatedData);

        return successResponse(student, 'Student admitted successfully', 201);

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to admit student');
    }
}
