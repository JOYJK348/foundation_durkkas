const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking ems.live_classes existence and columns...");

    const { data, error } = await supabase.schema('ems').from('live_classes').select('*').limit(1);

    if (error) {
        console.log("❌ Error accessing table:", error.message);
        if (error.code === 'PGRST116') {
            console.log("Empty table, trying to catch column names via meta info if possible...");
        }
    } else {
        console.log("✅ Table exists.");
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("Table is empty. No data to extract column names.");
        }
    }
}

check();
