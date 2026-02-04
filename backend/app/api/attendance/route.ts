/**
 * Attendance API Routes
 * POST /api/attendance/verify - Submit face & location verification
 * GET /api/attendance/session/active - Get active attendance session
 * GET /api/attendance/student/:studentId - Get student attendance history
 * GET /api/attendance/batch/:batchId/summary - Get batch attendance summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/services/AttendanceService';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'verify_attendance':
                return await handleVerifyAttendance(body, session);

            case 'create_session':
                return await handleCreateSession(body, session);

            case 'register_face':
                return await handleRegisterFace(body, session);

            case 'add_location':
                return await handleAddLocation(body, session);

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Attendance API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'active_session':
                return await handleGetActiveSession(searchParams, session);

            case 'student_history':
                return await handleGetStudentHistory(searchParams, session);

            case 'batch_summary':
                return await handleGetBatchSummary(searchParams, session);

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Attendance API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// Handler functions
async function handleVerifyAttendance(body: any, session: any) {
    const {
        sessionId,
        studentId,
        verificationType,
        faceImageUrl,
        latitude,
        longitude,
        locationAccuracy,
        deviceInfo
    } = body;

    const companyId = session.user.companyId;

    const result = await AttendanceService.submitFaceVerification(
        {
            sessionId,
            studentId,
            verificationType,
            faceImageUrl,
            latitude,
            longitude,
            locationAccuracy,
            deviceInfo,
            ipAddress: body.ipAddress,
            userAgent: body.userAgent
        },
        companyId
    );

    return NextResponse.json({
        success: true,
        data: result,
        message: result.locationResult.is_valid
            ? 'Attendance verified successfully'
            : 'Location verification failed. You are outside the allowed area.'
    });
}

async function handleCreateSession(body: any, session: any) {
    const { courseId, batchId, sessionDate, sessionType, startTime, endTime } = body;
    const companyId = session.user.companyId;

    const sessionData = await AttendanceService.createSession({
        companyId,
        courseId,
        batchId,
        sessionDate,
        sessionType,
        startTime,
        endTime
    });

    return NextResponse.json({
        success: true,
        data: sessionData,
        message: 'Attendance session created successfully'
    });
}

async function handleRegisterFace(body: any, session: any) {
    const { studentId, faceEncoding, referenceImageUrl, qualityScore } = body;
    const companyId = session.user.companyId;

    const profile = await AttendanceService.registerFaceProfile(
        companyId,
        studentId,
        faceEncoding,
        referenceImageUrl,
        qualityScore
    );

    return NextResponse.json({
        success: true,
        data: profile,
        message: 'Face profile registered successfully'
    });
}

async function handleAddLocation(body: any, session: any) {
    const { branchId, locationName, latitude, longitude, radiusMeters } = body;
    const companyId = session.user.companyId;

    const location = await AttendanceService.addInstitutionLocation(
        companyId,
        branchId,
        locationName,
        latitude,
        longitude,
        radiusMeters
    );

    return NextResponse.json({
        success: true,
        data: location,
        message: 'Location added successfully'
    });
}

async function handleGetActiveSession(searchParams: URLSearchParams, session: any) {
    const batchId = parseInt(searchParams.get('batchId') || '0');
    const companyId = session.user.companyId;

    const activeSession = await AttendanceService.getActiveSession(companyId, batchId);

    if (!activeSession) {
        return NextResponse.json({
            success: false,
            message: 'No active attendance session found'
        });
    }

    return NextResponse.json({
        success: true,
        data: activeSession,
        message: `Active window: ${activeSession.activeWindow}`
    });
}

async function handleGetStudentHistory(searchParams: URLSearchParams, session: any) {
    const studentId = parseInt(searchParams.get('studentId') || '0');
    const courseId = searchParams.get('courseId') ? parseInt(searchParams.get('courseId')!) : undefined;
    const companyId = session.user.companyId;

    const history = await AttendanceService.getStudentAttendance(companyId, studentId, courseId);

    return NextResponse.json({
        success: true,
        data: history
    });
}

async function handleGetBatchSummary(searchParams: URLSearchParams, session: any) {
    const batchId = parseInt(searchParams.get('batchId') || '0');
    const sessionId = parseInt(searchParams.get('sessionId') || '0');
    const companyId = session.user.companyId;

    const summary = await AttendanceService.getBatchAttendanceSummary(companyId, batchId, sessionId);

    return NextResponse.json({
        success: true,
        data: summary
    });
}
