import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope, autoAssignCompany } from '@/middleware/tenantFilter';
import { ems, app_auth } from '@/lib/supabase';
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

        const { data: material, error } = await ems.courseMaterials()
            .insert(validatedData)
            .select()
            .single();

        if (error) throw error;

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
        const { data: rolesData } = await app_auth.userRoles()
            .select(`
                roles:role_id (
                    name
                )
            `)
            .eq('user_id', userId);

        const userRoles = rolesData?.map((r: any) => r.roles?.name) || [];
        const isManager = userRoles.includes('ACADEMIC_MANAGER') || userRoles.includes('COMPANY_ADMIN');
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('course_id');

        let query = (ems as any).supabase
            .schema('ems')
            .from('course_materials')
            .select(`
                *,
                course:courses (
                    id,
                    course_name,
                    course_code
                )
            `)
            .eq('company_id', scope.companyId!)
            .is('deleted_at', null);

        // If not manager, only show active materials
        if (!isManager) {
            query = query.eq('is_active', true);
        }

        if (courseId) {
            query = query.eq('course_id', parseInt(courseId));
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return successResponse(data || [], 'Materials fetched successfully');
    } catch (error: any) {
        console.error('Materials GET error:', error);
        return errorResponse(null, error.message || 'Failed to fetch materials', 500);
    }
}
