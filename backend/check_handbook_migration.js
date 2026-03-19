const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addHandbookColumns() {
    console.log('🚀 Adding Handbook System Columns...\n');

    try {
        // Check if columns already exist by trying to select them
        const { data: testData, error: testError } = await supabase
            .schema('ems')
            .from('course_materials')
            .select('handbook_type, batch_id, material_description, target_audience')
            .limit(1);

        if (!testError) {
            console.log('✅ Columns already exist! Handbook system is ready.');
            console.log('\n📊 Existing columns:');
            if (testData && testData.length > 0) {
                console.log('   Sample data:', testData[0]);
            }
            return;
        }

        console.log('📝 Columns not found. Please run the SQL migration manually.\n');
        console.log('Run this in Supabase SQL Editor:\n');
        console.log('----------------------------------------');
        console.log(`
ALTER TABLE ems.course_materials 
ADD COLUMN IF NOT EXISTS handbook_type VARCHAR(50) DEFAULT 'STUDENT_HANDBOOK',
ADD COLUMN IF NOT EXISTS batch_id BIGINT REFERENCES ems.batches(id),
ADD COLUMN IF NOT EXISTS material_description TEXT,
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(50) DEFAULT 'STUDENTS';

ALTER TABLE ems.course_materials 
ADD CONSTRAINT course_materials_handbook_type_check 
CHECK (handbook_type IN ('TUTOR_HANDBOOK', 'STUDENT_HANDBOOK', 'GENERAL_RESOURCE'));

ALTER TABLE ems.course_materials 
ADD CONSTRAINT course_materials_target_audience_check 
CHECK (target_audience IN ('TUTORS', 'STUDENTS', 'BOTH'));

CREATE INDEX IF NOT EXISTS idx_course_materials_handbook_type ON ems.course_materials(handbook_type);
CREATE INDEX IF NOT EXISTS idx_course_materials_batch_id ON ems.course_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_target_audience ON ems.course_materials(target_audience);
        `);
        console.log('----------------------------------------\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addHandbookColumns();
