import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserTenantScope, autoAssignCompany } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { QuizService } from '@/lib/services/QuizService';
import { ems } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        let courseIds: number[] | undefined = undefined;
        if (scope.emsProfile?.profileType === 'tutor' && scope.emsProfile.profileId) {
            // Get tutor's assigned courses
            const { data: junctionMappings } = await ems.courseTutors()
                .select('course_id')
                .eq('tutor_id', scope.emsProfile.profileId)
                .is('deleted_at', null);

            const { data: legacyCourses } = await ems.courses()
                .select('id')
                .eq('tutor_id', scope.emsProfile.profileId)
                .is('deleted_at', null);

            courseIds = [
                ...(junctionMappings?.map((m: any) => m.course_id) || []),
                ...(legacyCourses?.map((c: any) => c.id) || [])
            ];
        }

        const data = await QuizService.getAllQuizzes(scope.companyId!, courseIds);

        return successResponse(data, 'Quizzes fetched successfully');
    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch quizzes');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        let data = await req.json();
        console.log('[Quiz POST] Received data:', JSON.stringify(data, null, 2));

        data = await autoAssignCompany(userId, data);

        // Add audit fields
        data.created_by = userId;
        data.updated_by = userId;

        console.log('[Quiz POST] After autoAssignCompany:', JSON.stringify(data, null, 2));

        const quiz = await QuizService.createQuiz(data);

        return successResponse(quiz, 'Quiz created successfully', 201);
    } catch (error: any) {
        console.error('[Quiz POST] Error:', error);
        console.error('[Quiz POST] Error message:', error.message);
        console.error('[Quiz POST] Error stack:', error.stack);


        // Return more detailed error for debugging
        return errorResponse(
            error.code || 'QUIZ_CREATE_ERROR',
            error.message || 'Failed to create quiz',
            500,
            {
                code: error.code,
                details: error.details,
                hint: error.hint
            }
        );
    }
}
