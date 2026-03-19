# 🎓 MULTI-TUTOR ASSIGNMENT SYSTEM

## 📋 **OVERVIEW:**

This feature allows assigning **multiple tutors** to a single course, with one designated as the **primary tutor**.

### **Use Cases:**
- **Main Instructor** + **Assistant Instructors**
- **Subject Expert** + **Lab Coordinator**
- **Theory Teacher** + **Practical Teacher**
- **Multiple Tutors** for large classes

---

## 🗄️ **DATABASE SCHEMA:**

### **New Table:** `ems.course_tutors`

```sql
CREATE TABLE ems.course_tutors (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    tutor_id BIGINT NOT NULL,
    
    tutor_role VARCHAR(50) DEFAULT 'INSTRUCTOR',
    is_primary BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    
    UNIQUE(course_id, tutor_id),
    CONSTRAINT unique_primary_tutor 
        UNIQUE (course_id, is_primary) 
        WHERE is_primary = TRUE
);
```

### **Key Features:**
- ✅ **Junction Table** for many-to-many relationship
- ✅ **Unique Constraint** prevents duplicate assignments
- ✅ **Primary Tutor** constraint (only one per course)
- ✅ **Soft Delete** support
- ✅ **Tutor Roles** (INSTRUCTOR, ASSISTANT, COORDINATOR)

---

## 🔌 **API ENDPOINTS:**

### **1. GET - Get Assigned Tutors**
```
GET /api/ems/courses/:id/tutors
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tutorId": 2,
      "name": "Priya Sharma",
      "email": "priya.sharma@durkkas.com",
      "employeeCode": "EMP00002",
      "role": "INSTRUCTOR",
      "isPrimary": true
    },
    {
      "id": 2,
      "tutorId": 3,
      "name": "Arun Patel",
      "email": "arun.patel@durkkas.com",
      "employeeCode": "EMP00003",
      "role": "ASSISTANT",
      "isPrimary": false
    }
  ]
}
```

---

### **2. POST - Assign Tutors**
```
POST /api/ems/courses/:id/tutors
```

**Request Body:**
```json
{
  "tutorIds": [2, 3, 5],
  "isPrimary": true,
  "role": "INSTRUCTOR"
}
```

**Features:**
- ✅ Accepts **array of tutor IDs**
- ✅ First tutor becomes **primary** if `isPrimary: true`
- ✅ **Upsert** logic (updates if exists)
- ✅ Validates all tutors exist

**Response:**
```json
{
  "success": true,
  "message": "3 tutor(s) assigned successfully",
  "data": [...]
}
```

---

### **3. DELETE - Remove Tutor**
```
DELETE /api/ems/courses/:id/tutors?tutorId=2
```

**Features:**
- ✅ **Soft delete** (sets `deleted_at`)
- ✅ Removes specific tutor from course
- ✅ Validates permissions

**Response:**
```json
{
  "success": true,
  "message": "Tutor removed successfully"
}
```

---

## 🎨 **FRONTEND COMPONENT:**

### **MultiTutorModal**

**File:** `frontend/src/components/ems/multi-tutor-modal.tsx`

### **Features:**

#### **1. Multi-Select Interface:**
- ✅ **Checkboxes** for selecting multiple tutors
- ✅ **Visual feedback** (gradient background when selected)
- ✅ **Avatar circles** with initials
- ✅ **Tutor details** (name, email, code)

#### **2. Primary Tutor Selection:**
- ✅ **"Set Primary"** button for each selected tutor
- ✅ **Star icon** indicates primary tutor
- ✅ **Yellow badge** shows "Primary" status
- ✅ Only **one primary** allowed

#### **3. Currently Assigned Section:**
- ✅ Shows **currently assigned tutors**
- ✅ **Remove button** for each tutor
- ✅ **Primary badge** visible
- ✅ **Blue background** for assigned tutors

#### **4. Smart UI:**
- ✅ **Selection counter** (e.g., "3 selected")
- ✅ **Disabled state** when no selection
- ✅ **Loading states**
- ✅ **Success/Error notifications**

---

## 📊 **UI DESIGN:**

### **Modal Layout:**

