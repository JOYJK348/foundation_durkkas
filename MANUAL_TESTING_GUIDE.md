# 🎯 QUICK MANUAL TESTING GUIDE

## 📊 **DUMMY DATA SUMMARY**

After running the SQL script, you will have:

- ✅ **5 Courses** (Full Stack, Data Science, Digital Marketing, Mobile App, UI/UX)
- ✅ **6 Batches** (Different schedules and timings)
- ✅ **20 Students** (Realistic names and data)
- ✅ **20 Enrollments** (Students mapped to courses and batches)
- ✅ **10 Assignments** (Across different courses)
- ✅ **8 Quizzes** (With proper configuration)
- ✅ **7 Live Classes** (Scheduled sessions with meeting links)
- ✅ **10 Materials** (PDFs, ZIPs, XLSX files)

---

## 🚀 **STEP 1: RUN THE DUMMY DATA SCRIPT**

### **Option A: Using Supabase Dashboard**
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy content from `backend/database/EMS_COMPLETE_DUMMY_DATA.sql`
4. Paste and click **Run**
5. Wait for success message

### **Option B: Using psql (Terminal)**
```bash
cd backend/database
psql -h <your-supabase-host> -U postgres -d postgres -f EMS_COMPLETE_DUMMY_DATA.sql
```

---

## 🧪 **STEP 2: MANUAL TESTING CHECKLIST**

### **1. LOGIN**
- **URL:** `http://localhost:3001/login`
- **Credentials:**
  - Email: `manager@durkkas.com`
  - Password: `Durk@123`
- **Expected:** Redirect to Academic Manager Dashboard

---

### **2. DASHBOARD**
- **URL:** `http://localhost:3001/ems/academic-manager/dashboard`
- **Check:**
  - [ ] Stats cards showing correct counts
  - [ ] Recent activities
  - [ ] Quick actions working

---

### **3. STUDENTS MODULE**
- **URL:** `http://localhost:3001/ems/academic-manager/students`
- **Check:**
  - [ ] **20 students** appear in table
  - [ ] Stats cards show: Total: 20, Active: 20
  - [ ] Search works (try "Rajesh" or "Priya")
  - [ ] Click on any student to edit
  - [ ] Create new student works

**Sample Students to Look For:**
- Rajesh Kumar (STU-2026-001)
- Priya Sharma (STU-2026-002)
- Amit Patel (STU-2026-003)

---

### **4. COURSES MODULE**
- **URL:** `http://localhost:3001/ems/academic-manager/courses`
- **Check:**
  - [ ] **5 courses** appear
  - [ ] Stats: Total: 5, Published: 4, Draft: 1
  - [ ] Search works (try "Full Stack" or "Data Science")
  - [ ] Course details show duration, modules, lessons

**Sample Courses:**
1. **Full Stack Web Development Bootcamp** (FS-2026-01)
   - 16 weeks, 8 modules, 64 lessons
   - Status: Published

2. **Data Science & Machine Learning** (DS-2026-01)
   - 20 weeks, 10 modules, 80 lessons
   - Status: Published

3. **Digital Marketing Masterclass** (DM-2026-01)
   - 12 weeks, 6 modules, 48 lessons
   - Status: Published

---

### **5. BATCHES MODULE**
- **URL:** `http://localhost:3001/ems/academic-manager/batches`
- **Check:**
  - [ ] **6 batches** appear as cards
  - [ ] Each card shows course name, capacity, dates
  - [ ] Current strength updated correctly

**Sample Batches:**
1. **Full Stack Morning Batch** (FS-MORN-FEB26)
   - Course: Full Stack Web Development
   - Capacity: 8/30 students
   - Dates: Feb 10 - Jun 10, 2026

2. **Data Science Weekend Batch** (DS-WKND-FEB26)
   - Course: Data Science & ML
   - Capacity: 4/25 students
   - Dates: Feb 8 - Jul 8, 2026

---

### **6. ENROLLMENTS MODULE**
- **URL:** `http://localhost:3001/ems/academic-manager/enrollments`
- **Check:**
  - [ ] **20 enrollments** appear as cards
  - [ ] Each card shows student name, course, batch
  - [ ] Payment status visible (Paid/Partial)
  - [ ] Search works (try student name or course)

**Sample Enrollments:**
- Rajesh Kumar → Full Stack → Morning Batch (Paid)
- Priya Sharma → Full Stack → Morning Batch (Paid)
- Aditya Chopra → Data Science → Weekend Batch (Partial)

---

### **7. ASSIGNMENTS MODULE**
- **URL:** `http://localhost:3001/ems/academic-manager/assignments`
- **Check:**
  - [ ] **10 assignments** appear
  - [ ] Assignments linked to correct courses
  - [ ] Due dates visible
  - [ ] Max marks shown

**Sample Assignments:**
1. **Build a Todo App with React** (Full Stack)
   - Due: Feb 25, 2026
   - Max Marks: 100

