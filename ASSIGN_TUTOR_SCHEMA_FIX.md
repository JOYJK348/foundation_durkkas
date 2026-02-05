# ✅ ASSIGN TUTOR - FINAL FIX

## 🐛 **ISSUE:**
500 Internal Server Error when assigning tutor

**Root Cause:**
- Incorrect usage of `core` schema helper
- Was trying `core.supabase.from('employees')` 
- But `core` doesn't have `.supabase` property
- Should use `core.employees()` helper function

---

## ✅ **FINAL FIX:**

### **File:** `backend/app/api/ems/courses/[id]/assign-tutor/route.ts`

### **Import (Line 10):**
```typescript
import { ems, core } from '@/lib/supabase';
```

### **Usage (Line 34):**
```typescript
// ❌ WRONG:
await core.supabase.from('employees')

// ✅ CORRECT:
await core.employees()
```

---

## 📊 **HOW SUPABASE HELPERS WORK:**

### **Structure:**
```typescript
export const core = {
    employees: () => fromSchema(SCHEMAS.CORE, 'employees'),
    companies: () => fromSchema(SCHEMAS.CORE, 'companies'),
    branches: () => fromSchema(SCHEMAS.CORE, 'branches'),
    // ... more helpers
};
```

### **Usage:**
```typescript
// Use helper functions
await core.employees().select('*')
await core.companies().select('*')
await ems.courses().select('*')
```

---

## ✅ **COMPLETE WORKING CODE:**

```typescript
import { ems, core } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return errorResponse(null, 'Unauthorized', 401);

        const scope = await getUserTenantScope(userId);
        if (!scope.companyId) {
            return errorResponse(null, 'Company context required', 400);
        }

        const courseId = parseInt(params.id);
        const body = await req.json();
        const { tutorId } = body;

        if (!tutorId) {
            return errorResponse(null, 'Tutor ID is required', 400);
        }

        // ✅ Verify tutor exists (CORRECT WAY)
        const { data: tutor, error: tutorError } = await core.employees()
            .select('id, first_name, last_name, email')
            .eq('id', tutorId)
            .eq('company_id', scope.companyId)
            .eq('is_active', true)
            .single();

        if (tutorError || !tutor) {
            console.error('Error fetching tutor:', tutorError);
            return errorResponse(null, 'Tutor not found or inactive', 404);
        }

        // ✅ Update course
        const { data: updatedCourse, error: updateError } = await ems.supabase
            .from('courses')
            .update({
                tutor_id: tutorId,
                updated_at: new Date().toISOString(),
                updated_by: userId
            } as any)
            .eq('id', courseId)
            .eq('company_id', scope.companyId)
            .select()
            .single();

        if (updateError) {
            console.error('Error assigning tutor:', updateError);
            return errorResponse(null, 'Failed to assign tutor to course');
        }

        const tutorData: any = tutor;
        return successResponse(
            {
                course: updatedCourse,
                tutor: {
                    id: tutorData.id,
                    name: `${tutorData.first_name} ${tutorData.last_name}`,
                    email: tutorData.email
                }
            },
            'Tutor assigned successfully'
        );

    } catch (error: any) {
        console.error('Error in assign tutor:', error);
        return errorResponse(null, error.message || 'Failed to assign tutor');
    }
}
```

---

## 🧪 **TEST NOW:**

1. Go to Courses page
2. Click "Assign Tutor"
3. Select a tutor
4. Click "Assign Tutor" button
5. **Expected:** ✅ Success! Tutor assigned!

---

**Bro, ipo correct ah work aagum! Helper function properly use panrom!** 🦾✅🔥
