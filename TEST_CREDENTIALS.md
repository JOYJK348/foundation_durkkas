# 🔐 EMS TEST CREDENTIALS

## 📋 **LOGIN CREDENTIALS FOR TESTING**

---

## 👨‍💼 **ACADEMIC MANAGER**

### **Manager 1: Rajesh Kumar**
```
Email: rajesh.kumar@durkkas.com
Password: Manager@123
Role: ACADEMIC_MANAGER
Company: Durkkas Academy
```

**Access:**
- ✅ Full EMS control
- ✅ Approve/Reject content
- ✅ View all activities
- ✅ Manage courses, batches, enrollments
- ✅ Assign tutors
- ✅ Upload materials

**Dashboard:** `/ems/academic-manager/dashboard`

---

## 👨‍🏫 **TUTORS**

### **Tutor 1: Priya Sharma**
```
Email: priya.sharma@durkkas.com
Password: Tutor@123
Role: TUTOR
Company: Durkkas Academy
Assigned Courses: Full Stack Development, Python Programming
```

**Access:**
- ✅ Create assignments (needs approval)
- ✅ Create quizzes (needs approval)
- ✅ Upload materials (needs approval)
- ✅ Schedule live classes (needs approval)
- ✅ Grade students
- ✅ View assigned students
- ✅ Conduct classes

**Dashboard:** `/ems/tutor/dashboard`

---

### **Tutor 2: Arun Patel**
```
Email: arun.patel@durkkas.com
Password: Tutor@123
Role: TUTOR
Company: Durkkas Academy
Assigned Courses: Data Science, Machine Learning
```

**Access:**
- ✅ Same as Tutor 1
- ✅ Different course assignments

**Dashboard:** `/ems/tutor/dashboard`

---

## 👨‍🎓 **STUDENTS**

### **Student 1: Vikram Reddy**
```
Email: vikram.reddy@student.durkkas.com
Password: Student@123
Role: STUDENT
Company: Durkkas Academy
Enrolled Courses: Full Stack Development, Python Programming
```

**Access:**
- ✅ View APPROVED content only
- ✅ Submit assignments
- ✅ Take quizzes
- ✅ Download materials
- ✅ Attend live classes
- ✅ View grades

**Dashboard:** `/ems/student/dashboard`

---

### **Student 2: Sneha Iyer**
```
Email: sneha.iyer@student.durkkas.com
Password: Student@123
Role: STUDENT
Company: Durkkas Academy
Enrolled Courses: Data Science, Machine Learning
```

**Access:**
- ✅ Same as Student 1
- ✅ Different course enrollments

**Dashboard:** `/ems/student/dashboard`

---

### **Student 3: Arjun Nair**
```
Email: arjun.nair@student.durkkas.com
Password: Student@123
Role: STUDENT
Company: Durkkas Academy
Enrolled Courses: Full Stack Development, Data Science
```

**Access:**
- ✅ Same as other students
- ✅ Enrolled in multiple courses

**Dashboard:** `/ems/student/dashboard`

---

## 🧪 **TESTING SCENARIOS**

### **Scenario 1: Assignment Approval Workflow**
1. **Login as Tutor (Priya Sharma)**
   - Create new assignment for "Full Stack Development"
   - Submit for approval
   - Logout

2. **Login as Manager (Rajesh Kumar)**
   - Go to Approvals Dashboard
   - Review assignment
   - Approve it
   - Logout

3. **Login as Student (Vikram Reddy)**
   - Go to Assignments
   - See the approved assignment
   - Submit assignment
   - Logout

4. **Login as Tutor (Priya Sharma)**
   - Go to Grading
   - Grade student submission
   - Logout

---

### **Scenario 2: Quiz Creation & Taking**
1. **Login as Tutor (Arun Patel)**
   - Create quiz for "Data Science"
   - Add questions (MCQ, True/False)
   - Submit for approval
   - Logout