```
┌─────────────────────────────────────────┐
│ Assign Tutors (Multiple)            ✕  │ ← Purple gradient header
│ Full Stack Development                  │
├─────────────────────────────────────────┤
│                                         │
│ CURRENTLY ASSIGNED (2)                  │
│ ┌─────────────────────────────────┐   │
│ │ PS  Priya Sharma  [⭐ Primary]  │ [Remove] │
│ │     priya.sharma@durkkas.com    │   │
│ └─────────────────────────────────┘   │
│ ┌─────────────────────────────────┐   │
│ │ AP  Arun Patel                  │ [Remove] │
│ │     arun.patel@durkkas.com      │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ━━━━ SELECT TUTORS (3 selected) ━━━━   │
│                                         │
│ ☑ PS  Priya Sharma                  ✓  │ ← Selected
│      📧 priya.sharma@durkkas.com       │
│      🆔 Code: EMP00002                 │
│      [⭐ Primary]                       │
│                                         │
│ ☑ AP  Arun Patel                    ✓  │ ← Selected
│      📧 arun.patel@durkkas.com         │
│      🆔 Code: EMP00003                 │
│      [Set Primary]                     │
│                                         │
│ ☐ RK  Rajesh Kumar                     │ ← Not selected
│      📧 rajesh.kumar@durkkas.com       │
│      🆔 Code: EMP00001                 │
│                                         │
├─────────────────────────────────────────┤
│         [Cancel] [Assign 3 Tutors]      │
└─────────────────────────────────────────┘
```

---

## 🔧 **USAGE:**

### **Step 1: Open Modal**
```tsx
import { MultiTutorModal } from '@/components/ems/multi-tutor-modal';

<MultiTutorModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    courseId={17}
    courseName="Full Stack Development"
    onSuccess={() => {
        // Refresh course data
        fetchCourses();
    }}
/>
```

### **Step 2: Select Tutors**
- Click checkboxes to select multiple tutors
- Selected tutors show purple background
- Checkmark appears on right

### **Step 3: Set Primary (Optional)**
- Click "Set Primary" on any selected tutor
- Star icon fills
- Badge changes to "Primary"
- Only one can be primary

### **Step 4: Assign**
- Click "Assign X Tutors" button
- API call assigns all selected tutors
- Success notification appears
- Modal closes
- Course data refreshes

### **Step 5: Remove (Optional)**
- Click "Remove" on any assigned tutor
- Confirmation (optional)
- Tutor removed from course
- List updates

---

## ✅ **BENEFITS:**

### **1. Flexibility:**
- ✅ Assign **1 or more** tutors per course
- ✅ Designate **primary tutor**
- ✅ Add/remove tutors anytime

### **2. Better Organization:**
- ✅ Clear **primary tutor** designation
- ✅ **Role-based** assignments
- ✅ **Visual hierarchy** (primary badge)

### **3. Scalability:**
- ✅ Supports **large courses** with multiple instructors
- ✅ **Team teaching** scenarios
- ✅ **Specialized roles** (theory, lab, etc.)

### **4. User Experience:**
- ✅ **Intuitive** checkbox interface
- ✅ **Visual feedback** at every step
- ✅ **Clear status** indicators
- ✅ **Smooth animations**

---

## 🧪 **TESTING:**

### **Test Cases:**

1. **Assign Single Tutor:**
   - Select 1 tutor
   - Set as primary
   - Assign
   - Verify in database

2. **Assign Multiple Tutors:**
   - Select 3 tutors
   - Set one as primary
   - Assign
   - Verify all assigned

3. **Change Primary:**
   - Assign tutors with primary
   - Change primary to different tutor
   - Verify only one primary

4. **Remove Tutor:**
   - Remove one tutor
   - Verify soft delete
   - Verify others remain

5. **Edge Cases:**
   - Assign 0 tutors (should error)
   - Assign duplicate (should update)
   - Remove primary (should work)

---

## 📈 **MIGRATION PATH:**

### **From Single to Multi:**

1. **Run Migration:**
   ```sql
   -- Create course_tutors table
   \i backend/database/migrations/20260203_multi_tutor_assignment.sql
   ```

2. **Migrate Existing Data (Optional):**
   ```sql
   INSERT INTO ems.course_tutors (company_id, course_id, tutor_id, is_primary)
   SELECT company_id, id, tutor_id, TRUE
   FROM ems.courses
   WHERE tutor_id IS NOT NULL;
   ```

3. **Update Frontend:**
   - Replace `AssignTutorModal` with `MultiTutorModal`
   - Update API calls
   - Test thoroughly

4. **Backward Compatibility:**
   - Keep `courses.tutor_id` column
   - Sync with primary tutor from `course_tutors`
   - Gradual migration

---

## 🎯 **NEXT STEPS:**

1. **Run Database Migration**
2. **Test Multi-Tutor API**
3. **Integrate Modal in Courses Page**
4. **Update Course Cards** to show multiple tutors
5. **Add Tutor Role Management**
6. **Create Tutor Dashboard** (show assigned courses)

---

**Bro, ipo multi-tutor system ready! One course ku multiple tutors assign panlaam!** 🦾✅🔥🎊
