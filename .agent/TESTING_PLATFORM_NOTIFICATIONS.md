# Testing Platform Admin Real-Time Notifications

## Test Scenarios

### Test 1: Company Admin Creates a Branch
**Steps:**
1. Login as Company Admin (e.g., `admin@company.com`)
2. Navigate to Branches → Create New Branch
3. Fill in branch details:
   - Name: "Test Branch"
   - Code: "TB001"
   - Address: "123 Test Street"
   - Select company
4. Click "Create Branch"

**Expected Results:**
- ✅ Branch created successfully
- ✅ Platform Admin receives notification in bell icon
- ✅ Platform Admin sees toast notification: "New branches created - admin@company.com created a new branches at [time]"
- ✅ Entry appears in Platform Admin's Audit Logs page within 5 seconds
- ✅ Audit log shows: CREATE | branches | Company Admin email | IP address

---

### Test 2: Branch Admin Updates Employee
**Steps:**
1. Login as Branch Admin
2. Navigate to Employees → Select an employee
3. Update employee details (e.g., change designation or salary)
4. Click "Update Employee"

**Expected Results:**
- ✅ Employee updated successfully
- ✅ Platform Admin receives notification
- ✅ Platform Admin sees toast: "employees updated - branchadmin@company.com modified employees at [time]"
- ✅ Audit log shows: UPDATE | employees | Branch Admin email | Before/After data

---

### Test 3: Company Admin Deletes Department
**Steps:**
1. Login as Company Admin
2. Navigate to Departments
3. Delete a department
4. Confirm deletion

**Expected Results:**
- ✅ Department deleted
- ✅ Platform Admin receives HIGH priority notification
- ✅ Platform Admin sees RED toast: "departments deleted - admin@company.com deleted departments at [time]"
- ✅ Audit log shows: DELETE | departments | RED indicator

---

### Test 4: User Login/Logout
**Steps:**
1. Login as any user (Company Admin, Branch Admin, etc.)
2. Perform some actions
3. Logout

**Expected Results:**
- ✅ Platform Admin sees LOGIN toast when user logs in
- ✅ Platform Admin sees LOGOUT toast when user logs out
- ✅ Both events appear in audit logs with correct IP addresses

---

## Verification Checklist

### Platform Admin Dashboard
- [ ] Notification bell shows unread count
- [ ] Clicking bell opens notification dropdown
- [ ] Notifications show correct details (who, what, when, where)
- [ ] Audit Logs page shows "LIVE SYNC" badge with pulsing indicator
- [ ] Event counter shows total number of events
- [ ] Registry Heartbeat updates every 5 seconds
- [ ] Toast notifications appear automatically
- [ ] Toast colors match action types:
  - [ ] Green for CREATE
  - [ ] Blue for UPDATE
  - [ ] Red for DELETE
  - [ ] Indigo for LOGIN
  - [ ] Gray for LOGOUT

### Audit Log Table
- [ ] Shows all events in chronological order (newest first)
- [ ] Displays correct timestamp (local time)
- [ ] Shows actor email
- [ ] Shows action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- [ ] Shows resource type (branches, employees, etc.)
- [ ] Shows IP address
- [ ] Shows user agent (browser/device info)
- [ ] Search filter works
- [ ] Time period filter works
- [ ] Tenant scope filter works

### Real-Time Updates
- [ ] New events appear within 5 seconds
- [ ] No page refresh required
- [ ] Toast notifications don't interfere with UI
- [ ] Multiple toasts stack properly
- [ ] Toasts auto-dismiss after duration
- [ ] Console logs show sync activity

---

## Debugging

### If notifications don't appear:
1. Check browser console for errors
2. Verify backend is running (`npm run dev` in backend folder)
3. Check backend console for audit log entries: `✅ [AUDIT SERVICE] Event Registered`
4. Verify CORS headers are correct (should include Cache-Control, Pragma)
5. Check notification store is fetching: Look for `[NotificationStore]` logs

### If audit logs don't update:
1. Check browser Network tab for `/api/auth/audit-logs` requests
2. Verify requests are made every 5 seconds
3. Check response contains new data
4. Verify cache-busting timestamp is appended to URL
5. Check for CORS errors

### If toasts don't show:
1. Verify `sonner` toast library is installed
2. Check for React errors in console
3. Verify `syncLogsSilent` function is being called
4. Check console for "Live Sync Delta" messages
5. Ensure `mounted` state is true

---

## Performance Monitoring

### Expected Behavior:
- **Polling Interval**: Exactly 5 seconds between requests
- **Request Size**: ~10-50KB depending on number of logs
- **Response Time**: <200ms for audit logs API
- **Memory Usage**: Should remain stable (no memory leaks)
- **CPU Usage**: Minimal (polling is lightweight)

### Monitor in Browser DevTools:
1. Open Network tab
2. Filter by "audit-logs"
3. Watch for requests every 5 seconds
4. Check response times
5. Verify cache headers are set correctly

---

## Success Criteria

✅ **All CRUD operations** by Company/Branch Admins trigger notifications
✅ **Platform Admin** sees real-time toast alerts
✅ **Audit logs** update automatically within 5 seconds
✅ **Notification bell** shows unread count
✅ **No manual refresh** required
✅ **Action-specific styling** (colors/icons) works correctly
✅ **IP addresses** are captured accurately
✅ **User context** (email, role) is correct
✅ **Company scope** is tracked properly
✅ **System is stable** (no errors, no memory leaks)
