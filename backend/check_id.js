const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.schema('ems').from('live_classes').select('id').limit(1);
    if (error) {
        console.log("❌ Error:", error.message, error.code);
    } else {
        console.log("✅ Success selecting ID.");
    }
}
check();
