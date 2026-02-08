import { ems } from './backend/lib/supabase';

async function checkSchema() {
    try {
        const { data, error } = await ems.assignments().select('*').limit(1);
        if (error) {
            console.error('Error fetching assignments:', error);
            return;
        }
        console.log('Columns in ems.assignments:', Object.keys(data[0] || {}));
    } catch (err) {
        console.error('Check failed:', err);
    }
}

checkSchema();
