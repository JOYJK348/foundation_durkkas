# 🚀 MULTI-TUTOR SETUP GUIDE

## ✅ **WHAT WAS CREATED:**

### **1. Database Migration:**
📁 `backend/database/migrations/20260203_multi_tutor_assignment.sql`
- Creates `ems.course_tutors` junction table
- Supports multiple tutors per course
- One primary tutor constraint
- Soft delete support

### **2. Backend API:**
📁 `backend/app/api/ems/courses/[id]/tutors/route.ts`
- `GET` - Fetch assigned tutors
- `POST` - Assign multiple tutors
- `DELETE` - Remove tutor

### **3. Frontend Component:**
📁 `frontend/src/components/ems/multi-tutor-modal.tsx`
- Multi-select UI with checkboxes
- Primary tutor selection
- Remove functionality
- Beautiful gradient design

### **4. Documentation:**
📁 `MULTI_TUTOR_ASSIGNMENT.md`
- Complete feature documentation
- API reference
- Usage examples
- Testing guide

---

## 🔧 **SETUP STEPS:**

### **Step 1: Run Database Migration**

You need to run the SQL migration to create the `course_tutors` table.

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard
2. SQL Editor
3. Copy contents of `backend/database/migrations/20260203_multi_tutor_assignment.sql`
4. Run the SQL

**Option B: Via psql (if installed)**
```bash
psql -h aws-0-ap-south-1.pooler.supabase.com \
     -p 6543 \
     -d postgres \
     -U postgres.yxnrjwqrjbzfxqwsqwkl \
     -f backend/database/migrations/20260203_multi_tutor_assignment.sql
```

---

### **Step 2: Update Courses Page**

Replace the single-tutor modal with multi-tutor modal:

**File:** `frontend/src/app/ems/academic-manager/courses/page.tsx`

```tsx
// Change import
import { MultiTutorModal } from '@/components/ems/multi-tutor-modal';

// In the component
<MultiTutorModal
    isOpen={showAssignTutorModal}
    onClose={() => setShowAssignTutorModal(false)}
    courseId={selectedCourse?.id || 0}
    courseName={selectedCourse?.course_name || ''}
    onSuccess={() => {
        fetchCourses();
        fetchCourseMappings();
    }}
/>
```

---

### **Step 3: Update Course Cards (Optional)**

Show multiple tutors on course cards:

```tsx
{/* Tutors Info */}
<div className="flex items-center gap-2 p-3 bg-blue-100 border border-blue-300 rounded-lg text-sm">
    <span className="text-blue-700 font-bold">👨‍🏫 Tutors:</span>
    {course.tutors && course.tutors.length > 0 ? (
        <div className="flex flex-wrap gap-1">
            {course.tutors.map((tutor, idx) => (
                <span key={idx} className="text-blue-900 font-semibold">
                    {tutor.name}
                    {tutor.isPrimary && <span className="text-yellow-600">⭐</span>}
                    {idx < course.tutors.length - 1 && ','}
                </span>
            ))}
        </div>
    ) : (
        <span className="text-gray-600 italic font-medium">Not assigned</span>
    )}
</div>
```

---

### **Step 4: Test the Feature**

1. **Open Courses Page:**
   ```
   http://localhost:3001/ems/academic-manager/courses
   ```

2. **Click "Assign Tutor":**
   - New multi-select modal opens
   - Shows all available tutors

3. **Select Multiple Tutors:**
   - Click checkboxes to select
   - Selected tutors show purple background

4. **Set Primary Tutor:**
   - Click "Set Primary" on one tutor
   - Star icon appears

5. **Assign:**
   - Click "Assign X Tutors"
   - Success notification
   - Course updates

6. **Remove Tutor:**
   - Click "Remove" on any assigned tutor
   - Tutor removed from course

---

## 📊 **FEATURES:**

### **✅ Multi-Select:**
- Select 1 or more tutors
- Checkboxes for easy selection
- Visual feedback

### **✅ Primary Tutor:**
- Designate one as primary
- Star icon indicator
- Yellow badge

### **✅ Role-Based:**
- INSTRUCTOR (default)
- ASSISTANT
- COORDINATOR

### **✅ Smart UI:**
- Shows currently assigned
- Remove functionality
- Loading states
- Success/Error notifications

---

## 🎯 **COMPARISON:**

### **Old (Single Tutor):**
```
Course → 1 Tutor
```

### **New (Multi Tutor):**
```
Course → Multiple Tutors
         ├─ Primary Tutor (⭐)
         ├─ Assistant Tutor
         └─ Lab Coordinator
```

---

## 🧪 **TESTING CHECKLIST:**

- [ ] Database migration runs successfully
- [ ] API endpoints work (GET, POST, DELETE)
- [ ] Modal opens and shows tutors
- [ ] Can select multiple tutors
- [ ] Can set primary tutor
- [ ] Can assign tutors
- [ ] Can remove tutors
- [ ] Success notifications appear
- [ ] Course data refreshes
- [ ] No errors in console

---

## 📝 **NOTES:**

### **Backward Compatibility:**
- Old `courses.tutor_id` column still exists
- Can be synced with primary tutor
- Gradual migration supported

### **Data Migration (Optional):**
If you want to migrate existing single-tutor assignments:

```sql
INSERT INTO ems.course_tutors (company_id, course_id, tutor_id, is_primary, created_at)
SELECT company_id, id, tutor_id, TRUE, NOW()
FROM ems.courses
WHERE tutor_id IS NOT NULL
ON CONFLICT (course_id, tutor_id) DO NOTHING;
```

---

## 🚀 **READY TO USE!**

Once you run the migration, the multi-tutor system is ready!

**Bro, setup guide ready! Follow these steps to enable multi-tutor!** 🦾✅🔥
