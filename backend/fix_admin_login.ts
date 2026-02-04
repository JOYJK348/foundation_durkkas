
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Manually load env
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        console.log(`Loading env from ${envPath}`);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        const lines = envConfig.split(/\r?\n/);
        lines.forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                if (key && value && !key.startsWith('#')) {
                    process.env[key] = value;
                }
            }
        });
    } else {
        console.error("Could not find .env.local at " + envPath);
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars after load:", { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
    // Try to debug by listing keys (masked)
    console.log("Available Env Keys:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixAdmin() {
    console.log("Fixing Admin Login...");
    const email = 'admin@durkkas.com';
    const newPassword = 'durkkas@2026';

    try {
        // 1. Find User
        console.log(`Searching for user: ${email} in app_auth.users`);
        const { data: users, error: findError } = await supabase
            .schema('app_auth')
            .from('users')
            .select('*')
            .eq('email', email);

        if (findError) {
            console.error("Error finding user:", findError);
            return;
        }

        if (!users || users.length === 0) {
            console.log("User NOT found: " + email);
            console.log("Checking all users...");
            const { data: allUsers } = await supabase.schema('app_auth').from('users').select('email');
            if (allUsers) {
                console.log("Available emails:", allUsers.map(u => u.email).join(', '));
            }
        } else {
            const user = users[0];
            console.log("User found:", user.email, "ID:", user.id);
            console.log("Current status:", { is_active: user.is_active, is_locked: user.is_locked });

            // 2. Update Password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            console.log("Generated new hash for password:", newPassword);

            const { error: updateError } = await supabase
                .schema('app_auth')
                .from('users')
                .update({
                    password_hash: hash,
                    is_locked: false,
                    is_active: true,
                    // Ensure email is verified if that column exists (optional, keeping it simple)
                })
                .eq('id', user.id);

            if (updateError) {
                console.error("Error updating password:", updateError);
            } else {
                console.log("✅ Password updated successfully to: " + newPassword);
            }
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

fixAdmin();
