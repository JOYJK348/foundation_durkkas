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
        const { data: companies, error: compError } = await core.companies().select('id, name').limit(1);
        results.core_test = compError ? `ERROR: ${compError.message}` : `OK (${companies?.length} found)`;

        const { data: settings, error: setError } = await core.globalSettings().select('key, value').limit(1);
        results.settings_test = setError ? `ERROR: ${setError.message}` : `OK (${settings?.length} found)`;

        return successResponse(results, 'Debug info fetched');
    } catch (error: any) {
        return errorResponse('INTERNAL_ERROR', error.message, 500);
    }
}
