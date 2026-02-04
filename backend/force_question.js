
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
    console.log('--- FORCING QUESTION FOR QUIZ 9 ---');
    const { data: q, error: qErr } = await supabase.schema('ems').from('quiz_questions').insert({
        quiz_id: 9,
        company_id: 13,
        question_text: 'DIAGNOSTIC QUESTION: Does this work?',
        question_type: 'MCQ',
        question_order: 1,
        marks: 1
    }).select().single();

    if (qErr) console.error('Insert Error:', qErr);
    else {
        console.log('Inserted Question:', q);
        await supabase.schema('ems').from('quiz_options').insert([
            { question_id: q.id, option_text: 'Yes', is_correct: true, option_order: 1 },
            { question_id: q.id, option_text: 'No', is_correct: false, option_order: 2 }
        ]);
        await supabase.schema('ems').from('quizzes').update({ total_questions: 1 }).eq('id', 9);
        console.log('Done.');
    }
}

check();
