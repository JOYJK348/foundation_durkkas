
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
    console.log('--- 09:53 SCAN ---');
    const { data, error } = await supabase.schema('app_auth').from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Retrieved ${data.length} latest logs`);
    data.forEach(log => {
        console.log(`[${log.created_at}] ${log.action} | ${log.user_email} | IP: ${log.ip_address}`);
    });
}
scan();
