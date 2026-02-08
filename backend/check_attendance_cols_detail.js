const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    const schema = 'ems';
    const tables = ['attendance_records', 'attendance_face_verifications', 'attendance_sessions'];

    for (const table of tables) {
        console.log(`--- Checking ${schema}.${table} ---`);
        // Query information_schema directly via RPC if possible, or just raw query
        const { data: cols, error: colError } = await supabase.rpc('get_column_names_v2', {
            t_name: table,
            s_name: schema
        }).catch(e => ({ error: e }));

        if (cols) {
            console.log(`Columns for ${table}:`, cols);
        } else {
            // Try another way: select * limit 0
            const { data, error, status } = await supabase.schema(schema).from(table).select('*').limit(1);
            if (error) {
                console.error(`Error for ${table}:`, error.message);
            } else if (data) {
                console.log(`Columns for ${table}:`, Object.keys(data[0] || {}));
                if (data.length === 0) {
                    console.log(`(Table ${table} is empty)`);
                }
            }
        }
        console.log('');
    }
}

checkSchema();
