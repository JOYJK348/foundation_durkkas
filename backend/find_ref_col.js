
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findTableWithRef(id) {
    // We already know it's in ems.live_classes probably 
    // because of my previous checkRefs output (which was truncated but said live_classes)

    const { data: lc } = await supabase.schema('ems').from('live_classes').select('*');
    for (const row of lc) {
        for (const [key, val] of Object.entries(row)) {
            if (val === id) {
                console.log(`Found ID ${id} in ems.live_classes column: ${key} (Row ID: ${row.id})`);
            }
        }
    }
}

findTableWithRef(112);
