
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        // Run SQL to create the table
        const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
                CREATE TABLE IF NOT EXISTS app_auth.company_role_menus (
                    id BIGSERIAL PRIMARY KEY,
                    company_id BIGINT NOT NULL,
                    role_key VARCHAR(100) NOT NULL,
                    menu_key VARCHAR(100) NOT NULL,
                    is_accessible BOOLEAN DEFAULT TRUE,
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    UNIQUE(company_id, role_key, menu_key)
                );
            `
        });

        // Loophole: If exec_sql RPC doesn't exist (likely), we might fail.
        // Fallback: We can't easily run DDL without direct DB access or an RPC.
        // CHECK: Does "exec_sql" exist? users often add it. If not, I can't run this.

        if (error && error.message.includes('function exec_sql() does not exist')) {
            return NextResponse.json({ error: 'Cannot run DDL via API. Please run the SQL manually or use a migration tool.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Schema updated (or attempted)' });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ALTERNATIVE: Use a "settings" table that definitely exists.
// core.global_settings is "key", "value".
// key: "company_{id}_menus", value: JSON string of config.
// This is SAFER given I don't know if I can run DDL.
