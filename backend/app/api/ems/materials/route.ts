import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope, autoAssignCompany } from '@/middleware/tenantFilter';
import { ems } from '@/lib/supabase';
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
        const { searchParams } = new URL(req.url);

        const courseId = searchParams.get('course_id');

        let query = ems.courseMaterials()
            .select('*')
            .eq('company_id', scope.companyId!)
            .eq('is_active', true);

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
