
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env from .env.local
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

async function check() {
    console.log('--- DIAGNOSTIC START ---');
    const { data: q, error: qErr } = await supabase.schema('ems').from('quizzes').select('id, company_id, total_questions').eq('id', 8).single();
    if (qErr) console.error('Quiz 8 Error:', qErr);
    else console.log('Quiz 8:', q);

    const { data: qs, error: qsErr } = await supabase.schema('ems').from('quiz_questions').select('id, quiz_id, company_id, question_text').eq('quiz_id', 8);
    if (qsErr) console.error('Questions Error:', qsErr);
    else console.log('Questions for Quiz 8 count:', qs?.length);

    if (qs && qs.length > 0) {
        console.log('Sample Question:', qs[0]);
        const { data: opts, error: optsErr } = await supabase.schema('ems').from('quiz_options').select('id, question_id, option_text').in('question_id', qs.map(q => q.id));
        console.log('Options for these questions count:', opts?.length);
    }
    console.log('--- DIAGNOSTIC END ---');
}

check();
