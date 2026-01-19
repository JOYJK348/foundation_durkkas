
import { app_auth } from '../lib/supabase';

async function checkAudit() {
    console.log('--- USER CHECK ---');
    try {
        const { data, error } = await app_auth.users()
            .select('id, email, is_active, user_roles(role_id, roles(name))')
            .eq('email', 'admin@durkkas.in');

        if (error) {
            console.error('Error fetching user:', error);
            console.error('Code:', error.code, 'Details:', error.details);
            return;
        }

        console.log('User Found:', data);

    } catch (err) {
        console.error('Exception:', err);
    }
    console.log('--- END CHECK ---');
}

checkAudit();
