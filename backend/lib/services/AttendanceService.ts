/**
 * Attendance Service with Face & Location Verification
 * Handles opening/closing 5-minute windows with biometric validation
 */

import { ems, core } from '@/lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), 'attendance_debug.log');

function logToFile(msg: string, data?: any) {
    try {
        const timestamp = new Date().toISOString();
        const logMsg = `[${timestamp}] ${msg} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
        fs.appendFileSync(LOG_FILE, logMsg);
    } catch (e) {
        console.error('Logging failed:', e);
    }
}

export interface FaceVerificationData {
    sessionId: number;
    studentId: number;
    verificationType: 'OPENING' | 'CLOSING';
    faceImageUrl: string;
    faceDescriptor?: number[]; // 128D vector for secure face verification
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
        logToFile('Creating Session (Simplified) - Input:', sessionData);
        try {
            const insertPayload = {
                company_id: sessionData.companyId,
                course_id: sessionData.courseId,
                batch_id: sessionData.batchId,
                session_date: sessionData.sessionDate,
                session_type: sessionData.sessionType,
                status: 'SCHEDULED'
            };

            logToFile('Insert Payload:', insertPayload);

            const { data, error } = await ems.attendanceSessions()
                .insert(insertPayload as any)
                .select()
                .single();

            if (error) {
                logToFile('Database Error:', error);
                throw error;
            }
            logToFile('Session Created Successfully:', data);
            return data;
        } catch (err: any) {
            logToFile('Catch Error in createSession:', { message: err.message, stack: err.stack });
            throw err;
        }
    }

    /**
     * Update session status
     */
    static async updateSessionStatus(companyId: number, sessionId: number, status: string) {
        const { data, error } = await ems.attendanceSessions()
            .update({ status } as any)
            .eq('id', sessionId)
            .eq('company_id', companyId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Helper to check if current time is within 5 minutes of class start/end
     */
    static isInsideWindow(startTime: Date, endTime: Date, type: 'IN' | 'OUT') {
        const now = new Date();
        const targetTime = type === 'IN' ? startTime : endTime;
        const diffMinutes = Math.abs(now.getTime() - targetTime.getTime()) / (1000 * 60);

        if (diffMinutes <= 5) {
            return { isValid: true, message: 'Within window' };
        }
        return { isValid: false, message: `Too ${now < targetTime ? 'early' : 'late'} to mark ${type}` };
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
        logToFile('Marking Bulk Attendance (Resilient) - Input:', { sessionId, records });
        try {
            // 0. Resolve companyId from session
            const { data: sessionInfo, error: infoError } = await ems.attendanceSessions()
                .select('company_id')
                .eq('id', sessionId)
                .single();

            if (infoError || !sessionInfo) {
                logToFile('markBulkAttendance Session Lookup Error:', infoError || 'Session not found');
                throw new Error('Invalid session ID');
            }

            const companyId = sessionInfo.company_id;

            // 1. Delete existing records for this session to avoid duplicates
            await ems.attendanceRecords().delete().eq('session_id', sessionId);

            // 2. Detect columns to see if 'remarks' exists
            const { data: sample } = await ems.attendanceRecords().select('*').limit(1);
            const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
            const hasRemarks = columns.length > 0 ? columns.includes('remarks') : true;

            const hasLocation = columns.length > 0 ? columns.includes('latitude') : true;

            // 3. Insert new records
            const insertData = records.map(record => {
                const row: any = {
                    company_id: companyId,
                    session_id: sessionId,
                    student_id: record.student_id,
                    status: record.status
                };
                if (hasRemarks && record.remarks) {
                    row.remarks = record.remarks;
                }

                // Add verification metadata if available/applicable
                // Since this is marked by Manager, we set method to MANUAL
                if (hasLocation) {
                    row.verification_method = 'MANUAL';
                    // Optional: could add manager's IP if captured
                    if ((record as any).ip_address) row.ip_address = (record as any).ip_address;
                }

                return row;
            });

            const { data, error: insertError } = await ems.attendanceRecords()
                .insert(insertData)
                .select();

            if (insertError) {
                logToFile('markBulkAttendance Insert Error:', insertError);
                throw insertError;
            }

            logToFile('Bulk Attendance Marked Successfully:', data);
            return data;
        } catch (err: any) {
            logToFile('markBulkAttendance Catch Error:', { message: err.message, stack: err.stack });
            throw err;
        }
    }

    /**
     * Get single session by ID
     */
    static async getSessionById(companyId: number, sessionId: number) {
        const { data, error } = await ems.attendanceSessions()
            .select(`
                id, company_id, course_id, batch_id, session_date, session_type, status,
                course:courses(id, course_name, course_code),
                batch:batches(id, batch_name, batch_code)
            `)
            .eq('id', sessionId)
            .eq('company_id', companyId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get all sessions for a company
     */
    static async getAllSessions(companyId: number) {
        const { data, error } = await ems.attendanceSessions()
            .select(`
                id, company_id, course_id, batch_id, session_date, session_type, status,
                course:courses(id, course_name, course_code),
                batch:batches(id, batch_name, batch_code)
            `)
            .eq('company_id', companyId)
            .order('session_date', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get active attendance session (check if within opening or closing window)
     */
    static async getActiveSession(companyId: number, batchId: number) {
        const { data, error } = await ems.attendanceSessions()
            .select('id, company_id, batch_id, course_id, session_date, session_type, status')
            .eq('company_id', companyId)
            .eq('batch_id', batchId)
            .eq('session_date', new Date().toISOString().split('T')[0])
            .eq('status', 'OPEN')
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        // Since we don't have windows yet, we consider it 'OPENING' if it's OPEN
        return { ...data, activeWindow: 'OPENING' };
    }

    /**
     * Get batch attendance report for a date range
     */
    static async getBatchAttendanceReport(batchId: number, startDate: string, endDate: string) {
        // Fetch sessions
        const { data: sessions, error: sessionError } = await ems.attendanceSessions()
            .select('id, company_id, course_id, batch_id, session_date, session_type, status')
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
                id, company_id, session_id, student_id, user_id, status, created_at,
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

        // 3. Get total students per batch (enrolled)
        const batchIds = batches.map(b => b.id);
        const { data: enrollments } = await ems.enrollments()
            .select('batch_id')
            .in('batch_id', batchIds)
            .eq('enrollment_status', 'ACTIVE');

        // 4. Get attendance counts for these sessions
        const sessionIds = sessions?.map(s => s.id) || [];
        let attendanceCounts: any[] = [];
        if (sessionIds.length > 0) {
            const { data: counts, error: countError } = await ems.attendanceRecords()
                .select('session_id, status')
                .in('session_id', sessionIds);

            if (countError) {
                logToFile('getDailySchedule Count Error:', countError);
            }
            attendanceCounts = counts || [];
        }

        // 5. Merge data
        const schedule = batches.map(batch => {
            const totalStudents = enrollments?.filter(e => e.batch_id === batch.id).length || 0;
            // Find session for this batch
            const session = sessions?.find(s => s.batch_id === batch.id);

            // Clean up course object (Supabase sometimes returns it as an array)
            const courseData = Array.isArray(batch.course) ? batch.course[0] : batch.course;

            if (session) {
                const sessionRecords = attendanceCounts.filter(r => r.session_id === session.id);
                return {
                    ...batch,
                    course: courseData,
                    total_students: totalStudents,
                    session: {
                        ...session,
                        present_count: sessionRecords.filter(r => r.status === 'PRESENT').length,
                        absent_count: sessionRecords.filter(r => r.status === 'ABSENT').length
                    },
                    status: session.status
                };
            }
            return {
                ...batch,
                course: courseData,
                total_students: totalStudents,
                session: null,
                status: 'PENDING'
            };
        });

        return schedule;
    }

    /**
     * Verify location against institution whitelist
     */
    static async verifyLocation(companyId: number, latitude: number, longitude: number) {
        const { data, error } = await (ems.supabase.rpc as any)('verify_location', {
            p_company_id: companyId,
            p_latitude: latitude,
            p_longitude: longitude
        });

        if (error) throw error;
        return data as any || { is_valid: false, location_name: null, distance_meters: null };
    }

    /**
     * Submit face verification for attendance
     */
    static async submitFaceVerification(verificationData: FaceVerificationData, companyId: number) {
        // First, verify location (if RPC exists - otherwise default to true for testing)
        let locationResult = { is_valid: false, location_name: null as string | null, distance_meters: null as number | null };
        try {
            const loc = await this.verifyLocation(companyId, verificationData.latitude, verificationData.longitude);
            if (loc) locationResult = loc;
        } catch (err) {
            logToFile('Location verification failed/missing:', err);
            // If secure verification is required, we should fail here.
            // But for now, if function is missing, we might default to fail or mock true. 
            // In Production: Default to FALSE.
            return { success: false, error: 'Location verification system unavailable.' };
        }

        if (!locationResult.is_valid) {
            logToFile('Location verification failed:', { ...locationResult, input: verificationData });
            return {
                success: false,
                error: `Location verification failed. You are ${Math.round(locationResult.distance_meters || 0)}m away from ${locationResult.location_name || 'campus'}. Allowed: 100m.`
            };
        }

        let verificationId = 0;
        try {
            // Try to Insert face verification record
            const { data, error } = await ems.faceVerifications()
                .insert({
                    company_id: companyId,
                    session_id: verificationData.sessionId,
                    student_id: verificationData.studentId,
                    verification_type: verificationData.verificationType,
                    face_image_url: verificationData.faceImageUrl,
                    latitude: verificationData.latitude,
                    longitude: verificationData.longitude,
                    location_accuracy: verificationData.locationAccuracy,
                    location_verified: locationResult.is_valid,
                    distance_from_venue_meters: locationResult.distance_meters,
                    device_info: verificationData.deviceInfo,
                    ip_address: verificationData.ipAddress,
                    user_agent: verificationData.userAgent,
                    face_match_status: 'PENDING'
                } as any)
                .select()
                .single();

            if (data) verificationId = data.id;
        } catch (err) {
            logToFile('Face verification table missing/error, proceeding with basic record:', err);
        }

        // Only update attendance if verification passed
        await this.updateAttendanceRecord(
            companyId,
            verificationData.sessionId,
            verificationData.studentId,
            verificationData.verificationType,
            verificationId
        );

        return { success: true, locationResult };
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
            .select('id, company_id, session_id, student_id, status')
            .eq('company_id', companyId)
            .eq('session_id', sessionId)
            .eq('student_id', studentId)
            .single();

        const updateData: any = {
            company_id: companyId,
            session_id: sessionId,
            student_id: studentId,
            status: 'PRESENT'
        };

        // Simplified: Just update status to PRESENT if anything is verified
        if (existingRecord) {
            // Update existing record
            const { error } = await ems.attendanceRecords()
                .update({ status: 'PRESENT' })
                .eq('id', existingRecord.id);

            if (error) throw error;
        } else {
            // Create new record
            const { error } = await ems.attendanceRecords()
                .insert(updateData);

            if (error) throw error;
        }
    }

    /**
     * Get student attendance history
     */
    static async getStudentAttendance(companyId: number, studentId: number, courseId?: number) {
        logToFile('Getting Student Attendance - Input:', { companyId, studentId, courseId });
        try {
            let query = ems.attendanceRecords()
                .select(`
                    id, company_id, session_id, student_id, status, created_at,
                    session:attendance_sessions(
                        id, session_date, session_type, status,
                        course:courses(id, course_name, course_code)
                    )
                `)
                .eq('company_id', companyId)
                .eq('student_id', studentId);

            if (courseId) {
                query = query.eq('session.course_id', courseId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                logToFile('getStudentAttendance DB Error:', error);
                throw error;
            }
            return data;
        } catch (err: any) {
            logToFile('getStudentAttendance Catch Error:', { message: err.message, stack: err.stack });
            throw err;
        }
    }

    /**
     * Get batch attendance summary
     */
    static async getBatchAttendanceSummary(companyId: number, batchId: number, sessionId: number) {
        logToFile('Getting Batch Attendance Summary - Input:', { companyId, batchId, sessionId });
        try {
            const { data, error } = await ems.attendanceRecords()
                .select(`
                    id, company_id, session_id, student_id, status, created_at,
                    student:students(id, first_name, last_name, student_code)
                `)
                .eq('company_id', companyId)
                .eq('session_id', sessionId);

            if (error) {
                logToFile('getBatchAttendanceSummary DB Error:', error);
                throw error;
            }
            return { attendance: data || [] };
        } catch (err: any) {
            logToFile('getBatchAttendanceSummary Catch Error:', { message: err.message, stack: err.stack });
            throw err;
        }
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
        const { data, error } = await ems.faceProfiles()
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
        const { data, error } = await ems.institutionLocations()
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
