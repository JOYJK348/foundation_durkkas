
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanUp() {
    const idToDelete = 112;
    const idToKeep = 123;

    console.log(`Attempting to clean up Employee ${idToDelete} and merge into ${idToKeep}`);

    // Update live_classes
    const { error: err1 } = await supabase.schema('ems').from('live_classes').update({ tutor_id: idToKeep }).eq('tutor_id', idToDelete);
    if (err1) console.error("Error updating live_classes:", err1);
    else console.log("Live classes updated.");

    // Update courses (legacy tutor_id)
    const { error: err2 } = await supabase.schema('ems').from('courses').update({ tutor_id: idToKeep }).eq('tutor_id', idToDelete);
    if (err2) console.error("Error updating courses:", err2);
    else console.log("Courses updated.");

    // Update course_tutors
    const { error: err3 } = await supabase.schema('ems').from('course_tutors').update({ tutor_id: idToKeep }).eq('tutor_id', idToDelete);
    if (err3) console.error("Error updating course_tutors:", err3);
    else console.log("Course tutors updated.");

    // Try to delete again
    const { error: delErr } = await supabase.schema('core').from('employees').delete().eq('id', idToDelete);
    if (delErr) {
        console.error("DELETE FAILED AGAIN:", delErr);
    } else {
        console.log("SUCCESSFULLY DELETED 112.");
    }
}

cleanUp();
