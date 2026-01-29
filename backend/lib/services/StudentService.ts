import { ems } from '@/lib/supabase';
import { Student, StudentGuardian } from '@/types/database';

/**
 * Service for Student-related database operations
 */
export class StudentService {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. STUDENT MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async getAllStudents(companyId: number) {
        const { data, error } = await ems.students()
            .select('*')
            .eq('company_id', companyId)
            .is('deleted_at', null);

        if (error) throw error;
        return data as Student[];
    }

    static async getStudentById(id: number) {
        const { data, error } = await ems.students()
            .select('*, student_guardians(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Student & { student_guardians: StudentGuardian[] };
    }

    static async createStudent(studentData: Partial<Student>) {
        const { data, error } = await ems.students()
            .insert(studentData)
            .select()
            .single();

        if (error) throw error;
        return data as Student;
    }

    static async updateStudent(id: number, studentData: Partial<Student>) {
        const { data, error } = await ems.students()
            .update(studentData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Student;
    }

    static async softDeleteStudent(id: number, deletedBy: number, reason?: string) {
        const { data, error } = await ems.students()
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: deletedBy,
                delete_reason: reason,
                is_active: false
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. GUARDIAN MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    static async addGuardian(guardianData: Partial<StudentGuardian>) {
        const { data, error } = await ems.studentGuardians()
            .insert(guardianData)
            .select()
            .single();

        if (error) throw error;
        return data as StudentGuardian;
    }

    static async updateGuardian(id: number, guardianData: Partial<StudentGuardian>) {
        const { data, error } = await ems.studentGuardians()
            .update(guardianData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as StudentGuardian;
    }
}
