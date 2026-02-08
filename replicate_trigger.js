const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock ems, core, NotificationService to replicate EMSNotificationTriggers logic
const app_auth = {
    notifications: () => supabase.schema('app_auth').from('notifications')
};
const core = {
    employees: () => supabase.schema('core').from('employees')
};
const ems = {
    assignments: () => supabase.schema('ems').from('assignments'),
    enrollments: () => supabase.schema('ems').from('student_enrollments')
};

const NotificationService = {
    send: async (params) => {
        console.log('--- NotificationService.send called with:', JSON.stringify(params, null, 2));
        const data = {
            user_id: params.userId,
            company_id: params.companyId,
            target_type: params.targetType || 'USER',
            title: params.title,
            message: params.message,
            created_at: new Date().toISOString()
        };
        const { error } = await app_auth.notifications().insert(data);
        if (error) console.error('NS.send ERROR:', error.message);
        else console.log('NS.send SUCCESS');
    },
    notifyMany: async (userIds, params) => {
        console.log(`--- NotificationService.notifyMany called for ${userIds.length} users:`, JSON.stringify(params, null, 2));
        const data = userIds.map(uid => ({
            user_id: uid,
            company_id: params.companyId,
            target_type: params.targetType || 'USER',
            title: params.title,
            message: params.message,
            created_at: new Date().toISOString()
        }));
        const { error } = await app_auth.notifications().insert(data);
        if (error) console.error('NS.notifyMany ERROR:', error.message);
        else console.log('NS.notifyMany SUCCESS');
    }
};

async function ReplicateTrigger(assignmentId, companyId) {
    try {
        console.log(`Replicating trigger for Assignment ${assignmentId}, Company ${companyId}`);

        // 1. Fetch assignment details
        const { data: assignment, error } = await ems.assignments()
            .select(`
                id,
                assignment_title,
                course_id,
                batch_id,
                tutor_id,
                courses:course_id (course_name)
            `)
            .eq('id', assignmentId)
            .single();

        if (error) {
            console.error('Fetch Assignment Fail:', error.message);
            return;
        }
        console.log('Assignment Details:', JSON.stringify(assignment, null, 2));

        // 2. Notify the Tutor
        let tutorUserId = null;
        if (assignment.tutor_id) {
            const { data: tutor, error: tErr } = await core.employees()
                .select('user_id')
                .eq('id', assignment.tutor_id)
                .single();
            if (tErr) console.error('Fetch Tutor Fail:', tErr.message);
            tutorUserId = tutor?.user_id || null;
        }
        console.log('Tutor User ID:', tutorUserId);

        if (tutorUserId) {
            await NotificationService.send({
                userId: tutorUserId,
                companyId,
                product: 'EMS',
                module: 'assignments',
                title: '📝 New Assignment Notification',
                message: `You have been assigned to evaluate "${assignment.assignment_title}" for ${assignment.courses?.course_name || 'your course'}.`,
                actionUrl: `/ems/tutor/assignments`
            });
        }

        // 3. Notify Students
        const { data: enrollments, error: eErr } = await ems.enrollments()
            .select('student_id, students:student_id (user_id)')
            .eq(assignment.batch_id ? 'batch_id' : 'course_id', assignment.batch_id || assignment.course_id)
            .eq('enrollment_status', 'ACTIVE')
            .is('deleted_at', null);

        if (eErr) {
            console.error('Fetch Enrollments Fail:', eErr.message);
        } else {
            console.log(`Found ${enrollments?.length || 0} active students.`);
            const studentUserIds = enrollments?.map(e => e.students?.user_id).filter(id => id !== null) || [];
            console.log('Student User IDs:', studentUserIds);

            if (studentUserIds.length > 0) {
                await NotificationService.notifyMany(studentUserIds, {
                    companyId,
                    product: 'EMS',
                    module: 'assignments',
                    title: '📚 New Assignment Released',
                    message: `A new assignment "${assignment.assignment_title}" has been posted for your course ${assignment.courses?.course_name || ''}.`,
                    actionUrl: '/ems/student/assignments'
                });
            }
        }

    } catch (err) {
        console.error('REPLICATE ERROR:', err.message);
    }
}

ReplicateTrigger(5, 13);
