/**
 * EMS API - Attendance Management
 * Route: /api/ems/attendance
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { autoAssignCompany, getUserTenantScope } from '@/middleware/tenantFilter';
import { attendanceSessionSchema, attendanceRecordSchema } from '@/lib/validations/ems';
import { AttendanceService } from '@/lib/services/AttendanceService';
import { ems } from '@/lib/supabase';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), 'attendance_debug.log');

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const batchId = searchParams.get('batch_id');
        const studentId = searchParams.get('student_id');
        const sessionId = searchParams.get('session_id');
        const mode = searchParams.get('mode');
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

        if (mode === 'schedule') {
            const scope = await getUserTenantScope(userId);
            const schedule = await AttendanceService.getDailySchedule(scope.companyId!, date);
            return successResponse(schedule, 'Daily schedule fetched successfully');
        }

        // Case 1: Fetch details for a specific session (e.g. for marking attendance)
        if (sessionId) {
            const scope = await getUserTenantScope(userId);

            // If batchId is provided, get the detailed summary (students list)
            if (batchId) {
                const data = await AttendanceService.getBatchAttendanceSummary(scope.companyId!, parseInt(batchId), parseInt(sessionId));
                return successResponse(data, 'Session attendance summary fetched successfully');
            } else {
                // Just get session details
                const data = await AttendanceService.getSessionById(scope.companyId!, parseInt(sessionId));
                return successResponse(data, 'Session details fetched successfully');
            }
        }

        // Case 2: Fetch report for a batch over a date range
        if (batchId) {
            const startDate = searchParams.get('start_date') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
            const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

            // Ensure this method exists in Service
            // Note: getBatchAttendanceReport might not exist yet, I will add it.
            // Using a temporary direct query or placeholder if it doesn't exist?
            // Since I am about to add it, this is fine.
            const data = await AttendanceService.getBatchAttendanceReport(parseInt(batchId), startDate, endDate);
            return successResponse(data, 'Batch attendance report fetched successfully');
        }

        // Case 3: Fetch history for a specific student
        if (studentId || mode === 'student-history') {
            const scope = await getUserTenantScope(userId);

            let finalStudentId = studentId ? parseInt(studentId) : null;

            // If mode is student-history, we derive studentId from userId
            if (mode === 'student-history') {
                const { data: student } = await ems.students()
                    .select('id')
                    .eq('user_id', userId)
                    .single() as any;
                if (!student) return errorResponse(null, 'Student record not found', 404);
                finalStudentId = student.id;
            }

            if (!finalStudentId) return errorResponse(null, 'Student ID is required', 400);

            const courseId = searchParams.get('course_id');
            const data = await AttendanceService.getStudentAttendance(
                scope.companyId!,
                finalStudentId,
                courseId ? parseInt(courseId) : undefined
            );
            return successResponse(data, 'Student attendance history fetched successfully');
        }

        const scope = await getUserTenantScope(userId);
        const data = await AttendanceService.getAllSessions(scope.companyId!);
        return successResponse(data, 'Recent attendance sessions fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch attendance');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const mode = searchParams.get('mode') || 'session'; // session, record, student-mark

        // LOG TO FILE START
        try {
            fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] POST Request Start - Mode: ${mode}\n`);
        } catch (e) { }

        let data: any;
        try {
            data = await req.json();
            fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] POST Payload: ${JSON.stringify(data).substring(0, 500)}...\n`);
        } catch (jsonErr: any) {
            try {
                fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] JSON Parse Error: ${jsonErr.message}\n`);
            } catch (e) { }
            return errorResponse(null, 'Invalid JSON payload', 400);
        }

        console.log(`[API] Attendance POST mode=${mode}`, data);

        if (mode === 'student-mark') {
            const scope = await getUserTenantScope(userId);
            const { data: student, error: studentError } = await ems.students()
                .select('id')
                .eq('user_id', userId)
                .single() as any;

            if (studentError) {
                fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] Student Fetch Error for ${userId}: ${JSON.stringify(studentError)}\n`);
                if (studentError.code === 'PGRST116') {
                    return errorResponse(null, 'Student record not found (User is not linked to a student profile)', 404);
                }
                return errorResponse(null, 'Database connection failed: ' + studentError.message, 500);
            }

            if (!student) {
                return errorResponse(null, 'Student record not found', 404);
            }

            const result = await AttendanceService.submitFaceVerification({
                sessionId: data.session_id,
                studentId: student.id,
                verificationType: data.verification_type, // OPENING or CLOSING
                faceImageUrl: data.face_image_url,
                faceDescriptor: data.face_descriptor, // 128D vector for server-side verification
                latitude: data.latitude,
                longitude: data.longitude,
                locationAccuracy: data.location_accuracy,
                deviceInfo: data.device_info,
                ipAddress: req.headers.get('x-forwarded-for') || '0.0.0.0',
                userAgent: req.headers.get('user-agent') || ''
            }, scope.companyId!);

            return successResponse(result, 'Attendance verification submitted');
        }

        data = await autoAssignCompany(userId, data);

        if (mode === 'session') {
            const validatedData = attendanceSessionSchema.parse(data);
            const session = await AttendanceService.createSession({
                companyId: validatedData.company_id,
                courseId: validatedData.course_id,
                batchId: validatedData.batch_id!,
                sessionDate: validatedData.session_date,
                sessionType: validatedData.session_type,
                startTime: validatedData.start_time || '09:00',
                endTime: validatedData.end_time || '10:00'
            });
            return successResponse(session, 'Attendance session created successfully', 201);
        } else if (mode === 'session-status') {
            const scope = await getUserTenantScope(userId);
            const { session_id, status } = data;
            if (!session_id || !status) return errorResponse(null, 'Session ID and Status are required', 400);

            const result = await AttendanceService.updateSessionStatus(scope.companyId!, session_id, status);
            return successResponse(result, `Session status updated to ${status}`);
        } else {
            const bulkSchema = z.array(attendanceRecordSchema);
            const validatedRecords = bulkSchema.parse(data.records);
            const result = await AttendanceService.markBulkAttendance(data.session_id, validatedRecords as any);
            return successResponse(result, 'Attendance marked successfully');
        }

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to process attendance');
    }
}
