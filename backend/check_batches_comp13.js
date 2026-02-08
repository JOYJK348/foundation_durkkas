const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBatches() {
    const { data: batches, error } = await supabase
        .schema('ems')
        .from('batches')
        .select(`
            id,
            batch_name,
            course_id,
            company_id
        `)
        .eq('company_id', 13);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('--- Batches for Company 13 ---');
    console.table(batches);
}

checkBatches();
