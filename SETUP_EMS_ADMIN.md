# EMS Admin Setup Guide

## Step 1: Create EMS Admin User in Database

Run this SQL script to create the EMS Admin user with sample data:

```bash
psql -U postgres -d durkkas_foundation -f backend/database/seed_ems_admin_user.sql
```

**Password:** `admin`

## Step 2: Login Credentials

After running the SQL script, you can login with:

- **Email:** `ems.admin@dipl.edu`
- **Password:** `admin@123`
- **Role:** Branch Admin (Level 1)
- **Company:** DIPL (Durkkas Institute of Professional Learning)
- **Modules:** LMS, HR, ATTENDANCE

## Step 3: Access EMS Admin Dashboard

1. Go to: `http://localhost:3001/login`
2. Login with the credentials above
3. You will be redirected to `/branch/dashboard`
4. From there, you can access:
   - **Courses:** `/ems/admin/courses`
   - **Batches:** `/ems/admin/batches`
   - **Students:** `/ems/admin/students`
   - **Dashboard:** `/ems/admin/dashboard`

## What Was Created

### Database:
- ✅ DIPL Company with ENTERPRISE plan
- ✅ DIPL Main Campus branch with LMS module enabled
- ✅ EMS Admin user account (ems.admin@dipl.edu)
- ✅ Employee record for EMS Admin
- ✅ Branch Admin role assignment
- ✅ 3 Sample courses (Web Development, Data Science, Mobile App)
- ✅ 2 Sample batches
- ✅ 3 Sample students

### Frontend Pages:
- ✅ `/ems/admin/dashboard` - EMS Admin Dashboard
- ✅ `/ems/admin/courses` - Course Management
- ✅ `/ems/admin/batches` - Batch Management
- ✅ `/ems/admin/students` - Student Management

## Features

The EMS Admin can:
- View and manage all students
- Create and manage courses
- Create and manage batches
- View analytics and reports
- Access all LMS features through the sidebar

## Notes

- The EMS Admin uses the same `DashboardLayout` as other roles
- The sidebar will show LMS-specific menu items
- All pages are fully functional with no 404 errors
- The UI/UX matches the student dashboard design
