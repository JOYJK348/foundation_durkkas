
import { createClient } from '@supabase/supabase-js';

const url = 'https://waxbttxqhyoczmdshpzz.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18';
const supabase = createClient(url, key);

async function run() {
    const userId = 248; // dkit.system9@gmail.com
    console.log('--- Debugging CRM Counts for User 248 ---');

    // Get scope manual style
    const { data: userRoles, error: urError } = await supabase.schema('app_auth' as any).from('user_roles').select('*').eq('user_id', userId);

    if (urError) {
        console.error('User Roles Error:', urError);
        return;
    }

    console.log('User Roles:', userRoles);

    if (userRoles && userRoles.length > 0) {
        const companyId = userRoles[0].company_id;
        console.log('Assigned Company ID:', companyId);

        const tables = ['vendor_applications', 'partner', 'job_seeker_applications', 'student_internship_applications', 'course_enquiry_registrations', 'career_guidance_applications'];

        for (const t of tables) {
            const { count, error, data } = await supabase.schema('crm' as any).from(t).select('id, company_id', { count: 'exact' }).eq('company_id', companyId);
            if (error) {
                console.error(`Error in ${t}:`, error.message);
            } else {
                console.log(`Table ${t}: Count=${count}`);
                if (data) console.log(`  Data:`, data);
            }
        }

        console.log('--- Checking ALL data in crm (No Filter) ---');
        for (const t of tables) {
            const { count } = await supabase.schema('crm' as any).from(t).select('id, company_id', { count: 'exact' });
            console.log(`Unfiltered ${t}: ${count}`);
        }
    } else {
        console.log('No roles found for user 248');
    }
}
run();
