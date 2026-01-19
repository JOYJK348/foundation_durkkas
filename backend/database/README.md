# 🗄️ DATABASE SCHEMAS - DEPLOYMENT ORDER

**Durkkas ERP Multi-Tenant Backend**  
**Production-Ready | Enterprise-Grade | High Security**

---

## 📋 SQL FILES (Run in this exact order)

### **1. Initialization**
```
00_init.sql
```
- Creates PostgreSQL extensions
- Creates all schemas (core, app_auth, hrms, ems, finance, crm)
- Sets search paths

---

### **2. Core Schema (Foundation)**
```
01_core_schema.sql
```
**Tables:**
- ✅ companies (multi-tenant root)
- ✅ branches
- ✅ departments
- ✅ designations
- ✅ employees (master record)
- ✅ countries, states, cities (global data)

**Purpose:** Organizational foundation for all tenants

---

### **3. Auth Schema (Security)**
```
02_auth_schema.sql
```
**Tables:**
- ✅ users (authentication)
- ✅ roles (with level hierarchy)
- ✅ permissions (granular access)
- ✅ user_roles (multi-tenant scope)
- ✅ role_permissions
- ✅ menu_registry (navigation)
- ✅ menu_permissions
- ✅ audit_logs (security trail)
- ✅ login_history

**Functions:**
- ✅ get_user_tenant_scope()
- ✅ can_access_company()
- ✅ get_user_permissions()
- ✅ get_user_menus()

**Security:**
- ✅ Trigger validation for Company Admin (must have company_id)
- ✅ Platform Admin (Level 5) vs Company Admin (Level 4)
- ✅ Row Level Security (RLS) policies

---

### **4. HRMS Schema (Human Resources)**
```
03_hrms_schema.sql
```
**Tables:**
- ✅ attendance
- ✅ leave_types, leaves
- ✅ salary_components, employee_salary, payroll
- ✅ job_openings, candidates, job_applications, interviews
- ✅ appraisal_cycles, performance_reviews

**All tables:** Multi-tenant enabled (company_id)

---

### **5. EMS Schema (Education Management)**
```
04_ems_schema.sql
```
**Tables:**
- ✅ students
- ✅ courses
- ✅ batches
- ✅ enrollments
- ✅ teacher_assignments (references core.employees)

**All tables:** Multi-tenant enabled (company_id)

---

### **6. Finance Schema**
```
05_finance_schema.sql
```
**Tables:**
- ✅ invoices
- ✅ payments

**All tables:** Multi-tenant enabled (company_id)

---

### **7. CRM Schema (Customer Relationship)**
```
06_crm_schema.sql
```
**Tables:**
- ✅ leads
- ✅ followups

**All tables:** Multi-tenant enabled (company_id)

---

### **8. Soft Delete (Business Data Only)**
```
08_soft_delete_business_data.sql
```
**Adds to ALL business tables:**
- ✅ deleted_at TIMESTAMPTZ
- ✅ deleted_by BIGINT
- ✅ delete_reason TEXT

**Functions:**
- ✅ soft_delete_record()
- ✅ restore_deleted_record()

**Indexes:**
- ✅ Partial indexes on deleted_at for performance

**Important:**
- ❌ Auth tables NOT included (users, roles, permissions use is_active)
- ✅ Only business data tables (employees, students, invoices, etc.)

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Open Supabase SQL Editor**
1. Go to your Supabase project
2. Click "SQL Editor" in sidebar
3. Click "New Query"

### **Step 2: Run SQL Files in Order**
```sql
-- Run these in exact order:
1. 00_init.sql
2. 01_core_schema.sql
3. 02_auth_schema.sql
4. 03_hrms_schema.sql
5. 04_ems_schema.sql
6. 05_finance_schema.sql
7. 06_crm_schema.sql
8. 08_soft_delete_business_data.sql
```

