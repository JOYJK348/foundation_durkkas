
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase, fromSchema } from '@/lib/supabase';
import { applyTenantFilter, getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { SCHEMAS } from '@/config/constants';

export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[CRM STATS][${requestId}] 🚀 Fetching ABSOLUTE FRESH stats (POST)...`);

        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const companyId = scope.companyId;

        console.log(`[CRM STATS][${requestId}] 🔍 Context: User ${userId}, Company ${companyId}`);

        if (!companyId) return errorResponse(null, 'Company context not found', 400);

        const freshSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        const tables = [
            { key: 'vendors', table: 'vendor_applications' },
            { key: 'partners', table: 'partner' },
            { key: 'jobSeekers', table: 'job_seeker_applications' },
            { key: 'internships', table: 'student_internship_applications' },
            { key: 'courseEnquiries', table: 'course_enquiry_registrations' },
            { key: 'careerGuidance', table: 'career_guidance_applications' }
        ];

        const stats: any = { companyId };
        let total = 0;

        for (const item of tables) {
            let query = freshSupabase
                .schema('crm')
                .from(item.table)
                .select('id', { count: 'exact' })
                .eq('company_id', companyId)
                .is('deleted_at', null);

            if (scope.roleLevel < 4 && scope.branchId) {
                query = query.eq('branch_id', scope.branchId);
            }

            const { count, error } = await query;

            if (!error) {
                const val = count || 0;
                console.log(`[CRM STATS][${requestId}]   ✅ ${item.table}: ${val}`);
                stats[item.key] = val;
                total += val;
            } else {
                console.error(`[CRM STATS][${requestId}]   ❌ ${item.table} Error:`, error.message);
                stats[item.key] = 0;
            }
        }

        stats.totalLeads = total;
        stats.activePartners = stats.partners || 0;
        stats.applications = (stats.jobSeekers || 0) + (stats.internships || 0);
        stats.enquiries = (stats.courseEnquiries || 0) + (stats.careerGuidance || 0);

        console.log(`[CRM STATS][${requestId}] ✨ Total Leads: ${total}`);
        return successResponse(stats, 'CRM stats fetched successfully');
    } catch (error: any) {
        console.error('[CRM STATS] 💥 ERROR:', error.message);
        return errorResponse(null, error.message || 'Failed', 500);
    }
}
