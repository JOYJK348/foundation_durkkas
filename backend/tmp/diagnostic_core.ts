import { core } from '../lib/supabase';

async function diag() {
    console.log('--- DIAGNOSTIC SYSTEM START ---');
    try {
        console.log('Checking Departments...');
        const { data: dept, error: dError } = await core.departments().select('*').limit(1);
        if (dError) console.error('Dept Fetch Error:', dError);
        else console.log('Dept Columns:', Object.keys(dept[0] || {}));

        console.log('Checking Designations...');
        const { data: desig, error: dsError } = await core.designations().select('*').limit(1);
        if (dsError) console.error('Desig Fetch Error:', dsError);
        else console.log('Desig Columns:', Object.keys(desig[0] || {}));

        console.log('Checking Branches...');
        const { data: branch, error: bError } = await core.branches().select('*').limit(1);
        if (bError) console.error('Branch Fetch Error:', bError);
        else console.log('Branch Columns:', Object.keys(branch[0] || {}));

        console.log('Checking Employees...');
        const { data: emp, error: eError } = await core.employees().select('*').limit(1);
        if (eError) console.error('Employee Fetch Error:', eError);
        else console.log('Employee Columns:', Object.keys(emp[0] || {}));

        console.log('Checking Companies...');
        const { data: comp, error: cError } = await core.companies().select('*').limit(1);
        if (cError) console.error('Company Fetch Error:', cError);
        else console.log('Company Columns:', Object.keys(comp[0] || {}));

    } catch (e: any) {
        console.error('CRITICAL DIAGNOSTIC FAIL:', e.message);
    }
    console.log('--- DIAGNOSTIC SYSTEM END ---');
}

diag();
