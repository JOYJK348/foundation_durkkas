
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Attendance Records Debug ---');
    const { data, error } = await supabase
        .schema('ems')
        .from('attendance_records')
        .select('*')
        .limit(20);

    if (error) console.error(error);
    console.log('Records:', JSON.stringify(data, null, 2));
}

debug();
