
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMappings() {
    console.log("Fixing User-Employee Mappings...");

    // 1. Get all auth users
    const { data: users } = await supabase.schema('app_auth').from('users').select('id, email');

    // 2. Get all employees
    const { data: emps } = await supabase.schema('core').from('employees').select('id, email, user_id');

    for (const emp of emps) {
        if (!emp.user_id) {
            const user = users.find(u => u.email.toLowerCase() === emp.email.toLowerCase());
            if (user) {
                console.log(`Linking Employee ${emp.id} (${emp.email}) to User ${user.id}`);
                const { error } = await supabase.schema('core').from('employees').update({ user_id: user.id }).eq('id', emp.id);
                if (error) console.error(`Error linking ${emp.email}:`, error);
            } else {
                console.log(`No Auth User found for Employee ${emp.email}`);
            }
        }
    }

    // 3. Get all students
    const { data: students } = await supabase.schema('ems').from('students').select('id, email, user_id');
    for (const student of students) {
        if (!student.user_id) {
            const user = users.find(u => u.email.toLowerCase() === student.email.toLowerCase());
            if (user) {
                console.log(`Linking Student ${student.id} (${student.email}) to User ${user.id}`);
                const { error } = await supabase.schema('ems').from('students').update({ user_id: user.id }).eq('id', student.id);
                if (error) console.error(`Error linking ${student.email}:`, error);
            }
        }
    }
}

fixMappings();
