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

    const tables = ['attendance_records', 'face_verifications', 'attendance_sessions'];

    for (const table of tables) {
        console.log(`--- Checking ${schema}.${table} ---`);
        const { data, error } = await supabase.schema(schema).from(table).select('*').limit(1);

        if (error) {
            console.error(`Error for ${table}:`, error.message);
        } else {
            if (data && data.length > 0) {
                console.log(`Columns for ${table}:`, Object.keys(data[0]));
            } else {
                // Try to get columns even if empty by using a query that returns no rows but has schema info
                // or just assume it might be empty. 
                // Better yet, use information_schema if we have permissions
                const { data: cols, error: colError } = await supabase.rpc('get_column_names', {
                    t_name: table,
                    s_name: schema
                });
                if (cols) {
                    console.log(`Columns for ${table} (via RPC):`, cols);
                } else {
                    console.log(`Table ${table} is empty and RPC failed.`);
                }
            }
        }
        console.log('');
    }
}

checkSchema();
