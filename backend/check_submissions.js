
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubmissions() {
    console.log("Checking submissions for Course 1 and 2...");

    // Get Assignments for Course 1 and 2
    const { data: assignments } = await supabase.schema('ems').from('assignments').select('id, course_id, assignment_title').in('course_id', [1, 2]);
    const assignmentIds = assignments?.map(a => a.id) || [];
    console.log(`Assignments Found: ${assignmentIds.length}`);

    // Get Submissions with status 'SUBMITTED'
    const { data: submissions } = await supabase.schema('ems').from('assignment_submissions').select('*').in('assignment_id', assignmentIds).eq('submission_status', 'SUBMITTED');
    console.log(`Pending Submissions: ${submissions?.length || 0}`);
}

checkSubmissions();
