# ✅ SQL SYNTAX ERROR FIX

## 🐛 **ERROR:**
```
ERROR: 42601: syntax error at or near "WHERE" LINE 26
```

**Cause:** The `UNIQUE NULLS NOT DISTINCT` syntax is not supported in older PostgreSQL versions.

---

## ✅ **FIX:**

### **Before (BROKEN):**
```sql
-- This syntax doesn't work in all PostgreSQL versions
CONSTRAINT unique_primary_tutor UNIQUE NULLS NOT DISTINCT (course_id, is_primary) 
    WHERE is_primary = TRUE
```

### **After (WORKING):**
```sql
-- Use partial unique index instead
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_tutors_primary_unique 
    ON ems.course_tutors(course_id) 
    WHERE deleted_at IS NULL AND is_primary = TRUE;
```

---

## 📊 **HOW IT WORKS:**

### **Partial Unique Index:**
- Creates a **unique index** on `course_id`
- **Only** for rows where `is_primary = TRUE`
- **Ignores** soft-deleted rows (`deleted_at IS NULL`)

### **Result:**
- ✅ Only **one primary tutor** per course
- ✅ Multiple **non-primary** tutors allowed
- ✅ Works in **all PostgreSQL versions**

---

## 🧪 **TESTING:**

### **Test 1: Assign Primary Tutor**
```sql
-- Should work
INSERT INTO ems.course_tutors (company_id, course_id, tutor_id, is_primary)
VALUES (1, 17, 2, TRUE);
```

### **Test 2: Try to Add Second Primary**
```sql
-- Should fail with unique constraint error
INSERT INTO ems.course_tutors (company_id, course_id, tutor_id, is_primary)
VALUES (1, 17, 3, TRUE);
-- ERROR: duplicate key value violates unique constraint
```

### **Test 3: Add Non-Primary Tutors**
```sql
-- Should work (multiple allowed)
INSERT INTO ems.course_tutors (company_id, course_id, tutor_id, is_primary)
VALUES (1, 17, 3, FALSE);

INSERT INTO ems.course_tutors (company_id, course_id, tutor_id, is_primary)
VALUES (1, 17, 4, FALSE);
```

---

## ✅ **NOW RUN THE MIGRATION:**

The SQL file is fixed! You can now run it in Supabase:

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Copy the entire contents of:
   ```
   backend/database/migrations/20260203_multi_tutor_assignment.sql
   ```
4. Paste and **Run**
5. Should succeed! ✅

---

**Bro, SQL syntax fix aagiduchi! Ipo migration run panlaam!** 🦾✅🔥
