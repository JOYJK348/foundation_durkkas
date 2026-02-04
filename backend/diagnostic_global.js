
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

async function check() {
    console.log('--- GLOBAL DIAGNOSTIC ---');
    const { data: qs, error: qsErr } = await supabase.schema('ems').from('quiz_questions').select('id, quiz_id, company_id, question_text').order('id', { ascending: false }).limit(5);
    console.log('Last 5 Questions Created:', qs);

    const { data: quizzes, error: qErr } = await supabase.schema('ems').from('quizzes').select('id, quiz_title').order('id', { ascending: false }).limit(5);
    console.log('Last 5 Quizzes Created:', quizzes);
    console.log('--- END ---');
}

check();
