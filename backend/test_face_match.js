
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    console.log('--- Testing verify_face_match RPC ---');
    const { data, error } = await supabase.schema('ems').rpc('verify_face_match', {
        p_student_id: 41,
        p_new_embedding: Array(128).fill(0),
        p_threshold: 0.6
    });

    if (error) {
        console.log('RPC Error:', error.message);
    } else {
        console.log('RPC Success:', data);
    }
}
test();
