const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://waxbttxqhyoczmdshpzz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18');

async function checkLocations() {
    try {
        const { data, error } = await s.schema('ems').from('institution_locations').select('*');
        if (error) console.error(error);
        else console.log('Locations:', data);
    } catch (e) { console.error(e); }
}
checkLocations();
