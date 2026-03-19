const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
    console.log('🚀 Starting Database Fix...');

    // SQL to create the table
    const sql = `
    CREATE TABLE IF NOT EXISTS ems.student_face_profiles (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL UNIQUE,
        primary_face_url TEXT,
        face_embedding JSONB,
        registration_date TIMESTAMPTZ DEFAULT NOW(),
        registration_device_info JSONB,
        confidence_score FLOAT DEFAULT 95.0,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    `;

    // Note: Supabase client cannot run raw SQL directly unless we use an RPC.
    // If RPC is not there, we will try to insert a dummy record to see if it exists.

    const { data, error } = await supabase
        .from('student_face_profiles')
        .select('id')
        .limit(1);

    if (error && error.code === 'PGRST116') {
        console.log('❌ Table does not exist. Please run the SQL in migrations folder manually in Supabase Dashboard.');
    } else {
        console.log('✅ Table seems to exist or another error occurred:', error?.message);
    }
}

createTable();
