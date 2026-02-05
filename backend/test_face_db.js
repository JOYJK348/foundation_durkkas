/**
 * Database Test Script for Face Profile Registration
 * This will check if the table exists and try to create it if needed
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testDatabase() {
    console.log('🔍 Testing Face Profile Database Setup...\n');

    // Step 1: Check if EMS schema exists
    console.log('1️⃣ Checking EMS schema...');
    const { data: schemas, error: schemaError } = await supabase
        .rpc('pg_catalog.current_schemas', { include_implicit: true });

    if (schemaError) {
        console.log('⚠️  Could not check schemas (this is okay)');
    } else {
        console.log('✅ Schemas accessible');
    }

    // Step 2: Check if students table exists
    console.log('\n2️⃣ Checking ems.students table...');
    const { data: students, error: studentsError } = await supabase
        .schema('ems')
        .from('students')
        .select('id, first_name, last_name, email')
        .limit(1);

    if (studentsError) {
        console.error('❌ Students table error:', studentsError.message);
        console.log('   Code:', studentsError.code);
        return;
    }
    console.log('✅ Students table exists');
    if (students && students.length > 0) {
        console.log('   Sample student:', students[0].email);
    }

    // Step 3: Check if student_face_profiles table exists
    console.log('\n3️⃣ Checking ems.student_face_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
        .schema('ems')
        .from('student_face_profiles')
        .select('id')
        .limit(1);

    if (profilesError) {
        console.error('❌ Face profiles table does NOT exist!');
        console.log('   Error:', profilesError.message);
        console.log('   Code:', profilesError.code);
        console.log('\n📋 You need to run this SQL in Supabase Dashboard:');
        console.log('─'.repeat(60));
        console.log(`
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
        `);
        console.log('─'.repeat(60));
        return;
    }

    console.log('✅ Face profiles table exists!');
    console.log('   Current records:', profiles ? profiles.length : 0);

    // Step 4: Test insert capability
    console.log('\n4️⃣ Testing insert permissions...');
    const testData = {
        company_id: 999999,
        student_id: 999999,
        face_embedding: [0.1, 0.2, 0.3],
        confidence_score: 95.0,
        is_active: false
    };

    const { data: insertTest, error: insertError } = await supabase
        .schema('ems')
        .from('student_face_profiles')
        .insert(testData)
        .select();

    if (insertError) {
        if (insertError.code === '23503') {
            console.log('✅ Insert permissions OK (foreign key constraint working)');
        } else {
            console.error('❌ Insert test failed:', insertError.message);
            console.log('   Code:', insertError.code);
        }
    } else {
        console.log('✅ Insert successful (cleaning up...)');
        // Clean up test record
        await supabase
            .schema('ems')
            .from('student_face_profiles')
            .delete()
            .eq('student_id', 999999);
    }

    console.log('\n✅ Database test complete!');
}

testDatabase().catch(err => {
    console.error('💥 Test script error:', err);
    process.exit(1);
});
