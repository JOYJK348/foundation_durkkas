
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAudit() {
    console.log('--- AUDIT LOG CHECK ---');
    try {
        const { data, error, count } = await supabase
            .schema('app_auth')
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching audit logs:', error);
            return;
        }

        console.log('Total Logs Count:', count);
        console.log('Latest 10 Logs:');
        data?.forEach((log) => {
            console.log(`[${log.created_at}] Action: ${log.action} | Actor: ${log.user_email} | IP: ${log.ip_address} | Table: ${log.table_name}`);
        });

    } catch (err) {
        console.error('Exception:', err);
    }
    console.log('--- END CHECK ---');
}

checkAudit();
