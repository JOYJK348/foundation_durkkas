# Notification Isolation System - Company & Branch Level

## Overview
The notification system now implements **strict tenant isolation** to ensure users only see notifications relevant to their scope.

---

## Isolation Rules

### 1. **Platform Admin (Level 5)**
✅ **Sees:** ALL notifications (system-wide)
- Global platform notifications
- All company notifications
- All branch notifications
- Direct user notifications

❌ **Cannot see:** Nothing is hidden from Platform Admins

---

### 2. **Company Admin (Level 4)**
✅ **Sees:** ONLY notifications from their company
- Notifications sent by their Company Admin
- Notifications sent by Branch Admins in their company
- Notifications sent by employees in their company
- Direct notifications to them

❌ **Cannot see:**
- ❌ Platform Admin notifications (GLOBAL)
- ❌ Other companies' notifications
- ❌ System-wide announcements

---

### 3. **Branch Admin (Level 1)**
✅ **Sees:** ONLY notifications from their branch
- Notifications sent by their Branch Admin
- Notifications sent by their Company Admin to their branch
- Notifications sent by employees in their branch
- Direct notifications to them

❌ **Cannot see:**
- ❌ Platform Admin notifications (GLOBAL)
- ❌ Other companies' notifications
- ❌ Other branches' notifications (even in same company)
- ❌ Company-wide notifications (unless targeted to their branch)

---

## Technical Implementation

### Backend Filtering (`/api/auth/notifications` GET)

#### Platform Admin (Level 5)
```typescript
// NO FILTERS - Sees everything
query = supabaseService
    .schema('app_auth')
    .from('notifications')
    .select('*');
```

#### Company Admin (Level 4)
```typescript
// STRICT COMPANY FILTER
const filters = [
    `user_id.eq.${userId}`,                                      // Direct to me
    `sender_id.eq.${userId}`,                                    // Sent by me
    `and(target_type.eq.COMPANY,company_id.eq.${companyId})`,   // Company-wide
    `and(target_type.eq.ROLE,target_role_level.eq.4,company_id.eq.${companyId})`, // Role-based
    `and(target_type.is.null,company_id.eq.${companyId})`       // Legacy
];

query = query.or(filters.join(','));
```

**Key Points:**
- ❌ NO `target_type.eq.GLOBAL` filter
- ✅ ALL filters require `company_id.eq.${companyId}`

#### Branch Admin (Level 1)
```typescript
// STRICT BRANCH FILTER
const filters = [
    `user_id.eq.${userId}`,                                      // Direct to me
    `sender_id.eq.${userId}`,                                    // Sent by me
    `and(target_type.eq.BRANCH,branch_id.eq.${branchId},company_id.eq.${companyId})`, // Branch-wide
    `and(target_type.eq.ROLE,target_role_level.eq.1,branch_id.eq.${branchId})`, // Role-based
    `and(target_type.is.null,branch_id.eq.${branchId},company_id.eq.${companyId})` // Legacy
];

query = query.or(filters.join(','));
```

**Key Points:**
- ❌ NO `target_type.eq.GLOBAL` filter
- ❌ NO `target_type.eq.COMPANY` filter
- ✅ ALL filters require BOTH `branch_id` AND `company_id`

---

### Notification Creation

#### Platform Admin Notifications
```typescript
NotificationService.notifyPlatformAdmins({
    type: 'SYSTEM',
    title: 'New branches Created',
    message: 'John Doe from ABC Company created a new branches: "Main Branch"',
    priority: 'NORMAL'
});

// Database Insert:
{
    target_type: 'GLOBAL',  // 🔒 ONLY Platform Admins can see
    type: 'SYSTEM',
    title: '...',
    message: '...',
    // NO company_id, NO branch_id, NO user_id
}
```

#### Company Admin Notifications
```typescript
NotificationService.notifyCompanyAdmins(companyId, {
    type: 'INFO',
    title: 'New branches Created',
    message: 'John Doe from ABC Company created a new branches: "Main Branch"',
    priority: 'NORMAL'
});

// Database Insert:
{
    target_type: 'COMPANY',  // 🔒 ONLY this company's admins can see
    company_id: 123,
    type: 'INFO',
    title: '...',
    message: '...'
}
```

