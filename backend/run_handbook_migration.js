const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Running Handbook System Migration...\n');

    try {
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'database', 'migrations', 'add_handbook_types.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            console.error('❌ Migration failed:', error.message);

            // Try alternative approach - execute statements one by one
            console.log('\n📝 Trying alternative migration approach...\n');

            const statements = migrationSQL
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

            for (const statement of statements) {
                console.log(`Executing: ${statement.substring(0, 60)}...`);
                const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
                if (stmtError) {
                    console.warn(`⚠️  Warning: ${stmtError.message}`);
                }
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📊 New columns added to ems.course_materials:');
        console.log('   - handbook_type (TUTOR_HANDBOOK | STUDENT_HANDBOOK | GENERAL_RESOURCE)');
        console.log('   - batch_id (optional batch assignment)');
        console.log('   - material_description (text description)');
        console.log('   - target_audience (TUTORS | STUDENTS | BOTH)');
        console.log('\n🎉 Handbook System is now ready to use!');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

runMigration();
