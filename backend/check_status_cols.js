
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCols() {
    try {
        const tables = ['live_classes', 'batches', 'courses'];

        for (const table of tables) {
            console.log(`\n--- ${table} ---`);
            const { data, error } = await supabase.schema('ems').from(table).select('*').limit(1);
            if (error) {
                console.log(`Table ${table} error:`, error.message);
                continue;
            }
            if (data && data.length > 0) {
                const cols = Object.keys(data[0]);
                console.log(`Table ${table} has approval_status:`, cols.includes('approval_status'));
                if (!cols.includes('approval_status')) {
                    console.log(`Columns for ${table}:`, cols.join(', '));
                }
            } else {
                console.log('No data to check columns for table:', table);
            }
        }
    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    }
}

checkCols();
