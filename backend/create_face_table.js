/**
 * Auto-create face profiles table using Supabase RPC
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
    console.log('🚀 Attempting to create face profiles table...\n');

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
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_student FOREIGN KEY (student_id) 
            REFERENCES ems.students(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_face_profiles_student 
        ON ems.student_face_profiles(student_id);
    CREATE INDEX IF NOT EXISTS idx_face_profiles_company 
        ON ems.student_face_profiles(company_id);
    `;

    // Try using a generic RPC if available
    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('❌ RPC method not available:', error.message);
            console.log('\n⚠️  You need to manually run the SQL in Supabase Dashboard.');
            console.log('   Go to: SQL Editor → New Query → Paste the SQL above');
            return false;
        }

        console.log('✅ Table created successfully!');
        return true;
    } catch (err) {
        console.error('❌ Could not create table automatically');
        console.log('\n📋 Please run this SQL manually in Supabase Dashboard:');
        console.log('─'.repeat(60));
        console.log(sql);
        console.log('─'.repeat(60));
        return false;
    }
}

createTable();
