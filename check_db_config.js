const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConfig() {
    const companyId = 13; // From logs

    console.log("Checking Institution Locations for Company 13...");
    const { data: locations, error: locError } = await supabase
        .schema('ems')
        .from('institution_locations')
        .select('*')
        .eq('company_id', companyId);

    if (locError) console.error("Location Error:", locError);
    else console.log("Locations:", locations);

    console.log("\nChecking Core Locations for Company 13...");
    const { data: coreLocs, error: coreError } = await supabase
        .schema('core')
        .from('locations')
        .select('*')
        .eq('company_id', companyId);

    if (coreError) console.error("Core Location Error:", coreError);
    else console.log("Core Locations:", coreLocs);
}

checkConfig();
