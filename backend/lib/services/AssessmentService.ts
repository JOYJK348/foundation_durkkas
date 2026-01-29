import { ems } from '@/lib/supabase';
import { Quiz, Assignment } from '@/types/database';

/**
 * Service for Assessment Management (Quizzes & Assignments)
 * High-performance implementation with caching support
 */
export class AssessmentService {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. QUIZ OPERATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async getQuizzesByCourse(courseId: number, companyId: number) {
        const { data, error } = await ems.quizzes()
            .select('*')
            .eq('course_id', courseId)
            .eq('company_id', companyId)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Quiz[];
    }

    static async createQuiz(quizData: Partial<Quiz>) {
        const { data, error } = await ems.quizzes()
            .insert(quizData)
            .select()
            .single();

        if (error) throw error;
        return data as Quiz;
    }

    static async getQuizWithQuestions(quizId: number) {
        // Optimized: Single query with joins
        const { data, error } = await ems.quizzes()
            .select(`
                *,
                quiz_questions (
                    *,
                    quiz_options (*)
                )
            `)
            .eq('id', quizId)
            .single();

        if (error) throw error;
        return data;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. ASSIGNMENT OPERATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async getAssignmentsByCourse(courseId: number, companyId: number) {
        const { data, error } = await ems.assignments()
            .select('*')
            .eq('course_id', courseId)
            .eq('company_id', companyId)
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('deadline', { ascending: true });

        if (error) throw error;
        return data as Assignment[];
    }

    static async createAssignment(assignmentData: Partial<Assignment>) {
        const { data, error } = await ems.assignments()
            .insert(assignmentData)
            .select()
            .single();

        if (error) throw error;
        return data as Assignment;
    }

    static async getPendingAssignments(tutorId: number, companyId: number) {
        // Optimized query for tutor dashboard
        const { data, error } = await ems.assignments()
            .select(`
                id,
                assignment_title,
                deadline,
                assignment_submissions!inner (
                    id,
                    submission_status,
                    submitted_at
                )
            `)
            .eq('tutor_id', tutorId)
            .eq('company_id', companyId)
            .eq('assignment_submissions.submission_status', 'SUBMITTED')
            .is('deleted_at', null);

        if (error) throw error;
        return data;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. GRADING OPERATIONS (OPTIMIZED FOR BULK)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async gradeSubmission(
        submissionId: number,
        marks: number,
        feedback: string,
        gradedBy: number
    ) {
        const { data, error } = await ems.supabase
            .from('assignment_submissions')
            .update({
                marks_obtained: marks,
                tutor_feedback: feedback,
                graded_by: gradedBy,
                graded_at: new Date().toISOString(),
                submission_status: 'GRADED',
            })
            .eq('id', submissionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
