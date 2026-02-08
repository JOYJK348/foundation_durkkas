const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
    console.log('Attempting to fix ems.assignments schema using RPC...');

    const sql = `
        ALTER TABLE ems.assignments 
        ADD COLUMN IF NOT EXISTS batch_id BIGINT REFERENCES ems.batches(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS submission_mode VARCHAR(20) DEFAULT 'ONLINE';
    `;

    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: sql
        });

        if (error) {
            console.error('RPC Error:', error.message);
            if (error.message.includes('function exec_sql() does not exist')) {
                console.log('--- ACTION REQUIRED ---');
                console.log('The database migration could not be automated.');
                console.log('Please run the following SQL in your Supabase SQL Editor:');
                console.log(sql);
            }
        } else {
            console.log('✅ Schema updated successfully via RPC!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

fixSchema();
