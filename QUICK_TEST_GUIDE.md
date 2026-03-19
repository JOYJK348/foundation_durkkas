# 🧪 QUICK TEST GUIDE

## 🚀 **START TESTING IN 3 STEPS:**

### **Step 1: Run Database Migration**
```sql
-- Open Supabase SQL Editor
-- Run this file:
backend/database/migrations/20260202_approval_workflow.sql
```

### **Step 2: Check Existing Users**
```sql
-- Open Supabase SQL Editor
-- Run this file to see existing users:
CHECK_EXISTING_USERS.sql

-- This will show you:
-- - All existing users with roles
-- - Manager credentials
-- - Tutor credentials  
-- - Student credentials
-- - Enrollments
```

### **Step 3: Login & Test**
```
Open: http://localhost:3001/login
```

---

## 🔐 **LOGIN CREDENTIALS:**

### **👨‍💼 MANAGER:**
```
Email: rajesh.kumar@durkkas.com
Password: Manager@123
```

### **👨‍🏫 TUTOR 1:**
```
Email: priya.sharma@durkkas.com
Password: Tutor@123
```

### **👨‍🏫 TUTOR 2:**
```
Email: arun.patel@durkkas.com
Password: Tutor@123
```

### **👨‍🎓 STUDENT 1:**
```
Email: vikram.reddy@student.durkkas.com
Password: Student@123
```

### **👨‍🎓 STUDENT 2:**
```
Email: sneha.iyer@student.durkkas.com
Password: Student@123
```

### **👨‍🎓 STUDENT 3:**
```
Email: arjun.nair@student.durkkas.com
Password: Student@123
```

---

## 🎯 **QUICK TESTS:**

### **Test 1: Manager Dashboard (2 mins)**
1. Login as Manager
2. Go to `/ems/academic-manager/dashboard`
3. Check stats
4. Go to `/ems/academic-manager/approvals`
5. See pending approvals (should be empty initially)

### **Test 2: Tutor Creates Assignment (3 mins)**
1. Login as Tutor (Priya)
2. Go to `/ems/tutor/assignments`
3. Create new assignment
4. Check status (should be DRAFT)
5. Submit for approval
6. Logout

### **Test 3: Manager Approves (2 mins)**
1. Login as Manager
2. Go to `/ems/academic-manager/approvals`
3. See pending assignment
4. Click "Review"
5. Click "Approve"
6. Logout

### **Test 4: Student Sees Assignment (2 mins)**
1. Login as Student (Vikram)
2. Go to `/ems/student/assignments`
3. See approved assignment
4. Click to view details
5. Submit assignment
6. Logout

### **Test 5: Materials Access Control (3 mins)**
1. Login as Manager
2. Upload material for "Full Stack Development"
3. Logout
4. Login as Vikram (enrolled in Full Stack)
5. Go to `/ems/student/materials`
6. See the material
7. Logout
8. Login as Sneha (NOT enrolled in Full Stack)
9. Go to `/ems/student/materials`
10. Should NOT see Full Stack material
11. Logout

---

## ✅ **EXPECTED RESULTS:**

### **Manager:**
✅ Can see all pending approvals
✅ Can approve/reject content
✅ Can view all courses
✅ Can upload materials directly

### **Tutor:**
✅ Can create assignments (DRAFT)
✅ Can submit for approval
✅ Can see own content only
✅ Can grade students

### **Student:**
✅ Can see ONLY APPROVED content
✅ Can see ONLY enrolled course content
✅ Can submit assignments
✅ Can take quizzes
✅ Can download materials

---

## 🐛 **TROUBLESHOOTING:**

### **Issue: Cannot login**
- Check if users created successfully
- Run verification query from CREATE_TEST_USERS.sql
- Check password (case-sensitive)

### **Issue: No pending approvals**
- Create content as tutor first
- Submit for approval
- Then check as manager

### **Issue: Student sees no content**
- Check if content is APPROVED
- Check if student is enrolled in course
- Verify enrollment in database

---

## 📊 **DATA SETUP:**

### **Courses Created:**
1. ✅ Full Stack Development (Tutor: Priya)
2. ✅ Python Programming (Tutor: Priya)
3. ✅ Data Science (Tutor: Arun)
4. ✅ Machine Learning (Tutor: Arun)

### **Batches Created:**
1. ✅ FS-2026-01 (Full Stack)
2. ✅ PY-2026-01 (Python)
3. ✅ DS-2026-01 (Data Science)
4. ✅ ML-2026-01 (Machine Learning)

### **Enrollments:**
- ✅ Vikram: Full Stack + Python
- ✅ Sneha: Data Science + ML
- ✅ Arjun: Full Stack + Data Science

---

## 🎊 **READY TO TEST!**

**Total Test Time: ~15 minutes**

**What to Test:**
1. ✅ Login (all roles)
2. ✅ Dashboard (all roles)
3. ✅ Create content (tutor)
4. ✅ Approval workflow (manager)
5. ✅ View content (student)
6. ✅ Access control (student)
7. ✅ Materials filtering (student)

**Bro, ellame ready! Start testing!** 🦾🔥🚀
