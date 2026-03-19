import { EMSNotificationTriggers } from '../lib/services/EMSNotificationTriggers';
import { supabase } from '../lib/supabase';

async function test() {
    console.log('--- TUNNEL TEST ---');
    try {
        await EMSNotificationTriggers.onAssignmentCreated(5, 13);
        console.log('Trigger call finished');
    } catch (e) {
        console.error('Trigger Error:', e);
    }
}

test();
