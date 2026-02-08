
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_functions', { s_name: 'ems' });
    // If rpc doesn't exist, try a simple select from information_schema
    const { data: data2, error: error2 } = await supabase.from('core_academic_years').select('*').limit(1); // just a test

    // Use raw query via a temporary function if needed, but let's try something else.
    // Let's try to just list tables in ems schema.
    const { data: tables } = await supabase.from('pg_catalog.pg_tables').select('*').eq('schemaname', 'ems');
    console.log('Tables in ems:', tables?.map(t => t.tablename));

    const { data: rpcTest, error: rpcError } = await supabase.schema('ems').rpc('verify_location', {
        p_company_id: 13,
        p_latitude: 0,
        p_longitude: 0
    });
    console.log('RPC Error detail:', JSON.stringify(rpcError, null, 2));
}
check();
