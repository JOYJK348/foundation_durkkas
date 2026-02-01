/**
 * EMS API - Quiz Questions
 * Route: /api/ems/quizzes/[id]/questions
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { ems } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { id } = await context.params;
        const quizId = parseInt(id);
        const scope = await getUserTenantScope(userId);

        // Fetch questions with options using standard ems helpers
        const { data: questions, error } = await ems.quizQuestions()
            .select(`
                *,
                quiz_options (
                    id,
                    option_text,
                    option_order,
                    is_correct
                )
            `)
            .eq('quiz_id', quizId)
            .eq('company_id', scope.companyId!)
            .eq('is_active', true)
            .order('question_order', { ascending: true });

        if (error) throw error;

        return successResponse(questions, 'Questions fetched successfully');

    } catch (error: any) {
        console.error('[Quiz Questions GET] Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch questions');
    }
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { id } = await context.params;
        const quizId = parseInt(id);
        const scope = await getUserTenantScope(userId);
        const { questions } = await req.json();

        if (!questions || !Array.isArray(questions)) {
            return errorResponse(null, 'Invalid questions data', 400);
        }

        // 1. Delete existing questions for this quiz
        await ems.quizQuestions()
            .delete()
            .eq('quiz_id', quizId)
            .eq('company_id', scope.companyId!);

        // 2. Insert new questions
        for (const question of questions) {
            const { data: insertedQuestion, error: questionError } = await ems.quizQuestions()
                .insert({
                    company_id: scope.companyId,
                    quiz_id: quizId,
                    question_text: question.question_text,
                    question_type: question.question_type || 'MCQ',
                    question_order: question.question_order,
                    marks: question.marks || 1,
                    explanation: question.explanation || null,
                    is_active: true,
                } as any)
                .select()
                .single();

            if (questionError) throw questionError;
            if (!insertedQuestion) throw new Error('Failed to insert question');

            // 3. Insert options for this question
            if (question.options && question.options.length > 0) {
                const optionsToInsert = question.options.map((opt: any) => ({
                    question_id: (insertedQuestion as any).id,
                    option_text: opt.option_text,
                    option_order: opt.option_order,
                    is_correct: opt.is_correct || false,
                }));

                const { error: optionsError } = await ems.quizOptions()
                    .insert(optionsToInsert as any);

                if (optionsError) throw optionsError;
            }
        }

        // 4. Update quiz total_questions count
        await ems.quizzes()
            .update({ total_questions: questions.length } as any)
            .eq('id', quizId)
            .eq('company_id', scope.companyId!);

        return successResponse(
            { quiz_id: quizId, questions_count: questions.length },
            'Quiz questions saved successfully',
            201
        );

    } catch (error: any) {
        console.error('[Quiz Questions POST] Error:', error);
        return errorResponse(null, error.message || 'Failed to save questions');
    }
}
