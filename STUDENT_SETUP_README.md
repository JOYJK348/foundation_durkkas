# Student Authentication Setup Guide

## Overview
This guide explains how to set up and test the Student authentication flow in the Foundation Durkkas ERP system.

## Database Setup

### Step 1: Run the SQL Script
Execute the student setup script in your Supabase SQL Editor:

```bash
# Location: backend/database/seed_student_test_data.sql
```

This script will:
1. ✅ Create `STUDENT` role (Level 0, EMS product)
2. ✅ Create student-specific permissions
3. ✅ Create test company "DIPL" (Durkkas Institute of Professional Learning)
4. ✅ Create main campus branch
5. ✅ Create test student record in `ems.students`
6. ✅ Create user account with login credentials
7. ✅ Assign STUDENT role to the user
8. ✅ Create sample course and enroll the student

### Step 2: Verify Setup
After running the script, you should see:

```
✅ Student Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 Company: DIPL (Durkkas Institute of Professional Learning)
👤 Student: Rajesh Kumar Sharma
🆔 Student Code: DIPL2026001
📧 Email: rajesh.sharma@student.dipl.edu
🔑 Password: student@123
📚 Enrolled Course: Full Stack Web Development (WEB101)
📊 Progress: 25% (12/48 lessons completed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Test Login Credentials

### Student Account
- **Email**: `rajesh.sharma@student.dipl.edu`
- **Password**: `student@123`
- **Role**: STUDENT
- **Company**: DIPL
- **Student Code**: DIPL2026001

## Frontend Changes

### 1. Login Page (`frontend/src/app/(auth)/login/page.tsx`)
Updated to detect STUDENT role and redirect to `/ems/student` dashboard:

```typescript
// Check for Student role first (regardless of level)
if (roleName === "STUDENT") {
    router.push("/ems/student");
} else if (roleLevel >= 5) {
    router.push("/platform/dashboard");
}
// ... other role redirects
```

### 2. EMS Service (`frontend/src/services/emsService.ts`)
Created service layer with automatic authentication:
- Axios interceptor adds JWT token from cookies
- All EMS API calls are authenticated automatically

### 3. Student Dashboard (`frontend/src/app/ems/student/`)
Created initial dashboard structure:
- `layout.tsx`: Sidebar navigation and header
- `page.tsx`: Dashboard home with stats and course overview

## Testing the Flow

### Step 1: Login
1. Navigate to `http://localhost:3001/login`
2. Enter credentials:
   - Email: `rajesh.sharma@student.dipl.edu`
   - Password: `student@123`
3. Click "Sign In to Ecosystem"

### Step 2: Verify Redirect
After successful login, you should be redirected to:
```
http://localhost:3001/ems/student
```

### Step 3: Check Dashboard
You should see:
- ✅ Student Portal sidebar
- ✅ Welcome header with student name
- ✅ Stats cards (Enrolled Courses, Hours Learned, etc.)
- ✅ Active courses section
- ✅ Upcoming live classes

## API Endpoints Available

The student can access these endpoints (with JWT token):

### Student Profile
```
GET /api/ems/students/{id}
```

### Enrollments
```
GET /api/ems/enrollments?student_id={id}
```

### Courses
```
GET /api/ems/courses
GET /api/ems/courses/{id}
```

### Attendance
```
GET /api/ems/attendance?student_id={id}
```

### Quizzes
```
GET /api/ems/quizzes?course_id={id}
```

## Multi-Tenant Security

The system ensures:
1. ✅ Student can only access data from their company (DIPL)
2. ✅ JWT token includes company_id and branch_id
3. ✅ All API calls are filtered by tenant scope
4. ✅ Student cannot access other companies' data

## Role Hierarchy

```
Level 5: PLATFORM_ADMIN (Durkkas Team)
Level 4: COMPANY_ADMIN (Company Owner)
Level 2: PRODUCT_ADMIN (EMS_ADMIN, HRMS_ADMIN)
Level 1: BRANCH_ADMIN
Level 0: STUDENT, EMPLOYEE (Regular Users)
```

## Permissions Assigned to STUDENT Role

- `ems.courses.view` - View enrolled courses
- `ems.lessons.view` - View course lessons
- `ems.assignments.submit` - Submit assignments
- `ems.quizzes.attempt` - Attempt quizzes
- `ems.attendance.view` - View own attendance
- `ems.profile.view` - View own profile

## Next Steps for Development

### For Developer A (Navigation & Courses):
1. Create `CourseCard.tsx` component
2. Implement "My Courses" page
3. Build course viewer with lesson navigation
4. Add lesson completion tracking

### For Developer B (Analytics & Schedule):
1. Create dynamic stats cards with real data
2. Implement live class schedule
3. Build attendance calendar view
4. Add progress charts

### Shared Tasks:
1. Create Zustand store for EMS state management
2. Build reusable UI components
3. Implement real-time data fetching
4. Add loading states and error handling

## Troubleshooting

### Login fails with "Unauthorized"
- Check if SQL script ran successfully
- Verify user exists in `app_auth.users`
- Check role assignment in `app_auth.user_roles`

### Redirect goes to wrong page
- Clear browser cookies
- Check role name in database (should be "STUDENT")
- Verify login page redirect logic

### API calls return 401
- Check if JWT token is in cookies
- Verify axios interceptor is working
- Check backend JWT verification

## Database Queries for Debugging

### Check User
```sql
SELECT * FROM app_auth.users 
WHERE email = 'rajesh.sharma@student.dipl.edu';
```

### Check Role Assignment
```sql
SELECT u.email, r.name, r.level, ur.company_id
FROM app_auth.user_roles ur
JOIN app_auth.users u ON ur.user_id = u.id
JOIN app_auth.roles r ON ur.role_id = r.id
WHERE u.email = 'rajesh.sharma@student.dipl.edu';
```

### Check Student Record
```sql
SELECT * FROM ems.students 
WHERE student_code = 'DIPL2026001';
```

### Check Enrollment
```sql
SELECT s.student_code, c.course_name, e.enrollment_status
FROM ems.student_enrollments e
JOIN ems.students s ON e.student_id = s.id
JOIN ems.courses c ON e.course_id = c.id
WHERE s.student_code = 'DIPL2026001';
```

## Support

For issues or questions, contact the development team or refer to:
- Backend API Documentation: `backend/EMS_API_DOCUMENTATION.md`
- Deployment Guide: `backend/DEPLOYMENT_GUIDE.md`
