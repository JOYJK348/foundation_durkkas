/**
 * EMS API - Single Student Operations
 * Route: /api/ems/students/[id]
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { studentSchema } from '@/lib/validations/ems';
import { StudentService } from '@/lib/services/StudentService';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        // Security check handled by StudentService or scoped query
        const data = await StudentService.getStudentById(parseInt(params.id));

        // Final security check: Ensure it belongs to the user's company
        const scope = await getUserTenantScope(userId);
        if (data.company_id !== scope.companyId && scope.roleLevel < 5) {
            return errorResponse(null, 'Forbidden', 403);
        }

        return successResponse(data, 'Student fetched successfully');
    } catch (error: any) {
        return errorResponse(null, error.message || 'Student not found');
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const body = await req.json();
        const validatedData = studentSchema.partial().parse(body);

        // Security check
        const scope = await getUserTenantScope(userId);
        const existing = await StudentService.getStudentById(parseInt(params.id));

        if (existing.company_id !== scope.companyId && scope.roleLevel < 5) {
            return errorResponse(null, 'Forbidden', 403);
        }

        const student = await StudentService.updateStudent(parseInt(params.id), validatedData);

        return successResponse(student, 'Student updated successfully');
    } catch (error: any) {
        if (error.name === 'ZodError') return errorResponse(error.errors, 'Validation failed', 400);
        return errorResponse(null, error.message || 'Failed to update student');
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        // Security check
        const scope = await getUserTenantScope(userId);
        const existing = await StudentService.getStudentById(parseInt(params.id));

        if (existing.company_id !== scope.companyId && scope.roleLevel < 5) {
            return errorResponse(null, 'Forbidden', 403);
        }

        await StudentService.softDeleteStudent(
            parseInt(params.id),
            userId,
            'Deleted via API'
        );

        return successResponse(null, 'Student deleted successfully');
    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to delete student');
    }
}
