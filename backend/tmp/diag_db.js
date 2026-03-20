const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
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

async function diag() {
    console.log('--- DB DIAGNOSTIC START ---');
    const schemas = ['core'];
    const tables = ['companies', 'branches', 'departments', 'designations', 'employees'];

    for (const schema of schemas) {
        for (const table of tables) {
            console.log(`Checking ${schema}.${table}...`);
            const { data, error } = await supabase.schema(schema).from(table).select('*').limit(1);
            if (error) console.error(`  ERROR: ${error.message}`);
            else {
                console.log(`  Columns:`, Object.keys(data[0] || {}));
            }
        }
    }
    console.log('--- DB DIAGNOSTIC END ---');
}

diag();