2. **Login as Manager (Rajesh Kumar)**
   - Review quiz
   - Approve it
   - Logout

3. **Login as Student (Sneha Iyer)**
   - Go to Assessments
   - Take the quiz
   - Submit answers
   - View results
   - Logout

---

### **Scenario 3: Material Upload & Access**
1. **Login as Manager (Rajesh Kumar)**
   - Upload material for "Python Programming"
   - Select file type (Document/Video/Code)
   - Save
   - Logout

2. **Login as Student (Vikram Reddy)**
   - Go to Materials
   - See materials from enrolled courses only
   - Download material
   - Logout

3. **Login as Student (Sneha Iyer)**
   - Go to Materials
   - Should NOT see Python materials (not enrolled)
   - Logout

---

### **Scenario 4: Rejection & Resubmission**
1. **Login as Tutor (Priya Sharma)**
   - Create assignment with incomplete description
   - Submit for approval
   - Logout

2. **Login as Manager (Rajesh Kumar)**
   - Review assignment
   - Reject with reason: "Please add detailed instructions"
   - Logout

3. **Login as Tutor (Priya Sharma)**
   - Go to My Approvals
   - See rejected assignment
   - Read rejection reason
   - Edit assignment
   - Resubmit for approval
   - Logout

4. **Login as Manager (Rajesh Kumar)**
   - Review again
   - Approve
   - Logout

---

## 🔑 **QUICK LOGIN GUIDE**

### **Login Page:** `http://localhost:3001/login`

### **Test Each Role:**

**Manager Test:**
```
1. Login: rajesh.kumar@durkkas.com / Manager@123
2. Go to: /ems/academic-manager/approvals
3. Check pending approvals
4. Review and approve/reject
```

**Tutor Test:**
```
1. Login: priya.sharma@durkkas.com / Tutor@123
2. Go to: /ems/tutor/assignments
3. Create new assignment
4. Submit for approval
5. Check approval status
```

**Student Test:**
```
1. Login: vikram.reddy@student.durkkas.com / Student@123
2. Go to: /ems/student/assignments
3. See only APPROVED assignments
4. Submit assignment
5. View grades
```

---

## 📊 **DATA SETUP**

### **Courses:**
1. Full Stack Development (Tutor: Priya Sharma)
2. Python Programming (Tutor: Priya Sharma)
3. Data Science (Tutor: Arun Patel)
4. Machine Learning (Tutor: Arun Patel)

### **Batches:**
1. FS-2026-01 (Full Stack Development)
2. PY-2026-01 (Python Programming)
3. DS-2026-01 (Data Science)
4. ML-2026-01 (Machine Learning)

### **Enrollments:**
- Vikram Reddy: Full Stack, Python
- Sneha Iyer: Data Science, ML
- Arjun Nair: Full Stack, Data Science

---

## 🎯 **EXPECTED BEHAVIOR**

### **Manager:**
✅ Can see ALL pending approvals
✅ Can approve/reject any content
✅ Can view all courses, batches, students
✅ Can create content directly (auto-approved)

### **Tutor:**
✅ Can create content (DRAFT status)
✅ Can submit for approval (PENDING_APPROVAL)
✅ Can see own content only
✅ Can grade assigned students
✅ Cannot see other tutors' content

### **Student:**
✅ Can see ONLY APPROVED content
✅ Can see ONLY enrolled course content
✅ Cannot see DRAFT/PENDING/REJECTED content
✅ Cannot see other courses' content

---

## 🚀 **READY TO TEST!**

**Start Testing:**
1. Open browser: `http://localhost:3001`
2. Login with any credential above
3. Test the workflows
4. Verify approval system
5. Check role-based access

**Bro, ellame ready! Test panlam!** 🦾🔥🚀

---

## 📝 **NOTES:**

- All passwords are temporary for testing
- Change passwords in production
- Multi-tenant isolation working
- Role-based access enforced
- Approval workflow active

**HAPPY TESTING!** 🎊🔥
