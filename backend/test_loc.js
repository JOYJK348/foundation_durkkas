
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyLocation(companyId, latitude, longitude) {
    console.log('Verifying Location - Input:', { companyId, latitude, longitude });

    try {
        // Try calling with ems schema explicitly
        const { data, error } = await supabase.schema('ems').rpc('verify_location', {
            p_company_id: companyId,
            p_latitude: latitude,
            p_longitude: longitude
        });

        if (error) {
            console.log('verify_location (ems) Error:', error.message);
            // Fallback: try without schema
            const { data: data2, error: error2 } = await supabase.rpc('verify_location', {
                p_company_id: companyId,
                p_latitude: latitude,
                p_longitude: longitude
            });
            if (error2) {
                console.log('verify_location (default) Error:', error2.message);
                return null;
            }
            return Array.isArray(data2) ? data2[0] : data2;
        }

        return Array.isArray(data) ? data[0] : data;
    } catch (err) {
        console.log('Location RPC Failure:', err.message);
        return null;
    }
}

async function test() {
    console.log('--- Testing verifyLocation ---');
    const result = await verifyLocation(13, 12.9716, 77.5946);
    console.log('Result:', result);
}
test();
