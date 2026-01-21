import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Query to get column information for the career_guidance_applications table
        const { data, error } = await (supabase.rpc as any)('get_table_columns_v2', {
            t_schema: 'crm',
            t_name: 'career_guidance_applications'
        });

        // Fallback: if RPC doesn't exist, try direct query on information_schema
        if (error) {
            // Direct query to check constraints
            const { data: constraints, error: constError } = await (supabase.rpc as any)('get_table_constraints', {
                p_schema: 'crm',
                p_table: 'career_guidance_applications'
            });

            // Fallback for columns
            const { data: columns } = await supabase.schema('crm').from('career_guidance_applications').select('*').limit(1);

            return NextResponse.json({
                message: "Constraint Check",
                constraints: constraints || constError,
                columns: columns && columns.length > 0 ? Object.keys(columns[0]) : "No columns found",
                raw_error: constError
            });
        }

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
