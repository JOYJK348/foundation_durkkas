
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function deleteContentMaterials() {
    console.log('Deleting materials with delivery_method = "CONTENT"...');

    const { error, count } = await supabase
        .schema('ems')
        .from('course_materials')
        .delete({ count: 'exact' })
        .eq('delivery_method', 'CONTENT');

    if (error) {
        console.error('Error deleting materials:', error);
    } else {
        console.log(`Successfully deleted ${count} materials.`);
    }
}

deleteContentMaterials();
