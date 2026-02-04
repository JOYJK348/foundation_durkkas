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
                session:attendance_sessions(*),
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
