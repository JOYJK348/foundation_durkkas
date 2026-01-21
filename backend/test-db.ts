import { supabase } from './lib/supabase';

async function testDB() {
    console.log('Testing Supabase Connection...');

    // 1. Check Companies
    const { data: companies, error: compError } = await supabase
        .schema('core')
        .from('companies')
        .select('id, name')
        .limit(1);

    if (compError) {
        console.error('Error fetching companies:', compError);
    } else {
        console.log('Companies found:', companies);
    }

    // 2. Check CRM Schema Access
    const { data: crmData, error: crmError } = await supabase
        .schema('crm')
        .from('vendor_applications')
        .select('id')
        .limit(1);

    if (crmError) {
        console.error('Error accessing CRM schema:', crmError);
    } else {
        console.log('CRM schema access OK');
    }
}

testDB();
