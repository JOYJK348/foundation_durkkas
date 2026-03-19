
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: q, error: qErr } = await supabase.schema('ems').from('quizzes').select('id, company_id, total_questions').eq('id', 8).single();
    console.log('Quiz 8:', q, qErr);

    const { data: qs, error: qsErr } = await supabase.schema('ems').from('quiz_questions').select('id, quiz_id, company_id').eq('quiz_id', 8);
    console.log('Questions for Quiz 8:', qs?.length, qsErr);

    if (qs && qs.length > 0) {
        console.log('Sample Question:', qs[0]);
    }

    const { data: opts, error: optsErr } = await supabase.schema('ems').from('quiz_options').select('id, question_id').in('question_id', qs?.map(q => q.id) || []);
    console.log('Options for these questions:', opts?.length, optsErr);
}

check();
