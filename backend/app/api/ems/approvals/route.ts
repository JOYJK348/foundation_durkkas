import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { app_auth } from '@/lib/supabase';
import { ApprovalService } from '@/lib/services/ApprovalService';

/**
 * EMS Approvals API - GET Pending items, POST Approve/Reject
 * FIXED: Bypass tenantScope cache and use direct role check for robustness
 */

async function checkAuthorization(userId: number) {
    // Direct DB query to avoid any middleware/cache issues
    const { data: userRoles } = await app_auth.userRoles()
        .select(`
            company_id,
            roles!inner ( name, level )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

    if (!userRoles || userRoles.length === 0) return { isAuthorized: false, role: 'NONE', level: 0, companyId: null };

    // Find the highest role
    const roles = userRoles.map((ur: any) => ({
        name: ur.roles.name?.toUpperCase().replace(/\s+/g, '_'),
        level: Number(ur.roles.level || 0),
        companyId: ur.company_id
    })).sort((a, b) => b.level - a.level);

    const highest = roles[0];
    const isAuthorized =
        highest.name === 'ACADEMIC_MANAGER' ||
        highest.name === 'COMPANY_ADMIN' ||
        highest.name === 'PLATFORM_ADMIN' ||
        highest.level >= 3;

    return { isAuthorized, role: highest.name, level: highest.level, companyId: highest.companyId };
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const { isAuthorized, role, level, companyId: scopeCompanyId } = await checkAuthorization(userId);

        // Use companyId from scope, or from headers as fallback
        const companyId = scopeCompanyId || Number(req.headers.get('x-company-id'));

        console.log(`[Approvals API DEBUG] User: ${userId}, Role: ${role}, Level: ${level}, Company: ${companyId}`);

        if (!isAuthorized) {
            return errorResponse('AUTHORIZATION_ERROR', `Forbidden: Role ${role} (L${level}) lacks approval permissions`, 403, { role, level, userId });
        }

        if (!companyId) {
            return errorResponse('BAD_REQUEST', 'Missing context: Company ID required', 400);
        }

        const pendingData = await ApprovalService.getPendingItems(companyId);
        return successResponse(pendingData, 'Pending items fetched successfully');

    } catch (error: any) {
        return errorResponse('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch pending items');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const { isAuthorized, companyId: scopeCompanyId } = await checkAuthorization(userId);
        const companyId = scopeCompanyId || Number(req.headers.get('x-company-id'));

        if (!isAuthorized) {
            return errorResponse('AUTHORIZATION_ERROR', 'Forbidden: Only managers can approve/reject items', 403);
        }

        if (!companyId) {
            return errorResponse('BAD_REQUEST', 'Missing context: Company ID required', 400);
        }

        const { type, id, action, reason } = await req.json();

        if (!type || !id || !action) {
            return errorResponse('BAD_REQUEST', 'Missing required fields', 400);
        }

        let result;
        if (action === 'APPROVE') {
            result = await ApprovalService.approveItem(type, id, companyId, userId);
        } else if (action === 'REJECT') {
            result = await ApprovalService.rejectItem(type, id, companyId, userId, reason);
        } else {
            return errorResponse('BAD_REQUEST', 'Invalid action', 400);
        }

        return successResponse(result, `Item ${action.toLowerCase()}d successfully`);

    } catch (error: any) {
        return errorResponse('INTERNAL_SERVER_ERROR', error.message || 'Failed to process approval');
    }
}
