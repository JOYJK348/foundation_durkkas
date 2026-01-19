/**
 * Plan Limit Enforcement Service
 * Checks if a company can add more resources based on their subscription plan
 */

import { core, app_auth } from '@/lib/supabase';

// Plan limits configuration
const PLAN_LIMITS: Record<string, Record<string, number>> = {
    'TRIAL': { user: 10, employee: 10, branch: 3, department: 10, designation: 10 },
    'BASIC': { user: 25, employee: 25, branch: 5, department: 20, designation: 20 },
    'STANDARD': { user: 100, employee: 100, branch: 10, department: 50, designation: 50 },
    'ENTERPRISE': { user: 0, employee: 0, branch: 0, department: 0, designation: 0 }, // 0 = Unlimited
};

export type ResourceType = 'user' | 'employee' | 'branch' | 'department' | 'designation';

export interface LimitCheckResult {
    allowed: boolean;
    current: number;
    max: number;
    remaining: number;
    message: string;
    planName: string;
}

/**
 * Check if company can add more of a specific resource
 */
export async function canAddResource(
    companyId: number | string,
    resourceType: ResourceType
): Promise<LimitCheckResult> {
    try {
        // 1. Get company's current plan and limits
        const { data: company, error: companyError } = await core.companies()
            .select('subscription_plan, max_users, max_branches')
            .eq('id', companyId)
            .single();

        if (companyError || !company) {
            return {
                allowed: false,
                current: 0,
                max: 0,
                remaining: 0,
                message: 'Company not found',
                planName: 'UNKNOWN'
            };
        }

        const planName = company.subscription_plan || 'TRIAL';
        const defaultLimits = PLAN_LIMITS[planName] || PLAN_LIMITS['TRIAL'];

        // Use company-specific limits if set, otherwise use plan defaults
        let maxAllowed: number;
        switch (resourceType) {
            case 'user':
                maxAllowed = company.max_users ?? defaultLimits.user;
                break;
            case 'employee':
                maxAllowed = company.max_users ?? defaultLimits.employee;
                break;
            case 'branch':
                maxAllowed = company.max_branches ?? defaultLimits.branch;
                break;
            case 'department':
                maxAllowed = defaultLimits.department;
                break;
            case 'designation':
                maxAllowed = defaultLimits.designation;
                break;
            default:
                maxAllowed = 0;
        }

        // If unlimited (0), always allow
        if (maxAllowed === 0) {
            return {
                allowed: true,
                current: 0,
                max: 0,
                remaining: -1, // -1 indicates unlimited
                message: `Unlimited ${resourceType}s allowed`,
                planName
            };
        }

        // 2. Count current usage
        let currentCount = 0;
        switch (resourceType) {
            case 'user':
                const { count: userCount } = await app_auth.userRoles()
                    .select('id', { count: 'exact', head: true })
                    .eq('company_id', companyId)
                    .eq('is_active', true);
                currentCount = userCount || 0;
                break;
            case 'employee':
                const { count: empCount } = await core.employees()
                    .select('id', { count: 'exact', head: true })
                    .eq('company_id', companyId)
                    .eq('is_active', true)
                    .is('deleted_at', null);
                currentCount = empCount || 0;
                break;
            case 'branch':
                const { count: branchCount } = await core.branches()
                    .select('id', { count: 'exact', head: true })
                    .eq('company_id', companyId)
                    .eq('is_active', true)
                    .is('deleted_at', null);
                currentCount = branchCount || 0;
                break;
            case 'department':
                const { count: deptCount } = await core.departments()
                    .select('id', { count: 'exact', head: true })
                    .eq('company_id', companyId)
                    .eq('is_active', true)
                    .is('deleted_at', null);
                currentCount = deptCount || 0;
                break;
            case 'designation':
                const { count: desigCount } = await core.designations()
                    .select('id', { count: 'exact', head: true })
                    .eq('company_id', companyId)
                    .eq('is_active', true)
                    .is('deleted_at', null);
                currentCount = desigCount || 0;
                break;
        }

        const allowed = currentCount < maxAllowed;
        const remaining = Math.max(0, maxAllowed - currentCount);

        return {
            allowed,
            current: currentCount,
            max: maxAllowed,
            remaining,
            planName,
            message: allowed
                ? `You can add ${remaining} more ${resourceType}(s)`
                : `You have reached the maximum limit of ${maxAllowed} ${resourceType}(s) for your ${planName} plan. Please upgrade to add more.`
        };
    } catch (error: any) {
        console.error('[LimitService] Error checking limits:', error);
        return {
            allowed: false,
            current: 0,
            max: 0,
            remaining: 0,
            message: 'Error checking limits',
            planName: 'UNKNOWN'
        };
    }
}

/**
 * Check if a module is enabled for the company
 */
export async function isModuleEnabled(
    companyId: number | string,
    moduleName: string
): Promise<boolean> {
    try {
        const { data: company } = await core.companies()
            .select('enabled_modules')
            .eq('id', companyId)
            .single();

        if (!company?.enabled_modules) return false;

        const modules = Array.isArray(company.enabled_modules)
            ? company.enabled_modules
            : JSON.parse(company.enabled_modules as string || '[]');

        return modules.includes(moduleName) || modules.includes('CORE');
    } catch (error) {
        console.error('[LimitService] Error checking module:', error);
        return false;
    }
}

/**
 * Check if trial has expired
 */
export async function isTrialExpired(companyId: number | string): Promise<boolean> {
    try {
        const { data: company } = await core.companies()
            .select('subscription_plan, subscription_end_date, trial_expired')
            .eq('id', companyId)
            .single();

        if (!company) return true;
        if (company.trial_expired) return true;
        if (company.subscription_plan !== 'TRIAL') return false;

        if (company.subscription_end_date) {
            const endDate = new Date(company.subscription_end_date);
            return new Date() > endDate;
        }

        return false;
    } catch (error) {
        console.error('[LimitService] Error checking trial:', error);
        return false;
    }
}
