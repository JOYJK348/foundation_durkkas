/**
 * AUTH API - Role Permissions mapping
 * Route: /api/auth/role-permissions
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { app_auth } from '@/lib/supabase';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { getUserIdFromToken } from '@/lib/jwt';
import { AuditService } from '@/lib/services/AuditService';

export async function GET(_req: NextRequest) {
    try {
        const { data, error } = await app_auth.rolePermissions()
            .select(`
                *,
                role:roles(name, display_name),
                permission:permissions(name, display_name, resource, action)
            `)
            .eq('is_active', true);

        if (error) throw new Error(error.message);
        return successResponse(data, 'Role permissions fetched');
    } catch (error: any) {
        return errorResponse(null, error.message);
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);
        const scope = await getUserTenantScope(userId);

        // Only Platform Admin (Level 5) can modify global role permissions
        if (scope.roleLevel < 5) {
            return errorResponse(null, 'Forbidden: Platform Admin only', 403);
        }

        const body = await req.json();
        const { data, error } = await app_auth.rolePermissions()
            .insert(body)
            .select()
            .single();

        if (error) throw new Error(error.message);

        const record = data as any;

        await AuditService.logAction({
            userId,
            action: 'CREATE',
            tableName: 'role_permissions',
            recordId: record.id?.toString(),
            newData: record,
            ipAddress: AuditService.getIP(req)
        } as any);

        return successResponse(record, 'Role permission assignment established', 201);
    } catch (error: any) {
        return errorResponse(null, error.message);
    }
}
