import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateUserLeads() {
    const email = 'jayakumarjunefirst@gmail.com';
    const targetCompanyId = 21;
    const targetBranchId = 35;

    console.log(`🚀 Migrating leads for ${email} to company ${targetCompanyId}...`);

    const tables = [
        'vendor_applications',
        'b2b_applications',
        'partner',
        'job_seeker_applications',
        'student_internship_applications',
        'career_guidance_applications',
        'course_enquiry_registrations'
    ];

    for (const table of tables) {
        const { data, error } = await supabase
            .schema('crm')
            .from(table)
            .update({
                company_id: targetCompanyId,
                branch_id: targetBranchId
            })
            .eq('email', email)
            .eq('company_id', 11);

        if (error) {
            console.error(`❌ Error updating ${table}:`, error.message);
        } else {
            console.log(`✅ Table crm.${table}: Links updated.`);
        }
    }

    console.log('✨ Migration complete!');
}

migrateUserLeads();
