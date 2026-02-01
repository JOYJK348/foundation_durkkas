import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope, autoAssignCompany } from '@/middleware/tenantFilter';
import { CourseService } from '@/lib/services/CourseService';
import { courseMaterialSchema } from '@/lib/validations/ems';

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        // Validate data
        const validatedData = courseMaterialSchema.parse(data);

        // Simple upload tracking
        (validatedData as any).uploaded_by = userId;

        const material = await CourseService.createMaterial(validatedData);

        return successResponse(material, 'Material added successfully', 201);

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to add material', 500);
    }
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const { searchParams } = new URL(req.url);

        const menuId = searchParams.get('menu_id');
        const courseId = searchParams.get('course_id');

        let materials;
        if (menuId) {
            materials = await CourseService.getMaterialsByMenu(parseInt(menuId), scope.companyId!);
        } else if (courseId) {
            // Existing logic or custom fetch
            const { ems } = require('@/lib/supabase');
            const { data } = await ems.courseMaterials()
                .select('*')
                .eq('course_id', parseInt(courseId))
                .eq('company_id', scope.companyId!)
                .eq('is_active', true);
            materials = data;
        } else {
            materials = await CourseService.getGlobalMaterials(scope.companyId!);
        }

        return successResponse(materials, 'Materials fetched successfully');
    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch materials', 500);
    }
}
