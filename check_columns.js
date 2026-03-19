
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, 'backend', '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Checking Columns ---');
    const { data: cols, error } = await supabase.rpc('get_table_columns', {
        t_schema: 'ems',
        t_name: 'gst_lab_sales'
    });

    if (error) {
        console.log('RPC get_table_columns not found, trying query...');
        // Try a direct select to see what we get
        const { data, error: selectErr } = await supabase.schema('ems').from('gst_lab_sales').select('*').limit(1);
        if (selectErr) {
            console.error('Select error:', selectErr);
        } else {
            console.log('Columns in gst_lab_sales:', data && data.length > 0 ? Object.keys(data[0]) : 'No data, columns unknown');
        }
    } else {
        console.log('Columns:', cols);
    }
}

check();
