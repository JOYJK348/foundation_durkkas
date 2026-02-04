
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRoles() {
    console.log("Fixing Missing Tutor Roles...");

    // 1. Get all employees who look like tutors (based on course assignments or designations)
    const { data: emps } = await supabase.schema('core').from('employees').select('id, user_id, email, company_id, branch_id');

    for (const emp of emps) {
        if (emp.user_id) {
            // Check if they have Role 37 (TUTOR)
            const { data: roles } = await supabase.schema('app_auth').from('user_roles').select('id').eq('user_id', emp.user_id).eq('role_id', 37);

            if (!roles || roles.length === 0) {
                // If they are assigned to a course as a tutor, they MUST have the role
                const { data: ct } = await supabase.schema('ems').from('course_tutors').select('id').eq('tutor_id', emp.id);
                const { data: courses } = await supabase.schema('ems').from('courses').select('id').eq('tutor_id', emp.id);

                if ((ct && ct.length > 0) || (courses && courses.length > 0)) {
                    console.log(`Granting TUTOR role to User ${emp.user_id} (${emp.email})`);
                    await supabase.schema('app_auth').from('user_roles').insert({
                        user_id: emp.user_id,
                        role_id: 37,
                        company_id: emp.company_id,
                        branch_id: emp.branch_id || null
                    });
                }
            }
        }
    }
}

fixRoles();
