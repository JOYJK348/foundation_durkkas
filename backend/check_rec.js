
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.schema('ems').from('attendance_records').select('*').limit(1);
    if (error) console.error(error);
    else console.log(JSON.stringify(Object.keys(data[0] || {})));
}
check();
