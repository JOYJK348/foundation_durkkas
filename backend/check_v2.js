
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const tables = ['attendance_sessions', 'live_classes', 'batches', 'courses'];
    for (const t of tables) {
        const { data, error } = await supabase.rpc('get_table_columns', { t_name: t, s_name: 'ems' });
        let has = false;
        if (error) {
            const { data: row } = await supabase.schema('ems').from(t).select('*').limit(1);
            if (row && row.length > 0) has = Object.keys(row[0]).includes('approval_status');
        } else {
            has = data.some(c => c.column_name === 'approval_status');
        }
        console.log(`${t}: ${has}`);
    }
}
check();
