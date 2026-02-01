# Branch Admin Architecture

## Overview
The `branch-admin` folder is now a **generic, module-agnostic** workspace that dynamically adapts based on:
1. **Branch ID** - Which branch the admin is managing
2. **Menu ID** - Dynamic access control based on user permissions
3. **Enabled Modules** - What modules (HRMS, EMS, Finance, CRM) the branch has access to

## Directory Structure
```
frontend/src/app/branch-admin/
├── dashboard/         # Main branch dashboard (module-agnostic)
├── analytics/         # Branch performance analytics
├── reports/           # Branch-level reports (all modules)
├── notifications/     # Branch notifications
└── profile/           # User profile
```

**Note:** Module-specific pages (HRMS, EMS, Finance, CRM) are accessed through their respective workspace folders:
- **HRMS:** `/hrms/workspace/` (employees, attendance, leaves)
- **EMS:** `/ems/academic-manager/` (students, batches, courses, live-classes)
- **Finance:** `/finance/workspace/`
- **CRM:** `/crm/workspace/`

## Key Features

### 1. **Module Agnostic**
- Branch admins can access **any module** (HRMS, EMS, Finance, CRM) based on their company's subscription
- No longer tied to EMS-only functionality
- Dynamic menu rendering based on enabled modules

### 2. **Dynamic Routing**
All branch-admin routes are dynamically rewritten based on branch context:

**Before:**
```
/ems/branch-admin/dashboard  (EMS-specific, hardcoded)
```

**After:**
```
/branch-admin/dashboard  →  /b/{branchId-hash}/dashboard  (Dynamic, generic)
```

### 3. **Permission-Based Access**
Access is controlled by:
- **User Level** (0-5, where 1-3 are branch-level roles)
- **Menu ID** (Granular permission registry from database)
- **Enabled Modules** (Subscription-based feature gating)

## How It Works

### DashboardLayout.tsx Logic
```typescript
// Dynamic href resolution for branch admins
const getDashboardHref = () => {
    if (userLevel === 5) return "/platform/dashboard";      // Platform Admin
    if (userLevel === 4) return "/workspace/dashboard";     // Company Admin
    return "/branch-admin/dashboard";                        // Branch Admin (Generic)
};

// URL Rewriting for unique branch context
if (userLevel < 4) {
    if (href.startsWith('/branch-admin')) {
        href = href.replace('/branch-admin', branchPrefix);  // /b/{branchId-hash}
    }
}
```

### Login Redirect
```typescript
// login/page.tsx
else if (roleLevel >= 1 || roleLevel === 0) {
    router.push("/branch-admin/dashboard");  // Generic branch admin entry
}
```

## Module Access Architecture

Branch admins access module-specific functionality through the **workspace folders**, not through `/branch-admin`. The branch-admin folder contains only **generic branch management** pages.

### How Branch Admins Access Modules

#### HRMS Module
Branch admins with HRMS access navigate to:
- `/hrms/workspace/employees` - Employee directory
- `/hrms/workspace/attendance` - Attendance tracking
- `/hrms/workspace/leaves` - Leave management

#### EMS Module
Branch admins with EMS access navigate to:
- `/ems/academic-manager/dashboard` - LMS Dashboard
- `/ems/academic-manager/students` - Student directory
- `/ems/academic-manager/batches` - Batch management
- `/ems/academic-manager/courses` - Course catalog

#### Finance Module
- `/finance/workspace` - Finance dashboard

#### CRM Module
- `/crm/workspace` - CRM dashboard

### Branch-Admin Core Pages
The `/branch-admin` folder contains only **cross-module** pages:
- **Dashboard** - Aggregated view of all modules
- **Analytics** - Branch performance metrics (all modules)
- **Reports** - Comprehensive reporting (all modules)
- **Notifications** - Branch-level notifications
- **Profile** - User profile management

## Access Control Flow

```
User Login
    ↓
Role Level Check (1-3 = Branch Admin)
    ↓
Redirect to /branch-admin/dashboard
    ↓
DashboardLayout checks:
    - User's branch assignment
    - Enabled modules (from subscription)
    - Menu permissions (from DB)
    ↓
Render only accessible menu items
    ↓
Dynamic URL rewriting: /branch-admin/* → /b/{branchId-hash}/*
```

## Benefits

### ✅ **Scalability**
- Single branch-admin codebase serves all modules
- Easy to add new modules without restructuring

### ✅ **Security**
- Branch isolation through dynamic URL rewriting
- Permission-based menu rendering
- Module gating based on subscription

### ✅ **Maintainability**
- No module-specific branch-admin folders
- Centralized permission logic
- Consistent UX across all modules

### ✅ **Flexibility**
- Branch admins can manage multiple modules
- Dynamic feature access based on company plan
- Menu items adapt to user permissions

## Migration Notes

### What Changed
1. **Moved:** `/ems/branch-admin/*` → `/branch-admin/*`
2. **Updated:** All routing references in `DashboardLayout.tsx`
3. **Updated:** Login redirect logic
4. **Removed:** EMS-specific branch-admin folder

### Breaking Changes
- Old URLs like `/ems/branch-admin/dashboard` will no longer work
- All branch-admin routes are now generic `/branch-admin/*`
- Dynamic URL rewriting happens at runtime based on branch context

## Future Enhancements

### Planned Features
1. **Branch-Specific Theming** - Custom branding per branch
2. **Multi-Branch Support** - Single user managing multiple branches
3. **Cross-Module Dashboards** - Unified view of HRMS + EMS + Finance
4. **Advanced Analytics** - Branch performance across all modules

### Database Schema
```sql
-- Branch-Menu Access Control
CREATE TABLE branch_menu_access (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id),
    menu_id INT REFERENCES menu_registry(id),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Branch Module Subscriptions
CREATE TABLE branch_modules (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id),
    module_code VARCHAR(50), -- 'HRMS', 'EMS', 'FINANCE', 'CRM'
    is_active BOOLEAN DEFAULT true,
    activated_at TIMESTAMP DEFAULT NOW()
);
```

## Developer Guide

### Adding a New Module Page
1. Create the page in `/branch-admin/{module-page}/page.tsx`
2. Add menu item to `DashboardLayout.tsx` navItems
3. Set appropriate `module` and `menuId` for access control
4. Ensure the page uses `DashboardLayout` wrapper

### Example: Adding Finance Module
```typescript
// In DashboardLayout.tsx navItems
{
    id: "finance_ledger",
    label: "Finance Ledger",
    icon: CreditCard,
    href: "/branch-admin/finance",
    roles: [1, 2, 3],  // Branch-level roles
    module: "FINANCE",
    menuId: 120
}
```

## Testing Checklist
- [ ] Login as Branch Admin (Level 1-3)
- [ ] Verify redirect to `/branch-admin/dashboard`
- [ ] Check menu items match enabled modules
- [ ] Test navigation to HRMS pages
- [ ] Test navigation to EMS pages
- [ ] Verify URL rewriting to `/b/{hash}/*`
- [ ] Test permission-based menu filtering
- [ ] Verify module gating works correctly

---

**Last Updated:** 2026-02-01  
**Architecture Version:** 2.0  
**Status:** ✅ Production Ready
