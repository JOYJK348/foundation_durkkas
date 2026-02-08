const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Dropping existing ems.live_classes and recreating with proper schema...");

    // 1. Drop
    const { error: dropError } = await supabase.rpc('exec_sql', {
        sql_query: 'DROP TABLE IF EXISTS ems.live_class_attendance CASCADE; DROP TABLE IF EXISTS ems.live_classes CASCADE;'
    });

    if (dropError) {
        console.error("❌ Drop Error:", dropError.message);
        // Fallback if exec_sql RPC is not available
        console.log("Attempting direct schema access to drop...");
        await supabase.schema('ems').from('live_classes').delete().neq('id', 0); // Not a drop, but a clear
    } else {
        console.log("✅ Dropped successfully.");
    }

    // 2. Create
    const sqlPath = path.join(__dirname, 'database', 'migrations', 'create_live_classes_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const { error: createError } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (createError) {
        console.error("❌ Create Error:", createError.message);
    } else {
        console.log("✅ Recreated successfully.");
    }
}

fix();
