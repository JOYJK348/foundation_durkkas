# 🎓 COMPLETE EMS - MULTI-TENANT APPROVAL WORKFLOW

## 🏗️ **SYSTEM ARCHITECTURE**

### **3-TIER HIERARCHY:**
```
┌─────────────────────────────────────────────┐
│         ACADEMIC MANAGER (Top Level)        │
│  - Overall control & approval authority     │
│  - View all activities                      │
│  - Approve/Reject tutor content             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              TUTOR (Middle Level)           │
│  - Create assignments & quizzes             │
│  - Conduct classes                          │
│  - Grade students                           │
│  - NEEDS APPROVAL for content               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            STUDENT (End User)               │
│  - View approved content only               │
│  - Submit assignments                       │
│  - Take quizzes                             │
│  - Access materials                         │
└─────────────────────────────────────────────┘
```

---

## 📋 **APPROVAL WORKFLOW**

### **1. ASSIGNMENT WORKFLOW**
```
Tutor Creates Assignment (DRAFT)
         ↓
Submit for Approval (PENDING_APPROVAL)
         ↓
Manager Reviews
         ↓
    ┌────────┴────────┐
    ↓                 ↓
APPROVED          REJECTED
    ↓                 ↓
Visible to      Back to Tutor
Students        (with feedback)
```

### **2. QUIZ WORKFLOW**
```
Tutor Creates Quiz (DRAFT)
         ↓
Submit for Approval (PENDING_APPROVAL)
         ↓
Manager Reviews Questions
         ↓
    ┌────────┴────────┐
    ↓                 ↓
APPROVED          REJECTED
    ↓                 ↓
Students can     Back to Tutor
take quiz        (with feedback)
```

### **3. MATERIAL WORKFLOW**
```
Tutor Uploads Material (DRAFT)
         ↓
Submit for Approval (PENDING_APPROVAL)
         ↓
Manager Reviews Content
         ↓
    ┌────────┴────────┐
    ↓                 ↓
APPROVED          REJECTED
    ↓                 ↓
Visible to      Back to Tutor
Students        (with feedback)
```

---

## 🗄️ **DATABASE SCHEMA UPDATES**

### **Add Approval Fields to Tables:**

```sql
-- Assignments
ALTER TABLE ems.assignments ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'DRAFT';
ALTER TABLE ems.assignments ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES core.employees(id);
ALTER TABLE ems.assignments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE ems.assignments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Quizzes
ALTER TABLE ems.quizzes ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'DRAFT';
ALTER TABLE ems.quizzes ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES core.employees(id);
ALTER TABLE ems.quizzes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE ems.quizzes ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Materials
ALTER TABLE ems.course_materials ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'DRAFT';
ALTER TABLE ems.course_materials ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES core.employees(id);
ALTER TABLE ems.course_materials ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE ems.course_materials ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Live Classes
ALTER TABLE ems.live_classes ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'DRAFT';
ALTER TABLE ems.live_classes ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES core.employees(id);
ALTER TABLE ems.live_classes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE ems.live_classes ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
```

### **Approval Status Values:**
- `DRAFT` - Created by tutor, not submitted
- `PENDING_APPROVAL` - Submitted, waiting for manager
- `APPROVED` - Manager approved, visible to students
- `REJECTED` - Manager rejected, back to tutor
- `PUBLISHED` - Approved and active

---

## 🎯 **ROLE-BASED FEATURES**

### **ACADEMIC MANAGER:**
✅ **Dashboard:**
- Pending approvals count
- Recent activities
- System overview

✅ **Approvals Module:**
- View all pending assignments
- View all pending quizzes
- View all pending materials
- View all pending live classes
- Approve/Reject with feedback

✅ **Monitoring:**
- View all tutor activities
- View all student progress
- Generate reports

✅ **Full CRUD:**
- Create/Edit/Delete courses
- Create/Edit/Delete batches
- Assign tutors to courses
- Enroll students

---

### **TUTOR:**
✅ **Content Creation:**
- Create assignments (DRAFT → Submit for Approval)
- Create quizzes (DRAFT → Submit for Approval)
- Upload materials (DRAFT → Submit for Approval)
- Schedule live classes (DRAFT → Submit for Approval)

✅ **Grading:**
- Grade assignment submissions
- Grade quiz attempts
- Provide feedback

✅ **Class Management:**
- Conduct approved live classes
- Mark attendance
- Share screen/materials

✅ **Student Interaction:**
- View assigned students
- Answer doubts
- Track progress

✅ **Approval Tracking:**
- View pending approvals
- View rejected items with feedback
- Resubmit after corrections

