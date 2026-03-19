const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceCreate() {
    console.log('--- FORCE CREATING ASSIGNMENT ---');
    const insertData = {
        company_id: 13,
        course_id: 2,
        batch_id: 2,
        assignment_title: 'HTML TEST TRIGGER',
        assignment_description: 'Testing trigger again',
        submission_mode: 'ONLINE',
        max_marks: 100,
        tutor_id: 128,
        is_active: true,
        created_at: new Date().toISOString()
    };

    const { data: assignment, error } = await supabase
        .schema('ems')
        .from('assignments')
        .insert([insertData])
        .select()
        .single();

    if (error) {
        console.error('Insert Failed:', error.message);
        return;
    }

    console.log('Assignment Created:', assignment.id);

    // Now manually call the trigger logic (replicated or imported)
    // Since I can't import easily here, I'll use my replicate_trigger.js logic
}

forceCreate();
