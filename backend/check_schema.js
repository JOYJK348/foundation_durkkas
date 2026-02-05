
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log("Checking ems.course_materials columns...");
    // We can't easily query information_schema via JS client usually unless configured, 
    // but we can try to select a single row and see keys, or try an update and see error.

    // Attempt to select 1 row
    const { data, error } = await supabase.schema('ems').from('course_materials').select('*').limit(1);

    if (error) {
        console.error("Error selecting:", error);
    } else if (data && data.length > 0) {
        console.log("Columns found in course_materials:", Object.keys(data[0]));
    } else {
        console.log("No data in course_materials to check columns.");
    }

    console.log("\nChecking ems.course_modules columns...");
    const { data: modData, error: modError } = await supabase.schema('ems').from('course_modules').select('*').limit(1);
    if (modData && modData.length > 0) console.log("Columns found: ", Object.keys(modData[0]));
    else console.log("No data or error in course_modules");
}

checkColumns();