### **Step 3: Verify**
```sql
-- Check all schemas exist
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name IN ('core', 'app_auth', 'hrms', 'ems', 'finance', 'crm');

-- Check demo companies
SELECT * FROM core.companies;

-- Check roles
SELECT * FROM app_auth.roles ORDER BY level DESC;

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'app_auth' AND routine_type = 'FUNCTION';
```

---

## 📊 DATABASE STRUCTURE

```
┌─────────────────────────────────────────────┐
│           MULTI-TENANT ARCHITECTURE         │
└─────────────────────────────────────────────┘

┌─────────────────┐
│  CORE SCHEMA    │ ← Foundation (Multi-tenant Root)
│  - companies    │ ← Tenant isolation starts here
│  - branches     │
│  - employees    │ ← Master record for all modules
└─────────────────┘
         ↓
┌─────────────────┐
│  APP_AUTH       │ ← Security & Access Control
│  - users        │
│  - roles        │ ← Level 5 (Platform) vs Level 4 (Company)
│  - permissions  │
│  - user_roles   │ ← company_id scoping
└─────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  BUSINESS MODULES (All Multi-tenant)       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  HRMS   │ │   EMS   │ │ FINANCE │      │
│  │  - HR   │ │ - Edu   │ │ - Bills │      │
│  │  - Pay  │ │ - Stu   │ │ - Pay   │      │
│  └─────────┘ └─────────┘ └─────────┘      │
│  ┌─────────┐                               │
│  │   CRM   │                               │
│  │ - Leads │                               │
│  └─────────┘                               │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────┐
│  SOFT DELETE    │ ← Data Protection
│  - Never lose   │
│  - Can restore  │
│  - Audit trail  │
└─────────────────┘
```

---

## 🔐 SECURITY FEATURES

### **Multi-Tenant Isolation:**
- ✅ Platform Admin (Level 5) → Access ALL companies
- ✅ Company Admin (Level 4) → Access ONLY their company
- ✅ Database trigger enforces company_id for Company Admins
- ✅ All business tables have company_id foreign key

### **Soft Delete:**
- ✅ Business data never actually deleted
- ✅ Complete audit trail (who, when, why)
- ✅ Can restore anytime
- ✅ Auth tables use is_active flag instead

### **Audit Trail:**
- ✅ audit_logs table tracks all critical actions
- ✅ login_history tracks authentication
- ✅ Soft delete logs to audit_logs
- ✅ All tables have created_by, updated_by

---

## 📝 NOTES

### **Why this order?**
1. **00_init.sql** - Must run first (creates schemas)
2. **01_core_schema.sql** - Foundation (companies table is root)
3. **02_auth_schema.sql** - Security (references core.companies)
4. **03-07** - Business modules (reference core tables)
5. **08_soft_delete** - Enhancement (alters existing tables)

### **Auth Tables vs Business Tables:**
- **Auth tables** (users, roles, permissions):
  - Use `is_active = FALSE` to deactivate
  - Never soft delete (security audit requirement)
  - Must retain forever for compliance

- **Business tables** (employees, students, invoices):
  - Use soft delete (deleted_at, deleted_by, delete_reason)
  - Can restore if needed
  - Compliance-friendly data retention

---

## ✅ VERIFICATION CHECKLIST

After running all SQL files:

- [ ] All 6 schemas created (core, app_auth, hrms, ems, finance, crm)
- [ ] Demo companies exist (ABC School, XYZ College)
- [ ] Roles created (PLATFORM_ADMIN level 5, COMPANY_ADMIN level 4)
- [ ] Functions exist (get_user_tenant_scope, can_access_company, etc.)
- [ ] Soft delete columns added to business tables
- [ ] Soft delete functions created (soft_delete_record, restore_deleted_record)
- [ ] Indexes created for performance
- [ ] Triggers active (validate_user_role_scope, update_updated_at)

---

**🚀 Database is now production-ready for multi-tenant SaaS deployment!**

**Total Tables:** 40+ tables across 6 schemas  
**Security:** Enterprise-grade with RLS, triggers, and audit trail  
**Data Protection:** Soft delete for business data  
**Scalability:** Unlimited companies, optimized indexes
