const { ems } = require('./backend/lib/supabase');

async function fixBatchDates() {
    console.log('--- Adjusting Batch Dates for Testing ---');
    const today = new Date().toISOString().split('T')[0];
    const startDate = '2026-02-01';
    const endDate = '2026-06-01';

    try {
        const { data, error } = await ems.batches()
            .update({
                start_date: startDate,
                end_date: endDate,
                is_active: true,
                status: 'ACTIVE'
            } as any)
            .neq('id', 0); // Update all batches for simplicity in testing

        if (error) {
            console.error('Error updating batches:', error);
            return;
        }

        console.log(`Successfully updated batches to be active today (${today}).`);
        console.log(`New range: ${startDate} to ${endDate}`);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

fixBatchDates();
