const { supabase } = require('./backend/lib/supabase');

async function checkRpc() {
    console.log("Checking for verify_location RPC...");

    // Try public
    const { data: publicData, error: publicError } = await supabase.rpc('verify_location', {
        p_company_id: 13,
        p_latitude: 0,
        p_longitude: 0
    });

    if (publicError) {
        console.log("Public RPC failed:", publicError.message);
    } else {
        console.log("Public RPC exists and returned:", publicData);
    }

    // Try ems schema
    try {
        const { data: emsData, error: emsError } = await (supabase as any).schema('ems').rpc('verify_location', {
            p_company_id: 13,
            p_latitude: 0,
            p_longitude: 0
        });

        if (emsError) {
            console.log("EMS RPC failed:", emsError.message);
        } else {
            console.log("EMS RPC exists and returned:", emsData);
        }
    } catch (e) {
        console.log("EMS RPC call threw:", e.message);
    }
}

checkRpc();
