# Branch-Specific Routing & Access Control

## Overview
Branch admins now have **branch-specific URLs** and **menu-based permissions** that are dynamically controlled based on:
1. **Branch Code** - Unique identifier for each branch (e.g., `chennai`, `salem`, `coimbatore`)
2. **Menu IDs** - Granular permission control from the database
3. **Enabled Modules** - What modules the branch has access to

## URL Structure

### Branch-Specific URLs
Each branch admin gets a unique URL prefix based on their branch code:

```
Chennai Branch Admin:
/b/chennai/dashboard
/b/chennai/analytics
/b/chennai/reports
/b/chennai/hrms/employees
/b/chennai/ems/students

Salem Branch Admin:
/b/salem/dashboard
/b/salem/analytics
/b/salem/reports
/b/salem/hrms/employees
/b/salem/ems/students
```

### URL Rewriting Logic
The system automatically rewrites URLs based on the user's branch:

```typescript
// Branch Admin URL Rewriting
const branchSlug = branchCode || `branch-${user?.branch_id || 'default'}`;
const branchPrefix = `/b/${branchSlug}`;

// Examples:
/branch-admin/dashboard → /b/chennai/dashboard
/hrms/workspace/employees → /b/chennai/hrms/employees
/ems/academic-manager/students → /b/chennai/ems/students
```

## Database Schema

