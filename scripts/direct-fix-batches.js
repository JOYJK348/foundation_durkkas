const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://waxbttxqhyoczmdshpzz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheGJ0dHhxaHlvY3ptZHNocHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODExMzgxOCwiZXhwIjoyMDgzNjg5ODE4fQ.4WowA7kl3Tw77m63XiLrqVIvILvrj949Rt6lRJVSb18';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixBatches() {
    console.log('--- Fixing Batch Dates ---');

    // Set start_date to 5 days ago and end_date to 90 days from now
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 5);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 90);

    const sdStr = startDate.toISOString().split('T')[0];
    const edStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .schema('ems')
        .from('batches')
        .update({
            start_date: sdStr,
            end_date: edStr,
            is_active: true,
            status: 'ACTIVE'
        })
        .neq('id', 0); // Update all

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Successfully updated batches!');
        console.log('New Start Date:', sdStr);
        console.log('New End Date:', edStr);
    }
}

fixBatches();
