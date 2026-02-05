# 🎓 EMS COMPLETE SETUP - WHO HAS WHAT ACCESS

## 📋 **COMPLETE USER MAPPING**

---

## 👨‍💼 **ACADEMIC MANAGER**

### **Rajesh Kumar**
```
Email: rajesh.kumar@durkkas.com
Password: Manager@123
Role: ACADEMIC_MANAGER
```

**Access:**
- ✅ **All Courses** - Can see and manage ALL courses
- ✅ **All Batches** - Can see and manage ALL batches
- ✅ **All Students** - Can see ALL students
- ✅ **All Tutors** - Can manage ALL tutors
- ✅ **Approvals** - Can approve/reject content
- ✅ **Full Control** - Complete system access

**Dashboard:** `/ems/academic-manager/dashboard`

---

## 👨‍🏫 **TUTOR 1: Priya Sharma**

### **Login:**
```
Email: priya.sharma@durkkas.com
Password: Manager@123
Role: TUTOR
```

### **Assigned Courses:**
1. ✅ **Full Stack Development**
   - Course Code: FS101
   - Students: Vikram, Arjun
   
2. ✅ **Python Programming**
   - Course Code: PY101
   - Students: Vikram

**Can Do:**
- ✅ Create assignments for HER courses
- ✅ Create quizzes for HER courses
- ✅ Upload materials for HER courses
- ✅ Grade students in HER courses
- ✅ View students enrolled in HER courses
- ❌ Cannot see other tutors' courses

**Dashboard:** `/ems/tutor/dashboard`

---

## 👨‍🏫 **TUTOR 2: Arun Patel**

### **Login:**
```
Email: arun.patel@durkkas.com
Password: Manager@123
Role: TUTOR
```

### **Assigned Courses:**
1. ✅ **Data Science**
   - Course Code: DS101
   - Students: Sneha, Arjun
   
2. ✅ **Machine Learning**
   - Course Code: ML101
   - Students: Sneha

**Can Do:**
- ✅ Create assignments for HIS courses
- ✅ Create quizzes for HIS courses
- ✅ Upload materials for HIS courses
- ✅ Grade students in HIS courses
- ✅ View students enrolled in HIS courses
- ❌ Cannot see Priya's courses

**Dashboard:** `/ems/tutor/dashboard`

---

## 👨‍🎓 **STUDENT 1: Vikram Reddy**

### **Login:**
```
Email: vikram.reddy@student.durkkas.com
Password: Student@123
Role: STUDENT
```

### **Enrolled Courses:**
1. ✅ **Full Stack Development** (Tutor: Priya)
   - Batch: FS-2026-JAN
   
2. ✅ **Python Programming** (Tutor: Priya)
   - Batch: PY-2026-JAN

**Can See:**
- ✅ Assignments from Full Stack & Python ONLY
- ✅ Quizzes from Full Stack & Python ONLY
- ✅ Materials from Full Stack & Python ONLY
- ❌ Cannot see Data Science or ML content
- ❌ Cannot see other students' work

**Dashboard:** `/ems/student/dashboard`

---

## 👨‍🎓 **STUDENT 2: Sneha Iyer**

### **Login:**
```
Email: sneha.iyer@student.durkkas.com
Password: Student@123
Role: STUDENT
```

### **Enrolled Courses:**
1. ✅ **Data Science** (Tutor: Arun)
   - Batch: DS-2026-JAN
   
2. ✅ **Machine Learning** (Tutor: Arun)
   - Batch: ML-2026-JAN

**Can See:**
- ✅ Assignments from Data Science & ML ONLY
- ✅ Quizzes from Data Science & ML ONLY
- ✅ Materials from Data Science & ML ONLY
- ❌ Cannot see Full Stack or Python content
- ❌ Cannot see other students' work

**Dashboard:** `/ems/student/dashboard`

---

## 👨‍🎓 **STUDENT 3: Arjun Nair**

### **Login:**
```
Email: arjun.nair@student.durkkas.com
Password: Student@123
Role: STUDENT
```

### **Enrolled Courses:**
1. ✅ **Full Stack Development** (Tutor: Priya)
   - Batch: FS-2026-JAN
   
