const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBranch() {
    try {
        console.log('Update branch 29 to only HR modules...');
        const { data, error } = await supabase
            .schema('core')
            .from('branches')
            .update({
                enabled_modules: ['HR'],
                allowed_menu_ids: []
            })
            .eq('id', 29)
            .select();

        if (error) throw error;
        console.log('Successfully updated branch:', data);
    } catch (err) {
        console.error('Error updating branch:', err.message);
    }
}

updateBranch();
