/**
 * Test script to insert a sample audit log entry
 * Run with: node backend/scripts/test-audit-log.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestAuditLog() {
    console.log('🔍 Inserting test audit log entry...');

    const { data, error } = await supabase
        .schema('app_auth')
        .from('audit_logs')
        .insert({
            user_id: 1,
            user_email: 'admin@durkkas.com',
            company_id: null,
            action: 'DELETE',
            resource_type: 'companies',
            resource_id: 999,
            schema_name: 'core',
            table_name: 'companies',
            old_values: {
                id: 999,
                name: 'Test Company',
                is_active: true
            },
            new_values: {
                delete_reason: 'Testing archive system',
                is_active: false,
                deleted_at: new Date().toISOString()
            },
            ip_address: '127.0.0.1',
            user_agent: 'Test Script',
            created_at: new Date().toISOString()
        })
        .select();

    if (error) {
        console.error('❌ Error inserting test log:', error);
        return;
    }

    console.log('✅ Test audit log inserted successfully:', data);

    // Now fetch all audit logs
    const { data: logs, error: fetchError } = await supabase
        .schema('app_auth')
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (fetchError) {
        console.error('❌ Error fetching logs:', fetchError);
        return;
    }

    console.log(`📊 Total audit logs in database: ${logs?.length || 0}`);
    if (logs && logs.length > 0) {
        console.log('Latest log:', JSON.stringify(logs[0], null, 2));
    }
}

insertTestAuditLog()
    .then(() => {
        console.log('✅ Script completed');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Script failed:', err);
        process.exit(1);
    });
