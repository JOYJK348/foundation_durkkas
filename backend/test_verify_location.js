
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    console.log('--- Testing verify_location RPC ---');
    const { data, error } = await supabase.rpc('verify_location', {
        p_company_id: 13,
        p_latitude: 12.9716,
        p_longitude: 77.5946
    });

    if (error) {
        console.error('RPC Error (default):', error.message);
        const { data: data2, error: error2 } = await supabase.schema('ems').rpc('verify_location', {
            p_company_id: 13,
            p_latitude: 12.9716,
            p_longitude: 77.5946
        });
        if (error2) {
            console.error('RPC Error (ems):', error2.message);
        } else {
            console.log('RPC Success (ems):', data2);
        }
    } else {
        console.log('RPC Success (default):', data);
    }
}
test();
