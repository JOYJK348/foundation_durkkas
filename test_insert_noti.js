const { createClient } = require('./backend/node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('./backend/node_modules/dotenv');

const envFile = fs.readFileSync('./backend/.env.local', 'utf8');
const env = dotenv.parse(envFile);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const data = {
        user_id: 428,
        company_id: 13,
        target_type: 'USER',
        title: '🧪 TEST NOTIFICATION',
        message: 'This is a test to see if inserts work.',
        type: 'INFO',
        category: 'INFO',
        priority: 'NORMAL',
        created_at: new Date().toISOString()
    };

    console.log('Attempting insert into app_auth.notifications:', data);

    const { data: res, error } = await supabase
        .schema('app_auth')
        .from('notifications')
        .insert(data)
        .select();

    if (error) {
        console.error('Insert Failed!', error);
    } else {
        console.log('Insert Success!', res);
    }
}

testInsert();
