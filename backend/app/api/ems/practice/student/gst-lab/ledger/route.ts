/**
 * GST Finance Lab API - Ledger System
 * Route: GET /api/ems/practice/student/gst-lab/ledger
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, asyncHandler } from '@/lib/errorHandler';
import { getUserIdFromToken } from '@/lib/jwt';
import { GSTFinanceLabService } from '@/lib/services/GSTFinanceLabService';

export const GET = asyncHandler(async (req: NextRequest) => {
    const userId = await getUserIdFromToken(req);
    if (!userId) throw new Error('Unauthorized');

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const ledgerType = searchParams.get('type'); // INPUT_TAX_CREDIT, OUTPUT_TAX_LIABILITY, CASH_LEDGER

    if (!companyId) {
        return errorResponse(null, 'Company ID is required', 400);
    }

    if (ledgerType) {
        // Get specific ledger entries
        const ledger = await GSTFinanceLabService.getLedger(
            parseInt(companyId),
            ledgerType as any
        );
        return successResponse(ledger, `${ledgerType} ledger retrieved`);
    } else {
        // Get all balances
        const balances = await GSTFinanceLabService.getLedgerBalances(parseInt(companyId));
        return successResponse(balances, 'Ledger balances retrieved');
    }
});
