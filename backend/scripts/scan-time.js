
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function scan() {
    console.log('--- 08:51 SCAN ---');
    const { data } = await supabase.schema('app_auth').from('audit_logs')
        .select('*')
        .gte('created_at', '2026-01-17T03:20:00Z')
        .lte('created_at', '2026-01-17T03:22:00Z');

    console.log(`Found ${data.length} logs around 03:21 UTC`);
    data.forEach(log => {
        console.log(`[${log.created_at}] ${log.action} | ${log.user_email} | IP: ${log.ip_address}`);
    });
}
scan();
