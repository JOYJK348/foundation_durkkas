import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase } from '@/lib/supabase';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { AuditService } from '@/lib/services/AuditService';

/**
 * CRM RESTORE API
 * Restores soft-deleted leads across any CRM table
 */

const TABLE_MAP: Record<string, string> = {
    'vendors': 'vendor_applications',
    'partners': 'partner',
    'job-seekers': 'job_seeker_applications',
    'internships': 'student_internship_applications',
    'course-enquiries': 'course_enquiry_registrations',
    'career-guidance': 'career_guidance_applications'
};

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        const body = await req.json();
        const { typeKey, id } = body;

        const tableName = TABLE_MAP[typeKey];
        if (!tableName) return errorResponse('BAD_REQUEST', 'Invalid type key', 400);

        // 🏗️ RESTORATION LOGIC
        const { data, error } = await supabase
            .schema('crm')
            .from(tableName)
            .update({
                deleted_at: null,
                deleted_by: null,
                delete_reason: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('company_id', scope.companyId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        await AuditService.logAction({
            userId,
            action: 'RESTORE',
            tableName: tableName,
            schemaName: 'crm',
            recordId: String(id),
            companyId: scope.companyId,
            ipAddress: AuditService.getIP(req)
        } as any);

        return successResponse(data, 'Lead restored and synchronized back to active pipeline');

    } catch (error: any) {
        return errorResponse('DATABASE_ERROR', error.message);
    }
}
