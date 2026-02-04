
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { app_auth } from './lib/supabase';

async function checkUsers() {
    console.log("Checking users...");
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    try {
        const { data, error } = await app_auth.users().select('*');
        if (error) {
            console.error("Error fetching users:", error);
        } else {
            console.log("Users found:", data.length);
            data.forEach((u: any) => {
                console.log(`- ${u.email} (ID: ${u.id})`);
            });
            const admin = data.find((u: any) => u.email === 'admin@durkkas.com');
            if (admin) {
                console.log("\nAdmin details:", JSON.stringify(admin, null, 2));
            } else {
                console.log("\nAdmin user 'admin@durkkas.com' NOT FOUND.");
            }
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

checkUsers();
