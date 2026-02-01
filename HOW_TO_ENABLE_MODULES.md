# How to Enable Modules for Branch Creation

## Problem
When creating a branch, only **CRM** module is showing in "Step 2: Module Access Configuration". This is because your company's subscription only has CRM enabled.

## Solution Options

### Option 1: Enable Modules via Subscription Page (Recommended)

1. Navigate to: **Dashboard → Subscription**
2. In the "Custom Plan Builder" section, select the modules you need:
   - ✅ **LMS** (Learning Management System) - For EMS Admin
   - ✅ **HR** (Human Resources) - For HRMS Admin  
   - ✅ **FINANCE** (Finance & Accounting) - For Finance Admin
   - ✅ **CRM** (Customer Relations) - Already enabled
   - ✅ **PAYROLL** (Payroll Management)
3. Click "Request Activation"
4. Once activated, all modules will appear in branch creation

### Option 2: Database Update (Quick Fix for Testing)

Update your company's subscription directly in the database:

```sql
-- Find your company ID
SELECT id, name, subscription_plan FROM core.companies;

-- Update enabled modules for your company
UPDATE core.companies 
SET enabled_modules = ARRAY['HR', 'ATTENDANCE', 'PAYROLL', 'CRM', 'LMS', 'FINANCE']::text[]
WHERE id = YOUR_COMPANY_ID;

-- Verify the update
SELECT id, name, enabled_modules FROM core.companies WHERE id = YOUR_COMPANY_ID;
```

### Option 3: Temporary Override (For Development Only)

If you're a Platform Admin, you can temporarily see all modules. The code already handles this:

```typescript
// In CreateBranchPage
const displayedModules = useMemo(() => {
    if (!modules || modules.length === 0) return [];
    
    // Platform Admin sees ALL modules
    let filtered = isPlatformAdmin
        ? modules
        : modules.filter((mod: Module) => {
            return enabledModules.includes(mod.key as any);
        });
    
    return filtered;
}, [modules, enabledModules, accessibleMenuIds, isPlatformAdmin]);
```

## Current Subscription Status

Based on your current setup:
- **Plan**: CUSTOM (or TRIAL)
- **Enabled Modules**: CRM only
- **Max Users**: Check subscription page
- **Max Branches**: Check subscription page

## Module Mapping Reference

When you enable modules, they map to admin types as follows:

| Module Key | Admin Type | Description |
|------------|-----------|-------------|
| `LMS` | EMS_ADMIN | Education Management System |
| `HR` | HRMS_ADMIN | Human Resources & Payroll |
| `FINANCE` | FINANCE_ADMIN | Finance & Accounting |
| `CRM` | CRM_ADMIN | Customer Relations |
| `CORE` | BRANCH_ADMIN | General Branch Admin |

## After Enabling Modules

Once modules are enabled, when you create a branch:

**Step 2: Module Access** will show:
- ✅ HR (Human Resources)
- ✅ LMS (Learning Management System)
- ✅ FINANCE (Finance & Accounting)
- ✅ CRM (Customer Relations)
- ✅ PAYROLL (Payroll Management)

**Step 3: Branch Admins** will show:
- ✅ Branch Admin
- ✅ EMS Admin
- ✅ HRMS Admin
- ✅ Finance Admin
- ✅ CRM Admin
- ✅ Back Office Admin

## Quick Database Fix Script

Run this in your Supabase SQL Editor:

```sql
-- Enable all modules for testing
UPDATE core.companies 
SET enabled_modules = ARRAY['HR', 'ATTENDANCE', 'PAYROLL', 'CRM', 'LMS', 'FINANCE']::text[]
WHERE name = 'Durkkas Institute of Professional Learning';

-- Verify
SELECT name, enabled_modules, subscription_plan 
FROM core.companies 
WHERE name = 'Durkkas Institute of Professional Learning';
```

After running this, refresh your browser and all modules should appear!
