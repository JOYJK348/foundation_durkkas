
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Attempting to insert a test sale to discover columns ---');
    // Using minimal columns that I know exist from the schema file
    const { data, error } = await supabase.schema('ems').from('gst_lab_sales').insert({
        company_id: 1, // Assuming company 1 exists
        customer_name: 'Discovery Test',
        invoice_no: 'TEST-' + Date.now(),
        invoice_date: '2025-01-01',
        taxable_amount: 100,
        gst_rate: 18
    }).select().single();

    if (error) {
        console.error('Insert error:', error);
    } else {
        console.log('Success! Columns returned:', Object.keys(data));
        // Clean up
        await supabase.schema('ems').from('gst_lab_sales').delete().eq('id', data.id);
    }
}
check();
