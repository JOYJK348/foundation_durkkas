import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { SCHEMAS } from '@/config/constants';
import { errorResponse } from '@/lib/errorHandler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * AUTH: Audit Logs API
 * Route: /api/auth/audit-logs
 */
export async function GET(req: NextRequest) {
    try {
        const callerEmail = req.headers.get('x-user-email') || 'Unknown';
        const roleLevel = req.headers.get('x-user-roles') || '[]';
        console.log(`📡 [API AUDIT] Access requested by ${callerEmail} (Roles: ${roleLevel})`);

        const { data, error, count } = await supabaseService
            .schema(SCHEMAS.AUTH)
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ [API AUDIT] Query Error:', error.message);
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            console.log(`✅ [API AUDIT] Latest entry in registry: ${data[0].action} at ${data[0].created_at} by ${data[0].user_email}`);
        }

        console.log(`✅ [API AUDIT] Successfully fetched ${data?.length || 0} (Total: ${count}) entries for platform view`);
        // 📡 TELEMETRY HANDSHAKE: Ensure bit-perfect real-time delivery
        const responseData = {
            success: true,
            data: data || [],
            message: `Audit stream synchronized: ${count} entries`,
            timestamp: new Date().toISOString(),
            server_time: new Date().toISOString(),
            meta: { total: count }
        };

        return NextResponse.json(responseData, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store'
            }
        });
    } catch (error: any) {
        console.error('❌ [API AUDIT] Exception:', error.message);
        return errorResponse('INTERNAL_ERROR', error.message || 'Failed to sync audit stream', 500);
    }
}
