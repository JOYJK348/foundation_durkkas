# 🎯 SUBSCRIPTION-BASED FEATURE ACCESS CONTROL
## Enterprise SaaS | Zero-Noise UI | Professional Grade

---

## 📋 OVERVIEW

This system implements **subscription-based feature access control** where:
- ✅ Companies see ONLY what they subscribed to
- ✅ No disabled menus
- ✅ No "access denied" pages  
- ✅ If not subscribed → feature doesn't exist in UI
- ✅ Professional upgrade prompts when needed

---

## 🏗️ ARCHITECTURE

### Backend Components

#### 1. **Feature Access Middleware** (`middleware/featureAccess.ts`)
```typescript
// Get company's feature access
const access = await getCompanyFeatureAccess(userId);

// Check if module is enabled
if (access.hasModule('CRM')) {
  // Show CRM features
}

// Check subscription limits
const canCreate = await access.canCreateBranch();
```

**Key Functions:**
- `getCompanyFeatureAccess(userId)` - Get complete feature access info
- `requireModuleAccess(userId, module)` - Enforce module access in APIs
- `getAccessibleMenus(userId)` - Get filtered menu IDs
- `validateCreationLimit(userId, limitType)` - Check subscription limits

#### 2. **API Endpoint** (`/api/auth/feature-access`)
Returns user's complete subscription information:
```json
{
  "company": {
    "id": 11,
    "name": "Durkkas Innovations",
    "subscriptionPlan": "ENTERPRISE",
    "subscriptionStatus": "ACTIVE"
  },
  "enabledModules": ["CORE", "HR", "CRM", "PAYROLL"],
  "limits": {
    "maxUsers": 100,
    "maxBranches": 10,
    "maxEmployees": 500
  },
  "accessibleMenuIds": [1, 2, 3, 44, 45],
  "isPlatformAdmin": false
}
```

### Frontend Components

#### 1. **Feature Access Context** (`contexts/FeatureAccessContext.tsx`)
Global React Context for feature access:

```tsx
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';

function MyComponent() {
  const { hasModule, enabledModules, limits } = useFeatureAccess();
  
  if (hasModule('CRM')) {
    return <CRMDashboard />;
  }
  
  return null; // Don't show anything if module not enabled
}
```

**Available Hooks:**
- `hasModule(module)` - Check single module
- `hasAnyModule(modules[])` - Check if any module is enabled
- `hasAllModules(modules[])` - Check if all modules are enabled
- `canAccessMenu(menuId)` - Check menu access

#### 2. **Module Gate Component**
Conditional rendering based on module access:

```tsx
import { ModuleGate } from '@/contexts/FeatureAccessContext';

<ModuleGate module="CRM">
  <CRMFeatures />
</ModuleGate>

<ModuleGate module={['HR', 'PAYROLL']} requireAll={true}>
  <PayrollDashboard />
</ModuleGate>
```

#### 3. **HOC for Protection**
```tsx
import { withModuleAccess } from '@/contexts/FeatureAccessContext';

const ProtectedCRM = withModuleAccess(CRMDashboard, 'CRM');
```

#### 4. **Subscription Required Component**
Professional upgrade prompt:
```tsx
import SubscriptionRequired from '@/components/subscription/SubscriptionRequired';

<SubscriptionRequired 
  moduleName="CRM"
  message="Custom message here"
/>
```

---

## 🎨 IMPLEMENTATION EXAMPLES

### Example 1: Protect Entire Page
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFeatureAccess } from '@/contexts/FeatureAccessContext';
import { toast } from 'sonner';

