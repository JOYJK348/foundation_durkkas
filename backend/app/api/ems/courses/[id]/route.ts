/**
 * EMS API - Single Course Operations
 * Route: /api/ems/courses/[id]
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { courseSchema } from '@/lib/validations/ems';
import { CourseService } from '@/lib/services/CourseService';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userIdHeader = req.headers.get('x-user-id');
        const userId = userIdHeader ? parseInt(userIdHeader) : null;
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const data = await CourseService.getCourseDetails(parseInt(params.id), scope.emsProfile);

        if (!data) return errorResponse(null, 'Course not found', 404);

        // Security check
        if (data.company_id !== scope.companyId && scope.roleLevel < 5) {
            return errorResponse(null, 'Forbidden', 403);
        }

        return successResponse(data, 'Course details fetched successfully');
    } catch (error: any) {
        return errorResponse(null, error.message || 'Course not found');
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
        const validatedData = courseSchema.partial().parse(body);

        // Security check
        const scope = await getUserTenantScope(userId);
        const existing = await CourseService.getCourseDetails(parseInt(params.id));

        if (existing.company_id !== scope.companyId && scope.roleLevel < 5) {
            return errorResponse(null, 'Forbidden', 403);
        }

        const course = await CourseService.updateCourse(parseInt(params.id), validatedData);

        return successResponse(course, 'Course updated successfully');
    } catch (error: any) {
        if (error.name === 'ZodError') return errorResponse(error.errors, 'Validation failed', 400);
        return errorResponse(null, error.message || 'Failed to update course');
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
        const existing = await CourseService.getCourseDetails(parseInt(params.id));

        if (existing.company_id !== scope.companyId && scope.roleLevel < 5) {
            return errorResponse(null, 'Forbidden', 403);
        }

        await CourseService.softDeleteCourse(
            parseInt(params.id),
            userId,
            'Deleted via API'
        );

        return successResponse(null, 'Course deleted successfully');
    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to delete course');
    }
}
