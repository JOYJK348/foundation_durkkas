
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase, fromSchema } from '@/lib/supabase';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { SCHEMAS } from '@/config/constants';

export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const requestId = Math.random().toString(36).substring(7);
        console.log(`[CRM RECENT][${requestId}] 🚀 Fetching ABSOLUTE FRESH leads (POST)...`);

        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const companyId = scope.companyId;

        if (!companyId) return errorResponse(null, 'Company context not found', 400);

        console.log(`[CRM RECENT][${requestId}] 🔍 Context: User ${userId}, Company ${companyId}`);

        const freshSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        const limit = 20; // Increased limit
        const allLeads: any[] = [];

        const tableConfigs = [
            { key: 'vendors', table: 'vendor_applications', type: 'Vendor' },
            { key: 'partners', table: 'partner', type: 'Partner' },
            { key: 'jobSeekers', table: 'job_seeker_applications', type: 'Job Seeker' },
            { key: 'internships', table: 'student_internship_applications', type: 'Internship' },
            { key: 'courseEnquiries', table: 'course_enquiry_registrations', type: 'Course Enquiry' },
            { key: 'careerGuidance', table: 'career_guidance_applications', type: 'Career Guidance' }
        ];

        for (const item of tableConfigs) {
            let query = freshSupabase
                .schema('crm')
                .from(item.table)
                .select('*')
                .eq('company_id', companyId)
                .is('deleted_at', null);

            if (scope.roleLevel < 4 && scope.branchId) {
                query = query.eq('branch_id', scope.branchId);
            }

            const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);

            if (!error && data && data.length > 0) {
                console.log(`[CRM RECENT][${requestId}]   ✅ Found ${data.length} in ${item.table}. Top ID: ${data[0].id}, Name: ${data[0].vendor_name || data[0].full_name || data[0].contact_person_name}`);
                data.forEach((v: any) => {
                    const leadName = v.vendor_name || v.contact_person_name || v.full_name || v.name || v.candidate_name || v.student_name || 'Individual Lead';
                    allLeads.push({
                        id: v.id,
                        name: leadName,
                        email: v.email || 'N/A',
                        type: item.type,
                        categoryKey: item.key, // Added for frontend routing
                        date: v.created_at
                    });
                });
            }
        }

        const sortedLeads = allLeads.sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            return timeB - timeA;
        }).slice(0, 10);

        console.log(`[CRM RECENT][${requestId}] ✨ Returning ${sortedLeads.length} leads. Top ID: ${sortedLeads[0]?.id}`);

        return new Response(JSON.stringify({
            success: true,
            data: sortedLeads,
            message: 'Recent leads fetched successfully',
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
        });

    } catch (error: any) {
        console.error('[CRM RECENT] 💥 ERROR:', error.message);
        return successResponse([], 'Failed', 200);
    }
}
