
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from current directory
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('--- Starting GST Lab Data Seeding (JS - Backend) ---');

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

    // 3. Clear existing transactions
    console.log('Cleaning up existing transactions...');
    await supabase.schema('ems').from('gst_lab_payments').delete().eq('company_id', companyId).then();
    await supabase.schema('ems').from('gst_lab_challans').delete().eq('company_id', companyId).then();
    await supabase.schema('ems').from('gst_lab_returns').delete().eq('company_id', companyId).then();
    await supabase.schema('ems').from('gst_lab_ledgers').delete().eq('company_id', companyId).then();
    await supabase.schema('ems').from('gst_lab_sales').delete().eq('company_id', companyId).then();
    await supabase.schema('ems').from('gst_lab_purchases').delete().eq('company_id', companyId).then();

    // 4. Seed Purchases (April 2025)
    console.log('Seeding Purchases for April...');
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
            transaction_type: 'INTRA_STATE'
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
            transaction_type: 'INTER_STATE'
        }
    ];
    const { error: purErr } = await supabase.schema('ems').from('gst_lab_purchases').insert(purchases);
    if (purErr) console.error('Error seeding purchases:', purErr);

    // 5. Seed Sales (April 2025)
    console.log('Seeding Sales for April...');
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
            transaction_type: 'INTRA_STATE'
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
            transaction_type: 'INTER_STATE'
        }
    ];
    const { error: salErr } = await supabase.schema('ems').from('gst_lab_sales').insert(sales);
    if (salErr) console.error('Error seeding sales:', salErr);

    // 6. Seed Ledgers
    console.log('Seeding Ledgers...');
    const ledgers = [
        {
            company_id: companyId,
            ledger_type: 'INPUT_TAX_CREDIT',
            transaction_date: '2025-04-30',
            description: 'ITC Accumulated for April',
            debit_amount: 24000,
            credit_amount: 0,
            balance: 24000,
            metadata: { source: 'SEEDING' }
        },
        {
            company_id: companyId,
            ledger_type: 'OUTPUT_TAX_LIABILITY',
            transaction_date: '2025-04-30',
            description: 'Output Tax for April',
            debit_amount: 0,
            credit_amount: 50400,
            balance: 50400,
            metadata: { source: 'SEEDING' }
        },
        {
            company_id: companyId,
            ledger_type: 'CASH_LEDGER',
            transaction_date: '2025-04-01',
            description: 'Opening Balance',
            debit_amount: 0,
            credit_amount: 0,
            balance: 10000,
            metadata: { source: 'SEEDING' }
        }
    ];
    await supabase.schema('ems').from('gst_lab_ledgers').insert(ledgers);

    // 7. Seed Returns (April, May, June - for Return Grid)
    console.log('Seeding Return Statuses...');
    const months = [
        { m: 'April', p: '04-2025', s: 'FILED', ts: 280000, tp: 150000, og: 50400, ig: 24000, net: 26400 },
        { m: 'May', p: '05-2025', s: 'FILED', ts: 320000, tp: 180000, og: 57600, ig: 32400, net: 25200 },
        { m: 'June', p: '06-2025', s: 'DRAFT', ts: 0, tp: 0, og: 0, ig: 0, net: 0 }
    ];

    const periodReturns = [];
    for (const m of months) {
        periodReturns.push({
            company_id: companyId,
            return_month: m.m,
            return_year: 2025,
            filing_period: m.p,
            total_sales: m.ts,
            total_purchases: m.tp,
            output_gst_total: m.og,
            input_gst_total: m.ig,
            net_tax_payable: m.net,
            status: m.s,
            filed_at: m.s === 'FILED' ? new Date().toISOString() : null
        });
    }
    const { data: returnData, error: retErr } = await supabase.schema('ems').from('gst_lab_returns').insert(periodReturns).select();
    if (retErr) {
        console.error('Error seeding returns:', retErr);
        return;
    }

    // 8. Seed Challan for April (PAID) and May (GENERATED)
    console.log('Seeding Challans...');
    const aprilReturn = returnData.find(r => r.filing_period === '04-2025');
    const mayReturn = returnData.find(r => r.filing_period === '05-2025');

    const challans = [
        {
            company_id: companyId,
            return_id: aprilReturn.id,
            challan_number: 'CPIN1234567890',
            challan_date: '2025-05-15',
            total_amount: 26400,
            status: 'PAID',
            paid_at: new Date().toISOString()
        },
        {
            company_id: companyId,
            return_id: mayReturn.id,
            challan_number: 'CPIN9876543210',
            challan_date: '2025-06-12',
            total_amount: 25200,
            status: 'GENERATED'
        }
    ];
    await supabase.schema('ems').from('gst_lab_challans').insert(challans);

    console.log('--- Seeding Completed Successfully ---');
}

seed();
