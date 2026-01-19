import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';

/**
 * Service for Student-related database operations
 */
export class StudentService {
    static async getAllStudents() {
        const { data, error } = await supabaseService
            .schema(SCHEMAS.EMS)
            .from('students')
            .select('*');

        if (error) throw error;
        return data;
    }

    static async getStudentById(id: number) {
        const { data, error } = await supabaseService
            .schema(SCHEMAS.EMS)
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }
}
