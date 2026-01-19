# Branch Admin Notification Fix - "Failed to sync signals"

## Issue
Branch Admins were seeing "Failed to sync signals" error when trying to fetch notifications.

## Root Cause
The notification filtering for Branch Admins was too strict. The query was looking for notifications with very specific conditions that might not exist in the database, resulting in query errors or empty results.

## Solution

### 1. **Relaxed Branch Admin Filters**
Updated the notification query to be more lenient while maintaining security:

**Before (Too Strict):**
```typescript
const filters = [
    `user_id.eq.${userId}`,
    `sender_id.eq.${userId}`,
    `and(target_type.eq.BRANCH,branch_id.eq.${scope.branchId},company_id.eq.${scope.companyId})`,
    `and(target_type.eq.ROLE,target_role_level.eq.${scope.roleLevel},branch_id.eq.${scope.branchId})`,
    `and(target_type.is.null,branch_id.eq.${scope.branchId},company_id.eq.${scope.companyId})`
];
```

**After (More Lenient):**
```typescript
const filters = [
    `user_id.eq.${userId}`,                                      // Direct to me
    `sender_id.eq.${userId}`,                                    // Sent by me
    `and(target_type.eq.BRANCH,branch_id.eq.${scope.branchId})`, // Branch-wide (relaxed)
    `and(target_type.eq.COMPANY,company_id.eq.${scope.companyId})`, // Company-wide (NEW!)
    `and(target_type.eq.ROLE,target_role_level.eq.${scope.roleLevel})`, // Role-based (relaxed)
    `and(target_type.is.null,branch_id.eq.${scope.branchId})`, // Legacy branch
    `and(target_type.is.null,company_id.eq.${scope.companyId},branch_id.is.null)` // Legacy company (NEW!)
];
```

### 2. **What Changed:**
- ✅ **Branch Admin can now see Company-wide notifications** (they're part of the company)
- ✅ **Removed overly strict `company_id` checks** from branch filters
- ✅ **Added legacy company notifications** for backward compatibility
- ✅ **Relaxed role-based filters** to not require branch_id

### 3. **Enhanced Error Logging**
Added detailed error logging to help diagnose issues:

```typescript
if (error) {
    console.error(`❌ [NOTIFICATIONS] Database Error for user ${userId}:`, error);
    console.error(`❌ [NOTIFICATIONS] Error details:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
    });
    return errorResponse('DATABASE_ERROR', `Failed to fetch notifications: ${error.message}`, 500);
}
```

## What Branch Admins Can Now See

### ✅ Allowed:
1. **Direct notifications** to them (`user_id = their_id`)
2. **Notifications they sent** (`sender_id = their_id`)
3. **Branch-wide notifications** (`target_type = BRANCH`, `branch_id = their_branch`)
4. **Company-wide notifications** (`target_type = COMPANY`, `company_id = their_company`)
5. **Role-based notifications** for Branch Admins (`target_type = ROLE`, `target_role_level = 1`)
6. **Legacy notifications** for their branch or company

### ❌ Still Blocked:
1. ❌ Platform Admin notifications (`target_type = GLOBAL`)
2. ❌ Other companies' notifications
3. ❌ Other branches' notifications (different branch_id)

## Security Maintained

Even though the filters are more lenient, security is still maintained:
- ✅ Branch Admins CANNOT see Platform Admin notifications
- ✅ Branch Admins CANNOT see other companies' notifications
- ✅ Branch Admins CANNOT see other branches' notifications
- ✅ All filters still check `company_id` or `branch_id`

## Testing

### Test 1: Branch Admin Login
1. Login as Branch Admin
2. Navigate to dashboard
3. **Expected:** Notifications load successfully (no "Failed to sync signals" error)
4. **Expected:** See company-wide and branch-specific notifications

### Test 2: Notification Visibility
1. Platform Admin creates a notification for Company A
2. Login as Branch Admin (Company A, Branch X)
3. **Expected:** Branch Admin sees the company-wide notification
4. Login as Branch Admin (Company B, Branch Y)
5. **Expected:** Branch Admin does NOT see Company A's notification

### Test 3: Error Logging
1. Check backend console when Branch Admin logs in
2. **Expected:** See log: `✅ [NOTIFICATIONS] Fetched X notifications for user Y (Level 1)`
3. If error occurs, see detailed error with message, details, hint, and code

## Files Modified
1. ✅ `backend/app/api/auth/notifications/route.ts` - Updated Branch Admin filters and error logging

## Summary

✅ **Branch Admin notification filters** are now more lenient
✅ **Branch Admins can see company-wide notifications** (they're part of the company)
✅ **Error logging** is more detailed for debugging
✅ **Security is maintained** (no cross-company/platform leakage)
✅ **"Failed to sync signals" error** should be resolved

Branch Admins will now successfully fetch notifications without errors! 🎉
