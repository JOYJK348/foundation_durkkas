
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    const courseId = 16;
    const companyId = 13;
    const branchId = 28; // Standard branch for company 13

    console.log('Cleaning up existing content for course 16...');
    // Note: cascade delete should handle lessons too
    await supabase.schema('ems').from('course_modules').delete().eq('course_id', courseId);

    const mods = [
        'Phase 1: Frontend Foundation',
        'Phase 2: React Core & Advanced',
        'Phase 3: Backend & Database',
        'Phase 4: Full Stack Integration'
    ];

    const insMods = [];
    for (let i = 0; i < mods.length; i++) {
        const { data, error } = await supabase.schema('ems').from('course_modules')
            .insert({
                course_id: courseId,
                company_id: companyId,
                branch_id: branchId,
                module_name: mods[i],
                module_order: i + 1,
                visibility: 'PUBLIC'
            }).select();

        if (data && data[0]) {
            insMods.push(data[0]);
        } else {
            console.log(`Mod ${i} Error:`, error);
        }
    }

    if (insMods.length < 4) {
        console.log(`MODS FAILED: only ${insMods.length} inserted. Check if course 16 still exists.`);
        return;
    }

    const lessonsNames = [
        'Intro to Web', 'HTML5', 'CSS3', 'Flexbox', 'Grid', 'Responsive', 'JS Execution', 'DOM Intro', 'DOM Advanced', 'ES6+', 'Async JS', 'Fetch API', 'Storage', 'Forms', 'Git', 'Phase 1 Quiz',
        'React Intro', 'JSX', 'useState', 'useEffect', 'Forms', 'Router', 'Context', 'useMemo', 'Custom Hooks', 'Patterns', 'Tailwind', 'Shadcn', 'SSR', 'Next.js', 'Zustand', 'Phase 2 Quiz',
        'Node.js', 'Express', 'REST', 'Middleware', 'Error Handling', 'SQL vs NoSQL', 'Postgres', 'Joins', 'Prisma', 'Migrations', 'JWT', 'Bcrypt', 'RBAC', 'S3 Uploads', 'Testing', 'Phase 3 Quiz',
        'Full Stack Link', 'React Query', 'Pagination', 'Search', 'Socket.io', 'Chat App', 'Charts', 'Security', 'Env Vars', 'Docker', 'CI/CD', 'Deploy', 'Cloud DB', 'Sentry', 'Prep', 'Final Quiz'
    ];

    let count = 0;
    for (let i = 0; i < lessonsNames.length; i++) {
        const mIdx = Math.floor(i / 16);
        const mId = insMods[mIdx].id;

        const { error } = await supabase.schema('ems').from('lessons').insert({
            course_id: courseId,
            company_id: companyId,
            branch_id: branchId,
            module_id: mId,
            lesson_name: lessonsNames[i],
            lesson_type: i % 16 == 15 ? 'QUIZ' : 'VIDEO',
            lesson_order: (i % 16) + 1,
            duration_minutes: 30,
            visibility: i % 5 == 0 ? 'PUBLIC' : 'ENROLLED'
        });

        if (!error) {
            count++;
        } else {
            console.log(`Lesson ${i} Error:`, error);
        }
    }

    console.log(`SUCCESS: Seeded ${count} lessons into ${insMods.length} modules for course ID 16.`);
}

seed();