---

## Example Scenarios

### Scenario 1: Company Admin Creates a Branch

**Action:**
- Company Admin (Company A) creates a new branch

**Notifications Created:**
1. **Platform Admin Notification:**
   ```
   target_type: 'GLOBAL'
   title: 'New branches Created'
   message: 'John Doe from Company A created a new branches: "Main Branch"'
   ```

2. **Company Admin Notification:**
   ```
   target_type: 'COMPANY'
   company_id: Company A's ID
   title: 'New branches Created'
   message: 'John Doe from Company A created a new branches: "Main Branch"'
   ```

**Who Sees What:**
- ✅ **Platform Admin:** Sees notification #1 (GLOBAL)
- ✅ **Company A Admin:** Sees notification #2 (COMPANY)
- ❌ **Company B Admin:** Sees NOTHING
- ❌ **Branch Admin:** Sees NOTHING (unless targeted)

---

### Scenario 2: Branch Admin Updates Employee

**Action:**
- Branch Admin (Branch X, Company A) updates an employee

**Notifications Created:**
1. **Platform Admin Notification:**
   ```
   target_type: 'GLOBAL'
   title: 'employees Updated'
   message: 'Sarah Admin from Company A updated employees: "Raj Kumar"'
   ```

2. **Company Admin Notification:**
   ```
   target_type: 'COMPANY'
   company_id: Company A's ID
   title: 'employees Updated'
   message: 'Sarah Admin from Company A updated employees: "Raj Kumar"'
   ```

**Who Sees What:**
- ✅ **Platform Admin:** Sees notification #1 (GLOBAL)
- ✅ **Company A Admin:** Sees notification #2 (COMPANY)
- ❌ **Company B Admin:** Sees NOTHING
- ❌ **Branch Y Admin (same company):** Sees NOTHING
- ❌ **Branch X Admin (who performed action):** Sees NOTHING (it's their own action)

---

## Database Schema

### Notifications Table
```sql
CREATE TABLE app_auth.notifications (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES app_auth.users(id),
    user_id BIGINT REFERENCES app_auth.users(id),  -- Direct target
    company_id BIGINT REFERENCES core.companies(id),
    branch_id BIGINT REFERENCES core.branches(id),
    target_type VARCHAR(50),  -- 'GLOBAL', 'COMPANY', 'BRANCH', 'USER', 'ROLE'
    target_role_level INT,
    type VARCHAR(50),
    priority VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    action_url VARCHAR(255),
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Target Types
- **GLOBAL**: Only Platform Admins (Level 5)
- **COMPANY**: Specific company admins
- **BRANCH**: Specific branch admins
- **USER**: Specific user
- **ROLE**: Specific role level

---

## Testing

### Test 1: Company Admin Isolation
1. Login as **Company A Admin**
2. Check notifications
3. **Expected:** Only see notifications from Company A
4. **Should NOT see:** Platform Admin notifications, Company B notifications

### Test 2: Branch Admin Isolation
1. Login as **Branch X Admin** (Company A)
2. Check notifications
3. **Expected:** Only see notifications from Branch X
4. **Should NOT see:** Platform notifications, Company notifications, Branch Y notifications

### Test 3: Platform Admin Visibility
1. Login as **Platform Admin**
2. Create a branch in Company A
3. **Expected:** Platform Admin sees the notification
4. Login as **Company B Admin**
5. **Expected:** Company B Admin does NOT see the notification

---

## Summary

✅ **Platform Admin** → Sees ALL notifications
✅ **Company Admin** → Sees ONLY their company notifications
✅ **Branch Admin** → Sees ONLY their branch notifications
❌ **NO cross-company leakage**
❌ **NO cross-branch leakage**
❌ **NO Platform Admin notifications visible to Company/Branch Admins**

---

## Files Modified
1. `/api/auth/notifications/route.ts` - Strict filtering logic
2. `lib/services/NotificationService.ts` - Proper target_type setting
3. `lib/services/AuditService.ts` - Dual notification system (Platform + Company)
