
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fullMenuSync() {
    console.log('🔄 Fetching all active menu IDs...');
    const { data: menus } = await supabase.schema('app_auth').from('menu_registry').select('id');
    const allMenuIds = menus?.map(m => m.id) || [];

    const companyId = 11;
    console.log(`🚀 Synchronizing ${allMenuIds.length} menus to DIPL (ID: ${companyId})...`);

    const { error } = await supabase
        .schema('core')
        .from('companies')
        .update({
            allowed_menu_ids: allMenuIds
        })
        .eq('id', companyId);

    if (error) {
        console.error('❌ Sync failed:', error);
    } else {
        console.log('✨ All menus successfully synchronized to DIPL! 🎯💎');
    }
}

fullMenuSync();
