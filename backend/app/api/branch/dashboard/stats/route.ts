/**
 * Branch Dashboard Stats API
 * Route: /api/branch/dashboard/stats
 * Returns: Aggregated stats for all modules user has access to
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { core, hrms, ems, finance, crm } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await import('@/middleware/tenantFilter').then(m =>
            m.getUserTenantScope(userId)
        );

        if (!scope.companyId || !scope.branchId) {
            return errorResponse(null, 'Branch context required', 403);
        }

        const stats: any = {};

        // HRMS Stats
        try {
            const { count: employeeCount } = await hrms.supabase
                .from('employees')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', scope.companyId)
                .eq('branch_id', scope.branchId)
                .eq('is_active', true)
                .is('deleted_at', null);

            stats.hrms = {
                totalEmployees: employeeCount || 0,
                // TODO: Add more HRMS stats (attendance rate, pending leaves, etc.)
            };
        } catch (error) {
            stats.hrms = { totalEmployees: 0 };
        }

        // EMS Stats
        try {
            const { count: studentCount } = await ems.supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', scope.companyId)
                .eq('branch_id', scope.branchId)
                .eq('is_active', true)
                .is('deleted_at', null);

            const { count: courseCount } = await ems.supabase
                .from('courses')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', scope.companyId)
                .eq('is_active', true)
                .is('deleted_at', null);

            stats.ems = {
                totalStudents: studentCount || 0,
                activeCourses: courseCount || 0,
            };
        } catch (error) {
            stats.ems = { totalStudents: 0, activeCourses: 0 };
        }

        // Finance Stats
        try {
            // TODO: Implement finance stats when finance schema is ready
            stats.finance = {
                monthlyRevenue: 0,
                pendingInvoices: 0,
            };
        } catch (error) {
            stats.finance = { monthlyRevenue: 0, pendingInvoices: 0 };
        }

        // CRM Stats
        try {
            // TODO: Implement CRM stats when CRM schema is ready
            stats.crm = {
                activeLeads: 0,
                pendingFollowUps: 0,
            };
        } catch (error) {
            stats.crm = { activeLeads: 0, pendingFollowUps: 0 };
        }

        return successResponse(stats, 'Dashboard stats fetched successfully');

    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return errorResponse(null, error.message || 'Failed to fetch dashboard stats');
    }
}
