import { ems } from '@/lib/supabase';
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
                courses:course_id (
                    id,
                    course_name,
                    course_code
                )
            `)
            .eq('company_id', companyId)
            .is('deleted_at', null)
            .order('start_date', { ascending: false });

        if (branchId) {
            query = query.eq('branch_id', branchId);
        }

        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
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
        const { data, error } = await ems.batches()
            .select(`
                *,
                courses:course_id (*),
                student_enrollments (
                    id,
                    students:student_id (
                        id,
                        student_code,
                        first_name,
                        last_name,
                        email
                    )
                )
            `)
            .eq('id', batchId)
            .single();

        if (error) throw error;
        return data;
    }
}
