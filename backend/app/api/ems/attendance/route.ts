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
import { z } from 'zod';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const batchId = searchParams.get('batch_id');
        const studentId = searchParams.get('student_id');

        if (batchId) {
            const startDate = searchParams.get('start_date') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
            const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

            const data = await AttendanceService.getBatchAttendanceReport(parseInt(batchId), startDate, endDate);
            return successResponse(data, 'Batch attendance report fetched successfully');
        }

        if (studentId) {
            const data = await AttendanceService.getStudentAttendance(parseInt(studentId));
            return successResponse(data, 'Student attendance history fetched successfully');
        }

        return errorResponse(null, 'Either batch_id or student_id is required', 400);

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch attendance');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const mode = searchParams.get('mode') || 'session'; // session or record

        let data = await req.json();
        data = await autoAssignCompany(userId, data);

        if (mode === 'session') {
            const validatedData = attendanceSessionSchema.parse(data);
            const session = await AttendanceService.createSession(validatedData);
            return successResponse(session, 'Attendance session created successfully', 201);
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
