import { ems } from '@/lib/supabase';
import { Database } from '@/types/database';

type AttendanceSession = Database['ems']['Tables']['attendance_sessions']['Row'];
type AttendanceRecord = Database['ems']['Tables']['attendance_records']['Row'];

/**
 * Service for Attendance Management
 * Handles daily attendance for batches and sessions
 */
export class AttendanceService {
    static async createSession(sessionData: Partial<AttendanceSession>) {
        const { data, error } = await ems.attendanceSessions()
            .insert(sessionData as any)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Failed to create session');

        // Automatically initialize attendance records for all students in the batch
        if (sessionData.batch_id) {
            await this.initializeBatchAttendance(data.id, sessionData.batch_id, data.company_id);
        }

        return data;
    }

    private static async initializeBatchAttendance(sessionId: number, batchId: number, companyId: number) {
        // Get all students enrolled in this batch
        const { data: enrollments } = await ems.enrollments()
            .select('student_id')
            .eq('batch_id', batchId)
            .eq('enrollment_status', 'ACTIVE');

        if (enrollments && enrollments.length > 0) {
            const records = enrollments.map(e => ({
                company_id: companyId,
                session_id: sessionId,
                student_id: e.student_id,
                status: 'ABSENT' // Default to absent until marked present
            }));

            const { error } = await ems.attendanceRecords()
                .insert(records as any);

            if (error) throw error;
        }
    }

    static async markBulkAttendance(sessionId: number, records: { student_id: number, status: string, remarks?: string }[]) {
        const { data, error } = await ems.attendanceRecords()
            .upsert(
                records.map(r => ({
                    session_id: sessionId,
                    student_id: r.student_id,
                    status: r.status,
                    remarks: r.remarks,
                    company_id: 1 // Default to 1, should be passed in production
                } as any)),
                { onConflict: 'session_id,student_id' }
            )
            .select();

        if (error) throw error;
        return data;
    }

    static async getBatchAttendanceReport(batchId: number, startDate: string, endDate: string) {
        const { data, error } = await ems.attendanceSessions()
            .select(`
                *,
                attendance_records (
                    student_id,
                    status,
                    students:student_id (first_name, last_name, student_code)
                )
            `)
            .eq('batch_id', batchId)
            .gte('session_date', startDate)
            .lte('session_date', endDate)
            .order('session_date', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async getStudentAttendance(studentId: number) {
        const { data, error } = await ems.attendanceRecords()
            .select(`
                *,
                sessions:session_id (
                    session_date,
                    session_type,
                    courses:course_id (course_name)
                )
            `)
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}
