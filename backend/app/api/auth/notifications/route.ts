import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';
import { successResponse, errorResponse } from '@/lib/errorHandler';

/**
 * GET /api/auth/notifications
 * Fetch notifications for the current user based on hierarchy and scope
 */
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

        const scope = await getUserTenantScope(userId);

        let query = supabaseService
            .schema(SCHEMAS.AUTH)
            .from('notifications')
            .select('*, sender:sender_id(display_name, avatar_url)');

        // 🔒 STRICT ISOLATION: Company & Branch Level
        if (scope.roleLevel === 5) {
            // PLATFORM ADMIN: See ALL notifications (no filters)
            console.log(`[NOTIFICATIONS] Platform Admin ${userId} - Fetching ALL notifications`);
        }
        else if (scope.roleLevel === 4) {
            // COMPANY ADMIN: ONLY their company notifications
            // NO Platform Admin notifications, NO other companies
            if (!scope.companyId) {
                return errorResponse('FORBIDDEN', 'Company Admin must have company assignment', 403);
            }

            const filters = [
                `user_id.eq.${userId}`,                                      // Direct to me
                `sender_id.eq.${userId}`,                                    // Sent by me
                `and(target_type.eq.COMPANY,company_id.eq.${scope.companyId})`, // Company-wide
                `and(target_type.eq.ROLE,target_role_level.eq.${scope.roleLevel},company_id.eq.${scope.companyId})`, // Role-based in my company
                `and(target_type.is.null,company_id.eq.${scope.companyId})` // Legacy company notifications
            ];

            query = query.or(filters.join(','));
            console.log(`[NOTIFICATIONS] Company Admin ${userId} - Company ${scope.companyId} only`);
        }
        else if (scope.roleLevel === 1) {
            // BRANCH ADMIN: ONLY their branch notifications
            // NO other branches, NO other companies, NO Platform notifications
            if (!scope.branchId || !scope.companyId) {
                return errorResponse('FORBIDDEN', 'Branch Admin must have branch assignment', 403);
            }

            const filters = [
                `user_id.eq.${userId}`,                                      // Direct to me
                `sender_id.eq.${userId}`,                                    // Sent by me
                `and(target_type.eq.BRANCH,branch_id.eq.${scope.branchId})`, // Branch-wide (relaxed - no company check)
                `and(target_type.eq.COMPANY,company_id.eq.${scope.companyId})`, // Company-wide (Branch Admin can see company notifications)
                `and(target_type.eq.ROLE,target_role_level.eq.${scope.roleLevel})`, // Role-based (relaxed)
                `and(target_type.is.null,branch_id.eq.${scope.branchId})`, // Legacy branch notifications
                `and(target_type.is.null,company_id.eq.${scope.companyId},branch_id.is.null)` // Legacy company notifications
            ];

            query = query.or(filters.join(','));
            console.log(`[NOTIFICATIONS] Branch Admin ${userId} - Branch ${scope.branchId}, Company ${scope.companyId}`);
        }
        else {
            // OTHER ROLES (Employees, etc.): Only direct notifications
            const filters = [
                `user_id.eq.${userId}`,      // Direct to me
                `sender_id.eq.${userId}`     // Sent by me
            ];

            if (scope.companyId) {
                filters.push(`and(target_type.eq.ROLE,target_role_level.eq.${scope.roleLevel},company_id.eq.${scope.companyId})`);
            }

            query = query.or(filters.join(','));
            console.log(`[NOTIFICATIONS] User ${userId} - Direct notifications only`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error(`❌ [NOTIFICATIONS] Database Error for user ${userId}:`, error);
            console.error(`❌ [NOTIFICATIONS] Error details:`, {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return errorResponse('DATABASE_ERROR', `Failed to fetch notifications: ${error.message}`, 500);
        }

        console.log(`✅ [NOTIFICATIONS] Fetched ${data?.length || 0} notifications for user ${userId} (Level ${scope.roleLevel})`);
        return successResponse(data);
    } catch (err: any) {
        console.error(`❌ [NOTIFICATIONS] Exception:`, err);
        return errorResponse('INTERNAL_SERVER_ERROR', err.message || 'Failed to sync notifications', 500);
    }
}

/**
 * POST /api/auth/notifications
 * Hierarchical Notification Dispatcher
 */
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

        const scope = await getUserTenantScope(userId);
        const { target_type, target_id, target_role_level, company_id, branch_id, title, message, category, priority } = await req.json();

        // 🛡️ SECURITY & HIERARCHY VALIDATION
        if (scope.roleLevel < 1) {
            return errorResponse('FORBIDDEN', 'Employees cannot broadcast notifications', 403);
        }

        // Validate target role level (cannot target above yourself)
        if (target_type === 'ROLE' && target_role_level >= scope.roleLevel && scope.roleLevel < 5) {
            return errorResponse('FORBIDDEN', 'Cannot target roles equal or above your hierarchy level', 403);
        }

        const notificationData: any = {
            sender_id: userId,
            title,
            message,
            category: category || 'INFORMATION',
            priority: priority || 'NORMAL',
            target_type,
            created_at: new Date().toISOString()
        };

        if (target_type === 'ROLE') {
            notificationData.target_role_level = target_role_level;
        }

        // 2. Validate Scoping based on Role
        if (scope.roleLevel >= 5) {
            // PLATFORM ADMIN: Can notify anywhere
            notificationData.company_id = company_id || null;
            notificationData.branch_id = branch_id || null;
            notificationData.user_id = target_type === 'USER' ? target_id : null;
        }
        else if (scope.roleLevel === 4) {
            // COMPANY ADMIN: Strictly own company
            if (target_type === 'GLOBAL') return errorResponse('FORBIDDEN', 'Company Admin cannot send global alerts', 403);

            notificationData.company_id = scope.companyId;
            notificationData.branch_id = (target_type === 'BRANCH') ? branch_id : null;
            notificationData.user_id = (target_type === 'USER') ? target_id : null;
        }
        else if (scope.roleLevel === 1) {
            // BRANCH ADMIN: Strictly own branch
            if (target_type !== 'USER' && target_type !== 'BRANCH') {
                return errorResponse('FORBIDDEN', 'Branch Admin can only notify their own branch', 403);
            }

            notificationData.company_id = scope.companyId;
            notificationData.branch_id = scope.branchId;
            notificationData.user_id = (target_type === 'USER') ? target_id : null;
        }

        const { data, error } = await supabaseService
            .schema(SCHEMAS.AUTH)
            .from('notifications')
            .insert([notificationData])
            .select()
            .single();

        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);
        return successResponse(data, 'Notification sent successfully');

    } catch (err: any) {
        return errorResponse('INTERNAL_SERVER_ERROR', err.message, 500);
    }
}

/**
 * PATCH /api/auth/notifications
 * Mark notifications as read
 */
export async function PATCH(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

        const { ids, all } = await req.json();

        // For simplicity, we mark 'is_read' in the main table.
        // In a hierarchical system with broadcasts, we should insert into notification_read_receipts
        // so one user reading it doesn't clear it for others.

        let query = supabaseService
            .schema(SCHEMAS.AUTH)
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() });

        if (all) {
            query = query.eq('user_id', userId);
        } else if (ids && Array.isArray(ids)) {
            query = query.in('id', ids);
        } else {
            return errorResponse('VALIDATION_ERROR', 'Notification IDs are required', 400);
        }

        const { error } = await query;
        if (error) return errorResponse('DATABASE_ERROR', error.message, 500);

        return successResponse({ message: 'Notifications marked as read' });
    } catch (err: any) {
        return errorResponse('INTERNAL_SERVER_ERROR', err.message, 500);
    }
}
