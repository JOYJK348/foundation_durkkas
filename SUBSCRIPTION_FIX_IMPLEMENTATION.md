# 🚀 SUBSCRIPTION ENFORCEMENT - IMPLEMENTATION GUIDE

## Current Status: ❌ BROKEN
- Backend saves subscription data correctly ✅
- Backend API returns subscription data correctly ✅  
- Frontend fetches subscription data ✅
- **Frontend DOES NOT filter menus based on subscription ❌ CRITICAL**
- **Dashboard shows all widgets regardless of subscription ❌ CRITICAL**

## Root Cause
`DashboardLayout.tsx` has static menu array and only filters by:
1. Role level (Platform Admin vs Company Admin)
2. Module existence check (but shows ALL menus if module exists)

**Missing:** Menu-level filtering based on `allowed_menu_ids`

## The Fix (3 Files)

### File 1: Update DashboardLayout.tsx

**Location:** `frontend/src/components/layout/DashboardLayout.tsx`

**Change Required:** Use `useFeatureAccess` hook to filter menus dynamically

```typescript
// Add import at top
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';

// Inside component, replace static filtering with:
const { enabledModules, accessibleMenuIds, isPlatformAdmin, isLoading } = useFeatureAccess();

// Filter menus dynamically
const filteredNavItems = navItems.filter(item => {
    // 1. Role check
    if (!item.roles.includes(userLevel)) return false;
    
    // 2. Platform Admin: Only show platform menus
    if (userLevel === 5) {
        return item.roles.includes(5);
    }
    
    // 3. Module check (if menu requires a module)
    if (item.module && !enabledModules.includes(item.module)) {
        return false;
    }
    
    // 4. Menu ID check (for sub-feature access)
    // If accessibleMenuIds is populated, use it for fine-grained control
    if (accessibleMenuIds.length > 0 && item.menuId) {
        return accessibleMenuIds.includes(item.menuId);
    }
    
    return true;
});
```

**Problem:** Current `navItems` array doesn't have `menuId` field!

**Solution:** Add `menuId` to each nav item that maps to `menu_registry.id`

### File 2: Map Menu IDs to NavItems

We need to map frontend menu items to database menu IDs.

**Database Menu IDs (from menu_registry):**
```
Core Menus (always visible):
- Dashboard: varies by role
- Profile: varies by role
- Notifications: varies by role

Platform Admin Only (role 5):
- Companies
- Modules  
- Admins Overview
- Subscription Plans
- System Settings
- Audit Logs
- Branding

Company Admin (role 4):
- Branches
- Departments
- Designations
- Employees (HR module)
- Attendance (ATTENDANCE module)
- Leaves (ATTENDANCE module)
- Payroll (PAYROLL module)
- CRM (CRM module)
  - Sub-menus: Vendors, Partners, Job Seekers, etc.
- LMS (LMS module)
- Finance (FINANCE module)
- Reports
- Access Control
- Subscription
- Settings
```

**Action Required:** Query database to get exact menu IDs, then update navItems array.

### File 3: Update Company Dashboard

**Location:** `frontend/src/app/workspace/dashboard/page.tsx`

**Change Required:** Conditionally render widgets based on enabled modules

```typescript
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';

export default function CompanyDashboard() {
    const { enabledModules, company, limits } = useFeatureAccess();
    
    return (
        <>
            {/* Always show */}
            <WelcomeCard company={company} />
            <PlanCard plan={company?.subscriptionPlan} limits={limits} />
            
            {/* Conditional widgets */}
            {enabledModules.includes('HR') && <HRStatsWidget />}
            {enabledModules.includes('ATTENDANCE') && <AttendanceWidget />}
            {enabledModules.includes('PAYROLL') && <PayrollWidget />}
            {enabledModules.includes('CRM') && <CRMWidget />}
            {enabledModules.includes('LMS') && <LMSWidget />}
            {enabledModules.includes('FINANCE') && <FinanceWidget />}
            
            {/* Quick Actions - filtered */}
            <QuickActions enabledModules={enabledModules} />
        </>
    );
}
```

## Implementation Steps

### Step 1: Get Menu IDs from Database ✅
Run this query to map menu names to IDs:

```sql
SELECT id, menu_key, menu_name, display_name, module_key 
FROM app_auth.menu_registry 
WHERE is_active = true 
ORDER BY module_key, sort_order;
```

### Step 2: Update navItems Array
Add `menuId` field to each item based on query results.

### Step 3: Update DashboardLayout Filtering Logic
Replace current module-only filtering with menu ID filtering.

### Step 4: Update Dashboard Widgets
Make all widget rendering conditional on enabled modules.

### Step 5: Update CRM Page (Sub-Module Filtering)
**Location:** `frontend/src/app/workspace/crm/page.tsx`

Filter CRM tabs based on `accessibleMenuIds`:

```typescript
const { accessibleMenuIds } = useFeatureAccess();

const crmTabs = [
    { id: 68, name: 'Vendors', component: VendorsTab },
    { id: 69, name: 'Partners', component: PartnersTab },
    // ... other tabs
].filter(tab => accessibleMenuIds.includes(tab.id));
```

## Testing Checklist

### Test Case 1: Custom Plan - CRM Vendor Only
**Setup:**
- Company: Joy Solutions
- Plan: Custom
- Modules: CRM
- Menus: CRM parent + Vendors only

**Expected Result:**
- ✅ Sidebar shows: Dashboard, CRM, Profile, Logout
- ✅ CRM page shows: Only Vendors tab
- ✅ Dashboard shows: Only CRM widget
- ✅ No HR/Attendance/Payroll/LMS/Finance anywhere
- ✅ Plan badge shows "Custom Plan"
- ✅ Limits match custom plan settings

### Test Case 2: Trial Plan
**Expected Result:**
- ✅ All modules visible
- ✅ Trial limits enforced
- ✅ "Upgrade" prompts shown
- ✅ Plan badge shows "Trial - X days left"

### Test Case 3: Platform Admin
**Expected Result:**
- ✅ Only platform menus visible
- ✅ No workspace menus
- ✅ Can access all companies
- ✅ No subscription limits

## Priority Actions (In Order)

1. ✅ Create FeatureAccessContext (DONE)
2. ✅ Add to Providers (DONE)
3. ⏳ Query database for menu IDs
4. ⏳ Update navItems with menuId field
5. ⏳ Update DashboardLayout filtering logic
6. ⏳ Update Company Dashboard widgets
7. ⏳ Update CRM page tab filtering
8. ⏳ Test all scenarios

## Files Modified Summary

### Backend (No changes needed - already correct)
- ✅ `backend/app/api/platform/companies/create-with-admin/route.ts`
- ✅ `backend/app/api/auth/feature-access/route.ts`
- ✅ `backend/middleware/featureAccess.ts`

### Frontend (Changes needed)
- ✅ `frontend/src/contexts/FeatureAccessContext.tsx` (CREATED)
- ✅ `frontend/src/components/providers/Providers.tsx` (UPDATED)
- ⏳ `frontend/src/components/layout/DashboardLayout.tsx` (NEEDS UPDATE)
- ⏳ `frontend/src/app/workspace/dashboard/page.tsx` (NEEDS UPDATE)
- ⏳ `frontend/src/app/workspace/crm/page.tsx` (NEEDS UPDATE)

## Next Immediate Action

**Query database to get menu IDs**, then update DashboardLayout.tsx with proper filtering logic.

---

**Status:** 🟡 IN PROGRESS (60% Complete)
**Blocker:** Need to map menu IDs to navItems
**ETA:** 30 minutes to complete
