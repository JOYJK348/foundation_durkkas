# DURKKAS ERP - Master Database Setup Guide

## 📋 Complete DDL Execution Order

Run these files in **EXACT ORDER** for a fresh database setup:

### Phase 1: Foundation (MUST RUN FIRST)
1. `MASTER_01_init_and_core.sql` - Schemas, Extensions, Core Tables
2. `MASTER_02_auth_and_security.sql` - Authentication, RBAC, Security
3. `MASTER_03_business_modules.sql` - HRMS, EMS, Finance, CRM

### Phase 2: Enhancements (OPTIONAL - Run if needed)
4. `MASTER_04_seed_data.sql` - Demo companies, users, permissions
5. `MASTER_05_subscription_system.sql` - Subscription plans and access control

## ✅ What's Included

### All Tables
- Core: companies, branches, departments, designations, employees
- Auth: users, roles, permissions, user_roles, menu_registry, notifications
- HRMS: attendance, leaves, payroll, salary_components
- EMS: students, courses, batches, enrollments
- Finance: invoices, payments
- CRM: leads, followups

### All Features
- ✅ Multi-tenant isolation
- ✅ Soft delete on all business tables
- ✅ Automatic updated_at triggers
- ✅ Security validation triggers
- ✅ Subscription-based access control
- ✅ Comprehensive indexing
- ✅ Helper functions for tenant scope

### All Functions
- `app_auth.get_user_tenant_scope()`
- `app_auth.validate_user_role_scope()` (Security Trigger)
- `core.get_company_usage()`
- `core.can_add_resource()`
- `core.apply_subscription_to_company()`
- `core.get_company_allowed_menus()`

## 🚀 Quick Start

```sql
-- Run in PostgreSQL/Supabase SQL Editor
\i MASTER_01_init_and_core.sql
\i MASTER_02_auth_and_security.sql
\i MASTER_03_business_modules.sql
\i MASTER_04_seed_data.sql
\i MASTER_05_subscription_system.sql
```

## 📝 Notes
- All duplicate files removed
- All hotfixes integrated
- Production-ready constraints
- No missing triggers or functions
