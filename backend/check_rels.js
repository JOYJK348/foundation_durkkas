const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRelations() {
    console.log("Checking live_classes columns and trying to find valid relation names...");

    // 1. Just select * and see raw data (limit 1)
    const { data: raw, error: rawErr } = await supabase.schema('ems').from('live_classes').select('*').limit(1);
    if (rawErr) {
        console.log("Raw Error:", rawErr.message);
        return;
    }
    console.log("Columns present:", Object.keys(raw[0] || {}));

    // 2. Test common relation names for tutor_id
    const tests = [
        'employees:tutor_id(id)',
        'tutor:tutor_id(id)',
        'core_employees:tutor_id(id)',
        'tutor_id:tutor_id(id)'
    ];

    for (const t of tests) {
        const { error } = await supabase.schema('ems').from('live_classes').select(t).limit(1);
        if (!error) {
            console.log(`✅ Relation worked: ${t}`);
        } else {
            console.log(`❌ Relation failed: ${t} -> ${error.message}`);
        }
    }
}
checkRelations();
