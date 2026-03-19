# EMS Multi-Tenant Architecture Implementation Plan
## Professional Company-Based LMS System

**Created:** 2026-02-01  
**Objective:** Transform EMS into a professional multi-tenant LMS with company-level isolation similar to CRM module

---

## 🎯 Core Requirements

### 1. Company Admin Dashboard Integration
- Add "LMS / Academic Management" module to Company Admin dashboard
- Provide access control similar to CRM module
- Company-level data isolation (only see their company's data)

### 2. Data Isolation Strategy
- **All queries filtered by `company_id`** (automatic via middleware)
- **Branch-level filtering** for branch-specific roles
- **Role-based access control** (RBAC) for different user types

### 3. User Roles & Access Levels
| Role | Access Level | Data Scope |
|------|-------------|------------|
| **PLATFORM_ADMIN** | Global | All companies |
| **COMPANY_ADMIN** | Company-wide | Single company (all branches) |
| **ACADEMIC_MANAGER** | Company-wide | Single company (all branches) |
| **BRANCH_ADMIN** | Branch-specific | Single branch only |
| **TUTOR** | Limited | Only assigned courses |
| **STUDENT** | Limited | Only enrolled courses |

---

## 📋 Implementation Phases

### Phase 1: Frontend Architecture Updates

#### A. Company Admin Dashboard Enhancement
**File:** `frontend/src/app/branch-admin/dashboard/page.tsx`

**Changes:**
1. Add LMS/Academic Management card to dashboard
2. Create navigation to `/branch-admin/lms` or `/ems/academic-manager`
3. Add permission check for LMS module access

#### B. API Client Enhancement
**File:** `frontend/src/lib/api.ts`

**Changes:**
```typescript
// Auto-inject company_id and branch_id headers
api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    const companyId = Cookies.get('x-company-id');
    const branchId = Cookies.get('x-branch-id');
    
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (companyId) config.headers['x-company-id'] = companyId;
    if (branchId) config.headers['x-branch-id'] = branchId;
    
    return config;
});
```

#### C. Academic Manager Dashboard Refactor
**Files to Update:**
- `frontend/src/app/ems/academic-manager/dashboard/page.tsx`
- All child pages (courses, students, batches, etc.)

**Changes:**
1. Fetch real data from API (currently showing hardcoded "0")
2. Display company-specific statistics
3. Add company context indicator in UI
4. Implement proper loading states

---

### Phase 2: Backend Architecture Updates

#### A. Middleware Enhancement
**File:** `backend/middleware/tenantFilter.ts`

**Current Status:** ✅ Already implemented
- `getUserTenantScope()` - Gets user's company/branch context
- `autoAssignCompany()` - Auto-assigns company_id on INSERT
- `applyTenantFilter()` - Filters queries by company_id

**Additional Enhancement Needed:**
```typescript
// Add EMS profile resolution
export async function getEMSProfile(userId: number, roleType: string) {
    if (roleType === 'TUTOR') {
        // Find employee_id from core.employees where user_id = userId
        return { profile_type: 'tutor', profile_id: employeeId };
    }
    if (roleType === 'STUDENT') {
        // Find student_id from ems.students where user_id = userId
        return { profile_type: 'student', profile_id: studentId };
    }
    return null;
}
```

#### B. Service Layer Updates
**Files to Update:**
- `backend/lib/services/CourseService.ts`
- `backend/lib/services/StudentService.ts`
- `backend/lib/services/BatchService.ts`
- All other EMS services

**Pattern to Follow:**
```typescript
// Example: CourseService.getAllCourses()
static async getAllCourses(companyId: number, userId?: number, roleType?: string) {
    let query = ems.courses()
        .select('*')
        .eq('company_id', companyId)
        .is('deleted_at', null);
    
    // Role-based filtering
    if (roleType === 'TUTOR' && userId) {
        const profile = await getEMSProfile(userId, 'TUTOR');
        query = query.eq('tutor_id', profile.profile_id);
    }
    
    if (roleType === 'STUDENT' && userId) {
        // Join with enrollments table
        query = query.in('id', enrolledCourseIds);
    }
    
    return query.order('created_at', { ascending: false });
}
```

#### C. API Route Updates
**Files to Update:**
- `backend/app/api/ems/courses/route.ts`
- `backend/app/api/ems/students/route.ts`
- `backend/app/api/ems/batches/route.ts`
- All other EMS API routes

**Pattern:**
```typescript
export async function GET(req: NextRequest) {
    const userId = await getUserIdFromToken(req);
    if (!userId) return errorResponse(null, 'Unauthorized', 401);
    
    const scope = await getUserTenantScope(userId);
    
    // Pass company context to service
    const data = await CourseService.getAllCourses(
        scope.companyId!,
        userId,
        scope.roleType
    );
    
    return successResponse(data, `Fetched ${data.length} courses`);
}
```

---

### Phase 3: Database Schema Verification

#### Tables to Verify (company_id column exists)
- ✅ `ems.students` - Has company_id, branch_id
- ✅ `ems.courses` - Has company_id, branch_id, tutor_id
- ✅ `ems.batches` - Has company_id, branch_id, course_id
- ✅ `ems.enrollments` - Has company_id
- ✅ `ems.assignments` - Has company_id
- ✅ `ems.quizzes` - Has company_id
- ✅ `ems.attendance_sessions` - Has company_id
- ✅ `ems.course_materials` - Has company_id

**All tables already have proper multi-tenant structure!**

---

### Phase 4: UI/UX Enhancements

#### A. Company Context Indicator
Add to all EMS pages:
```tsx
<div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
    <div className="flex items-center">
        <Building2 className="h-5 w-5 text-blue-500 mr-2" />
        <span className="text-sm font-medium text-blue-900">
            Viewing: {companyName} {branchName ? `- ${branchName}` : ''}
        </span>
    </div>
</div>
```

#### B. Real-time Statistics
Update dashboard to show:
- Total Students (company-specific)
- Total Courses (company-specific)
- Active Batches (company-specific)
- Total Tutors (company-specific)

#### C. Empty States
Add proper empty states when no data:
```tsx
{courses.length === 0 && (
    <EmptyState
        icon={BookOpen}
        title="No Courses Yet"
        description="Create your first course to get started"
        action={
            <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
            </Button>
        }
    />
)}
```

---

## 🔐 Security Checklist

- [ ] All API routes verify user authentication
- [ ] All queries filtered by company_id (via middleware)
- [ ] Role-based access control implemented
- [ ] Tutor can only see their assigned courses
- [ ] Student can only see enrolled courses
- [ ] Company Admin cannot see other companies' data
- [ ] Platform Admin can switch company context

---

## 🚀 Deployment Steps

### Step 1: Update Frontend API Client
1. Modify `lib/api.ts` to send company/branch headers
2. Test authentication flow
3. Verify headers are sent correctly

### Step 2: Update Backend Services
1. Enhance all EMS services with company filtering
2. Add role-based query logic
3. Test with different user roles

### Step 3: Update API Routes
1. Modify all EMS API routes to use tenant scope
2. Add proper error handling
3. Test authorization

### Step 4: Update Frontend Pages
1. Fetch real data from APIs
2. Add company context indicators
3. Implement loading/error states
4. Add empty states

### Step 5: Company Admin Integration
1. Add LMS module to Company Admin dashboard
2. Create navigation routes
3. Test access control

---

## 📊 Testing Matrix

| User Role | Test Scenario | Expected Result |
|-----------|--------------|-----------------|
| Platform Admin | View all companies' courses | ✅ See all |
| Company Admin | View courses | ✅ See only their company |
| Academic Manager | View courses | ✅ See only their company |
| Tutor | View courses | ✅ See only assigned courses |
| Student | View courses | ✅ See only enrolled courses |
| Company A User | Try to access Company B data | ❌ Blocked by middleware |

---

## 🎨 Design Consistency

Follow CRM module patterns:
- Same color scheme (purple for EMS)
- Same card layouts
- Same navigation structure
- Same permission model
- Same data isolation strategy

---

## 📝 Files to Modify

### Frontend (15 files)
1. `lib/api.ts` - Add headers
2. `app/branch-admin/dashboard/page.tsx` - Add LMS module
3. `app/ems/academic-manager/dashboard/page.tsx` - Real data
4. `app/ems/academic-manager/courses/page.tsx` - Company filtering
5. `app/ems/academic-manager/students/page.tsx` - Company filtering
6. `app/ems/academic-manager/batches/page.tsx` - Company filtering
7. `app/ems/academic-manager/assignments/page.tsx` - Company filtering
8. `app/ems/academic-manager/quizzes/page.tsx` - Company filtering
9. `app/ems/academic-manager/attendance/page.tsx` - Company filtering
10. `app/ems/academic-manager/tutors/page.tsx` - Company filtering
11. `app/ems/academic-manager/announcements/page.tsx` - Company filtering
12. `app/ems/academic-manager/certificates/page.tsx` - Company filtering
13. `app/ems/academic-manager/live-classes/page.tsx` - Company filtering
14. `app/ems/academic-manager/materials/page.tsx` - Company filtering
15. `app/ems/academic-manager/progress/page.tsx` - Company filtering

### Backend (10+ files)
1. `middleware/tenantFilter.ts` - Add EMS profile resolution
2. `lib/services/CourseService.ts` - Role-based filtering
3. `lib/services/StudentService.ts` - Company filtering
4. `lib/services/BatchService.ts` - Company filtering
5. `app/api/ems/courses/route.ts` - Use tenant scope
6. `app/api/ems/students/route.ts` - Use tenant scope
7. `app/api/ems/batches/route.ts` - Use tenant scope
8. `app/api/ems/assignments/route.ts` - Use tenant scope
9. `app/api/ems/quizzes/route.ts` - Use tenant scope
10. All other EMS API routes

---

## ✅ Success Criteria

1. Company Admin can access LMS from their dashboard
2. All data is filtered by company_id automatically
3. No manual company_id selection needed
4. Tutors see only their courses
5. Students see only enrolled courses
6. Platform Admin can view all companies
7. Zero data leakage between companies
8. Professional UI matching CRM standards

---

## 🔄 Migration Path

### For Existing Data
```sql
-- Verify all EMS tables have company_id
SELECT table_name 
FROM information_schema.columns 
WHERE table_schema = 'ems' 
AND column_name = 'company_id';

-- Check for any NULL company_id (should be none)
SELECT 'students' as table_name, COUNT(*) as null_count 
FROM ems.students WHERE company_id IS NULL
UNION ALL
SELECT 'courses', COUNT(*) FROM ems.courses WHERE company_id IS NULL
UNION ALL
SELECT 'batches', COUNT(*) FROM ems.batches WHERE company_id IS NULL;
```

---

## 📞 Support & Rollback

### Rollback Plan
If issues occur:
1. Revert API client changes (remove headers)
2. Revert service layer changes
3. Keep database schema (no changes needed)
4. Frontend pages will continue to work with old API

### Monitoring
- Log all company context switches
- Monitor query performance
- Track authorization failures
- Alert on data leakage attempts

---

**Status:** Ready for Implementation  
**Estimated Time:** 4-6 hours  
**Priority:** High  
**Risk Level:** Medium (requires careful testing)
