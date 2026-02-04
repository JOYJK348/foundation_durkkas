
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deepSearch(id) {
    const schemas = ['ems', 'core', 'app_auth', 'hrms'];
    const tables = {
        'ems': ['courses', 'course_tutors', 'batches', 'live_classes', 'attendance_sessions', 'assignments', 'assignment_submissions', 'quizzes', 'quiz_attempts', 'students'],
        'core': ['companies', 'branches', 'departments', 'designations', 'employees'],
        'hrms': ['employees', 'attendance', 'leave_requests', 'payroll_cycles', 'job_openings', 'candidates']
    };

    for (const schema of schemas) {
        const tableList = tables[schema] || [];
        for (const table of tableList) {
            try {
                const { data } = await supabase.schema(schema).from(table).select('*');
                if (data) {
                    for (const row of data) {
                        for (const [key, val] of Object.entries(row)) {
                            if (val === id) {
                                console.log(`Found ID ${id} in ${schema}.${table} column: ${key} (Row ID: ${row.id})`);
                            }
                        }
                    }
                }
            } catch (e) { }
        }
    }
}

deepSearch(112);
