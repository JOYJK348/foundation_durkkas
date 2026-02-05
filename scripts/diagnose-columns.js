const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://waxbttxqhyoczmdshpzz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runSqlFile(filename) {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'backend', 'database', filename), 'utf8');

    // Split SQL into individual statements if possible, or use a better RPC
    // Supabase doesn't have a direct 'run_sql' unless you define an RPC function for it.
    // Let's check if 'exec_sql' exists.
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error executing SQL:', error);
        // If exec_sql doesn't exist, we might need another way or just manually fix columns.
    } else {
        console.log('SQL executed successfully');
    }
}

// Since I cannot guarantee exec_sql exists, I will just try to find the columns using a try-catch select in Node.
async function diagnoseColumns() {
    const columnsToTest = ['check_in_time', 'in_time', 'check_in', 'checkin_time'];
    for (const col of columnsToTest) {
        const { error } = await supabase.schema('ems').from('attendance_records').select(col).limit(0);
        if (!error) {
            console.log(`Column found: ${col}`);
        } else {
            console.log(`Column ${col} NOT found: ${error.message}`);
        }
    }
}

diagnoseColumns();
