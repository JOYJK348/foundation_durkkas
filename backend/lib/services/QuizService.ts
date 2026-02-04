import { ems } from '@/lib/supabase';

export class QuizService {
    static async getAllQuizzes(companyId: number, courseIds?: number[]) {
        let query = ems.quizzes()
            .select(`
                *,
                courses:course_id (id, course_name, course_code),
                quiz_assignments (*)
            `)
            .eq('company_id', companyId)
            .is('deleted_at', null);

        if (courseIds && courseIds.length > 0) {
            query = query.in('course_id', courseIds);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async getQuizById(id: number, companyId: number) {
        const { data, error } = await ems.quizzes()
            .select(`
                *,
                courses:course_id (*),
                quiz_questions (*),
                quiz_assignments (*)
            `)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .single();

        if (error) throw error;
        return data;
    }

    static async createQuiz(data: any) {
        const { assignments, ...quizData } = data;

        const { data: result, error } = await ems.quizzes()
            .insert(quizData)
            .select()
            .single();

        if (error) throw error;

        // If assignments are provided, create them
        if (assignments && Array.isArray(assignments) && assignments.length > 0) {
            const assignmentRecords = assignments.map((a: any) => ({
                ...a,
                quiz_id: result.id,
                company_id: result.company_id
            }));

            await ems.quizAssignments().insert(assignmentRecords);
        }

        return result;
    }

    static async assignQuiz(data: any) {
        const { data: result, error } = await ems.quizAssignments()
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    static async updateQuiz(id: number, companyId: number, data: any) {
        const { data: result, error } = await ems.quizzes()
            .update(data)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    static async deleteQuiz(id: number, companyId: number, deletedBy: number) {
        const { data, error } = await ems.quizzes()
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: deletedBy
            } as any)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async addQuestion(questionData: any) {
        const { data, error } = await ems.quizQuestions()
            .insert(questionData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getQuestions(quizId: number) {
        const { data, error } = await ems.quizQuestions()
            .select('*')
            .eq('quiz_id', quizId)
            .order('question_order', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async submitQuizAttempt(attemptData: any) {
        const { data, error } = await ems.quizAttempts()
            .insert(attemptData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getStudentAttempts(quizId: number, studentId: number) {
        const { data, error } = await ems.quizAttempts()
            .select('*')
            .eq('quiz_id', quizId)
            .eq('student_id', studentId)
            .order('attempt_number', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async getQuizAttempts(quizId: number, companyId: number, studentIds?: number[]) {
        let query = ems.quizAttempts()
            .select(`
                *,
                students:student_id (id, first_name, last_name, student_code, email)
            `)
            .eq('quiz_id', quizId)
            .eq('company_id', companyId);

        if (studentIds && studentIds.length > 0) {
            query = query.in('student_id', studentIds);
        }

        const { data, error } = await query.order('completed_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async autoGradeAttempt(attemptId: number) {
        // Get attempt with answers
        const { data: attempt } = await ems.quizAttempts()
            .select('*, quizzes:quiz_id (quiz_questions (*))')
            .eq('id', attemptId)
            .single();

        if (!attempt) throw new Error('Attempt not found');

        // Auto-grade logic for MCQ and True/False
        let totalMarks = 0;
        let obtainedMarks = 0;

        const questions = (attempt as any).quizzes?.quiz_questions || [];
        const answers = (attempt as any).answers || {};

        questions.forEach((q: any) => {
            totalMarks += q.marks || 0;
            if (answers[q.id] === q.correct_answer) {
                obtainedMarks += q.marks || 0;
            }
        });

        // Update attempt with marks
        const { data, error } = await ems.quizAttempts()
            .update({
                total_marks: totalMarks,
                marks_obtained: obtainedMarks,
                is_graded: true
            } as any)
            .eq('id', attemptId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
