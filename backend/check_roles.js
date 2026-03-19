const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://waxbttxqhyoczmdshpzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: userRoles } = await supabase.from('user_roles').select('*, roles(*)').eq('user_id', 470).schema('app_auth');
    fs.writeFileSync('roles_debug_470.json', JSON.stringify(userRoles, null, 2));
    console.log("Done");
}
check();