### Branch Table Structure
```sql
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'chennai', 'salem', etc.
    enabled_modules JSONB,              -- ['HRMS', 'EMS', 'FINANCE']
    allowed_menu_ids JSONB,             -- [44, 49, 55, 57, 73, 74]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Example Branch Record
```json
{
    "id": 1,
    "company_id": 5,
    "name": "Chennai Branch",
    "code": "chennai",
    "enabled_modules": ["HRMS", "EMS", "ATTENDANCE"],
    "allowed_menu_ids": [44, 49, 55, 57, 73, 74, 79, 80],
    "is_active": true
}
```

## Menu ID Registry

### Core Menu IDs
```typescript
const MENU_IDS = {
    // Core
    DASHBOARD: 44,
    EMPLOYEES: 49,
    DEPARTMENTS: 50,
    DESIGNATIONS: 51,
    BRANCHES: 52,
    
    // HRMS
    ATTENDANCE: 55,
    LEAVES: 57,
    PAYROLL: 61,
    
    // EMS
    LMS_DASHBOARD: 73,
    LMS_COURSES: 74,
    LMS_CLASSES: 75,
    LMS_ASSESSMENTS: 76,
    LMS_STUDENTS: 79,
    LMS_BATCHES: 80,
    
    // Finance
    FINANCE: 81,
    
    // CRM
    CRM: 89,
    
    // Settings
    SETTINGS: 47,
    ACCESS_CONTROL: 88,
    REPORTS: 87
};
```

## Access Control Flow

### 1. Branch Code Resolution
```typescript
// Fetch branch details on mount
useEffect(() => {
    const fetchBranch = async () => {
        if (userLevel > 0 && userLevel < 4 && user?.branch_id) {
            const branches = await platformService.getBranches();
            const currentBranch = branches?.find(b => 
                String(b.id) === String(user.branch_id)
            );
            
            if (currentBranch) {
                setBranchName(currentBranch.name);
                setBranchCode(currentBranch.code);
                setBranchModules(currentBranch.enabled_modules);
                setBranchMenus(currentBranch.allowed_menu_ids);
            }
        }
    };
    fetchBranch();
}, [userLevel, user?.branch_id]);
```

### 2. Menu Filtering
```typescript
const filteredNav = navItems.filter(item => {
    // 1. Role check
    if (!item.roles.includes(userLevel)) return false;
    
    // 2. Module check
    if (item.module && !enabledModules.includes(item.module)) return false;
    
    // 3. Branch-specific menu check
    if (userLevel < 4 && branchMenus.length > 0 && item.menuId) {
        if (!branchMenus.includes(item.menuId)) {
            console.log(`🚫 Blocking "${item.label}" - not in branch menu list`);
            return false;
        }
    }
    
    return true;
});
```

### 3. URL Rewriting
```typescript
const finalNav = filteredNav.map(item => {
    let href = item.href;
    
    if (userLevel < 4) {
        const branchSlug = branchCode || `branch-${user?.branch_id}`;
        const branchPrefix = `/b/${branchSlug}`;
        
        // Rewrite all workspace URLs
        if (href.startsWith('/branch-admin')) {
            href = href.replace('/branch-admin', branchPrefix);
        } else if (href.startsWith('/hrms/workspace')) {
            href = href.replace('/hrms/workspace', `${branchPrefix}/hrms`);
            } else if (href.startsWith('/ems/academic-manager')) {
                href = href.replace('/ems/academic-manager', `${branchPrefix}/ems`);
        }
    }
    
    return { ...item, href };
});
```

## Configuration Examples

### Example 1: Chennai Branch (Full Access)
```json
{
    "code": "chennai",
    "enabled_modules": ["HRMS", "EMS", "FINANCE", "CRM"],
    "allowed_menu_ids": [44, 49, 50, 51, 55, 57, 61, 73, 74, 75, 76, 79, 80, 81, 89]
}
```
**Result:** Chennai branch admin sees all modules and all menu items.

### Example 2: Salem Branch (HRMS Only)
```json
{
    "code": "salem",
    "enabled_modules": ["HRMS", "ATTENDANCE"],
    "allowed_menu_ids": [44, 49, 55, 57]
}
```
**Result:** Salem branch admin only sees:
- Dashboard
- Employees
- Attendance
- Leaves

### Example 3: Coimbatore Branch (EMS Only)
```json
{
    "code": "coimbatore",
    "enabled_modules": ["EMS"],
    "allowed_menu_ids": [44, 73, 74, 79, 80]
}
```
**Result:** Coimbatore branch admin only sees:
- Dashboard
- LMS Dashboard
- Courses
- Students
- Batches

## Testing Checklist

### Branch Code Testing
- [ ] Login as Chennai branch admin
- [ ] Verify URL shows `/b/chennai/dashboard`
- [ ] Navigate to employees → URL should be `/b/chennai/hrms/employees`
- [ ] Login as Salem branch admin
- [ ] Verify URL shows `/b/salem/dashboard`

### Menu Filtering Testing
- [ ] Chennai branch (full access) sees all menu items
- [ ] Salem branch (HRMS only) sees only HRMS items
- [ ] Coimbatore branch (EMS only) sees only EMS items
- [ ] Menu items not in `allowed_menu_ids` are hidden

### Module Gating Testing
- [ ] Branch with only HRMS module cannot access EMS pages
- [ ] Branch with only EMS module cannot access HRMS pages
- [ ] Attempting to manually navigate to blocked URL redirects or shows error

## API Endpoints

### Get Branch Details
```typescript
GET /api/branches/:id
Response: {
    id: 1,
    name: "Chennai Branch",
    code: "chennai",
    enabled_modules: ["HRMS", "EMS"],
    allowed_menu_ids: [44, 49, 55, 57, 73, 74]
}
```

### Update Branch Permissions
```typescript
PATCH /api/branches/:id
Body: {
    allowed_menu_ids: [44, 49, 55, 57, 73, 74, 79, 80]
}
```

## Security Considerations

### 1. Server-Side Validation
Always validate branch access on the server:
```typescript
// Backend middleware
const validateBranchAccess = async (req, res, next) => {
    const userBranchId = req.user.branch_id;
    const requestedBranchCode = req.params.branchCode;
    
    const branch = await getBranchByCode(requestedBranchCode);
    
    if (branch.id !== userBranchId) {
        return res.status(403).json({ error: "Access denied" });
    }
    
    next();
};
```

### 2. Menu ID Validation
Verify menu access on every API call:
```typescript
const validateMenuAccess = async (req, res, next) => {
    const menuId = req.body.menuId;
    const branch = await getBranchById(req.user.branch_id);
    
    if (!branch.allowed_menu_ids.includes(menuId)) {
        return res.status(403).json({ error: "Menu not allowed" });
    }
    
    next();
};
```

## Troubleshooting

### Issue: Branch code not showing in URL
**Solution:** Check if branch has a `code` field in database. If not, it falls back to `branch-{id}`.

### Issue: Menu items not filtering
**Solution:** Verify `allowed_menu_ids` is properly set in branch record and is an array of numbers.

### Issue: Wrong branch data showing
**Solution:** Ensure `user.branch_id` is correctly set in auth store and matches the branch record.

---

**Last Updated:** 2026-02-01  
**Version:** 2.0  
**Status:** ✅ Production Ready
