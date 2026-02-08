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

function logToFile(msg: string, data?: any) {
    try {
        const timestamp = new Date().toISOString();
        const logMsg = `[${timestamp}] ${msg} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
        fs.appendFileSync(LOG_FILE, logMsg);
    } catch (e) {
        console.error('Logging failed:', e);
    }
}

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

        if (mode === 'student-schedule') {
            const scope = await getUserTenantScope(userId);
            // If studentId is provided in query (for admin view), use it. Otherwise use logged-in user's linked student ID
            // BUT here we assume the logged in user IS a student.
            // We need to resolve student ID from user ID.
            // Assuming 1-to-1 mapping or passed via query for now.
            // Let's rely on student_id param if present, else try to find student profile for user.
            let targetStudentId = studentId ? parseInt(studentId) : null;

            if (!targetStudentId) {
                // Try to find student record for this user
                const { data: student } = await ems.students()
                    .select('id')
                    .eq('user_id', userId)
                    .single();
                if (student) targetStudentId = student.id;
            }

            if (!targetStudentId) return errorResponse(null, 'Student ID not found for user', 404);

            const sessions = await AttendanceService.getStudentActiveSessionsWithStatus(scope.companyId!, targetStudentId);
            return successResponse(sessions, 'Student schedule fetched successfully');
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
        if (studentId || mode === 'student-history' || mode === 'smart-list') {
            const scope = await getUserTenantScope(userId);

            let finalStudentId = studentId ? parseInt(studentId) : null;

            // If mode is student-history or smart-list, we derive studentId from userId
            if (mode === 'student-history' || mode === 'smart-list') {
                const { data: student } = await ems.students()
                    .select('id')
                    .eq('user_id', userId)
                    .single() as any;
                if (!student) return errorResponse(null, 'Student record not found', 404);
                finalStudentId = student.id;
            }

            if (!finalStudentId) return errorResponse(null, 'Student ID is required', 400);

            if (mode === 'smart-list') {
                const data = await AttendanceService.getStudentActiveSessionsWithStatus(
                    scope.companyId!,
                    finalStudentId
                );
                return successResponse(data, 'Smart attendance list fetched successfully');
            }

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
                faceImageUrl: data.face_image_url || data.captured_image,
                faceDescriptor: data.face_descriptor, // Pass descriptors as embeddings
                latitude: data.latitude || data.location?.latitude,
                longitude: data.longitude || data.location?.longitude,
                locationAccuracy: data.location_accuracy || 10,
                deviceInfo: data.device_info || {},
                ipAddress: req.headers.get('x-forwarded-for') || '0.0.0.0',
                userAgent: req.headers.get('user-agent') || ''
            }, scope.companyId!);

            if (!result.success) {
                return errorResponse('VERIFICATION_FAILED', result.error || 'Verification failed', 400, result);
            }

            return successResponse(result, 'Attendance verification successful');
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
                endTime: validatedData.end_time || '10:00',
                classMode: validatedData.class_mode,
                requireFaceVerification: validatedData.require_face_verification
            });
            return successResponse(session, 'Attendance session created successfully', 201);
        } else if (mode === 'session-status') {
            const scope = await getUserTenantScope(userId);
            const { session_id, status } = data;
            if (!session_id || !status) return errorResponse(null, 'Session ID and Status are required', 400);

            // Added debug logging to file since console is not visible
            logToFile('POST Request Start - Mode: session-status', { session_id, status, companyId: scope.companyId });

            const result = await AttendanceService.updateSessionStatus(scope.companyId!, parseInt(session_id.toString()), status);
            return successResponse(result, `Session status updated to ${status}`);
        } else if (mode === 'cancel-session') {
            const scope = await getUserTenantScope(userId);
            const { session_id, cancellation_reason } = data;
            if (!session_id || !cancellation_reason) return errorResponse(null, 'Session ID and Reason are required', 400);

            const result = await AttendanceService.cancelSession(
                scope.companyId!,
                parseInt(session_id.toString()),
                cancellation_reason,
                userId
            );
            return successResponse(result, 'Session cancelled successfully');
        } else if (mode === 'update-session') {
            const scope = await getUserTenantScope(userId);
            const { session_id, ...updateData } = data;
            if (!session_id) return errorResponse(null, 'Session ID is required', 400);

            const result = await AttendanceService.updateSession(
                scope.companyId!,
                parseInt(session_id.toString()),
                updateData
            );
            return successResponse(result, 'Session updated successfully');
        } else {
            const bulkSchema = z.array(attendanceRecordSchema);
            const validatedRecords = bulkSchema.parse(data.records);
            const result = await AttendanceService.markBulkAttendance(parseInt(data.session_id.toString()), validatedRecords as any);
            return successResponse(result, 'Attendance marked successfully');
        }

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors, 'Validation failed', 400);
        }
        return errorResponse(null, error.message || 'Failed to process attendance');
    }
}
