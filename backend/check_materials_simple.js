const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMaterials() {
    const { data, error } = await supabase
        .schema('ems')
        .from('course_materials')
        .select('id, material_name, material_type, delivery_method, file_url, content_json, handbook_type')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', JSON.stringify(error, null, 2));
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

checkMaterials().catch(e => console.error(JSON.stringify(e, null, 2)));
