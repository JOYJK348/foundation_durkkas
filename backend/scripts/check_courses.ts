// Load environment variables
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Simple key-value parser for .env
const env: any = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Checking EMS Courses ---');
    const { data: courses, error: courseError } = await supabase
        .schema('ems')
        .from('courses')
        .select('*');

    if (courseError) {
        console.error('Error fetching courses:', courseError);
    } else {
        console.log(`Found ${courses.length} courses:`);
        courses.forEach(c => console.log(`- [${c.id}] ${c.course_name} (Company: ${c.company_id})`));
    }

    console.log('\n--- Checking EMS Batches ---');
    const { data: batches, error: batchError } = await supabase
        .schema('ems')
        .from('batches')
        .select('*');

    if (batchError) {
        console.error('Error fetching batches:', batchError);
    } else {
        console.log(`Found ${batches.length} batches:`);
        batches.forEach(b => console.log(`- [${b.id}] ${b.batch_name} (Course: ${b.course_id})`));
    }
}

checkData();
