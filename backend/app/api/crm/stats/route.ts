
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase } from '@/lib/supabase';
import { applyTenantFilter, getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { SCHEMAS } from '@/config/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);

        const tables = {
            vendors: 'vendor_applications',
            partners: 'partner',
            jobSeekers: 'job_seeker_applications',
            internships: 'student_internship_applications',
            courseEnquiries: 'course_enquiry_registrations',
            careerGuidance: 'career_guidance_applications'
        };

        const stats: any = {};

        // Helper to count rows in a specific table
        const countTable = async (tableName: string) => {
            let query = supabase.schema(SCHEMAS.CRM as any).from(tableName).select('*', { count: 'exact', head: true });

            // Apply company filter
            if (scope.roleLevel < 5 && scope.companyId) {
                query = query.eq('company_id', scope.companyId);
            }

            const { count, error } = await query;

            if (error) {
                console.error(`[CRM Stats] Error counting ${tableName}:`, error.message);
                return 0;
            }

            return count || 0;
        };

        // Execute counts in parallel
        const results = await Promise.all([
            countTable(tables.vendors),
            countTable(tables.partners),
            countTable(tables.jobSeekers),
            countTable(tables.internships),
            countTable(tables.courseEnquiries),
            countTable(tables.careerGuidance)
        ]);

        stats.vendors = results[0];
        stats.partners = results[1];
        stats.jobSeekers = results[2];
        stats.internships = results[3];
        stats.courseEnquiries = results[4];
        stats.careerGuidance = results[5];

        // Calculated totals
        stats.totalLeads = stats.vendors + stats.partners + stats.jobSeekers + stats.internships + stats.courseEnquiries + stats.careerGuidance;
        stats.activePartners = stats.partners;
        stats.applications = stats.jobSeekers + stats.internships;
        stats.enquiries = stats.courseEnquiries + stats.careerGuidance;
        stats.companyId = scope.companyId; // Return company ID for frontend use

        return successResponse(stats, 'CRM stats fetched successfully');

    } catch (error: any) {
        return errorResponse(null, error.message || 'Failed to fetch CRM stats');
    }
}
