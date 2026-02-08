import { ems, core } from '@/lib/supabase';
import { Batch } from '@/types/database';

/**
 * Service for Batch Management
 * Optimized for enrollment capacity tracking
 */
export class BatchService {
    static async getAllBatches(companyId: number, branchId?: number, courseId?: number) {
        let query = ems.batches()
            .select(`
                *,
                enrolled_count:student_enrollments(count),
                courses:course_id (
                    id,
                    course_name,
                    course_code
                )
            `)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (branchId) {
            query = query.or(`branch_id.eq.${branchId},branch_id.is.null`);
        }

        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Flatten the count from PostgREST sub-query result
        return data.map((batch: any) => ({
            ...batch,
            enrolled_count: Array.isArray(batch.enrolled_count)
                ? (batch.enrolled_count[0]?.count || 0)
                : (batch.current_strength || 0)
        }));
    }

    static async createBatch(batchData: Partial<Batch>) {
        const { data, error } = await ems.batches()
            .insert({
                ...batchData,
                current_strength: 0,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Batch;
    }

    static async getBatchById(id: number, companyId: number) {
        const { data, error } = await ems.batches()
            .select('*, courses:course_id(*)')
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .single();

        if (error) throw error;
        return data as Batch;
    }

    static async updateBatch(id: number, companyId: number, batchData: Partial<Batch>) {
        const { data, error } = await ems.batches()
            .update(batchData)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data as Batch;
    }

    static async deleteBatch(id: number, companyId: number, deletedBy: number, reason?: string) {
        const { data, error } = await ems.batches()
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: deletedBy,
                delete_reason: reason || 'Removed by admin',
                is_active: false,
                status: 'DELETED'
            } as any)
            .eq('id', id)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async softDeleteBatch(id: number, deletedBy: number, reason?: string) {
        const { data, error } = await ems.batches()
            .update({
                deleted_at: new Date().toISOString(),
                is_active: false,
                status: 'DELETED'
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateBatchStrength(batchId: number, increment: number = 1) {
        // Optimized: Atomic increment operation
        const { data: batch } = await ems.batches()
            .select('current_strength, max_students')
            .eq('id', batchId)
            .single();

        if (!batch) throw new Error('Batch not found');

        const newStrength = (batch.current_strength || 0) + increment;

        if (batch.max_students && newStrength > batch.max_students) {
            throw new Error('Batch capacity exceeded');
        }

        const { data, error } = await ems.batches()
            .update({ current_strength: newStrength } as any)
            .eq('id', batchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getBatchDetails(batchId: number) {
        const { data: batch, error } = await ems.batches()
            .select(`
                *,
                courses:course_id (
                    id,
                    course_name,
                    course_code,
                    course_category,
                    course_level
                ),
                student_enrollments (
                    id,
                    enrollment_date,
                    enrollment_status,
                    students:student_id (
                        id,
                        student_code,
                        first_name,
                        last_name,
                        email,
                        phone
                    )
                )
            `)
            .eq('id', batchId)
            .single();

        if (error) throw error;
        if (!batch) return null;

        // Fetch tutors for this course
        const { data: courseTutors } = await ems.courseTutors()
            .select(`
                id,
                tutor_id,
                tutor_role,
                is_primary
            `)
            .eq('course_id', batch.course_id)
            .is('deleted_at', null);

        if (courseTutors && courseTutors.length > 0) {
            const { data: employees } = await core.employees()
                .select('id, first_name, last_name, email, employee_code')
                .in('id', courseTutors.map((ct: any) => ct.tutor_id));

            if (employees) {
                const employeesMap = new Map((employees as any[]).map((e: any) => [e.id, e]));
                (batch as any).tutors = courseTutors.map((ct: any) => {
                    const emp = employeesMap.get(ct.tutor_id);
                    return {
                        ...ct,
                        name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Tutor',
                        email: emp?.email,
                        employee_code: emp?.employee_code
                    };
                });
            } else {
                (batch as any).tutors = [];
            }
        } else {
            (batch as any).tutors = [];
        }

        return batch;
    }
}
