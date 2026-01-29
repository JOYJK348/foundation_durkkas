import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { supabase, core, app_auth } from '@/lib/supabase';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUserTenantScope } from '@/middleware/tenantFilter';

export async function GET(req: NextRequest) {
    const results: any = {
        timestamp: new Date().toISOString(),
        env: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
            key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING'
        },
        connection: 'UNKNOWN',
        auth_test: 'UNKNOWN',
        core_test: 'UNKNOWN'
    };

    try {
        // 1. Connection Test
        const { data: connData, error: connError } = await supabase.from('companies').select('count', { count: 'exact', head: true });
        if (connError) results.connection = `ERROR: ${connError.message}`;
        else results.connection = 'OK';

        // 2. Auth Context Test
        const userId = await getUserIdFromToken(req);
        results.auth_context = userId ? `USER_${userId}` : 'NO_TOKEN';

        if (userId) {
            try {
                const scope = await getUserTenantScope(userId);
                results.tenant_scope = scope;
                results.auth_test = 'OK';
            } catch (e: any) {
                results.auth_test = `ERROR: ${e.message}`;
            }
        }

        // 3. Schema Data Test
        const { data: users, error: userError } = await app_auth.users().select('id, email, is_active').limit(10);
        results.users_list = userError ? `ERROR: ${userError.message}` : users;

        const userIdQuery = req.nextUrl.searchParams.get('userId');
        const emailQuery = req.nextUrl.searchParams.get('email');

        if (emailQuery) {
            const { data: userByEmail } = await app_auth.users().select('id, email').eq('email', emailQuery).single();
            results.found_user = userByEmail;
        }

        const effectiveUserId = userIdQuery ? parseInt(userIdQuery) : (results.found_user?.id || userId);

        if (effectiveUserId) {
            results.testing_user = `USER_${effectiveUserId}`;

            // Check roles directly
            const { data: userRoles } = await app_auth.userRoles().select('*, roles(name, level)').eq('user_id', effectiveUserId);
            results.user_roles_direct = userRoles;

            try {
                const scope = await getUserTenantScope(effectiveUserId);
                results.tenant_scope = scope;
                results.auth_test = 'OK';
            } catch (e: any) {
                results.auth_test = `ERROR: ${e.message}`;
            }
        }

        const { data: allRoles } = await app_auth.roles().select('id, name, level').limit(50);
        results.all_roles = allRoles;

        const { data: adminRole } = await app_auth.roles().select('id, name, level').eq('name', 'ADMIN').single();
        results.admin_role = adminRole;

        return successResponse(results, 'Debug info fetched');
    } catch (error: any) {
        return errorResponse('INTERNAL_ERROR', error.message, 500);
    }
}
