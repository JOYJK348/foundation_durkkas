import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateMenus() {
    console.log('🚀 Starting CRM Menu Migration...');

    // 1. Delete old CRM menus
    const { error: deleteError } = await supabase
        .schema('app_auth')
        .from('menu_registry')
        .delete()
        .eq('module_key', 'CRM');

    if (deleteError) {
        console.error('❌ Error deleting old menus:', deleteError);
        return;
    }

    console.log('✅ Old CRM menus cleared.');

    // 2. Insert new CRM menus matching the actual project structure
    const newMenus = [
        {
            menu_key: 'CRM_TRACKS',
            menu_name: 'Lead Tracks',
            display_name: 'All Lead Channels',
            module_key: 'CRM',
            is_active: true,
            sort_order: 10,
            icon: 'LayoutGrid'
        },
        {
            menu_key: 'CRM_VENDORS',
            menu_name: 'Vendors',
            display_name: 'Vendor Applications',
            module_key: 'CRM',
            is_active: true,
            sort_order: 20,
            icon: 'Truck'
        },
        {
            menu_key: 'CRM_PARTNERS',
            menu_name: 'Partners',
            display_name: 'Strategic Partners',
            module_key: 'CRM',
            is_active: true,
            sort_order: 30,
            icon: 'Handshake'
        },
        {
            menu_key: 'CRM_JOB_SEEKERS',
            menu_name: 'Job Seekers',
            display_name: 'Talent Pool / Careers',
            module_key: 'CRM',
            is_active: true,
            sort_order: 40,
            icon: 'Briefcase'
        },
        {
            menu_key: 'CRM_INTERNSHIPS',
            menu_name: 'Internships',
            display_name: 'Student Interns',
            module_key: 'CRM',
            is_active: true,
            sort_order: 50,
            icon: 'GraduationCap'
        },
        {
            menu_key: 'CRM_COURSE_ENQUIRIES',
            menu_name: 'Enquiries',
            display_name: 'Course Enquiries',
            module_key: 'CRM',
            is_active: true,
            sort_order: 60,
            icon: 'Search'
        },
        {
            menu_key: 'CRM_CAREER_GUIDANCE',
            menu_name: 'Career Guidance',
            display_name: 'Counseling Leads',
            module_key: 'CRM',
            is_active: true,
            sort_order: 70,
            icon: 'Compass'
        }
    ];

    const { error: insertError } = await supabase
        .schema('app_auth')
        .from('menu_registry')
        .insert(newMenus);

    if (insertError) {
        console.error('❌ Error inserting new menus:', insertError);
        return;
    }

    console.log('✅ CRM menus updated successfully matching actual registration channels.');
}

migrateMenus();
