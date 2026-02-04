
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCols() {
    const { data } = await supabase.schema('ems').from('live_classes').select('*').limit(1);
    console.log("COLUMNS:", Object.keys(data[0] || {}));
}

checkCols();
