const { ems, core } = require('./backend/lib/supabase');

async function debugStudentLocation() {
    const email = 'rsaritha1796@gmail.com'; // Saritha R

    // Get student and company
    const { data: student } = await ems.students()
        .select('id, company_id')
        .eq('email', email)
        .single();

    if (!student) {
        console.log("Student not found");
        return;
    }

    const companyId = student.company_id;
    console.log(`Student ID: ${student.id}, Company ID: ${companyId}`);

    // Check core.locations
    const { data: coreLocs } = await core.locations()
        .select('id, name, latitude, longitude, is_active')
        .eq('company_id', companyId);

    console.log("Core Locations:", coreLocs);

    // Check ems.institution_locations
    const { data: instLocs } = await ems.institution_locations()
        .select('id, location_name, latitude, longitude, is_active')
        .eq('company_id', companyId);

    console.log("Institution Locations:", instLocs);

    // Test RPC (Public)
    const { data: rpcPublic, error: rpcPublicError } = await ems.supabase.rpc('verify_location', {
        p_company_id: companyId,
        p_latitude: 12.9716, // Sample Bangalore lat
        p_longitude: 77.5946
    });
    console.log("RPC (Public) Result:", rpcPublic || rpcPublicError);

    // Test RPC (EMS) - Supposing it might be reachable via schema choice or if we call RPC with schema prefix if supported?
    // Supabase RPC typically doesn't let you specify schema in the rpc() call easily.
}

debugStudentLocation();
