/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GST FINANCE LAB SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Complete business logic for GST educational simulation system
 * Handles: Company Setup, Purchases, Sales, Ledgers, Returns, Challans, Payments
 */

import { ems } from '../supabase';

export class GSTFinanceLabService {

    // ═══════════════════════════════════════════════════════════════════════
    // 1️⃣ COMPANY SETUP
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Create Mock GST Company Registration
     */
    static async createCompany(allocationId: number, companyData: {
        company_name: string;
        state: string;
        state_code: string;
        default_gst_rate?: number;
    }) {
        // Check if company already exists for this allocation
        const { data: existing } = await ems.supabase
            .schema('ems')
            .from('gst_lab_companies')
            .select('*')
            .eq('allocation_id', allocationId)
            .maybeSingle();

        if (existing) {
            return existing; // Already registered
        }

        // Generate mock GSTIN using database function
        const { data: gstinData } = await ems.supabase
            .rpc('generate_mock_gstin', {
                state_code: companyData.state_code,
                company_name: companyData.company_name
            });

        // Create company
        const { data: company, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_companies')
            .insert({
                allocation_id: allocationId,
                company_name: companyData.company_name,
                state: companyData.state,
                state_code: companyData.state_code,
                gstin: gstinData || `${companyData.state_code}XXXXX9999X1Z5`, // Fallback
                default_gst_rate: companyData.default_gst_rate || 18,
                financial_year: '2025-26'
            })
            .select()
            .single();

        if (error) throw error;
        return company;
    }

    /**
     * Get Company Details
     */
    static async getCompany(allocationId: number) {
        const { data, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_companies')
            .select('*')
            .eq('allocation_id', allocationId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    /**
     * Get Company Details by ID
     */
    static async getCompanyById(companyId: number) {
        const { data, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_companies')
            .select('*')
            .eq('id', companyId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2️⃣ PURCHASE MODULE (Input GST)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Add Purchase Entry
     */
    static async addPurchase(companyId: number, purchaseData: {
        supplier_name: string;
        supplier_gstin?: string;
        invoice_no: string;
        invoice_date: string;
        taxable_amount: number;
        gst_rate: number;
        transaction_type: 'INTRA_STATE' | 'INTER_STATE';
        items?: any[];
    }) {
        // Calculate GST breakdown
        const isInterState = purchaseData.transaction_type === 'INTER_STATE';
        const gstBreakdown = this.calculateGST(
            purchaseData.taxable_amount,
            purchaseData.gst_rate,
            isInterState
        );

        // Insert purchase
        const { data: purchase, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_purchases')
            .insert({
                company_id: companyId,
                supplier_name: purchaseData.supplier_name,
                supplier_gstin: purchaseData.supplier_gstin,
                invoice_no: purchaseData.invoice_no,
                invoice_date: purchaseData.invoice_date,
                taxable_amount: purchaseData.taxable_amount,
                gst_rate: purchaseData.gst_rate,
                cgst_amount: gstBreakdown.cgst,
                sgst_amount: gstBreakdown.sgst,
                igst_amount: gstBreakdown.igst,
                transaction_type: purchaseData.transaction_type
            })
            .select()
            .single();

        if (error) throw error;

        // Trigger will auto-update ITC ledger
        return purchase;
    }

    /**
     * Get All Purchases for a Company
     */
    static async getPurchases(companyId: number, month?: string) {
        let query = ems.supabase
            .schema('ems')
            .from('gst_lab_purchases')
            .select('*')
            .eq('company_id', companyId)
            .order('invoice_date', { ascending: false });

        if (month) {
            // Filter by month (format: 'YYYY-MM')
            const startDate = `${month}-01`;
            const endDate = `${month}-31`;
            query = query.gte('invoice_date', startDate).lte('invoice_date', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3️⃣ SALES MODULE (Output GST)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Add Sales Entry
     */
    static async addSales(companyId: number, salesData: {
        customer_name: string;
        customer_gstin?: string;
        invoice_no: string;
        invoice_date: string;
        taxable_amount: number;
        gst_rate: number;
        transaction_type: 'INTRA_STATE' | 'INTER_STATE';
        items?: any[];
    }) {
        // Calculate GST breakdown
        const isInterState = salesData.transaction_type === 'INTER_STATE';
        const gstBreakdown = this.calculateGST(
            salesData.taxable_amount,
            salesData.gst_rate,
            isInterState
        );

        // Insert sales
        const { data: sales, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_sales')
            .insert({
                company_id: companyId,
                customer_name: salesData.customer_name,
                customer_gstin: salesData.customer_gstin,
                invoice_no: salesData.invoice_no,
                invoice_date: salesData.invoice_date,
                taxable_amount: salesData.taxable_amount,
                gst_rate: salesData.gst_rate,
                cgst_amount: gstBreakdown.cgst,
                sgst_amount: gstBreakdown.sgst,
                igst_amount: gstBreakdown.igst,
                transaction_type: salesData.transaction_type
            })
            .select()
            .single();

        if (error) throw error;

        // Trigger will auto-update Output GST ledger
        return sales;
    }

    /**
     * Get All Sales for a Company
     */
    static async getSales(companyId: number, month?: string) {
        let query = ems.supabase
            .schema('ems')
            .from('gst_lab_sales')
            .select('*')
            .eq('company_id', companyId)
            .order('invoice_date', { ascending: false });

        if (month) {
            const startDate = `${month}-01`;
            const endDate = `${month}-31`;
            query = query.gte('invoice_date', startDate).lte('invoice_date', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4️⃣ LEDGER SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get Ledger Entries
     */
    static async getLedger(companyId: number, ledgerType: 'INPUT_TAX_CREDIT' | 'OUTPUT_TAX_LIABILITY' | 'CASH_LEDGER') {
        const { data, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_ledgers')
            .select('*')
            .eq('company_id', companyId)
            .eq('ledger_type', ledgerType)
            .order('transaction_date', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get Current Ledger Balances
     */
    static async getLedgerBalances(companyId: number) {
        const itc = await this.getCurrentBalance(companyId, 'INPUT_TAX_CREDIT');
        const output = await this.getCurrentBalance(companyId, 'OUTPUT_TAX_LIABILITY');
        const cash = await this.getCurrentBalance(companyId, 'CASH_LEDGER');

        return {
            input_tax_credit: itc,
            output_tax_liability: output,
            cash_balance: cash,
            net_payable: output - itc // Positive = Pay, Negative = Carry Forward
        };
    }

    /**
     * Get Current Balance for a Ledger Type
     */
    private static async getCurrentBalance(companyId: number, ledgerType: string): Promise<number> {
        const { data } = await ems.supabase
            .schema('ems')
            .from('gst_lab_ledgers')
            .select('balance')
            .eq('company_id', companyId)
            .eq('ledger_type', ledgerType)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return data?.balance || 0;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5️⃣ MONTHLY RETURN (GSTR-3B)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Generate Monthly Return Summary
     */
    static async generateMonthlyReturn(companyId: number, month: string, year: number) {
        const filingPeriod = `${month.toString().padStart(2, '0')}-${year}`;

        // Check if already filed
        const { data: existing } = await ems.supabase
            .schema('ems')
            .from('gst_lab_returns')
            .select('*')
            .eq('company_id', companyId)
            .eq('filing_period', filingPeriod)
            .maybeSingle();

        if (existing) {
            return existing;
        }

        // Calculate totals for the month
        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

        const purchases = await this.getPurchases(companyId, monthStr);
        const sales = await this.getSales(companyId, monthStr);

        // Calculate totals with NaN safety
        const totalPurchases = (purchases || []).reduce((sum, p) => sum + (parseFloat(p.taxable_amount) || 0), 0);
        const totalSales = (sales || []).reduce((sum, s) => sum + (parseFloat(s.taxable_amount) || 0), 0);

        const inputGST = (purchases || []).reduce((sum, p) => sum + (parseFloat(p.total_gst_amount) || 0), 0);
        const outputGST = (sales || []).reduce((sum, s) => sum + (parseFloat(s.total_gst_amount) || 0), 0);

        const netTaxPayable = outputGST - inputGST;
        const itcCarryForward = netTaxPayable < 0 ? Math.abs(netTaxPayable) : 0;

        console.log(`[GST Lab] Generating return for ${filingPeriod}. Output: ${outputGST}, Input: ${inputGST}, Net: ${netTaxPayable}`);

        // Create return
        const { data: returnData, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_returns')
            .insert({
                company_id: companyId,
                return_month: new Date(year, parseInt(month as any) - 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
                return_year: year,
                filing_period: filingPeriod,
                total_sales: totalSales,
                total_purchases: totalPurchases,
                output_gst_total: outputGST,
                input_gst_total: inputGST,
                net_tax_payable: Math.max(netTaxPayable, 0),
                itc_carry_forward: itcCarryForward,
                status: 'DRAFT'
            })
            .select()
            .single();

        if (error) {
            console.error('[GST Lab] Failed to insert return:', error);
            throw error;
        }
        return returnData;
    }

    /**
     * File Monthly Return
     */
    static async fileReturn(returnId: number) {
        const { data, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_returns')
            .update({
                status: 'FILED',
                filed_at: new Date().toISOString()
            })
            .eq('id', returnId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get All Returns for a Company
     */
    static async getReturns(companyId: number) {
        const { data, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_returns')
            .select('*')
            .eq('company_id', companyId)
            .order('filing_period', { ascending: false });

        if (error) throw error;
        return data;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6️⃣ CHALLAN GENERATION (PMT-06)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Generate Payment Challan
     */
    static async generateChallan(returnId: number) {
        // Get return details
        const { data: returnData, error: returnError } = await ems.supabase
            .schema('ems')
            .from('gst_lab_returns')
            .select('*')
            .eq('id', returnId)
            .single();

        if (returnError || !returnData) throw new Error('Return not found');

        if (returnData.net_tax_payable <= 0) {
            throw new Error('No tax payable. ITC carry forward available.');
        }

        // Check if challan already exists
        const { data: existing } = await ems.supabase
            .schema('ems')
            .from('gst_lab_challans')
            .select('*')
            .eq('return_id', returnId)
            .maybeSingle();

        if (existing) {
            return existing;
        }

        // Generate mock CPIN (Common Portal Identification Number)
        const cpin = `CPIN${Date.now().toString().slice(-10)}`;

        // Create challan
        const { data: challan, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_challans')
            .insert({
                company_id: returnData.company_id,
                return_id: returnId,
                challan_number: cpin,
                challan_date: new Date().toISOString().split('T')[0],
                total_amount: returnData.net_tax_payable,
                cgst_amount: 0, // Can be split if needed
                sgst_amount: 0,
                igst_amount: returnData.net_tax_payable,
                status: 'GENERATED'
            })
            .select()
            .single();

        if (error) throw error;
        return challan;
    }

    /**
     * Get Challans for a Company
     */
    static async getChallans(companyId: number) {
        const { data, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_challans')
            .select(`
                *,
                return:gst_lab_returns (
                    return_month,
                    filing_period
                )
            `)
            .eq('company_id', companyId)
            .order('challan_date', { ascending: false });

        if (error) throw error;
        return data;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 7️⃣ PAYMENT SIMULATION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Make Payment Against Challan
     */
    static async makePayment(challanId: number) {
        // Get challan details
        const { data: challan, error: challanError } = await ems.supabase
            .schema('ems')
            .from('gst_lab_challans')
            .select('*')
            .eq('id', challanId)
            .single();

        if (challanError || !challan) throw new Error('Challan not found');

        if (challan.status === 'PAID') {
            throw new Error('Challan already paid');
        }

        // Generate mock transaction ID
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create payment record
        const { data: payment, error: paymentError } = await ems.supabase
            .schema('ems')
            .from('gst_lab_payments')
            .insert({
                company_id: challan.company_id,
                challan_id: challanId,
                payment_date: new Date().toISOString().split('T')[0],
                payment_amount: challan.total_amount,
                payment_mode: 'SIMULATED',
                transaction_id: transactionId
            })
            .select()
            .single();

        if (paymentError) throw paymentError;

        // Update challan status
        await ems.supabase
            .schema('ems')
            .from('gst_lab_challans')
            .update({
                status: 'PAID',
                paid_at: new Date().toISOString()
            })
            .eq('id', challanId);

        // Update return status
        await ems.supabase
            .schema('ems')
            .from('gst_lab_returns')
            .update({ status: 'PAID' })
            .eq('id', challan.return_id);

        // Trigger will auto-update cash ledger
        return payment;
    }

    /**
     * Get Payment History
     */
    static async getPayments(companyId: number) {
        const { data, error } = await ems.supabase
            .schema('ems')
            .from('gst_lab_payments')
            .select(`
                *,
                challan:gst_lab_challans (
                    challan_number,
                    total_amount
                )
            `)
            .eq('company_id', companyId)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🧮 HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calculate GST Breakdown
     */
    private static calculateGST(taxableAmount: number, gstRate: number, isInterState: boolean) {
        if (isInterState) {
            // Inter-state: Only IGST
            return {
                cgst: 0,
                sgst: 0,
                igst: parseFloat(((taxableAmount * gstRate) / 100).toFixed(2))
            };
        } else {
            // Intra-state: CGST + SGST
            const halfRate = gstRate / 2;
            return {
                cgst: parseFloat(((taxableAmount * halfRate) / 100).toFixed(2)),
                sgst: parseFloat(((taxableAmount * halfRate) / 100).toFixed(2)),
                igst: 0
            };
        }
    }

    /**
     * Get Complete Dashboard Data
     */
    static async getDashboard(companyId: number) {
        const [company, balances, purchases, sales, returns, challans, payments] = await Promise.all([
            this.getCompanyById(companyId),
            this.getLedgerBalances(companyId),
            this.getPurchases(companyId),
            this.getSales(companyId),
            this.getReturns(companyId),
            this.getChallans(companyId),
            this.getPayments(companyId)
        ]);

        return {
            company,
            balances,
            summary: {
                total_purchases: purchases.length,
                total_sales: sales.length,
                total_returns: returns.length,
                pending_payments: challans.filter(c => c.status === 'GENERATED').length
            },
            recent_transactions: {
                purchases: purchases.slice(0, 5),
                sales: sales.slice(0, 5)
            },
            returns,
            challans,
            payments
        };
    }
}
