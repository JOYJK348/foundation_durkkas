
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

async function checkData() {
    console.log('--- DATABASE DATA CHECK ---');

    // 1. Check Quizzes
    const { data: quizzes, error: qErr } = await supabase.schema('ems').from('quizzes').select('*');
    if (qErr) {
        console.error('Quizzes Error:', qErr);
    } else {
        console.log(`Found ${quizzes.length} quizzes`);
        quizzes.forEach(q => {
            console.log(`- ID: ${q.id}, Title: ${q.title || q.quiz_name}, Questions (total_questions field): ${q.total_questions}`);
        });
    }

    // 2. Questions Check
    const { data: questions, error: questErr } = await supabase.schema('ems').from('quiz_questions').select('*');
    if (questErr) {
        console.error('Questions Error:', questErr);
    } else {
        console.log(`Found ${questions.length} total questions in quiz_questions table`);
        questions.forEach(q => {
            console.log(`- Q ID: ${q.id}, Quiz ID: ${q.quiz_id}, Text: ${q.question_text.substring(0, 20)}...`);
        });
    }

    console.log('--- END ---');
}

checkData();