2. ✅ **Data Science** (Tutor: Arun)
   - Batch: DS-2026-JAN

**Can See:**
- ✅ Assignments from Full Stack & Data Science ONLY
- ✅ Quizzes from Full Stack & Data Science ONLY
- ✅ Materials from Full Stack & Data Science ONLY
- ❌ Cannot see Python or ML content
- ❌ Cannot see other students' work

**Dashboard:** `/ems/student/dashboard`

---

## 📊 **COURSE → TUTOR → STUDENTS MAPPING**

### **Course 1: Full Stack Development**
```
Tutor: Priya Sharma
Students: 
  - Vikram Reddy
  - Arjun Nair
Batch: FS-2026-JAN
```

### **Course 2: Python Programming**
```
Tutor: Priya Sharma
Students: 
  - Vikram Reddy
Batch: PY-2026-JAN
```

### **Course 3: Data Science**
```
Tutor: Arun Patel
Students: 
  - Sneha Iyer
  - Arjun Nair
Batch: DS-2026-JAN
```

### **Course 4: Machine Learning**
```
Tutor: Arun Patel
Students: 
  - Sneha Iyer
Batch: ML-2026-JAN
```

---

## 🔒 **ACCESS CONTROL RULES**

### **Manager (Rajesh):**
```
✅ See ALL courses
✅ See ALL students
✅ See ALL batches
✅ Approve/Reject ALL content
✅ Manage ALL tutors
```

### **Tutor (Priya/Arun):**
```
✅ See ONLY their assigned courses
✅ See ONLY students enrolled in their courses
✅ Create content for ONLY their courses
❌ Cannot see other tutors' courses
❌ Cannot see students not in their courses
```

### **Student (Vikram/Sneha/Arjun):**
```
✅ See ONLY enrolled courses
✅ See ONLY APPROVED content
✅ Submit assignments for ONLY enrolled courses
❌ Cannot see other courses
❌ Cannot see DRAFT/PENDING content
❌ Cannot see other students' submissions
```

---

## 🎯 **EXAMPLE SCENARIOS**

### **Scenario 1: Priya creates assignment**
1. Priya logs in
2. Creates assignment for "Full Stack Development"
3. Submits for approval
4. **Vikram & Arjun:** Cannot see yet (PENDING)
5. Rajesh approves
6. **Vikram & Arjun:** Can now see and submit
7. **Sneha:** Still cannot see (not enrolled)

### **Scenario 2: Vikram views courses**
1. Vikram logs in
2. Goes to "My Courses"
3. **Sees:**
   - Full Stack Development ✅
   - Python Programming ✅
4. **Does NOT see:**
   - Data Science ❌
   - Machine Learning ❌

### **Scenario 3: Arun grades assignment**
1. Arun logs in
2. Goes to "Pending Grading"
3. **Sees submissions from:**
   - Sneha (Data Science) ✅
   - Arjun (Data Science) ✅
4. **Does NOT see submissions from:**
   - Vikram (Full Stack) ❌

---

## 📋 **QUICK REFERENCE TABLE**

| User | Role | Courses | Students | Can Approve |
|------|------|---------|----------|-------------|
| **Rajesh** | Manager | ALL | ALL | ✅ YES |
| **Priya** | Tutor | Full Stack, Python | Vikram, Arjun | ❌ NO |
| **Arun** | Tutor | Data Science, ML | Sneha, Arjun | ❌ NO |
| **Vikram** | Student | Full Stack, Python | - | ❌ NO |
| **Sneha** | Student | Data Science, ML | - | ❌ NO |
| **Arjun** | Student | Full Stack, Data Science | - | ❌ NO |

---

## 🔑 **ALL PASSWORDS**

```
Manager: Manager@123
Tutors: Manager@123
Students: Student@123
```

---

## 🚀 **TEST URL**

```
http://localhost:3001/login
```

---

**Bro, idhu complete mapping! Yaaru ku enna access nu clear ah theriyum!** 🦾🔥🚀

**ELLAME ROLE-BASED ACCESS CONTROL!** ✅🎊
