
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findDuplicates() {
    const { data: emps } = await supabase.schema('core').from('employees').select('id, user_id, company_id, email').not('user_id', 'is', null);

    const seen = new Map();
    const dups = [];

    for (const e of emps) {
        const key = `${e.user_id}-${e.company_id}`;
        if (seen.has(key)) {
            dups.push({ original: seen.get(key), duplicate: e });
        } else {
            seen.set(key, e);
        }
    }

    if (dups.length > 0) {
        console.log("DUPLICATES FOUND:", JSON.stringify(dups, null, 2));
    } else {
        console.log("NO DUPLICATES FOUND.");
    }
}

findDuplicates();
