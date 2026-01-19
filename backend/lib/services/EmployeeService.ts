import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';

/**
 * Service for Employee-related database operations
 * Living in lib/services ensures business logic is separated from routing.
 */
export class EmployeeService {
    /**
     * Fetch all employees
     */
    static async getAllEmployees() {
        const { data, error } = await supabaseService
            .schema(SCHEMAS.HRMS)
            .from('employees')
            .select(`
                *
                // company:companies!fk_hrms_employees_company(name),
                // branch:branches!fk_hrms_employees_branch(name),
                // department:departments!fk_hrms_employees_department(name),
                // designation:designations!fk_hrms_employees_designation(title)
            `);

        if (error) throw error;
        return data;
    }

    /**
     * Get employee by ID
     */
    static async getEmployeeById(id: number) {
        const { data, error } = await supabaseService
            .schema(SCHEMAS.HRMS)
            .from('employees')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }
}
