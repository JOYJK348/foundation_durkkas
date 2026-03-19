
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCols() {
    console.log('--- COLUMNS CHECK ---');
    // Using RPC to list columns or just a sample row
    const { data, error } = await supabase.schema('ems').from('quiz_attempts').select('*').limit(1);
    if (error) console.error('Column check Error:', error);
    else {
        console.log('Columns found:', Object.keys(data[0] || {}));
    }
    console.log('--- END ---');
}

checkCols();
