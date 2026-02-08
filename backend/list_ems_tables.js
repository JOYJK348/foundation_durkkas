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
    console.log(`--- Listing tables in schema: ${schema} ---`);

    const { data, error } = await supabase.rpc('get_tables', { s_name: schema }).catch(e => ({ error: e }));

    if (error || !data) {
        // If RPC fails, try a direct query to information_schema if possible, 
        // but usually we don't have direct access.
        // Let's try to query some known tables to see which ones fail.
        const tables = ['attendance_records', 'face_verifications', 'attendance_face_verifications', 'attendance_sessions'];
        for (const table of tables) {
            const { error: tableError } = await supabase.schema(schema).from(table).select('count').limit(1);
            if (tableError) {
                console.log(`Table ${table}: NOT FOUND (${tableError.message})`);
            } else {
                console.log(`Table ${table}: EXISTS`);
            }
        }
    } else {
        console.log('Tables:', data);
    }
}

listTables();