2. **Data Cleaning with Pandas** (Data Science)
   - Due: Feb 28, 2026
   - Max Marks: 100

3. **SEO Audit Report** (Digital Marketing)
   - Due: Mar 1, 2026
   - Max Marks: 100

---

### **8. QUIZZES MODULE**
- **URL:** `http://localhost:3001/ems/academic-manager/quizzes`
- **Check:**
  - [ ] **8 quizzes** appear
  - [ ] Duration, marks, passing marks visible
  - [ ] Published status shown

**Sample Quizzes:**
1. **React Fundamentals Quiz** (Full Stack)
   - Duration: 30 min
   - Total Marks: 50, Passing: 25
   - Max Attempts: 2

2. **Python Basics Quiz** (Data Science)
   - Duration: 30 min
   - Total Marks: 50, Passing: 25
   - Max Attempts: 3

---

### **9. LIVE CLASSES MODULE**
- **URL:** `http://localhost:3001/ems/academic-manager/live-classes`
- **Check:**
  - [ ] **7 live classes** scheduled
  - [ ] Meeting links visible
  - [ ] Schedule dates/times shown
  - [ ] Status: Scheduled

**Sample Live Classes:**
1. **Introduction to React Hooks** (Full Stack Morning)
   - Date: Feb 11, 2026 @ 9:00 AM
   - Duration: 120 min
   - Link: https://meet.google.com/abc-defg-hij

2. **Data Visualization with Matplotlib** (Data Science Weekend)
   - Date: Feb 8, 2026 @ 10:00 AM
   - Duration: 180 min
   - Link: https://meet.google.com/data-sci-001

---

### **10. MATERIALS MODULE**
- **URL:** `http://localhost:3001/ems/academic-manager/materials`
- **Check:**
  - [ ] **10 materials** appear
  - [ ] Material types shown (PDF, ZIP, XLSX)
  - [ ] Download links visible
  - [ ] Linked to correct courses

**Sample Materials:**
1. **React Cheat Sheet** (Full Stack)
   - Type: PDF
   - Downloadable: Yes

2. **Python for Data Science Handbook** (Data Science)
   - Type: PDF
   - Downloadable: Yes

3. **SEO Checklist 2026** (Digital Marketing)
   - Type: PDF
   - Downloadable: Yes

---

## ✅ **VERIFICATION CHECKLIST**

### **Overall System Check:**
- [ ] All modules load without errors
- [ ] Search functionality works in all modules
- [ ] Create/Edit/Delete operations work
- [ ] Toast notifications appear for actions
- [ ] Data relationships are correct (students → enrollments → courses)
- [ ] No console errors in browser DevTools
- [ ] Mobile responsive (resize browser)

### **Data Integrity Check:**
- [ ] Students are properly enrolled in courses
- [ ] Batches show correct student count
- [ ] Assignments linked to correct courses
- [ ] Quizzes linked to correct courses
- [ ] Live classes linked to correct batches
- [ ] Materials linked to correct courses

---

## 🎯 **QUICK TEST FLOW (5 Minutes)**

1. **Login** → manager@durkkas.com
2. **Dashboard** → Check stats
3. **Students** → See 20 students, search "Rajesh"
4. **Courses** → See 5 courses, click "Full Stack"
5. **Batches** → See 6 batches, check "Morning Batch" has 8 students
6. **Enrollments** → See 20 enrollments, verify student-course links
7. **Assignments** → See 10 assignments with due dates
8. **Quizzes** → See 8 quizzes with durations
9. **Live Classes** → See 7 scheduled classes with meeting links
10. **Materials** → See 10 materials with download links

---

## 📊 **EXPECTED COUNTS**

| Module | Count | Status |
|--------|-------|--------|
| Courses | 5 | 4 Published, 1 Draft |
| Batches | 6 | All Active |
| Students | 20 | All Active |
| Enrollments | 20 | 18 Paid, 2 Partial |
| Assignments | 10 | All Active |
| Quizzes | 8 | All Published |
| Live Classes | 7 | All Scheduled |
| Materials | 10 | All Downloadable |

---

## 🐛 **TROUBLESHOOTING**

### **No data appearing?**
1. Check if SQL script ran successfully
2. Verify company_id = 1 in database
3. Check browser console for errors
4. Refresh the page

### **Wrong counts?**
1. Run verification query from SQL script
2. Check for duplicate data
3. Clear browser cache

### **API errors?**
1. Check backend is running (port 3000)
2. Check authentication token
3. Look at backend console logs

---

## 🎉 **SUCCESS CRITERIA**

✅ All 8 modules show data  
✅ Search works in all modules  
✅ Relationships are correct  
✅ No console errors  
✅ Mobile responsive  
✅ Create/Edit/Delete works  

---

**Ready for Production Testing!** 🚀🔥🦾
