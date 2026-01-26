import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import * as bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * 🚀 DURKKAS Enterprise Intelligence Toolkit
 * A unified command-driven architecture for system maintenance, 
 * data seeding, and administrative diagnostics.
 */

const commands: Record<string, Function> = {
    // 🔍 INSPECT USER
    user: async (identifier: string) => {
        console.log(`\n🔍 Analyzing Identity: ${identifier}...`)
        const { data, error } = await supabase
            .schema('app_auth')
            .from('users')
            .select(`*, user_roles(role_id, company_id, branches(name))`)
            .or(`email.eq.${identifier},id.eq.${identifier}`)

        if (error) return console.error('❌ Error:', error.message)
        if (!data || data.length === 0) return console.log('⚠️ No identity found for this identifier.')

        console.table(data.map(u => ({
            ID: u.id,
            Email: u.email,
            Name: `${u.first_name} ${u.last_name}`,
            Active: u.is_active,
            Roles: u.user_roles?.length || 0
        })))
    },

    // 🏢 INSPECT COMPANY
    company: async (id: string) => {
        console.log(`\n🏢 Inspecting Company ID: ${id}...`)
        const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return console.error('❌ Error:', error.message)
        console.log('--- COMPANY CONFIGURATION ---')
        console.log(company)

        const { data: staff } = await supabase.schema('core').from('employees').select('count', { count: 'exact' }).eq('company_id', id)
        const { data: branches } = await supabase.schema('core').from('branches').select('name').eq('company_id', id)

        console.log(`\n📊 OPERATIONAL METRICS:`)
        console.log(`- Total Employees:`, staff?.[0]?.count || 0)
        console.log(`- Active Branches:`, branches?.map(b => b.name).join(', ') || 'None')
    },

    // 📋 OVERVIEW
    list: async () => {
        console.log(`\n📋 Listing Active Entities...`)
        const { data, error } = await supabase
            .from('companies')
            .select('id, name, domain, is_active, subscription_tier')
            .order('created_at', { ascending: false })

        if (error) return console.error('❌ Error:', error.message)
        console.table(data)
    },

    // � ROLES & PERMISSIONS
    security: async () => {
        console.log(`\n🔒 Enterprise Security Matrix...`)
        const { data: roles } = await supabase.schema('app_auth').from('roles').select('name, level').order('level', { ascending: false })
        const { data: perms } = await supabase.schema('app_auth').from('permissions').select('count')

        console.log('--- SYSTEM ROLES ---')
        console.table(roles)
        console.log(`\nTotal Permissions Registered: ${perms?.[0]?.count || 0}`)
    },

    // 🏗️ PROVISION ADMIN
    provision: async (email: string, roleName = 'PLATFORM_ADMIN', companyId?: string, password?: string) => {
        console.log(`\n Provisioning Access for: ${email}...`)
        const finalPassword = password || 'durkkas@2026'
        const passwordHash = await bcrypt.hash(finalPassword, 10)

        const { data: role } = await supabase.schema('app_auth').from('roles').select('id').eq('name', roleName).single()
        if (!role) return console.error(`❌ Invalid Role: ${roleName}`)

        const { data: user, error: userErr } = await supabase.schema('app_auth').from('users').upsert({
            email,
            password_hash: passwordHash,
            first_name: roleName.split('_')[0],
            last_name: 'Admin',
            is_active: true,
            is_verified: true
        }, { onConflict: 'email' }).select().single()

        if (userErr) return console.error('❌ Provisioning Failed:', userErr.message)

        const { error: roleErr } = await supabase.schema('app_auth').from('user_roles').upsert({
            user_id: user.id,
            role_id: role.id,
            company_id: companyId ? Number(companyId) : null,
            is_active: true
        }, { onConflict: 'user_id,role_id,company_id,branch_id' })

        if (roleErr) console.error('⚠️ Role Assignment Error:', roleErr.message)
        else console.log(`✅ Success! ${email} provisioned as ${roleName}. Password: ${finalPassword}`)
    },

    //  SEED DATA
    seed: async (id?: string) => {
        let companyId = id ? Number(id) : null;

        if (!companyId) {
            const { data: firstCompany } = await supabase.from('companies').select('id').limit(1).single();
            if (firstCompany) {
                companyId = firstCompany.id;
                console.log(`📡 No Company ID provided. Defaulting to first entity: [${companyId}]`);
            } else {
                return console.error('❌ No companies found in system. Cannot seed.');
            }
        }

        console.log(`\n Seeding Operational Data for Company [${companyId}]...`)

        const { data: branches } = await supabase.schema('core').from('branches').select('id').eq('company_id', companyId).limit(1)
        const { data: depts } = await supabase.schema('core').from('departments').select('id').eq('company_id', companyId).limit(1)
        const { data: desigs } = await supabase.schema('core').from('designations').select('id').eq('company_id', companyId).limit(1)

        if (!branches?.length || !depts?.length || !desigs?.length) {
            return console.error('❌ Metadata missing. Ensure branches, depts, and desigs exist for this company.')
        }

        const mockEmployees = [
            { first_name: 'Rahul', last_name: 'Dravid', email: `rahul.${Date.now()}@durkkas.com`, employee_code: `E${Date.now()}1` },
            { first_name: 'Virat', last_name: 'Kohli', email: `virat.${Date.now()}@durkkas.com`, employee_code: `E${Date.now()}2` }
        ].map(e => ({
            ...e,
            company_id: Number(companyId),
            branch_id: branches[0].id,
            department_id: depts[0].id,
            designation_id: desigs[0].id,
            is_active: true,
            created_at: new Date().toISOString()
        }))

        const { error } = await supabase.schema('core').from('employees').insert(mockEmployees)
        if (error) console.error('❌ Seeding Error:', error.message)
        else console.log(`✅ Seeded ${mockEmployees.length} records successfully.`)
    },

    // 📦 STORAGE SYNC
    setupStorage: async () => {
        console.log(`\n📦 Initializing Enterprise Storage...`)
        const buckets = ['branding', 'avatars', 'documents']

        for (const b of buckets) {
            const { data, error } = await supabase.storage.getBucket(b)
            if (error) {
                console.log(`Creating bucket: ${b}...`)
                await supabase.storage.createBucket(b, { public: true })
            } else {
                console.log(`Bucket exists: ${b}`)
            }
        }
        console.log('✅ Storage setup verified.')
    },

    // ❤️ SYSTEM HEALTH & MASTER SETTINGS
    health: async () => {
        console.log(`\n❤️ Conducting Enterprise Health Audit...`)

        // Check DB & Master Settings
        const { data: settings, error: sErr } = await supabase
            .schema('core')
            .from('global_settings')
            .select('*')

        if (sErr) console.error('❌ Database Connection/Schema Error:', sErr.message)
        else {
            console.log('✅ Database Connection: STABLE')
            console.log('\n--- MASTER SETTINGS REGISTRY ---')
            console.table(settings.map(s => ({ Key: s.key, Value: s.value, Category: s.category })))
        }

        const { data: userCount } = await supabase.schema('app_auth').from('users').select('count', { count: 'exact' })
        console.log(`\nVerified Identity Count: ${userCount?.[0]?.count || 0}`)
    },

    // 🏎️ REDIS CACHE DIAGNOSTICS
    redis: async () => {
        console.log(`\n🏎️ Analyzing Redis Intelligence Cache...`)
        // Using external dynamic import to avoid mandatory dependency for non-redis tasks
        try {
            const { Redis } = await import('@upstash/redis')
            const redis = new Redis({
                url: process.env.REDIS_URL!,
                token: process.env.REDIS_TOKEN!,
            })

            const keys = await redis.keys('user:*:sessions')
            console.log(`✅ Cache Connection: STABLE`)
            console.log(`Active Session Keys Found: ${keys.length}`)
            if (keys.length > 0) console.log('Top Keys:', keys.slice(0, 5))
        } catch (err) {
            console.error('❌ Redis Connection Failed. Check REDIS_URL/TOKEN in environment.')
        }
    }
}

const run = async () => {
    const [cmd, ...args] = process.argv.slice(2)

    if (!commands[cmd]) {
        console.log(`
🚀 DURKKAS Enterprise Toolkit
Available Commands:
- user <id|email>       : Detailed identity analysis
- company <id>          : Entity operational audit
- list                  : View all registered entities
- health                : System-wide DB & Master Settings audit
- redis                 : Inspect active cache session keys
- security              : Inspect roles & system permissions
- provision <email> [role] [compId] : Create/Fix admin access
- seed <compId>         : Populate operational data
- setupStorage          : Verify storage bucket architecture
        `)
        return
    }

    try {
        await commands[cmd](...args)
    } catch (err) {
        console.error('💥 Critical Execution Failure:', err)
    }
}

run()
