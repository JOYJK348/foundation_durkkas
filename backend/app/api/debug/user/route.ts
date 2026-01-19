import { NextRequest, NextResponse } from 'next/server';
import { app_auth, core } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const shouldCreate = url.searchParams.get('create') === 'true';

        // Summary of actions taken
        const report: any = { status: 'checked', fixes: [] };

        if (shouldCreate) {
            // 1. DATA PREP
            const { data: role } = await app_auth.roles().select('id').eq('name', 'COMPANY_ADMIN').single();
            // Get ANY company to assign this admin to (ideally the first one)
            const { data: company } = await core.companies().select('id').limit(1).single();

            if (!role || !company) {
                return NextResponse.json({ error: 'Missing Role or Company data. Cannot seed admin.' }, { status: 400 });
            }

            // 2. USER FIX (Idempotent)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@123', salt);

            // Check if User Exists
            const { data: existingUser } = await app_auth.users()
                .select('id')
                .ilike('email', 'admin@durkkas.in')
                .maybeSingle();

            let targetUser;

            if (existingUser) {
                // Update Password
                await app_auth.users().update({ password_hash: hashedPassword, is_active: true }).eq('id', existingUser.id);
                targetUser = existingUser;
                report.fixes.push('User password reset');
            } else {
                // Create User
                const { data: newUser } = await app_auth.users()
                    .insert({
                        email: 'admin@durkkas.in',
                        password_hash: hashedPassword,
                        first_name: 'DIPL',
                        last_name: 'Admin',
                        display_name: 'Company Admin',
                        is_active: true,
                        is_verified: true
                    })
                    .select()
                    .single();
                targetUser = newUser;
                report.fixes.push('User created');
            }

            // 3. ROLE FIX
            const { data: existingRole } = await app_auth.userRoles()
                .select('id')
                .eq('user_id', targetUser.id)
                .eq('role_id', role.id)
                .maybeSingle();

            if (!existingRole) {
                await app_auth.userRoles().insert({
                    user_id: targetUser.id,
                    role_id: role.id,
                    company_id: company.id,
                    is_active: true
                });
                report.fixes.push('Role assigned');
            }

            // ==========================================
            // 4. CONTEXT SEEDING (The "Fix My Dropdowns" Logic)
            // ==========================================
            const companyId = company.id;

            // A. BRANCHES
            const { count: branchCount } = await core.branches().select('*', { count: 'exact', head: true }).eq('company_id', companyId);
            let branchId = null;

            if (branchCount === 0) {
                const { data: newBranch } = await core.branches().insert({
                    company_id: companyId,
                    name: 'Head Office',
                    code: 'HO',
                    is_head_office: true,
                    created_by: targetUser.id
                }).select().single();
                branchId = newBranch?.id;
                report.fixes.push('Seeded Branch: Head Office');
            } else {
                const { data: b } = await core.branches().select('id').eq('company_id', companyId).limit(1).single();
                branchId = b?.id;
            }

            // B. DEPARTMENTS
            const { count: deptCount } = await core.departments().select('*', { count: 'exact', head: true }).eq('company_id', companyId);
            if (deptCount === 0 && branchId) {
                await core.departments().insert([
                    { company_id: companyId, branch_id: branchId, name: 'Engineering', code: 'ENG', created_by: targetUser.id },
                    { company_id: companyId, branch_id: branchId, name: 'Human Resources', code: 'HR', created_by: targetUser.id },
                    { company_id: companyId, branch_id: branchId, name: 'Administration', code: 'ADM', created_by: targetUser.id }
                ]);
                report.fixes.push('Seeded Departments: ENG, HR, ADM');
            }

            // C. DESIGNATIONS
            const { count: desigCount } = await core.designations().select('*', { count: 'exact', head: true }).eq('company_id', companyId);
            if (desigCount === 0) {
                await core.designations().insert([
                    { company_id: companyId, title: 'General Manager', code: 'GM', level: 5, created_by: targetUser.id },
                    { company_id: companyId, title: 'Team Lead', code: 'TL', level: 3, created_by: targetUser.id },
                    { company_id: companyId, title: 'Senior Employee', code: 'SR-EMP', level: 2, created_by: targetUser.id },
                    { company_id: companyId, title: 'Employee', code: 'EMP', level: 1, created_by: targetUser.id }
                ]);
                report.fixes.push('Seeded Designations: GM, TL, EMP');
            }

            return NextResponse.json({
                success: true,
                message: 'Environment Repaired Successfully',
                report,
                admin_email: 'admin@durkkas.in'
            });
        }

        // Status Check Mode
        const { data: u } = await app_auth.users().select('id, email').eq('email', 'admin@durkkas.in').maybeSingle();
        return NextResponse.json({
            status: 'Ready',
            instruction: 'Add ?create=true to this URL to fix missing user/data.',
            currentUser: u || 'Not Found'
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
