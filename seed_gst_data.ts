
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from backend .env
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('--- Starting GST Lab Data Seeding ---');

    // 1. Get an allocation ID for Course 17
    const { data: allocations, error: allocError } = await supabase
        .schema('ems')
        .from('student_practice_allocations')
        .select('id, student_id, company_id')
        .eq('course_id', 17)
        .eq('module_type', 'GST_LAB')
        .limit(1);

    if (allocError || !allocations || allocations.length === 0) {
        console.error('No allocations found for Course 17. Run logic to allocate first.', allocError);
        return;
    }

    const allocation = allocations[0];
    const allocationId = allocation.id;
    console.log(`Using Allocation ID: ${allocationId}`);

    // 2. Create Company if not exists
    const { data: existingCompany } = await supabase
        .schema('ems')
        .from('gst_lab_companies')
        .select('*')
        .eq('allocation_id', allocationId)
        .maybeSingle();

    let companyId;
    if (!existingCompany) {
        console.log('Creating new mock company...');
        const { data: newCompany, error: compError } = await supabase
            .schema('ems')
            .from('gst_lab_companies')
            .insert({
                allocation_id: allocationId,
                company_name: 'Antigravity Electronics Pvt Ltd',
                state: 'Tamil Nadu',
                state_code: '33',
                gstin: '33AAACA1234A1Z5',
                default_gst_rate: 18,
                financial_year: '2025-26'
            })
            .select()
            .single();

        if (compError) {
            console.error('Error creating company:', compError);
            return;
        }
        companyId = newCompany.id;
    } else {
        companyId = existingCompany.id;
    }
    console.log(`Company ID: ${companyId}`);

    // 3. Clear existing transactions for a fresh start
    console.log('Cleaning up existing transactions...');
    await supabase.schema('ems').from('gst_lab_payments').delete().eq('company_id', companyId);
    await supabase.schema('ems').from('gst_lab_challans').delete().eq('company_id', companyId);
    await supabase.schema('ems').from('gst_lab_returns').delete().eq('company_id', companyId);
    await supabase.schema('ems').from('gst_lab_ledgers').delete().eq('company_id', companyId);
    await supabase.schema('ems').from('gst_lab_sales').delete().eq('company_id', companyId);
    await supabase.schema('ems').from('gst_lab_purchases').delete().eq('company_id', companyId);

    // 4. Seed Purchases (Input GST)
    console.log('Seeding Purchases...');
    const purchases = [
        {
            company_id: companyId,
            supplier_name: 'Intel Corp India',
            supplier_gstin: '33BBBBB1234B1Z5',
            invoice_no: 'PUR/25/001',
            invoice_date: '2025-04-10',
            taxable_amount: 100000,
            gst_rate: 18,
            cgst_amount: 9000,
            sgst_amount: 9000,
            igst_amount: 0,
            transaction_type: 'INTRA_STATE',
            items: [{ description: 'Core i9 Processors', qty: 5, rate: 20000 }]
        },
        {
            company_id: companyId,
            supplier_name: 'Samsung Electronics (Interstate)',
            supplier_gstin: '27CCCCC1234C1Z5',
            invoice_no: 'PUR/25/002',
            invoice_date: '2025-04-15',
            taxable_amount: 50000,
            gst_rate: 12,
            cgst_amount: 0,
            sgst_amount: 0,
            igst_amount: 6000,
            transaction_type: 'INTER_STATE',
            items: [{ description: 'SSD Drives', qty: 10, rate: 5000 }]
        }
    ];
    await supabase.schema('ems').from('gst_lab_purchases').insert(purchases);

    // 5. Seed Sales (Output GST)
    console.log('Seeding Sales...');
    const sales = [
        {
            company_id: companyId,
            customer_name: 'Reliance Digital',
            customer_gstin: '33DDDDD1234D1Z5',
            invoice_no: 'SAL/25/001',
            invoice_date: '2025-04-20',
            taxable_amount: 200000,
            gst_rate: 18,
            cgst_amount: 18000,
            sgst_amount: 18000,
            igst_amount: 0,
            transaction_type: 'INTRA_STATE',
            items: [{ description: 'Gaming Laptops', qty: 2, rate: 100000 }]
        },
        {
            company_id: companyId,
            customer_name: 'Flipkart (Interstate Sales)',
            customer_gstin: '29EEEEE1234E1Z5',
            invoice_no: 'SAL/25/002',
            invoice_date: '2025-04-25',
            taxable_amount: 80000,
            gst_rate: 18,
            cgst_amount: 0,
            sgst_amount: 0,
            igst_amount: 14400,
            transaction_type: 'INTER_STATE',
            items: [{ description: 'Custom PC Builds', qty: 1, rate: 80000 }]
        }
    ];
    await supabase.schema('ems').from('gst_lab_sales').insert(sales);

    // 6. Manually Seed Ledgers (Normally computed by triggers, but let's ensure data is there)
    console.log('Seeding Ledgers...');
    const ledgers = [
        {
            company_id: companyId,
            ledger_type: 'INPUT_TAX_CREDIT',
            transaction_date: '2025-04-15',
            description: 'Purchase ITC Accumulation',
            debit_amount: 24000, // 9000+9000+6000
            credit_amount: 0,
            balance: 24000,
            metadata: { source: 'SEEDING' }
        },
        {
            company_id: companyId,
            ledger_type: 'OUTPUT_TAX_LIABILITY',
            transaction_date: '2025-04-25',
            description: 'Sales Liability Accumulation',
            debit_amount: 0,
            credit_amount: 50400, // 18000+18000+14400
            balance: 50400,
            metadata: { source: 'SEEDING' }
        },
        {
            company_id: companyId,
            ledger_type: 'CASH_LEDGER',
            transaction_date: '2025-04-01',
            description: 'Opening Cash Balance',
            debit_amount: 0,
            credit_amount: 0,
            balance: 50000,
            metadata: { source: 'SEEDING' }
        }
    ];
    await supabase.schema('ems').from('gst_lab_ledgers').insert(ledgers);

    // 7. Seed Return (Draft)
    console.log('Seeding Returns...');
    const returns = {
        company_id: companyId,
        return_month: 'April 2025',
        return_year: 2025,
        filing_period: '04-2025',
        total_sales: 280000,
        total_purchases: 150000,
        output_gst_total: 50400,
        input_gst_total: 24000,
        net_tax_payable: 26400,
        status: 'DRAFT'
    };
    await supabase.schema('ems').from('gst_lab_returns').insert(returns);

    console.log('--- Seeding Completed Successfully ---');
}

seed();
