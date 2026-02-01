# EMS IMPLEMENTATION PLAN
## Dynamic, Role-Driven Education Management System

**Vision by: Jay Kumar**  
**Date: 2026-02-01**

---

## 🎯 Core Philosophy

This is **NOT** a static, company-specific application.  
This is a **global, dynamic education platform** that works for **any institution worldwide** without code changes.

---

## 🏗️ System Architecture

### Role Hierarchy (Top to Bottom)

```
PLATFORM_ADMIN (Durkkas Team)
    └── Creates companies/institutions
    
COMPANY_ADMIN (Institution Owner)
    └── Manages institution settings
    └── Creates ACADEMIC_MANAGER
    
ACADEMIC_MANAGER (Academic Head)
    └── Sets up academic structure
    └── Creates courses & batches
    └── Assigns tutors
    └── Controls tutor permissions
    
TUTOR (Content Creator)
    └── Creates academic content
    └── Manages assigned courses/batches
    └── Creates assignments & materials
    └── Grades students
    
STUDENT (Learner)
    └── Consumes assigned content
    └── Submits assignments
    └── Tracks progress
```

---

## 📋 Role Definitions

### 1. ACADEMIC_MANAGER

**Purpose**: Academic Administrator who sets up and controls the entire academic ecosystem

**Capabilities**:
- ✅ Create/Edit/Delete Courses
- ✅ Create/Edit/Delete Batches
- ✅ Assign Tutors to Courses/Batches
- ✅ Onboard Students
- ✅ Assign Students to Courses/Batches
- ✅ Define Tutor Permissions (what tutors can create)
- ✅ View all academic analytics
- ✅ Manage academic calendar
- ✅ Control module access (Assignments, Quizzes, Live Classes)

**Dashboard Sections**:
- Academic Structure Overview
- Course Management
- Batch Management
- Tutor Assignment
- Student Enrollment
- Academic Analytics
- Settings & Permissions

---

### 2. TUTOR

**Purpose**: Content Creator & Academic Facilitator

