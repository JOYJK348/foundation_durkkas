
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function simulate() {
    console.log('--- SIMULATING SUBMIT ---');
    const attempt_id = 1; // Change to a valid attempt ID if known, or find one

    // Find a real attempt to test
    const { data: atts } = await supabase.schema('ems').from('quiz_attempts').select('id, student_id, quiz_id').limit(1);
    if (!atts || atts.length === 0) {
        console.log('No attempts found to simulate');
        return;
    }
    const testId = atts[0].id;
    console.log(`Testing with Attempt ID: ${testId}`);

    // Update with dummy answers
    const { error: err } = await supabase.schema('ems').from('quiz_attempts').update({
        answers: { "1": "test" },
        status: 'COMPLETED',
        submitted_at: new Date().toISOString()
    }).eq('id', testId);

    if (err) console.error('Simulate Update Error:', err);
    else console.log('Simulate Update Success');
    console.log('--- END ---');
}

simulate();
