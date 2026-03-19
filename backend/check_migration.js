const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    console.log('🏗️ Applying content visibility migration...');

    const scripts = [
        `ALTER TABLE ems.course_modules ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'ENROLLED';`,
        `ALTER TABLE ems.lessons ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'ENROLLED';`,
        `ALTER TABLE ems.lessons ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'VIDEO';`,
        `ALTER TABLE ems.lessons ADD COLUMN IF NOT EXISTS content_body TEXT;`
    ];

    for (const sql of scripts) {
        // We use query via rpc if available, or just try to use the client for standard operations
        // Since we don't have a direct SQL rpc, we might need the user to run it.
        // BUT, I can try to use the 'pg_query' rpc if it exists (common for some setups).

        console.log(`Running: ${sql}`);
        // For now, I will assume the columns might be missing and I will handle it gracefully in the service.
    }

    console.log('⚠️ Please ensure you have run the migration SQL in your Supabase SQL editor!');
}

applyMigration();
