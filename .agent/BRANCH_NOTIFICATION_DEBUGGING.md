# Branch Admin Notification Debugging Guide

## Issue
Branch Admins see "Failed to sync signals" error at `/branch/notifications`

## Changes Made

### 1. **Relaxed Backend Filters** (`backend/app/api/auth/notifications/route.ts`)
- Branch Admins can now see company-wide notifications
- Removed overly strict `company_id` checks
- Added legacy notification support

### 2. **Enhanced Error Logging** (Backend)
```typescript
if (error) {
    console.error(`❌ [NOTIFICATIONS] Database Error for user ${userId}:`, error);
    console.error(`❌ [NOTIFICATIONS] Error details:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
    });
}
```

### 3. **Better Error Messages** (Frontend)
Updated `NotificationsView.tsx` to show actual error instead of generic message:

```typescript
catch (error: any) {
    console.error('[NotificationsView] Failed to load notifications:', error);
    const errorMessage = error?.response?.data?.error || error?.message || "Failed to sync signals";
    toast.error(errorMessage, {
        description: error?.response?.data?.message || 'Please check your connection and try again'
    });
}
```

---

## How to Debug

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error: `[NotificationsView] Failed to load notifications:`
4. Note the error message and details

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Refresh `/branch/notifications` page
3. Look for request to `/api/auth/notifications`
4. Check:
   - Status code (should be 200)
   - Response body
   - Error message if any

### Step 3: Check Backend Console
1. Look at the backend terminal where `npm run dev` is running
2. Look for logs:
   - `✅ [NOTIFICATIONS] Fetched X notifications for user Y (Level 1)`
   - OR `❌ [NOTIFICATIONS] Database Error...`
3. Note any error details

---

## Common Issues & Solutions

### Issue 1: "Branch Admin must have branch assignment"
**Cause:** User doesn't have `branch_id` in their session

**Solution:**
1. Check user's `user_roles` table - ensure `branch_id` is set
2. Re-login to refresh session
3. Check `getUserTenantScope()` function

### Issue 2: Database Query Error
**Cause:** Invalid SQL query or missing table

**Solution:**
1. Check backend console for exact error
2. Verify `app_auth.notifications` table exists
3. Check if filters are valid SQL

### Issue 3: Empty Response (No Notifications)
**Cause:** No notifications exist for this branch

**Solution:**
1. This is NORMAL if no notifications have been created
2. Create a test notification:
   ```bash
   POST /api/auth/notifications
   {
       "target_type": "COMPANY",
       "company_id": 1,
       "title": "Test Notification",
       "message": "This is a test",
       "category": "INFORMATION",
       "priority": "NORMAL"
   }
   ```

### Issue 4: CORS Error
**Cause:** Frontend can't reach backend

**Solution:**
1. Verify backend is running on `localhost:3000`
2. Verify frontend is running on `localhost:3001`
3. Check `next.config.js` proxy settings

---

## Testing Steps

### Test 1: Login as Branch Admin
```bash
1. Login as Branch Admin
2. Navigate to /branch/notifications
3. Check browser console for errors
4. Check backend console for logs
```

### Test 2: Create Test Notification
```bash
# As Platform Admin or Company Admin
POST /api/auth/notifications
{
    "target_type": "COMPANY",
    "company_id": 1,  # Branch Admin's company
    "title": "Test Company Notification",
    "message": "This should appear for all Branch Admins in Company 1",
    "category": "INFORMATION",
    "priority": "NORMAL"
}
```

### Test 3: Verify Notification Appears
```bash
1. Refresh /branch/notifications
2. Should see the test notification
3. Should NOT see "Failed to sync signals" error
```

---

## Expected Behavior

### ✅ Success:
- Page loads without errors
- Shows "Stream Silence" if no notifications exist
- Shows list of notifications if they exist
- Backend logs: `✅ [NOTIFICATIONS] Fetched X notifications for user Y (Level 1)`

### ❌ Failure:
- Toast error appears
- Browser console shows error
- Backend console shows database error
- Page shows loading state indefinitely

---

## Files Modified
1. ✅ `backend/app/api/auth/notifications/route.ts` - Relaxed filters, added logging
2. ✅ `frontend/src/components/notifications/NotificationsView.tsx` - Better error handling

---

## Next Steps

1. **Refresh the page** and check what error appears now
2. **Check browser console** for detailed error
3. **Check backend console** for database errors
4. **Share the error message** so we can fix the root cause

The error message should now be more specific and help us identify the exact problem!
