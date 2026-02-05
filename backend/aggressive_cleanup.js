
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function aggressiveCleanup() {
    const fromId = 112;
    const toId = 123;
    const schema = 'ems';

    console.log(`Aggressively merging references from Employee ${fromId} to ${toId} in ${schema}`);

    const tables = ['courses', 'course_tutors', 'assignments', 'live_classes', 'attendance_sessions', 'quizzes', 'batches'];

    for (const table of tables) {
        try {
            // Check for tutor_id column
            const { data } = await supabase.schema(schema).from(table).select('*').limit(1);
            if (data && data[0] && 'tutor_id' in data[0]) {
                console.log(`Table ${table} has tutor_id. Updating...`);
                const { error } = await supabase.schema(schema).from(table).update({ tutor_id: toId }).eq('tutor_id', fromId);
                if (error) console.error(`Error updating ${table}:`, error);
                else console.log(`Table ${table} updated successfully.`);
            }
        } catch (e) {
            console.log(`Skipping ${table}: ${e.message}`);
        }
    }

    // Try final delete
    const { error: delErr } = await supabase.schema('core').from('employees').delete().eq('id', fromId);
    if (delErr) {
        console.error("FINAL DELETE STILL FAILED:", delErr);
        // If still fails, it might be in study_materials or something else
    } else {
        console.log("SUCCESSFULLY DELETED 112.");
    }
}

aggressiveCleanup();
