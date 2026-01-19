# Platform Admin Real-Time Audit & Notification System

## Overview
The Platform Admin dashboard now receives **real-time notifications** for ALL CRUD operations performed by Company Admins and Branch Admins across the entire system.

## How It Works

### 1. **Automatic Audit Logging**
Every API endpoint that performs CREATE, UPDATE, or DELETE operations automatically calls:
```typescript
await AuditService.logAction({
    userId,
    userEmail,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    tableName: 'branches' | 'employees' | 'companies' | etc.,
    recordId: record.id,
    oldData: previousData,  // For UPDATE/DELETE
    newData: newData,       // For CREATE/UPDATE
    companyId: company_id,
    ipAddress: AuditService.getIP(req),
    userAgent: req.headers.get('user-agent')
});
```

### 2. **Dual Notification System**
When `AuditService.logAction()` is called, it triggers TWO notifications:

#### A. Platform Admin Notification
```typescript
NotificationService.notifyPlatformAdmins({
    type: 'SYSTEM',
    title: `System Event: ${action}`,
    message: `${userEmail} created/updated/deleted ${resource} "${recordName}" in ${companyName}`,
    priority: action === 'DELETE' ? 'HIGH' : 'NORMAL',
    sourceCompanyId: companyId,
    sourceCompanyName: companyName
});
```

#### B. Company Admin Notification
```typescript
NotificationService.notifyCompanyAdmins(companyId, {
    type: 'INFO',
    title: `Resource Updated: ${resource}`,
    message: `${userEmail} has successfully ${action}d new ${resource} "${recordName}"`,
    priority: 'NORMAL'
});
```

### 3. **Real-Time Toast Alerts**
The Platform Admin's Audit Logs page polls every **5 seconds** and shows instant toast notifications:

- **CREATE** → Green success toast with shield icon
- **UPDATE** → Blue info toast with alert icon
- **DELETE** → Red error toast with X icon
- **LOGIN** → Indigo success toast with lock icon
- **LOGOUT** → Gray toast with lock icon

## Monitored Operations

### Core Module (Company & Branch Admins can perform)
✅ **Companies**
- CREATE: New company registration
- UPDATE: Company details modification
- DELETE: Company removal

✅ **Branches**
- CREATE: New branch creation
- UPDATE: Branch details modification
- DELETE: Branch removal

✅ **Employees**
- CREATE: New employee onboarding
- UPDATE: Employee profile updates
- DELETE: Employee removal

✅ **Departments**
- CREATE: New department
- UPDATE: Department modification
- DELETE: Department removal

✅ **Designations**
- CREATE: New designation
- UPDATE: Designation modification
- DELETE: Designation removal

✅ **Academic Years**
- CREATE: New academic year
- UPDATE: Academic year modification
- DELETE: Academic year removal

### Auth Module
✅ **Users**
- CREATE: New user account
- UPDATE: User profile/role changes
- DELETE: User account removal

✅ **Roles**
- CREATE: New role definition
- UPDATE: Role modification
- DELETE: Role removal

✅ **Permissions**
- CREATE: New permission
- UPDATE: Permission modification
- DELETE: Permission removal

✅ **User Roles**
- CREATE: Role assignment to user
- DELETE: Role removal from user

✅ **Role Permissions**
- CREATE: Permission assignment to role
- DELETE: Permission removal from role

### Location Data
✅ **Countries, States, Cities, Locations**
- CREATE, UPDATE, DELETE operations

### Global Settings
✅ **System Configuration**
- UPDATE: Any global setting changes

## Platform Admin Dashboard Features

### 1. **Audit Logs Page** (`/platform/audit-logs`)
- **Live Sync Badge**: Shows "LIVE SYNC" with pulsing indicator
- **Event Counter**: Displays total number of events
- **Registry Heartbeat**: Shows last sync timestamp
- **Auto-Refresh**: Updates every 5 seconds
- **Toast Notifications**: Pop-up alerts for new events
- **Search & Filter**: Filter by actor, action, IP, or resource
- **Time Period Filter**: Last 24 hours, Past 7 days, Current month
- **Tenant Scope Filter**: All tenants or System only

