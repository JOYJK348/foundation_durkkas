/**
 * EMS API - Attendance Marking
 * Route: /api/ems/attendance/mark
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { ems } from '@/lib/supabase';
import { AttendanceService } from '@/lib/services/AttendanceService';

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const { classId, type, lat, long, faceUrl, faceScore } = await req.json();

        // 1. Fetch Class Details
        const { data: liveClass, error: classError } = await ems.liveClasses()
            .select('*')
            .eq('id', classId)
            .single();

        if (classError || !liveClass) return errorResponse(null, 'Class session not found', 404);

        // 2. Window Validation (Server Side)
        const windowCheck = AttendanceService.isInsideWindow(
            new Date(`${liveClass.scheduled_date}T${liveClass.start_time}`),
            new Date(`${liveClass.scheduled_date}T${liveClass.end_time}`),
            type
        );

        if (!windowCheck.isValid) {
            return errorResponse(null, windowCheck.message, 400);
        }

        // 3. Check if Record Exists
        const { data: existingRecord } = await ems.attendanceRecords()
            .select('*')
            .eq('class_id', classId)
            .eq('student_id', userId)
            .single();

        let updateData: any = {};
        if (type === 'IN') {
            updateData = {
                check_in_time: new Date().toISOString(),
                check_in_lat: lat,
                check_in_long: long,
                check_in_face_url: faceUrl,
                check_in_face_score: faceScore,
                attendance_status: 'PARTIAL'
            };
        } else {
            updateData = {
                check_out_time: new Date().toISOString(),
                check_out_lat: lat,
                check_out_long: long,
                check_out_face_url: faceUrl,
                check_out_face_score: faceScore,
                attendance_status: existingRecord?.check_in_time ? 'PRESENT' : 'LATE'
            };
        }

        const { data, error } = await ems.attendanceRecords()
            .upsert({
                id: existingRecord?.id,
                company_id: scope.companyId,
                class_id: classId,
                student_id: userId,
                ...updateData
            })
            .select()
            .single();

        if (error) throw error;

        return successResponse(data, `Attendance marked for Check-${type}`);

    } catch (error: any) {
        console.error('[Attendance Mark] Error:', error);
        return errorResponse(null, error.message || 'Failed to mark attendance');
    }
}
