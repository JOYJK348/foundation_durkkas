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
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const courseId = parseInt(params.id);

        const course = await CourseService.getCourseDetails(
            courseId,
            scope.companyId!,
            scope.emsProfile
        );

        if (!course) {
            return errorResponse(null, 'Course not found', 404);
        }

        return successResponse(course, 'Course fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch course');
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const courseId = parseInt(params.id);
        const data = await req.json();

        const validatedData = courseSchema.partial().parse(data);

        const updatedCourse = await CourseService.updateCourse(
            courseId,
            scope.companyId!,
            validatedData
        );

        if (!updatedCourse) {
            return errorResponse(null, 'Course not found or update failed', 404);
        }

        return successResponse(updatedCourse, 'Course updated successfully');

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to update course');
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return PUT(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const courseId = parseInt(params.id);

        // Get delete reason from request body
        const body = await req.json();
        const deleteReason = body?.deleteReason?.trim();

        if (!deleteReason) {
            return errorResponse(null, 'Delete reason is required', 400);
        }

        if (deleteReason.length < 10) {
            return errorResponse(null, 'Delete reason must be at least 10 characters', 400);
        }

        const deleted = await CourseService.deleteCourse(
            courseId,
            scope.companyId!,
            userId,
            deleteReason
        );

        if (!deleted) {
            return errorResponse(null, 'Course not found or already deleted', 404);
        }

        return successResponse(
            { id: courseId, deleted: true },
            'Course deleted successfully'
        );

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to delete course');
    }
}
