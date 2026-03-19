const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const userId = 427;
    console.log(`🔍 Checking User ID: ${userId}`);

    // 1. Check User Auth Profile
    const { data: user, error: userError } = await supabase.schema('app_auth').from('users').select('*').eq('id', userId).single();

    if (userError) {
        console.error('❌ Error finding user in app_auth.users:', userError);
    } else {
        console.log('✅ User Found:', {
            id: user.id,
            email: user.email,
            name: user.display_name,
            role: user.role
        });
    }

    // 2. Check Student Record
    const { data: student, error: studentError } = await supabase.schema('ems').from('students').select('*').eq('user_id', userId).single();

    if (studentError) {
        console.error('❌ Error finding student in ems.students:', studentError);
        // Check if multiple exist?
        const { data: multiple } = await supabase.schema('ems').from('students').select('*').eq('user_id', userId);
        if (multiple && multiple.length > 0) {
            console.log('⚠️ Multiple student records found:', multiple.length);
        }
    } else {
        console.log('✅ Student Record Found:', {
            id: student.id,
            code: student.student_code,
            company_id: student.company_id,
            deleted_at: student.deleted_at
        });
    }
}

checkUser();
