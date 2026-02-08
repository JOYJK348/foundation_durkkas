
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_functions', { s_name: 'ems' });
    if (error) {
        // Fallback: try to just call verify_location with dummy data to see the specific error
        const { error: err2 } = await supabase.schema('ems').rpc('verify_location', {
            p_company_id: 0,
            p_latitude: 0,
            p_longitude: 0
        });
        console.log('Test Call Error:', JSON.stringify(err2, null, 2));
    } else {
        console.log('Functions:', data);
    }
}
check();
