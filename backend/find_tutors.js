
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findTutors() {
    console.log("Users with TUTOR role (37):");
    const { data: ur } = await supabase.schema('app_auth').from('user_roles').select('user_id').eq('role_id', 37);
    if (ur) {
        for (const u of ur) {
            const { data: user } = await supabase.schema('app_auth').from('users').select('id, email').eq('id', u.user_id).single();
            const { data: emp } = await supabase.from('employees').select('id, company_id').eq('user_id', u.user_id).single();
            console.log(`UserID: ${user.id}, Email: ${user.email}, EmpID: ${emp?.id}, CompID: ${emp?.company_id}`);
        }
    }
}

findTutors();
