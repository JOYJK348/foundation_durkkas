
import { app_auth } from './lib/supabase';

async function debugUserRoles(userId: number) {
    console.log(`Checking roles for user ${userId}...`);

    // Get roles
    const { data: userRoles, error } = await app_auth.userRoles()
        .select(`
            *,
            roles:role_id (name, level, role_type)
        `)
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching roles:', error);
        return;
    }

    console.log('User Roles:', JSON.stringify(userRoles, null, 2));

    // Check specific role requirements
    const hasManager = userRoles?.some((ur: any) => ur.roles?.name === 'ACADEMIC_MANAGER');
    console.log('Has ACADEMIC_MANAGER?', hasManager);
}

// Default to 470 based on logs, or take from arg
const userId = process.argv[2] ? parseInt(process.argv[2]) : 470;
debugUserRoles(userId);
