const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('🔍 Checking for approval_status column in ems.courses...');

    // Check Courses
    const { data, error } = await supabase.rpc('get_column_info', {
        p_schema_name: 'ems',
        p_table_name: 'courses'
    });

    if (error) {
        // Fallback: try a simple query
        console.log('RPC failed, trying simple query...');
        const { error: queryError } = await supabase.schema('ems').from('courses').select('approval_status').limit(1);
        if (queryError) {
            console.error('❌ Column approval_status NOT FOUND or error:', queryError.message);

            // Try to apply the SQL if it fails
            console.log('🚀 Attempting to apply migration via RPC...');
            const migrationSql = `
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
                        CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
                    END IF;
                END $$;

                ALTER TABLE ems.courses ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING';
                ALTER TABLE ems.lessons ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING';
                ALTER TABLE ems.course_materials ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING';
                ALTER TABLE ems.assignments ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING';
                ALTER TABLE ems.quizzes ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'PENDING';

                UPDATE ems.courses SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING' AND is_published = true;
                UPDATE ems.lessons SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
                UPDATE ems.course_materials SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
                UPDATE ems.assignments SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
                UPDATE ems.quizzes SET approval_status = 'APPROVED' WHERE approval_status = 'PENDING';
            `;

            // We usually don't have a direct 'execute_sql' RPC unless custom created. 
            // If not, I'll recommend the user to run the SQL in Supabase dashboard.
            console.log('Please run the migration SQL file in your Supabase SQL Editor.');
        } else {
            console.log('✅ Column approval_status exists.');
        }
    } else {
        console.log('Column Info:', data);
    }
}

checkSchema();
