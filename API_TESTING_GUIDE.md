# 🏁 Durkkas ERP - Ultimate API Documentation (Master List)

This is the comprehensive API guide for the testing team. It covers all active modules except EMS and HRMS.

---

## 🔒 Security & Headers
**Base URL:** `https://foundation-durkkas.vercel.app/api` (Production)

| Header | Required | Value |
|--------|----------|-------|
| `Authorization` | Yes | `Bearer <JWT_TOKEN>` |
| `x-device-fingerprint` | Yes | Device hardware ID |
| `x-durkkas-client-ip` | Yes | Client's Public IP |
| `x-company-id` | Optional | For tenant-specific overrides |

---

## 1. 🔑 Auth & Identity (IAM)

### Authentication
- `POST /auth/login` - Authenticate user (Email/Password)
- `POST /auth/logout` - Invalidate current session
- `POST /auth/forgot-password` - Trigger recovery email
- `GET /auth/me` - Get current session & user details
- `GET /auth/login-history` - Audit log of user's sign-in activity

### Profile & Notifications
- `GET /auth/notifications` - Fetch user's notification feed
- `GET /auth/feature-access` - Check module & feature flags

### User & Role Management
- `GET /auth/users` - List all users
- `POST /auth/users` - Create new user
- `GET /auth/users/[id]` - Get single user details
- `PUT /auth/users/[id]` - Update user profile
- `GET /auth/roles` - List available system roles
- `GET /auth/user-roles` - List roles assigned to a specific user
- `POST /auth/user-roles` - Assign roles to a user

### Permissions & Menus
- `GET /auth/permissions` - List all system permissions
- `GET /auth/role-permissions` - Get permissions mapped to a role
- `GET /auth/user-permissions` - Get final flattened permissions for current user
- `GET /auth/menus` - Get system side-bar menu structure
- `GET /auth/company-menus` - Get tenant-specific menu overrides
- `POST /auth/company-menus` - Update tenant menu configuration

---

## 2. 🏢 Core Enterprise Module

### Organization Structure
- `GET /core/companies` - List all registered companies
- `POST /core/companies` - Register new company
- `GET /core/companies/[id]` - Get company profile
- `PUT /core/companies/[id]` - Update company details
- `GET /core/branches` - List all branches in current tenant
- `POST /core/branches` - Create new branch
- `GET /core/branches/[id]` - Get branch details

### Workforce
- `GET /core/employees` - List all employees
- `POST /core/employees` - Onboard new employee
- `POST /core/employees/onboard` - Trigger employee onboarding workflow
- `GET /core/employees/[id]` - Get employee profile
- `PATCH /core/employees/[id]` - Partial update employee data

### Masters & Metadata
- `GET /core/departments` - List organization departments
- `GET /core/designations` - List employee designations
- `GET /core/academic-years` - List academic sessions (for EMS bridge)
- `GET /core/countries` - List all countries
- `GET /core/states` - List states (filter by country)
- `GET /core/cities` - List cities (filter by state)
- `GET /core/locations` - List physical map locations

### Governance
- `GET /core/global-settings` - List system-wide configurations
- `GET /core/entity-limits` - Check current entity counts vs plan limits
- `GET /auth/audit-logs` - View system transaction logs

---

## 3. 🎯 CRM & Relationship Module (Extended)

### Dashboard & Analytics
- `GET /crm/stats` - Summary counts (Leads, Conversions, Pending)
- `GET /crm/recent-leads` - Fetch latest 10-20 lead activities

### Lead Management (Auth Required)
- `GET /crm/leads` - Full leading listing with filtering and pagination
- `GET /crm/leads/[id]` - Get detailed info for a single lead
- `PUT /crm/leads/[id]` - Update lead status or details
- `DELETE /crm/leads/[id]` - Archive a lead

### Application Management (Auth Required)
- `GET /crm/applications/[type]` - List applications by type (e.g., `internship`, `vendor`)
- `GET /crm/applications/[type]/[id]` - View details of a specific application
- `PUT /crm/applications/[type]/[id]` - Update application status (Approve/Reject)
- `DELETE /crm/applications/[type]/[id]` - Archive an application

### Data Recovery & Maintenance
- `GET /crm/archives` - View all archived/deleted leads and applications
- `POST /crm/restore` - Restore an archived record back to active
- `GET /crm/debug-schema` - Check database schema alignment for CRM

### Public Intake (Forms - No Auth Required)
These endpoints accept form submissions from the public website.
- `POST /crm/applications/internship` - Internship application submission
- `POST /crm/applications/job-seeker` - Career/Job application submission
- `POST /crm/applications/vendor` - Vendor enrollment/partnership
- `POST /crm/applications/partner` - Business associate/franchise form
- `POST /crm/applications/course-enquiry` - General education enquiry
- `POST /crm/applications/career-guidance` - Psychometric/Counseling request

---

## 4. 🌐 Platform Admin & Usage

### Branding & White-labeling
- `GET /platform/branding` - Get global platform theme
- `PUT /platform/branding` - Update platform colors/logos
- `GET /platform/branding/company/[companyId]` - Get tenant-specific branding
- `PUT /platform/branding/company/[companyId]` - Update tenant branding

### Usage & Billing
- `GET /platform/usage` - Global usage monitoring
- `GET /platform/usage/[companyId]` - Detailed usage stats for a specific tenant
- `GET /platform/limits` - View system-wide ceiling limits
- `GET /platform/subscriptions` - View active tenant subscriptions
- `GET /platform/subscription-templates` - List available plan tiers (Basic, Enterprise, etc.)

---

## 5. 🛠️ Utilities & System

### Binary & Media
- `POST /api/upload` - Secure file upload (Returns public URL)

### Health & Monitoring
- `GET /health` - System health check (API + DB + Redis)

---

## 💡 Important Testing Instructions
1. **Multitenancy:** Use `x-company-id` header if you want to test as a specific company admin while logged in as a Super Admin.
2. **Audit Verification:** After every POST/PUT/DELETE, verify that an entry was created in `GET /auth/audit-logs`.
3. **Session Management:** Test `POST /auth/logout` to ensure the token is invalidated in the Redis store.
4. **CRM Lead Conversion:** Test updating a lead status to 'CONVERTED' and check if it triggers a notification.
