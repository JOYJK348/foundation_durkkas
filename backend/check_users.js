
require('dotenv').config({ path: '.env.local' });
const { app_auth } = require('./lib/supabase');

async function checkUsers() {
    console.log("Checking users...");
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING");
    try {
        const { data, error } = await app_auth.users().select('*');
        if (error) {
            console.error("Error fetching users:", JSON.stringify(error, null, 2));
        } else {
            console.log("Users found:", data ? data.length : 0);
            if (data) {
                data.forEach((u) => {
                    console.log(`- ${u.email} (ID: ${u.id})`);
                });
                const admin = data.find((u) => u.email === 'admin@durkkas.com');
                if (admin) {
                    console.log("\nAdmin details:", JSON.stringify(admin, null, 2));
                } else {
                    console.log("\nAdmin user 'admin@durkkas.com' NOT FOUND.");
                }
            }
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

checkUsers();