---

### **STUDENT:**
✅ **Learning:**
- View APPROVED assignments only
- Take APPROVED quizzes only
- Download APPROVED materials only
- Attend APPROVED live classes only

✅ **Submissions:**
- Submit assignments
- Take quizzes
- View grades & feedback

✅ **Progress:**
- Track course completion
- View grades
- Download certificates

---

## 📱 **NEW PAGES TO CREATE**

### **For Academic Manager:**
1. ✨ **Approvals Dashboard** - `/academic-manager/approvals`
   - Pending assignments
   - Pending quizzes
   - Pending materials
   - Pending live classes

2. ✨ **Approval Detail Pages:**
   - `/academic-manager/approvals/assignments/[id]`
   - `/academic-manager/approvals/quizzes/[id]`
   - `/academic-manager/approvals/materials/[id]`
   - `/academic-manager/approvals/live-classes/[id]`

3. ✨ **Activity Monitor** - `/academic-manager/activities`
   - All tutor activities
   - All student activities
   - System logs

### **For Tutor:**
1. ✨ **My Approvals** - `/tutor/my-approvals`
   - Pending items
   - Approved items
   - Rejected items (with feedback)

2. ✨ **Create with Approval:**
   - Update existing create pages with "Submit for Approval" button
   - Show approval status on list pages

---

## 🔄 **WORKFLOW IMPLEMENTATION**

### **Tutor Creates Assignment:**
```typescript
// Status: DRAFT
const assignment = {
  assignment_title: "Week 1 Assignment",
  course_id: 1,
  approval_status: "DRAFT",
  created_by: tutorId
};

// Tutor submits for approval
updateAssignment(id, { approval_status: "PENDING_APPROVAL" });

// Manager approves
updateAssignment(id, {
  approval_status: "APPROVED",
  approved_by: managerId,
  approved_at: new Date()
});

// OR Manager rejects
updateAssignment(id, {
  approval_status: "REJECTED",
  rejection_reason: "Please add more detailed instructions"
});
```

---

## 🎨 **UI/UX ENHANCEMENTS**

### **Status Badges:**
- 🟡 DRAFT - Yellow
- 🔵 PENDING_APPROVAL - Blue
- 🟢 APPROVED - Green
- 🔴 REJECTED - Red

### **Notifications:**
- Tutor gets notification when approved/rejected
- Manager gets notification when new submission
- Student gets notification when new content approved

### **Filters:**
- Filter by status
- Filter by course
- Filter by date
- Filter by tutor

---

## 📊 **REPORTS & ANALYTICS**

### **For Manager:**
- Approval turnaround time
- Rejection rate by tutor
- Content quality metrics
- Student engagement

### **For Tutor:**
- Approval success rate
- Average approval time
- Student performance
- Class attendance

---

## 🔒 **SECURITY & PERMISSIONS**

### **API Endpoints:**
```
POST /api/ems/assignments/:id/submit-approval (Tutor only)
POST /api/ems/assignments/:id/approve (Manager only)
POST /api/ems/assignments/:id/reject (Manager only)

GET /api/ems/approvals/pending (Manager only)
GET /api/ems/my-approvals (Tutor only)
```

### **Database RLS:**
- Students see only APPROVED content
- Tutors see their own content (all statuses)
- Managers see everything

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Database (Priority 1)**
- [ ] Add approval columns to tables
- [ ] Create approval history table
- [ ] Update RLS policies

### **Phase 2: Backend APIs (Priority 1)**
- [ ] Submit for approval endpoint
- [ ] Approve endpoint
- [ ] Reject endpoint
- [ ] Get pending approvals endpoint

### **Phase 3: Manager UI (Priority 1)**
- [ ] Approvals dashboard
- [ ] Approval detail pages
- [ ] Approve/Reject buttons
- [ ] Activity monitor

### **Phase 4: Tutor UI (Priority 2)**
- [ ] Update create pages with approval flow
- [ ] My approvals page
- [ ] Resubmit functionality
- [ ] Status indicators

### **Phase 5: Student UI (Priority 2)**
- [ ] Filter to show only approved content
- [ ] Update queries to check approval_status

### **Phase 6: Notifications (Priority 3)**
- [ ] Email notifications
- [ ] In-app notifications
- [ ] Push notifications

---

## 🚀 **READY TO IMPLEMENT!**

This is a **PRODUCTION-GRADE** approval workflow system!

**Next Steps:**
1. Create database migration
2. Create approval pages
3. Update existing pages
4. Test workflow end-to-end

**Bro, idhu proper multi-tenant approval system!** 🦾🔥🚀
