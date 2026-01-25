
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
} else {
    dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log('--- Checking Users and Roles ---');

    // Get Users
    const { data: users, error: userError } = await supabase
        .schema('app_auth')
        .from('users')
        .select('id, email, first_name');

    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }

    for (const user of users) {
        console.log(`User: ${user.email} (ID: ${user.id})`);

        // Get Roles for User
        const { data: roles, error: roleError } = await supabase
            .schema('app_auth')
            .from('user_roles')
            .select('company_id, branch_id, role_id')
            .eq('user_id', user.id);

        if (roles) {
            console.log(`  Roles:`, roles);
        }
    }
}

checkUsers();
