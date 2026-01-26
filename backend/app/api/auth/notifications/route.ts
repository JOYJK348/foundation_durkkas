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

        // 🔒 STRICT ISOLATION & HIERARCHY
        if (scope.roleLevel === 5) {
            // PLATFORM ADMIN: Full Visibility
            console.log(`[NOTIFICATIONS] Platform Admin ${userId} - Global Access`);
        }
        else if (scope.roleLevel === 4) {
            // COMPANY ADMIN
            const filters = [
                `user_id.eq.${userId}`,                                      // Private
                `target_type.eq.GLOBAL`,                                     // Platform Alerts
                `and(target_type.eq.COMPANY,company_id.eq.${scope.companyId})`, // Company-wide
                `and(target_type.eq.ROLE,target_role_level.eq.${scope.roleLevel},company_id.eq.${scope.companyId})` // Role-based
            ];
            query = query.or(filters.join(','));
        }
        else if (scope.roleLevel === 1) {
            // BRANCH ADMIN
            const filters = [
                `user_id.eq.${userId}`,
                `target_type.eq.GLOBAL`,
                `and(target_type.eq.COMPANY,company_id.eq.${scope.companyId})`,
                `and(target_type.eq.BRANCH,branch_id.eq.${scope.branchId})`,
                `and(target_type.eq.ROLE,target_role_level.eq.${scope.roleLevel})`
            ];
            query = query.or(filters.join(','));
        }
        else {
            // EMPLOYEES
            const filters = [
                `user_id.eq.${userId}`,
                `target_type.eq.GLOBAL`,
                `and(target_type.eq.ROLE,target_role_level.eq.${scope.roleLevel},company_id.eq.${scope.companyId})`
            ];
            query = query.or(filters.join(','));
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        // Ensure consistency between type and category for UI
        const processed = (data || []).map(n => ({
            ...n,
            type: n.type || n.category || 'INFO',
            category: n.category || n.type || 'INFO'
        }));

        return successResponse(processed);
    } catch (err: any) {
        console.error(`❌ [NOTIFICATIONS] Exception:`, err);
        return errorResponse('INTERNAL_SERVER_ERROR', err.message, 500);
    }
}

/**
 * POST /api/auth/notifications
 * Dispatcher
 */
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse('UNAUTHORIZED', 'Authentication required', 401);

        const scope = await getUserTenantScope(userId);
        const body = await req.json();

        const {
            target_type,
            target_id,
            target_role_level,
            company_id,
            branch_id,
            title,
            message,
            type,
            category,
            priority,
            metadata
        } = body;

        const notificationData: any = {
            sender_id: userId,
            title,
            message,
            type: type || category || 'INFO',
            category: category || type || 'INFO',
            priority: priority || 'NORMAL',
            target_type: target_type || 'USER',
            metadata: metadata || {},
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
        const scope = await getUserTenantScope(userId);

        let query = supabaseService
            .schema(SCHEMAS.AUTH)
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() });

        if (all) {
            // Build scope-aware "Mark All" logic
            if (scope.roleLevel === 5) {
                // Platform Admin: Mark everything
                query = query.neq('id', 0);
            } else {
                const filters = [`user_id.eq.${userId}`];

                // Include shared notifications based on scope
                if (scope.companyId) {
                    filters.push(`target_type.eq.GLOBAL`);
                    filters.push(`and(target_type.eq.COMPANY,company_id.eq.${scope.companyId})`);
                }

                if (scope.branchId) {
                    filters.push(`and(target_type.eq.BRANCH,branch_id.eq.${scope.branchId})`);
                }

                query = query.or(filters.join(','));
            }
        } else if (ids && Array.isArray(ids)) {
            // For specific IDs, ensure they belong to the user's scope (Extra Security)
            if (scope.roleLevel < 5) {
                query = query.in('id', ids);

                const securityFilters = [`user_id.eq.${userId}`];
                if (scope.companyId) securityFilters.push(`company_id.eq.${scope.companyId}`);
                if (scope.branchId) securityFilters.push(`branch_id.eq.${scope.branchId}`);

                query = query.or(securityFilters.join(','));
            } else {
                query = query.in('id', ids);
            }
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
