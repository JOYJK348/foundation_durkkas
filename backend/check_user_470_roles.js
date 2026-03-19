const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://waxbttxqhyoczmdshpzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    console.log("Checking User 470 roles...");

    const { data: userRoles, error: urError } = await supabase
        .from('user_roles')
        .select(`
            *,
            roles (id, name, level, role_type)
        `)
        .eq('user_id', 470)
        .schema('app_auth');

    if (urError) {
        console.error("Error fetching user roles:", urError);
        return;
    }

    console.log("User Roles:", JSON.stringify(userRoles, null, 2));

    const { data: studentProfile, error: spError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', 470)
        .schema('ems');

    if (spError) {
        console.error("Error fetching student profile:", spError);
    } else {
        console.log("Student Profile:", JSON.stringify(studentProfile, null, 2));
    }
}

checkUser();
