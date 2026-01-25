
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCRMDataToCompany11() {
    console.log('--- Updating CRM Data from Company 20 to Company 11 ---');

    const tables = [
        'vendor_applications',
        'partner',
        'job_seeker_applications',
        'student_internship_applications',
        'course_enquiry_registrations',
        'career_guidance_applications'
    ];

    for (const table of tables) {
        const { data, error } = await supabase
            .schema('crm')
            .from(table)
            .update({ company_id: 11 })
            .eq('company_id', 20)
            .select();

        if (error) {
            console.error(`Error updating ${table}:`, error.message);
        } else {
            console.log(`✓ Updated ${table}: ${data?.length || 0} records moved to Company 11`);
        }
    }

    console.log('\n--- Verification: Checking Company 11 data ---');
    for (const table of tables) {
        const { count } = await supabase
            .schema('crm')
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('company_id', 11);

        console.log(`${table}: ${count} records`);
    }
}

updateCRMDataToCompany11();
