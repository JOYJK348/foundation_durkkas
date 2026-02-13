
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    console.log('--- Adding items column to GST tables ---');
    const sqls = [
        "ALTER TABLE ems.gst_lab_purchases ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;",
        "ALTER TABLE ems.gst_lab_sales ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;"
    ];

    for (const sql of sqls) {
        const { data, error } = await supabase.rpc('run_sql', { sql });
        if (error) {
            console.error(`Failed to run SQL: ${sql}`);
            console.error(error.message);
        } else {
            console.log(`Success: ${sql}`);
        }
    }
}

fix();
