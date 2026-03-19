
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAssignmentsCols() {
    const { data } = await supabase.schema('ems').from('assignments').select('*').limit(1);
    console.log("ASSIGNMENTS COLUMNS:", JSON.stringify(Object.keys(data[0] || {})));

    // Check if 112 is in there
    if (data) {
        const { data: rows } = await supabase.schema('ems').from('assignments').select('*');
        for (const row of rows) {
            for (const [key, val] of Object.entries(row)) {
                if (val === 112) {
                    console.log(`Found 112 in ems.assignments column: ${key} (Row ID: ${row.id})`);
                }
            }
        }
    }
}

checkAssignmentsCols();
