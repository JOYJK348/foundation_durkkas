import { ems } from '@/lib/supabase';

export class AssignmentService {
    static async getAllAssignments(companyId: number, courseIds?: number[]) {
        let query = ems.assignments()
            .select(`
                *,
                courses:course_id (id, course_name, course_code)
            `)
            .eq('company_id', companyId)
            .is('deleted_at', null);

        if (courseIds && courseIds.length > 0) {
            query = query.in('course_id', courseIds);
        }

        const { data, error } = await query.order('deadline', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async getAssignmentById(id: number, companyId: number) {
        const { data, error } = await ems.assignments()
            .select('*, courses:course_id (*)')
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .single();

        if (error) throw error;
        return data;
    }

    static async createAssignment(data: any) {
        const { data: result, error } = await ems.assignments()
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    static async updateAssignment(id: number, companyId: number, data: any) {
        const { data: result, error } = await ems.assignments()
            .update(data)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    static async deleteAssignment(id: number, companyId: number, deletedBy: number) {
        const { data, error } = await ems.assignments()
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

    static async getSubmissions(assignmentId: number) {
        const { data, error } = await ems.assignmentSubmissions()
            .select(`
                *,
                students:student_id (id, first_name, last_name, student_code)
            `)
            .eq('assignment_id', assignmentId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async submitAssignment(data: any) {
        const { data: result, error } = await ems.assignmentSubmissions()
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    static async gradeSubmission(submissionId: number, marks: number, feedback: string, gradedBy: number) {
        const { data, error } = await ems.assignmentSubmissions()
            .update({
                marks_obtained: marks,
                feedback,
                graded_by: gradedBy,
                graded_at: new Date().toISOString()
            } as any)
            .eq('id', submissionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
