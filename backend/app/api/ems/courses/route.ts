/**
 * EMS API - Courses (Multi-Tenant) - SIMPLIFIED & BULLETPROOF
 * Route: /api/ems/courses
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserTenantScope, autoAssignCompany } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { courseSchema } from '@/lib/validations/ems';
import { CourseService } from '@/lib/services/CourseService';
import { ems } from '@/lib/supabase';
import { dataCache } from '@/lib/cache/dataCache';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        if (!scope.companyId) {
            return errorResponse(null, 'Company context not found', 400);
        }

        // 🚀 CACHE CHECK
        let cacheKey = `ems_courses:${scope.companyId}`;
        const cachedData = dataCache.get(cacheKey);
        if (cachedData) {
            return successResponse(cachedData, 'Courses fetched successfully (cached)');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 [COURSES API] Request Details:');
        console.log(`   User ID: ${userId}`);
        console.log(`   Company ID: ${scope.companyId}`);
        console.log(`   Role: ${scope.roleName} (Level: ${scope.roleLevel})`);
        console.log(`   Selection Reason: ${scope.selectionReason}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');



        // SIMPLE, DIRECT QUERY - NO JOINS, JUST COURSES
        const { data: courses, error: coursesError } = await ems.courses()
            .select('*')
            .eq('company_id', scope.companyId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (coursesError) {
            console.error('❌ [COURSES API] Database error:', coursesError);
            throw coursesError;
        }

        const courseCount = courses?.length || 0;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ [COURSES API] Successfully fetched ${courseCount} courses`);
        console.log('   Course IDs:', courses?.map(c => c.id).join(', ') || 'none');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // 🚀 CACHE SET
        cacheKey = `ems_courses:${scope.companyId}`;
        dataCache.set(cacheKey, courses || [], 2 * 60 * 1000); // 2 minutes cache

        const response = successResponse(
            courses || [],
            `Courses fetched successfully (${courseCount} records)`,
            200,
            {
                debug: {
                    userId,
                    companyId: scope.companyId,
                    branchId: scope.branchId,
                    role: scope.roleName,
                    roleLevel: scope.roleLevel,
                    selectionReason: scope.selectionReason,
                    courseCount,
                    timestamp: new Date().toISOString()
                }
            }
        );

        return response;

    } catch (error: any) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ [COURSES API] Fatal Error:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return errorResponse(null, error.message || 'Failed to fetch courses');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        const validatedData = courseSchema.parse(data);

        const course = await CourseService.createCourse(validatedData);

        console.log(`✅ [COURSES API] Course created: ${course.id} - ${course.course_name}`);

        return successResponse(course, 'Course created successfully', 201);

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        console.error('❌ [COURSES API] Create error:', error);
        return errorResponse(null, error.message || 'Failed to create course');
    }
}
