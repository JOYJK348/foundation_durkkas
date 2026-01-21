import { supabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/errorHandler';
import { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {
    try {
        // 1. Check Companies
        const { data: companies, error: compError } = await supabase
            .schema('core')
            .from('companies')
            .select('id, name');

        if (compError) throw compError;

        // 2. Check CRM Table
        const { data: crmTest, error: crmError } = await supabase
            .schema('crm')
            .from('vendor_applications')
            .select('id')
            .limit(1);

        return successResponse({
            database: 'Connected',
            companiesCount: companies?.length || 0,
            firstCompany: companies?.[0] || 'None',
            crmTableStatus: crmError ? `Error: ${crmError.message}` : 'Accessible'
        }, 'Diagnostic check completed');

    } catch (err: any) {
        return errorResponse('DIAGNOSTIC_ERROR', err.message, 500);
    }
};
