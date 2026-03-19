
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDashboard(email) {
    const { data: user } = await supabase.schema('app_auth').from('users').select('id').eq('email', email).single();
    if (!user) return { email, error: "User not found" };
    const userId = user.id;

    const { data: userRoles } = await supabase.schema('app_auth').from('user_roles').select('*').eq('user_id', userId).eq('is_active', true);
    const { data: roles } = await supabase.schema('app_auth').from('roles').select('*').in('id', userRoles.map(ur => ur.role_id));
    const tutorRole = roles.find(r => r.name === 'TUTOR');
    const companyId = userRoles.find(ur => ur.role_id === tutorRole.id).company_id;

    const { data: employee, error: empErr } = await supabase.schema('core').from('employees')
        .select('id, email, user_id')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();

    if (empErr) return { email, error: empErr.message };

    const tutorId = employee.id;
    const { data: junctionMappings } = await supabase.schema('ems').from('course_tutors').select('course_id').eq('tutor_id', tutorId).is('deleted_at', null);
    const { data: legacyCourses } = await supabase.schema('ems').from('courses').select('id').eq('tutor_id', tutorId).eq('company_id', companyId).is('deleted_at', null);

    const assignedIds = [...new Set([
        ...(junctionMappings?.map(m => m.course_id) || []),
        ...(legacyCourses?.map(c => c.id) || [])
    ])];

    let courseNames = [];
    if (assignedIds.length > 0) {
        const { data: courses } = await supabase.schema('ems').from('courses').select('id, course_name').in('id', assignedIds);
        courseNames = courses.map(c => c.course_name);
    }

    return { email, tutorId, courseNames };
}

async function runTests() {
    const results = [];
    results.push(await testDashboard('priya.sharma@durkkas.com'));
    results.push(await testDashboard('arun.patel@durkkas.com'));
    console.log(JSON.stringify(results, null, 2));
}

runTests();
