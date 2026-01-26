import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase } from '@/lib/supabase';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const companyId = scope.companyId;

        if (!companyId) return errorResponse('BAD_REQUEST', 'Company context not found', 400);

        const freshSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        const tableConfigs = [
            { key: 'vendors', table: 'vendor_applications', type: 'Vendor' },
            { key: 'partners', table: 'partner', type: 'Partner' },
            { key: 'job-seekers', table: 'job_seeker_applications', type: 'Job Seeker' },
            { key: 'internships', table: 'student_internship_applications', type: 'Internship' },
            { key: 'course-enquiries', table: 'course_enquiry_registrations', type: 'Course Enquiry' },
            { key: 'career-guidance', table: 'career_guidance_applications', type: 'Career Guidance' }
        ];

        let archivedLeads: any[] = [];

        for (const item of tableConfigs) {
            const { data, error } = await freshSupabase
                .schema('crm')
                .from(item.table)
                .select('*')
                .eq('company_id', companyId)
                .not('deleted_at', 'is', null)
                .order('deleted_at', { ascending: false });

            if (!error && data) {
                data.forEach((v: any) => {
                    archivedLeads.push({
                        ...v,
                        _table: item.table,
                        _typeKey: item.key,
                        _typeName: item.type,
                        _display_name: v.vendor_name || v.contact_person_name || v.full_name || v.name || v.candidate_name || v.student_name || 'Unnamed Lead'
                    });
                });
            }
        }

        // Sort by deletion date
        archivedLeads.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

        return successResponse(archivedLeads, 'Archived leads fetched successfully');

    } catch (error: any) {
        return errorResponse('INTERNAL_ERROR', error.message);
    }
}
