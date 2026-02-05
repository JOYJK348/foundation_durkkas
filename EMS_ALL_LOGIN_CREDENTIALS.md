# 🔑 EMS LOGIN CREDENTIALS - ALL USERS

## 🏢 **COMPANY DETAILS:**
- **Company ID:** 13
- **Company Name:** Durkkas Foundation
- **Branch ID:** 46

---

## 👨‍💼 **ACADEMIC MANAGER:**
```
Email: rajesh.kumar@durkkas.com
Password: Manager@123
Role: ACADEMIC_MANAGER
Dashboard: /ems/academic-manager/dashboard
```

**Access:**
- ✅ Manage all courses
- ✅ Manage all students
- ✅ Manage all tutors
- ✅ Manage batches
- ✅ Approve assignments
- ✅ View analytics
- ✅ Manage enrollments

---

## 👨‍🏫 **TUTOR 1 (Full Stack & Python):**
```
Email: priya.sharma@durkkas.com
Password: Manager@123
Role: TUTOR
Dashboard: /ems/tutor/dashboard
```

**Assigned Courses:**
- ✅ Full Stack Development (FS101)
- ✅ Python Programming (PY101)

**Access:**
- ✅ View assigned courses
- ✅ Create/manage course content
- ✅ Create assignments
- ✅ Grade submissions
- ✅ View enrolled students
- ✅ Conduct live classes

---

## 👨‍🏫 **TUTOR 2 (Data Science & ML):**
```
Email: arun.patel@durkkas.com
Password: Manager@123
Role: TUTOR
Dashboard: /ems/tutor/dashboard
```

**Assigned Courses:**
- ✅ Data Science Fundamentals (DS101)
- ✅ Machine Learning Basics (ML101)

**Access:**
- ✅ View assigned courses
- ✅ Create/manage course content
- ✅ Create assignments
- ✅ Grade submissions
- ✅ View enrolled students
- ✅ Conduct live classes

---

## 👨‍🎓 **STUDENT 1:**
```
Email: vikram.reddy@student.durkkas.com
Password: Student@123
Role: STUDENT
Dashboard: /ems/student/dashboard
```

**Enrolled Courses:**
- ✅ Full Stack Development (FS101)
- ✅ Data Science Fundamentals (DS101)

**Access:**
- ✅ View enrolled courses
- ✅ Access course materials
- ✅ Submit assignments
- ✅ Take quizzes
- ✅ Join live classes
- ✅ View progress

---

## 👨‍🎓 **STUDENT 2:**
```
Email: sneha.iyer@student.durkkas.com
Password: Student@123
Role: STUDENT
Dashboard: /ems/student/dashboard
```

**Enrolled Courses:**
- ✅ Python Programming (PY101)
- ✅ Data Science Fundamentals (DS101)

**Access:**
- ✅ View enrolled courses
- ✅ Access course materials
- ✅ Submit assignments
- ✅ Take quizzes
- ✅ Join live classes
- ✅ View progress

---

## 👨‍🎓 **STUDENT 3:**
```
Email: arjun.nair@student.durkkas.com
Password: Student@123
Role: STUDENT
Dashboard: /ems/student/dashboard
```

**Enrolled Courses:**
- ✅ Full Stack Development (FS101)
- ✅ Machine Learning Basics (ML101)

**Access:**
- ✅ View enrolled courses
- ✅ Access course materials
- ✅ Submit assignments
- ✅ Take quizzes
- ✅ Join live classes
- ✅ View progress

---

## 🌐 **LOGIN URL:**
```
http://localhost:3001/login
```

---

## 📊 **COURSE DETAILS:**

### **Full Stack Development (FS101)**
- **Tutor:** Priya Sharma
- **Students:** Vikram, Arjun
- **Modules:** 4 (HTML/CSS, JavaScript, React, Node.js)
- **Lessons:** 8
- **Assignments:** 2

### **Python Programming (PY101)**
- **Tutor:** Priya Sharma
- **Students:** Sneha
- **Modules:** 4 (Basics, OOP, Data Structures, File Handling)
- **Lessons:** 0 (to be created)
- **Assignments:** 0 (to be created)

### **Data Science Fundamentals (DS101)**
- **Tutor:** Arun Patel
- **Students:** Vikram, Sneha
- **Modules:** 4 (Intro, Pandas, Visualization, Statistics)
- **Lessons:** 0 (to be created)
- **Assignments:** 2

### **Machine Learning Basics (ML101)**
- **Tutor:** Arun Patel
- **Students:** Arjun
- **Modules:** 4 (Fundamentals, Supervised, Unsupervised, Neural Networks)
- **Lessons:** 0 (to be created)
- **Assignments:** 0 (to be created)

---

## 🎯 **QUICK TEST SCENARIOS:**

### **Test 1: Manager Login**
1. Login as `rajesh.kumar@durkkas.com`
2. Should redirect to Academic Manager Dashboard
3. Can view all courses, students, tutors

### **Test 2: Tutor Login**
1. Login as `priya.sharma@durkkas.com`
2. Should redirect to Tutor Dashboard
3. Can see 2 courses (FS101, PY101)
4. Can view enrolled students
5. Can create/grade assignments

### **Test 3: Student Login**
1. Login as `vikram.reddy@student.durkkas.com`
2. Should redirect to Student Dashboard
3. Can see 2 courses (FS101, DS101)
4. Can view lessons and submit assignments

### **Test 4: Grading Flow**
1. Login as Priya (tutor)
2. Go to Grading section
3. Should see 2 pending submissions:
   - Vikram's Portfolio Website
   - Arjun's Portfolio Website
4. Can grade and provide feedback

---

## 🔐 **PASSWORD RESET (IF NEEDED):**

Run this SQL in Supabase:
```sql
-- Reset password for any user
UPDATE app_auth.users 
SET password_hash = crypt('NewPassword@123', gen_salt('bf'))
WHERE email = 'user@durkkas.com';
```

---

## 📝 **NOTES:**

- All passwords are currently: `Manager@123` or `Student@123`
- Company ID is always: `13`
- Branch ID is always: `46`
- All users are active and verified
- Employee records exist for all tutors and manager
- Student records exist for all students

---

**Bro, ellam users um inga irukku! Copy panni use pannunga!** 🦾🔥🚀

**READY TO TEST!** ✅🎊
