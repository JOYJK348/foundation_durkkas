const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createQuizzes() {
    console.log('📝 Creating test quizzes...');

    const companyId = 13;
    const branchId = 46;

    const quizzes = [
        {
            course_id: 1, // FSD
            quiz_title: 'React Basics Assessment',
            quiz_description: 'Test your basic React knowledge.',
            duration_minutes: 20,
            total_marks: 10,
            passing_marks: 5,
            max_attempts: 3,
            is_active: true
        },
        {
            course_id: 2, // DSAI
            quiz_title: 'Python for Data Science Quiz',
            quiz_description: 'Evaluate your Python proficiency.',
            duration_minutes: 15,
            total_marks: 10,
            passing_marks: 5,
            max_attempts: 2,
            is_active: true
        }
    ];

    for (const q of quizzes) {
        // Find existing
        let { data: existing } = await supabase.schema('ems').from('quizzes')
            .select('id')
            .eq('quiz_title', q.quiz_title)
            .eq('course_id', q.course_id)
            .limit(1)
            .single();

        let quizId;
        if (existing) {
            quizId = existing.id;
            console.log(`ℹ️ Quiz ${q.quiz_title} already exists (ID: ${quizId})`);
        } else {
            const { data: newQuiz, error } = await supabase.schema('ems').from('quizzes').insert({
                ...q,
                company_id: companyId,
                branch_id: branchId
            }).select().single();

            if (error) {
                console.error(`Error creating quiz ${q.quiz_title}:`, error);
                continue;
            }
            quizId = newQuiz.id;
            console.log(`✅ Created Quiz: ${q.quiz_title} (ID: ${quizId})`);
        }

        // Add dummy questions
        const questionsToAdd = [
            {
                question_text: q.quiz_title.includes('React') ? 'What is JSX?' : 'How do you define a function in Python?',
                question_type: 'MCQ',
                marks: 5,
                question_order: 1
            }
        ];

        for (const questionData of questionsToAdd) {
            let { data: qExisting } = await supabase.schema('ems').from('quiz_questions')
                .select('id')
                .eq('quiz_id', quizId)
                .eq('question_text', questionData.question_text)
                .limit(1)
                .single();

            let questionId;
            if (qExisting) {
                questionId = qExisting.id;
            } else {
                const { data: newQ, error: qError } = await supabase.schema('ems').from('quiz_questions').insert({
                    ...questionData,
                    quiz_id: quizId,
                    company_id: companyId
                }).select().single();

                if (qError) {
                    console.error(`Error creating question:`, qError);
                    continue;
                }
                questionId = newQ.id;
            }

            // Add options
            const options = q.quiz_title.includes('React')
                ? [
                    { option_text: 'JavaScript XML', is_correct: true, option_order: 1 },
                    { option_text: 'Java Syntax Extension', is_correct: false, option_order: 2 }
                ]
                : [
                    { option_text: 'def myFunc():', is_correct: true, option_order: 1 },
                    { option_text: 'function myFunc()', is_correct: false, option_order: 2 }
                ];

            for (const opt of options) {
                await supabase.schema('ems').from('quiz_options').upsert({
                    ...opt,
                    question_id: questionId
                }, { onConflict: 'question_id,option_text' });
            }
        }
    }

    console.log('✨ Quiz creation done!');
}

createQuizzes();