**Capabilities** (Based on Academic Manager's Permissions):
- ✅ View assigned courses/batches only
- ✅ Create course content (modules, lessons)
- ✅ Upload study materials
- ✅ Create assignments (if permitted)
- ✅ Create quizzes (if permitted)
- ✅ Schedule live classes (if permitted)
- ✅ Mark attendance
- ✅ Grade assignments
- ✅ Provide feedback
- ✅ View student progress (assigned students only)

**Dashboard Sections**:
- My Courses
- My Batches
- Create Content
- Assignments & Grading
- Live Classes
- Student Progress
- Announcements

---

### 3. STUDENT

**Purpose**: Learner & Content Consumer

**Capabilities**:
- ✅ View assigned course only
- ✅ View assigned batch only
- ✅ Access course materials
- ✅ Watch lessons
- ✅ Submit assignments
- ✅ Take quizzes
- ✅ Join live classes
- ✅ Track own progress
- ✅ View grades & feedback

**Dashboard Sections**:
- My Learning Dashboard
- My Course
- My Batch
- Today's Schedule
- Pending Assignments
- Upcoming Classes
- Progress Tracker
- Grades & Certificates

---

## 🔄 Data Flow Architecture

### Academic Manager → Tutor → Student Flow

```
ACADEMIC MANAGER creates:
├── Course: "Full Stack Development"
├── Batch: "FSD-2026-Morning"
└── Assigns Tutor: "Rajesh Kumar"

TUTOR creates (within assigned scope):
├── Module: "React Fundamentals"
├── Lesson: "Introduction to Hooks"
├── Assignment: "Build a Todo App"
└── Live Class: "React Best Practices"

STUDENT sees (auto-filtered):
├── Only their assigned course
├── Only their assigned batch
├── Only content created by their batch's tutor
└── Only assignments for their batch
```

**Key Principle**: **Zero manual linking**. Everything flows automatically based on institutional hierarchy.

---

## 🗄️ Database Design Principles

### 1. Multi-Tenancy (Institution Isolation)

Every table has:
```sql
company_id BIGINT NOT NULL REFERENCES core.companies(id)
```

This ensures **complete data isolation** between institutions.

### 2. Hierarchical Relationships

```
Institution (company_id)
    └── Course (company_id, course_id)
        └── Batch (company_id, course_id, batch_id)
            └── Student Enrollment (company_id, course_id, batch_id, student_id)
                └── Assignment Submission (company_id, batch_id, student_id, assignment_id)
```

### 3. No Orphan Data Rule

- ❌ No course without institution
- ❌ No batch without course
- ❌ No student without batch
- ❌ No assignment without batch
- ❌ No content without proper parent mapping

### 4. Soft Delete Only

```sql
deleted_at TIMESTAMPTZ
deleted_by BIGINT
delete_reason TEXT
```

**Audit trail for everything**.

---

## 🎨 Frontend Architecture

### Dashboard Routing Structure

```
/ems/academic-manager/dashboard    → Academic Manager Dashboard
/ems/tutor/dashboard               → Tutor Dashboard
/ems/student/dashboard             → Student Dashboard
```

### Shared Components (Role-Aware)

```typescript
// Example: CourseCard component
<CourseCard 
    course={course}
    userRole={userRole}  // Determines what actions are shown
/>

// Academic Manager sees: Edit, Delete, Assign Tutor
// Tutor sees: View, Add Content
// Student sees: View Only, Enroll Button (if applicable)
```

### API Design (Role-Based Access)

```typescript
// Single endpoint, role-based filtering
GET /api/ems/courses
  → Academic Manager: All courses in institution
  → Tutor: Only assigned courses
  → Student: Only enrolled courses

POST /api/ems/courses
  → Academic Manager: ✅ Allowed
  → Tutor: ❌ Forbidden (unless permitted)
  → Student: ❌ Forbidden
```

---

## 🔐 Permission System

### Academic Manager Controls Tutor Permissions

```typescript
interface TutorPermissions {
    can_create_courses: boolean;
    can_edit_course_structure: boolean;
    can_create_assignments: boolean;
    can_create_quizzes: boolean;
    can_schedule_live_classes: boolean;
    can_manage_students: boolean;
    can_view_analytics: boolean;
}
```

Stored in: `ems.tutor_permissions` table

**Dynamic Permission Checking**:
```typescript
// Backend middleware
if (userRole === 'TUTOR') {
    const permissions = await getTutorPermissions(userId);
    if (!permissions.can_create_assignments) {
        return forbidden('You do not have permission to create assignments');
    }
}
```

---

## 📊 Dashboard Implementations

### 1. Academic Manager Dashboard

**Widgets**:
- Total Courses
- Total Batches
- Total Students
- Total Tutors
- Active Enrollments
- Pending Approvals

**Quick Actions**:
- Create New Course
- Create New Batch
- Assign Tutor
- Enroll Student
- View Reports

**Recent Activity**:
- New enrollments
- Course completions
- Tutor assignments
- System notifications

---

### 2. Tutor Dashboard

**Widgets**:
- My Courses Count
- My Batches Count
- Total Students
- Pending Grading
- Upcoming Classes
- Recent Submissions

**Quick Actions**:
- Create Assignment
- Schedule Live Class
- Upload Material
- View Student Progress
- Post Announcement

**Content Management**:
- Course Content Builder
- Assignment Manager
- Quiz Builder
- Live Class Scheduler

---

### 3. Student Dashboard

**Widgets**:
- Course Progress %
- Completed Lessons
- Pending Assignments
- Upcoming Classes
- Current Grade
- Attendance %

**Learning Path**:
- Continue Learning (last accessed lesson)
- Next Lesson
- Recommended Materials

**Today's Schedule**:
- Live classes
- Assignment deadlines
- Quiz schedules

---

## 🚀 Implementation Phases

### Phase 1: Core Setup (Week 1)
- ✅ Database schema verification
- ✅ Role definitions in auth system
- ✅ Academic Manager role creation
- ✅ Permission system setup

### Phase 2: Academic Manager Dashboard (Week 2)
- ✅ Dashboard layout
- ✅ Course management UI
- ✅ Batch management UI
- ✅ Tutor assignment UI
- ✅ Student enrollment UI
- ✅ API endpoints

### Phase 3: Tutor Dashboard (Week 3)
- ✅ Dashboard layout
- ✅ Course content builder
- ✅ Assignment creation
- ✅ Quiz builder
- ✅ Live class scheduler
- ✅ Grading interface
- ✅ API endpoints

### Phase 4: Student Dashboard (Week 4)
- ✅ Dashboard layout
- ✅ Learning interface
- ✅ Assignment submission
- ✅ Quiz taking
- ✅ Live class joining
- ✅ Progress tracking
- ✅ API endpoints

### Phase 5: Integration & Testing (Week 5)
- ✅ End-to-end flow testing
- ✅ Role-based access testing
- ✅ Multi-institution testing
- ✅ Performance optimization
- ✅ Security audit

---

## 🎯 Success Criteria

### For Academic Manager:
- ✅ Can set up complete academic structure in < 30 minutes
- ✅ Can assign tutors and students without technical knowledge
- ✅ Can control all tutor permissions from dashboard
- ✅ Can view institution-wide analytics

### For Tutor:
- ✅ Sees only assigned courses/batches
- ✅ Can create content within permitted scope
- ✅ Content automatically appears in student dashboard
- ✅ Can grade and provide feedback efficiently

### For Student:
- ✅ Sees only assigned course and batch
- ✅ Zero irrelevant data
- ✅ Clear learning path
- ✅ Easy assignment submission
- ✅ Real-time progress tracking

### For System:
- ✅ Works for any institution worldwide
- ✅ Zero hardcoded company-specific logic
- ✅ Complete data isolation between institutions
- ✅ Scalable to 1000+ institutions
- ✅ Professional audit trail

---

## 🔧 Technical Stack

### Backend:
- Next.js API Routes
- PostgreSQL (Supabase)
- Role-based middleware
- JWT authentication

### Frontend:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Query (data fetching)

### State Management:
- Zustand (global state)
- Context API (auth & permissions)

---

## 📝 Next Steps

1. **Create ACADEMIC_MANAGER role** in database
2. **Build Academic Manager Dashboard** (priority)
3. **Implement permission system**
4. **Build Tutor Dashboard** (role-aware)
5. **Build Student Dashboard** (clean & focused)
6. **Test with multiple institutions**

---

**This is not a demo. This is a production-ready, enterprise-grade Education Management System.**

**Built for scale. Built for the world.**

---

**Prepared by**: AI Assistant  
**Approved by**: Jay Kumar  
**Date**: 2026-02-01
