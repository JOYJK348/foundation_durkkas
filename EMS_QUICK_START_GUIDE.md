# EMS Quick Start Guide
## Get Started in 5 Minutes

---

## 📋 Step 1: Run Database Setup

### Open Supabase SQL Editor and run these 2 files in order:

#### 1. Create Roles & Permission System
```sql
-- Copy and paste contents of: setup_ems_roles.sql
-- This creates:
-- - ACADEMIC_MANAGER role
-- - TUTOR role  
-- - STUDENT role
-- - tutor_permissions table
-- - academic_manager_settings table
```

#### 2. Create Test Accounts for AIPL
```sql
-- Copy and paste contents of: setup_ems_complete.sql
-- This creates:
-- - Academic Manager account
-- - Tutor account
-- - Student account
-- - Proper permissions
```

---

## 🔐 Step 2: Test Login

### Try logging in with these accounts:

#### Academic Manager
- **URL**: `http://localhost:3001/login`
- **Email**: `academic@aipl.com`
- **Password**: `Academic@2026`
- **Expected**: Should redirect to Academic Manager Dashboard

#### Tutor
- **URL**: `http://localhost:3001/login`
- **Email**: `tutor@aipl.com`
- **Password**: `Tutor@2026`
- **Expected**: Should redirect to Tutor Dashboard

#### Student
- **URL**: `http://localhost:3001/login`
- **Email**: `student@aipl.com`
- **Password**: `Student@2026`
- **Expected**: Should redirect to Student Dashboard

---

## 🎯 Step 3: Understand the Flow

### The Complete Academic Flow:

```
1. ACADEMIC MANAGER logs in
   └── Creates course: "Full Stack Development"
   └── Creates batch: "FSD-2026-Morning"
   └── Assigns tutor: Rajesh Kumar
   └── Enrolls student: Priya Sharma

2. TUTOR logs in
   └── Sees "Full Stack Development" in dashboard
   └── Creates assignment: "Build a Todo App"
   └── Assignment auto-linked to batch

3. STUDENT logs in
   └── Sees "Full Stack Development" (their course)
   └── Sees "FSD-2026-Morning" (their batch)
   └── Sees assignment: "Build a Todo App"
   └── Submits assignment
   └── Tutor grades it
   └── Student sees grade
```

**Everything flows automatically. No manual linking needed.**

---

## 🚀 Step 4: Start Building Dashboards

### Priority Order:

1. **Academic Manager Dashboard** (HIGHEST PRIORITY)
   - Location: `frontend/src/app/ems/academic-manager/dashboard/page.tsx`
   - Features:
     - Course management
     - Batch management
     - Tutor assignment
     - Student enrollment
     - Permission control

2. **Tutor Dashboard**
   - Location: `frontend/src/app/ems/tutor/dashboard/page.tsx`
   - Features:
     - My courses
     - Content creation
     - Assignment management
     - Grading interface

3. **Student Dashboard**
   - Location: `frontend/src/app/ems/student/dashboard/page.tsx`
   - Features:
     - Learning interface
     - Assignment submission
     - Progress tracking

---

## 📁 Files Created

### Documentation:
- ✅ `EMS_IMPLEMENTATION_PLAN.md` - Complete roadmap
- ✅ `EMS_IMPLEMENTATION_SUMMARY.md` - Detailed summary
- ✅ `EMS_QUICK_START_GUIDE.md` - This file

### SQL Scripts:
- ✅ `setup_ems_roles.sql` - Role & permission setup
- ✅ `setup_ems_complete.sql` - Complete AIPL setup

---

## ✅ Verification Checklist

After running the SQL scripts, verify:

- [ ] ACADEMIC_MANAGER role exists in `app_auth.roles`
- [ ] TUTOR role exists in `app_auth.roles`
- [ ] STUDENT role exists in `app_auth.roles`
- [ ] `ems.tutor_permissions` table exists
- [ ] `ems.academic_manager_settings` table exists
- [ ] Academic Manager user exists: `academic@aipl.com`
- [ ] Tutor user exists: `tutor@aipl.com`
- [ ] Student user exists: `student@aipl.com`
- [ ] Tutor has permissions set
- [ ] Student has student record in `ems.students`

### Run this verification query:

```sql
-- Check all roles
SELECT name, display_name, level 
FROM app_auth.roles 
WHERE name IN ('ACADEMIC_MANAGER', 'TUTOR', 'STUDENT')
ORDER BY level DESC;

-- Check all users
SELECT 
    u.email,
    r.name as role,
    c.name as company
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.companies c ON ur.company_id = c.id
WHERE u.email IN ('academic@aipl.com', 'tutor@aipl.com', 'student@aipl.com');

-- Check tutor permissions
SELECT 
    u.email,
    tp.can_create_assignments,
    tp.can_create_quizzes,
    tp.can_schedule_live_classes
FROM app_auth.users u
JOIN ems.tutor_permissions tp ON u.id = tp.tutor_id
WHERE u.email = 'tutor@aipl.com';
```

---

## 🐛 Troubleshooting

### Issue: Login returns 401

**Solution**: Password might not be hashed correctly. Run:
```sql
UPDATE app_auth.users
SET password_hash = crypt('Academic@2026', gen_salt('bf'))
WHERE email = 'academic@aipl.com';
```

### Issue: User has no role

**Solution**: Check user_roles table:
```sql
SELECT * FROM app_auth.user_roles 
WHERE user_id = (SELECT id FROM app_auth.users WHERE email = 'academic@aipl.com');
```

### Issue: Tutor has no permissions

**Solution**: Re-run the permissions setup:
```sql
-- See setup_ems_complete.sql STEP 4
```

---

## 📞 Support

If you encounter any issues:

1. Check the verification queries above
2. Review `EMS_IMPLEMENTATION_SUMMARY.md`
3. Check backend logs for errors
4. Verify database schema matches expected structure

---

## 🎯 Next Steps

1. ✅ Run SQL scripts
2. ✅ Test login with all accounts
3. 🔄 Start building Academic Manager Dashboard
4. 🔄 Build API endpoints
5. 🔄 Build Tutor Dashboard
6. 🔄 Build Student Dashboard

---

**Ready to build the future of education! 🚀**
