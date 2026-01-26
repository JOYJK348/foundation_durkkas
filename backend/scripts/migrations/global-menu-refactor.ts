import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function globalMenuRefactor() {
    console.log('🔄 Refactoring Organizational Core Menus...');

    // IDs for Employees, Departments, Designations, Branches
    const orgMenuIds = [49, 50, 51, 52];

    const { error: updateError } = await supabase
        .schema('app_auth')
        .from('menu_registry')
        .update({
            module_key: 'CORE',
            is_core: true
        })
        .in('id', orgMenuIds);

    if (updateError) {
        console.error('Error refactoring menus:', updateError);
        return;
    }

    console.log('✅ Organizational items (Branches, Employees, Depts) are now part of CORE.');

    // Step 2: Fix JOy Solutions (ID 21) subscription
    const companyId = 21;
    const { error: subError } = await supabase
        .schema('core')
        .from('companies')
        .update({
            enabled_modules: ['CORE', 'CRM'] // REMOVED HR!
        })
        .eq('id', companyId);

    if (subError) {
        console.error('Error updating company sub:', subError);
        return;
    }

    console.log('✅ JOy Solutions subscription updated: HR module REMOVED.');
}

globalMenuRefactor();
