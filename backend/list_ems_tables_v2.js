const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
    const schema = 'ems';
    const tables = [
        'attendance_records',
        'face_verifications',
        'attendance_face_verifications',
        'attendance_sessions'
    ];

    console.log(`--- Checking tables in schema: ${schema} ---`);
    for (const table of tables) {
        const { error } = await supabase.schema(schema).from(table).select('count', { count: 'exact', head: true }).limit(0);
        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                console.log(`Table ${table}: MISSING`);
            } else {
                console.log(`Table ${table}: ERROR (${error.message})`);
            }
        } else {
            console.log(`Table ${table}: EXISTS`);
        }
    }
}

listTables();
