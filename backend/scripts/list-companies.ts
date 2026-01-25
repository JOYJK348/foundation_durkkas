
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://waxbttxqhyoczmdshpzz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18');

async function listAllCompanies() {
    const { data, error } = await supabase.schema('core' as any).from('companies').select('id, name, code');
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

listAllCompanies();