### 2. **Notification Bell** (Top Navigation)
- Real-time notification count
- Dropdown list of recent system events
- Click to view full notification details
- Auto-updates when new events occur

## Example Scenarios

### Scenario 1: Company Admin Creates a Branch
1. Company Admin logs into their dashboard
2. Navigates to Branches → Create New Branch
3. Fills in branch details and submits
4. **Backend Actions:**
   - Branch record created in database
   - `AuditService.logAction()` called with action='CREATE'
   - Notification sent to Platform Admins
   - Notification sent to Company Admins
5. **Platform Admin Sees:**
   - Toast notification: "New branches created - admin@company.com created a new branches at 10:30:45"
   - Entry appears in Audit Logs table
   - Notification bell count increases
   - Notification appears in dropdown

### Scenario 2: Branch Admin Updates Employee
1. Branch Admin edits employee profile
2. Updates salary/designation/department
3. **Backend Actions:**
   - Employee record updated
   - `AuditService.logAction()` called with action='UPDATE', oldData, newData
   - Notifications triggered
4. **Platform Admin Sees:**
   - Toast notification: "employees updated - branchadmin@company.com modified employees at 11:15:22"
   - Audit log entry with before/after data
   - Notification in bell dropdown

### Scenario 3: Company Admin Deletes Department
1. Company Admin removes a department
2. **Backend Actions:**
   - Department record deleted
   - `AuditService.logAction()` called with action='DELETE', priority='HIGH'
   - High-priority notifications sent
4. **Platform Admin Sees:**
   - **RED** toast notification: "departments deleted - admin@company.com deleted departments at 14:20:10"
   - Audit log entry marked as DELETE
   - High-priority notification in bell

## Technical Implementation

### Backend
- **Middleware**: `middleware.ts` - Injects user context (ID, email, roles) into every request
- **Audit Service**: `lib/services/AuditService.ts` - Handles logging and notification triggering
- **Notification Service**: `lib/services/NotificationService.ts` - Sends notifications to users
- **Database**: `app_auth.audit_logs` table stores all events with full context

### Frontend
- **Audit Logs Page**: `frontend/src/app/platform/audit-logs/page.tsx`
- **Polling Interval**: 5 seconds (recursive setTimeout for reliability)
- **Toast Library**: Sonner (for beautiful, customizable notifications)
- **State Management**: React hooks with functional updates

### API Endpoints
- **GET** `/api/auth/audit-logs` - Fetch all audit logs (with cache-busting)
- **GET** `/api/auth/notifications` - Fetch user notifications
- All CRUD endpoints automatically log to audit trail

## Security Features
- ✅ IP Address tracking (with proxy detection)
- ✅ User Agent logging
- ✅ User identity verification
- ✅ Company/Branch scope tracking
- ✅ Before/After data capture (for UPDATE operations)
- ✅ Immutable audit trail
- ✅ Real-time monitoring
- ✅ Multi-tenant isolation

## Performance Optimizations
- ✅ Cache-Control headers to prevent stale data
- ✅ Efficient database indexing on `created_at` and `company_id`
- ✅ Pagination support (50 entries per page)
- ✅ Silent background polling (no UI flicker)
- ✅ Optimized SQL queries with proper joins

## Future Enhancements (Optional)
- [ ] WebSocket integration for instant push notifications
- [ ] Email alerts for critical events
- [ ] SMS alerts for high-priority actions
- [ ] Export audit logs to CSV/PDF
- [ ] Advanced filtering (by date range, specific users, etc.)
- [ ] Audit log retention policies
- [ ] Compliance reports (GDPR, SOC2, etc.)

---

## Summary
**Every action** performed by Company Admins and Branch Admins is now:
1. ✅ Logged in the audit trail with full context
2. ✅ Sent as a notification to Platform Admins
3. ✅ Displayed in real-time on the Audit Logs page
4. ✅ Shown as a toast notification with action-specific styling
5. ✅ Visible in the notification bell dropdown

The Platform Admin has **complete visibility** into all system activities with **zero latency**.
