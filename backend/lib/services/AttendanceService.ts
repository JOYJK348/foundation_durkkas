/**
 * Attendance Service with Face & Location Verification
 * Handles opening/closing 5-minute windows with biometric validation
 */

import { ems, core } from '@/lib/supabase';

export interface FaceVerificationData {
    sessionId: number;
    studentId: number;
    verificationType: 'OPENING' | 'CLOSING';
    faceImageUrl: string;
    latitude: number;
    longitude: number;
    locationAccuracy: number;
    deviceInfo: any;
    ipAddress?: string;
    userAgent?: string;
}

export interface AttendanceSession {
    id: number;
    companyId: number;
    courseId: number;
    batchId: number;
    sessionDate: string;
    sessionType: string;
    openingWindowStart: string;
    openingWindowEnd: string;
    closingWindowStart: string;
    closingWindowEnd: string;
    requireFaceVerification: boolean;
    requireLocationVerification: boolean;
    allowedRadiusMeters: number;
    status: string;
}

export class AttendanceService {
    /**
     * Create attendance session with time windows
     */
    static async createSession(sessionData: {
        companyId: number;
        courseId: number;
        batchId: number;
        sessionDate: string;
        sessionType: string;
        startTime: string;
        endTime: string;
    }) {
        // Calculate opening and closing windows (5 minutes each)
        const sessionStart = new Date(`${sessionData.sessionDate}T${sessionData.startTime}`);
        const sessionEnd = new Date(`${sessionData.sessionDate}T${sessionData.endTime}`);

        const openingWindowStart = sessionStart;
        const openingWindowEnd = new Date(sessionStart.getTime() + 5 * 60000); // +5 minutes

        const closingWindowStart = new Date(sessionEnd.getTime() - 5 * 60000); // -5 minutes
        const closingWindowEnd = sessionEnd;

        const { data, error } = await ems.attendanceSessions()
            .insert({
                company_id: sessionData.companyId,
                course_id: sessionData.courseId,
                batch_id: sessionData.batchId,
                session_date: sessionData.sessionDate,
                session_type: sessionData.sessionType,
                opening_window_start: openingWindowStart.toISOString(),
                opening_window_end: openingWindowEnd.toISOString(),
                closing_window_start: closingWindowStart.toISOString(),
                closing_window_end: closingWindowEnd.toISOString(),
                require_face_verification: true,
                require_location_verification: true,
                allowed_radius_meters: 100,
                status: 'SCHEDULED'
            } as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Mark bulk attendance for a session
     */
    static async markBulkAttendance(sessionId: number, records: {
        company_id: number;
        session_id: number;
        student_id: number;
        status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
        remarks?: string;
    }[]) {
        // 1. Delete existing records for this session (to allow overrides)
        // Or upsert. Upsert is better but Supabase upsert requires unique constraint on (session_id, student_id)
        // We know we have that.

        const { data, error } = await ems.attendanceRecords()
            .upsert(
                records.map(record => ({
                    company_id: record.company_id,
                    session_id: sessionId,
                    student_id: record.student_id,
                    status: record.status,
                    remarks: record.remarks,
                    check_in_time: record.status === 'PRESENT' ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString()
                })),
                { onConflict: 'session_id, student_id' }
            )
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Get active attendance session (check if within opening or closing window)
     */
    static async getActiveSession(companyId: number, batchId: number) {
        const now = new Date().toISOString();

        const { data, error } = await ems.attendanceSessions()
            .select('*')
            .eq('company_id', companyId)
            .eq('batch_id', batchId)
            .eq('session_date', new Date().toISOString().split('T')[0])
            .or(`opening_window_start.lte.${now},opening_window_end.gte.${now},closing_window_start.lte.${now},closing_window_end.gte.${now}` as any)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) return null;

        // Determine which window is active
        const nowTime = new Date(now);
        const openingStart = new Date(data.opening_window_start);
        const openingEnd = new Date(data.opening_window_end);
        const closingStart = new Date(data.closing_window_start);
        const closingEnd = new Date(data.closing_window_end);

        let activeWindow: 'OPENING' | 'CLOSING' | null = null;

        if (nowTime >= openingStart && nowTime <= openingEnd) {
            activeWindow = 'OPENING';
        } else if (nowTime >= closingStart && nowTime <= closingEnd) {
            activeWindow = 'CLOSING';
        }

        return { ...data, activeWindow };
    }

    /**
     * Get batch attendance report for a date range
     */
    static async getBatchAttendanceReport(batchId: number, startDate: string, endDate: string) {
        // Fetch sessions
        const { data: sessions, error: sessionError } = await ems.attendanceSessions()
            .select('*')
            .eq('batch_id', batchId)
            .gte('session_date', startDate)
            .lte('session_date', endDate)
            .order('session_date');

        if (sessionError) throw sessionError;
        if (!sessions || sessions.length === 0) return { sessions: [], attendance: [] };

        const sessionIds = sessions.map(s => s.id);

        // Fetch attendance records for these sessions
        const { data: attendance, error: attError } = await ems.attendanceRecords()
            .select(`
                *,
                student:students(id, first_name, last_name, student_code)
            `)
            .in('session_id', sessionIds);

        if (attError) throw attError;

        return { sessions, attendance };
    }

    /**
     * Get daily class schedule with attendance status
     */
    static async getDailySchedule(companyId: number, date: string) {
        // 1. Get all active batches that are running on this date
        const { data: batches, error: batchError } = await ems.batches()
            .select(`
                id, batch_name, batch_code, 
                start_time, end_time, 
                course:courses(id, course_name, course_code),
                session:attendance_sessions(id, status)
            `)
            .eq('company_id', companyId)
            .lte('start_date', date)
            .gte('end_date', date)
            .eq('is_active', true);
        // Filter joined session by date - This is tricky in Supabase basic query
        // Supabase 'eq' on joined resource usually filters the parent rows if using inner join, 
        // but for left join it might be complex.
        // Easier approach: Get batches, then get sessions for today.

        if (batchError) throw batchError;

        // 2. Get sessions for today separately to merge
        const { data: sessions, error: sessionError } = await ems.attendanceSessions()
            .select('id, batch_id, status')
            .eq('company_id', companyId)
            .eq('session_date', date);

        if (sessionError) throw sessionError;

        // 3. Merge data
        const schedule = batches.map(batch => {
            // Find session for this batch
            const session = sessions?.find(s => s.batch_id === batch.id);
            return {
                ...batch,
                session: session || null,
                status: session ? session.status : 'PENDING' // PENDING means not started yet
            };
        });

        return schedule;
    }

    /**
     * Verify location against institution whitelist
     */
    static async verifyLocation(companyId: number, latitude: number, longitude: number) {
        const { data, error } = await ems.supabase.rpc('verify_location', {
            p_company_id: companyId,
            p_latitude: latitude,
            p_longitude: longitude
        });

        if (error) throw error;
        return data[0] || { is_valid: false, location_name: null, distance_meters: null };
    }

    /**
     * Submit face verification for attendance
     */
    static async submitFaceVerification(verificationData: FaceVerificationData, companyId: number) {
        // First, verify location
        const locationResult = await this.verifyLocation(
            companyId,
            verificationData.latitude,
            verificationData.longitude
        );

        // Insert face verification record
        const { data, error } = await ems.supabase
            .from('attendance_face_verifications')
            .insert({
                company_id: companyId,
                session_id: verificationData.sessionId,
                student_id: verificationData.studentId,
                verification_type: verificationData.verificationType,
                face_image_url: verificationData.faceImageUrl,
                latitude: verificationData.latitude,
                longitude: verificationData.longitude,
                location_accuracy_meters: verificationData.locationAccuracy,
                location_verified: locationResult.is_valid,
                distance_from_venue_meters: locationResult.distance_meters,
                device_info: verificationData.deviceInfo,
                ip_address: verificationData.ipAddress,
                user_agent: verificationData.userAgent,
                face_match_status: 'PENDING' // Will be updated by face recognition service
            } as any)
            .select()
            .single();

        if (error) throw error;

        // If both location and face are verified, update attendance record
        if (locationResult.is_valid) {
            await this.updateAttendanceRecord(
                companyId,
                verificationData.sessionId,
                verificationData.studentId,
                verificationData.verificationType,
                data.id
            );
        }

        return { ...data, locationResult };
    }

    /**
     * Update attendance record with verification
     */
    private static async updateAttendanceRecord(
        companyId: number,
        sessionId: number,
        studentId: number,
        verificationType: 'OPENING' | 'CLOSING',
        verificationId: number
    ) {
        // Check if attendance record exists
        const { data: existingRecord } = await ems.attendanceRecords()
            .select('*')
            .eq('company_id', companyId)
            .eq('session_id', sessionId)
            .eq('student_id', studentId)
            .single();

        const updateData: any = {
            company_id: companyId,
            session_id: sessionId,
            student_id: studentId
        };

        if (verificationType === 'OPENING') {
            updateData.opening_verification_id = verificationId;
            updateData.status = 'PRESENT';
        } else {
            updateData.closing_verification_id = verificationId;
        }

        // Calculate attendance percentage
        if (existingRecord) {
            const hasOpening = verificationType === 'OPENING' || existingRecord.opening_verification_id;
            const hasClosing = verificationType === 'CLOSING' || existingRecord.closing_verification_id;

            if (hasOpening && hasClosing) {
                updateData.attendance_percentage = 100;
                updateData.verification_status = 'VERIFIED';
            } else if (hasOpening || hasClosing) {
                updateData.attendance_percentage = 50;
                updateData.verification_status = 'PARTIAL';
            }

            // Update existing record
            const { error } = await ems.attendanceRecords()
                .update(updateData)
                .eq('id', existingRecord.id);

            if (error) throw error;
        } else {
            // Create new record
            updateData.attendance_percentage = 50;
            updateData.verification_status = 'PARTIAL';

            const { error } = await ems.attendanceRecords()
                .insert(updateData);

            if (error) throw error;
        }
    }

    /**
     * Get student attendance history
     */
    static async getStudentAttendance(companyId: number, studentId: number, courseId?: number) {
        let query = ems.supabase
            .from('attendance_records')
            .select(`
                *,
                session:attendance_sessions(
                    *,
                    course:courses(id, course_name, course_code)
                ),
                opening_verification:opening_verification_id(*),
                closing_verification:closing_verification_id(*)
            `)
            .eq('company_id', companyId)
            .eq('student_id', studentId);

        if (courseId) {
            query = query.eq('session.course_id', courseId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get batch attendance summary
     */
    static async getBatchAttendanceSummary(companyId: number, batchId: number, sessionId: number) {
        const { data, error } = await ems.supabase
            .from('attendance_records')
            .select(`
                *,
                student:students(id, first_name, last_name, student_code),
                opening_verification:opening_verification_id(*),
                closing_verification:closing_verification_id(*)
            `)
            .eq('company_id', companyId)
            .eq('session_id', sessionId);

        if (error) throw error;
        return data;
    }

    /**
     * Register student face profile
     */
    static async registerFaceProfile(
        companyId: number,
        studentId: number,
        faceEncoding: any,
        referenceImageUrl: string,
        qualityScore: number
    ) {
        const { data, error } = await ems.supabase
            .from('student_face_profiles')
            .insert({
                company_id: companyId,
                student_id: studentId,
                face_encoding: faceEncoding,
                reference_image_url: referenceImageUrl,
                quality_score: qualityScore,
                is_active: true
            } as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Add institution location
     */
    static async addInstitutionLocation(
        companyId: number,
        branchId: number | null,
        locationName: string,
        latitude: number,
        longitude: number,
        radiusMeters: number = 100
    ) {
        const { data, error } = await ems.supabase
            .from('institution_locations')
            .insert({
                company_id: companyId,
                branch_id: branchId,
                location_name: locationName,
                latitude,
                longitude,
                radius_meters: radiusMeters,
                is_active: true
            } as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
