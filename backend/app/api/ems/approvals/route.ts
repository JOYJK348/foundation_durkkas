import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { app_auth } from '@/lib/supabase';
import { ApprovalService } from '@/lib/services/ApprovalService';

/**
 * EMS Approvals API - GET Pending items, POST Approve/Reject
 * FIXED: Extreme diagnostic mode for Production debugging
 */

async function checkAuthorization(userId: number) {
    // 1. Fetch raw user roles without filters first
    const { data: rawRoles, error: dbError } = await app_auth.userRoles()
        .select(`
            company_id,
            is_active,
            roles!inner ( id, name, level )
        `)
        .eq('user_id', userId);

    const { data: userData } = await app_auth.users().select('email').eq('id', userId).maybeSingle();

    if (dbError) {
        return { isAuthorized: false, role: 'DB_ERROR', level: 0, companyId: null, debug: { dbError, userId, email: userData?.email } };
    }

    if (!rawRoles || rawRoles.length === 0) {
        return { isAuthorized: false, role: 'NO_ROLES_FOUND', level: 0, companyId: null, debug: { userId, email: userData?.email } };
    }

    // 2. Filter active roles
    const activeRoles = rawRoles.filter((ur: any) => ur.is_active === true);

    if (activeRoles.length === 0) {
        return {
            isAuthorized: false,
            role: 'INACTIVE_ROLES',
            level: 0,
            companyId: null,
            debug: { rawRoles, userId, email: userData?.email }
        };
    }

    // 3. Find the highest role
    const roles = activeRoles.map((ur: any) => ({
        name: ur.roles.name?.toUpperCase().replace(/\s+/g, '_'),
        level: Number(ur.roles.level || 0),
        companyId: ur.company_id
    })).sort((a, b) => b.level - a.level);

    const highest = roles[0];

    // Liberal authorization check for production resolution
    const isAuthorized =
        highest.name === 'ACADEMIC_MANAGER' ||
        highest.name === 'COMPANY_ADMIN' ||
        highest.name === 'PLATFORM_ADMIN' ||
        highest.name === 'EMS_ADMIN' ||
        highest.level >= 3;

    return {
        isAuthorized,
        role: highest.name,
        level: highest.level,
        companyId: highest.companyId,
        debug: { activeRoles, userId, email: userData?.email, highestRole: highest }
    };
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            console.error('[Approvals API] No userId found in token');
            return errorResponse('UNAUTHORIZED', 'Unauthorized: No valid session', 401);
        }

        const auth = await checkAuthorization(userId);

        // Use companyId from scope, or from headers as fallback
        const companyId = auth.companyId || Number(req.headers.get('x-company-id'));

        console.log(`[Approvals API] GET Attempt - User: ${userId}, Authorized: ${auth.isAuthorized}, Role: ${auth.role}, Company: ${companyId}`);

        if (!auth.isAuthorized) {
            return errorResponse('AUTHORIZATION_ERROR', `Forbidden: Role ${auth.role} (L${auth.level}) lacks access`, 403, { auth });
        }

        if (!companyId) {
            return errorResponse('BAD_REQUEST', 'Missing context: Company ID required for approvals', 400, { auth });
        }

        const pendingData = await ApprovalService.getPendingItems(companyId);
        return successResponse(pendingData, 'Pending items fetched successfully');

    } catch (error: any) {
        console.error('[Approvals API] GET Critical Error:', error);
        return errorResponse('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch pending items');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);

        const auth = await checkAuthorization(userId);
        const companyId = auth.companyId || Number(req.headers.get('x-company-id'));

        if (!auth.isAuthorized) {
            return errorResponse('AUTHORIZATION_ERROR', 'Forbidden: Only managers can approve/reject items', 403, { auth });
        }

        if (!companyId) {
            return errorResponse('BAD_REQUEST', 'Missing context: Company ID required', 400, { auth });
        }

        const { type, id, action, reason } = await req.json();

        if (!type || !id || !action) {
            return errorResponse('BAD_REQUEST', 'Missing required fields: type, id, action', 400);
        }

        let result;
        if (action === 'APPROVE') {
            result = await ApprovalService.approveItem(type, id, companyId, userId);
        } else if (action === 'REJECT') {
            result = await ApprovalService.rejectItem(type, id, companyId, userId, reason);
        } else {
            return errorResponse('BAD_REQUEST', 'Invalid action. Use APPROVE or REJECT', 400);
        }

        return successResponse(result, `Item ${action.toLowerCase()}d successfully`);

    } catch (error: any) {
        console.error('[Approvals API] POST Critical Error:', error);
        return errorResponse('INTERNAL_SERVER_ERROR', error.message || 'Failed to process approval');
    }
}
