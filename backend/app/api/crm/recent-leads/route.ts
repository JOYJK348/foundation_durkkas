
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase } from '@/lib/supabase';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { SCHEMAS } from '@/config/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        const companyId = scope.companyId;

        if (!companyId) return errorResponse(null, 'Company context not found', 400);

        // Fetch top 3 from each table
        const limit = 3;

        const [
            vendors,
            partners,
            jobSeekers,
            internships,
            courseEnquiries,
            careerGuidance
        ] = await Promise.all([
            supabase.schema('crm' as any).from('vendor_applications').select('id, vendor_name, email, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit),
            supabase.schema('crm' as any).from('partner').select('id, contact_person_name, email, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit),
            supabase.schema('crm' as any).from('job_seeker_applications').select('id, full_name, email, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit),
            supabase.schema('crm' as any).from('student_internship_applications').select('id, full_name, email, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit),
            supabase.schema('crm' as any).from('course_enquiry_registrations').select('id, name, email, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit),
            supabase.schema('crm' as any).from('career_guidance_applications').select('id, student_name, candidate_name, email, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit),
        ]);

        const allLeads: any[] = [];

        vendors.data?.forEach(v => allLeads.push({ id: v.id, name: v.vendor_name, email: v.email, type: 'Vendor', date: v.created_at }));
        partners.data?.forEach(v => allLeads.push({ id: v.id, name: v.contact_person_name, email: v.email, type: 'Partner', date: v.created_at }));
        jobSeekers.data?.forEach(v => allLeads.push({ id: v.id, name: v.full_name, email: v.email, type: 'Job Seeker', date: v.created_at }));
        internships.data?.forEach(v => allLeads.push({ id: v.id, name: v.full_name, email: v.email, type: 'Internship', date: v.created_at }));
        courseEnquiries.data?.forEach(v => allLeads.push({ id: v.id, name: v.name, email: v.email, type: 'Course Enquiry', date: v.created_at }));
        careerGuidance.data?.forEach(v => allLeads.push({ id: v.id, name: v.student_name || v.candidate_name, email: v.email, type: 'Career Guidance', date: v.created_at }));

        // Sort by date descending
        const sortedLeads = allLeads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        return successResponse(sortedLeads, 'Recent leads fetched successfully');

    } catch (error: any) {
        console.error('[CRM Recent Leads] Error:', error);
        return errorResponse(null, error.message || 'Failed to fetch recent leads');
    }
}