export default function CRMPage() {
  const router = useRouter();
  const { hasModule, loading } = useFeatureAccess();

  useEffect(() => {
    if (!loading && !hasModule('CRM')) {
      toast.error('CRM module not enabled');
      router.push('/workspace');
    }
  }, [loading, hasModule, router]);

  if (loading) return <LoadingSpinner />;
  if (!hasModule('CRM')) return null;

  return <CRMDashboard />;
}
```

### Example 2: Conditional Features in Dashboard
```tsx
export default function Dashboard() {
  const { hasModule, enabledModules } = useFeatureAccess();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {hasModule('CRM') && <CRMWidget />}
      {hasModule('HR') && <HRWidget />}
      {hasModule('PAYROLL') && <PayrollWidget />}
      
      {/* Show only if has ANY of these modules */}
      {hasAnyModule(['LMS', 'CRM']) && <StudentLeadWidget />}
    </div>
  );
}
```

### Example 3: API Route Protection
```typescript
// In API route
import { requireModuleAccess } from '@/middleware/featureAccess';
import { getUserIdFromToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  
  // Enforce CRM module access
  await requireModuleAccess(userId, 'CRM');
  
  // If we reach here, user has access
  // ... rest of API logic
}
```

### Example 4: Check Limits Before Creation
```typescript
import { validateCreationLimit } from '@/middleware/featureAccess';

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  
  // Check if user can create more employees
  await validateCreationLimit(userId, 'employee');
  
  // If we reach here, limit not exceeded
  // ... create employee
}
```

---

## 🗄️ DATABASE SCHEMA

### Companies Table (core.companies)
```sql
enabled_modules: text[]  -- ['CORE', 'HR', 'CRM', 'PAYROLL']
subscription_plan: text  -- 'TRIAL', 'BASIC', 'STANDARD', 'ENTERPRISE'
subscription_status: text  -- 'ACTIVE', 'EXPIRED', 'SUSPENDED'
max_users: integer
max_branches: integer
max_employees: integer
max_departments: integer
max_designations: integer
allowed_menu_ids: integer[]
```

---

## 📊 MODULE TYPES

Available modules:
- `CORE` - Basic company management (always enabled)
- `HR` - Human Resources
- `ATTENDANCE` - Attendance tracking
- `PAYROLL` - Salary processing
- `CRM` - Customer/Lead management
- `LMS` - Learning Management System
- `FINANCE` - Financial management
- `INVENTORY` - Inventory management

---

## 🔐 SECURITY PRINCIPLES

### 1. **Backend Enforcement**
✅ All access checks happen on backend
✅ Frontend only hides UI elements
✅ API routes validate module access
✅ Database queries filtered by tenant

### 2. **Zero-Noise UI**
✅ Disabled menus don't exist
✅ No "Access Denied" pages for subscribed users
✅ Professional upgrade prompts
✅ Clean, focused interface

### 3. **Platform Admin Exception**
✅ Platform Admins (Level 5+) see everything
✅ No subscription limits apply
✅ Full system access

---

## 🚀 USAGE CHECKLIST

### For New Features/Modules

#### Backend:
- [ ] Add module to `ModuleType` enum
- [ ] Update API route with `requireModuleAccess()`
- [ ] Add limit checks if applicable
- [ ] Test with different subscription plans

#### Frontend:
- [ ] Wrap component with `ModuleGate` or use `useFeatureAccess()`
- [ ] Add loading states
- [ ] Test UI with module disabled
- [ ] Ensure no broken UI elements

#### Database:
- [ ] Update company's `enabled_modules` array
- [ ] Set appropriate limits
- [ ] Update `allowed_menu_ids` if needed

---

## 🧪 TESTING SCENARIOS

### Test Case 1: CRM Only Company
```typescript
// Company setup
enabled_modules: ['CORE', 'CRM']

// Expected behavior:
✅ CRM Dashboard visible
✅ CRM menus visible
❌ HR features hidden
❌ Payroll features hidden
❌ LMS features hidden
```

### Test Case 2: HR + Payroll Company
```typescript
// Company setup
enabled_modules: ['CORE', 'HR', 'PAYROLL']

// Expected behavior:
✅ HR Dashboard visible
✅ Payroll features visible
❌ CRM features hidden
❌ LMS features hidden
```

### Test Case 3: Limit Enforcement
```typescript
// Company setup
max_employees: 50

// Expected behavior:
✅ Can create employees 1-50
❌ Employee 51 creation fails with professional message
✅ Message: "Subscription Limit Reached..."
```

---

## 📞 SUPPORT

For implementation questions:
- Check this documentation first
- Review example implementations
- Contact: Platform Development Team

---

## 🎯 BEST PRACTICES

### DO ✅
- Always use `useFeatureAccess()` hook in components
- Check module access in API routes
- Validate limits before creation
- Show professional upgrade prompts
- Test with multiple subscription plans

### DON'T ❌
- Don't show disabled menus
- Don't show "Access Denied" for subscribed features
- Don't hardcode module checks
- Don't skip backend validation
- Don't forget loading states

---

**Last Updated:** 2026-01-25
**Version:** 1.0.0
**Status:** Production Ready ✅
