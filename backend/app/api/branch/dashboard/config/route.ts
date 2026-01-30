/**
 * Branch Dashboard Configuration API
 * Route: /api/branch/dashboard/config
 * Returns: User role, permissions, and available modules
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { core } from '@/lib/supabase';

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

        // Get user with role
        const { data: user } = await core.supabase
            .from('users')
            .select(`
                id,
                email,
                first_name,
                last_name,
                user_roles (
                    role:roles (
                        id,
                        role_name,
                        role_permissions (
                            permission:permissions (
                                permission_name,
                                resource,
                                action
                            )
                        )
                    )
                )
            `)
            .eq('id', userId)
            .single();

        if (!user) {
            return errorResponse(null, 'User not found', 404);
        }

        // Extract role and permissions
        const userRole = user.user_roles?.[0]?.role;
        const roleName = userRole?.role_name || 'USER';

        // Build permissions array
        const permissions: string[] = [];
        const modules = new Set<string>();

        userRole?.role_permissions?.forEach((rp: any) => {
            const perm = rp.permission;
            if (perm) {
                const permString = `${perm.resource}.${perm.action}`;
                permissions.push(permString);

                // Extract module from resource (e.g., "hrms_employees" -> "HRMS")
                const module = perm.resource.split('_')[0].toUpperCase();
                modules.add(module);
            }
        });

        // Get branch info
        const { data: branch } = await core.supabase
            .from('branches')
            .select('id, branch_name, branch_code')
            .eq('id', scope.branchId)
            .single();

        // Build dashboard configuration
        const dashboardConfig = {
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`.trim() || user.email,
                email: user.email,
                role: roleName,
            },
            branch: branch || null,
            role: roleName,
            permissions: permissions,
            modules: Array.from(modules),
            hasHRMS: modules.has('HRMS'),
            hasEMS: modules.has('EMS'),
            hasFinance: modules.has('FINANCE'),
            hasCRM: modules.has('CRM'),
        };

        return successResponse(dashboardConfig, 'Dashboard configuration fetched successfully');

    } catch (error: any) {
        console.error('Dashboard config error:', error);
        return errorResponse(null, error.message || 'Failed to fetch dashboard configuration');
    }
}
