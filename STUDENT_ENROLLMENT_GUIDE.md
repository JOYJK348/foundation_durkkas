# Student Enrollment & Login System - Complete Guide

## 🎓 Overview
This document explains the complete student enrollment workflow, auto-generated credentials, and dynamic student dashboard system.

---

## 📋 Student Enrollment Process

### 1. **Academic Manager Enrolls Student**

When an Academic Manager creates a new student through the `/ems/academic-manager/students` page:

**Frontend Flow:**
- Navigate to Academic Manager Dashboard → Students → Add Student
- Fill in student details (name, email, phone, etc.)
- Submit the form

**Backend Process (`POST /api/ems/students`):**
1. **Auto-generate credentials:**
   - Email: Uses the provided email
   - Password: `Student@123` (default for all students)
   - Student Code: Auto-generated (e.g., `STU001`, `STU002`)

2. **Create user account:**
   - Creates entry in `app_auth.users` table
   - Hashes password with bcrypt
   - Assigns `STUDENT` role (role_id = 6)
   - Links to company and branch

3. **Create student record:**
   - Creates entry in `ems.students` table
   - Links to the created user account via `user_id`

4. **Response includes credentials:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_code": "STU001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "login_credentials": {
      "email": "john.doe@example.com",
      "password": "Student@123",
      "student_code": "STU001"
    }
  },
  "message": "Student admitted successfully! Login Email: john.doe@example.com | Password: Student@123"
}
```

---

## 🔐 Student Login Process

### 1. **Student Login**

**URL:** `http://localhost:3001/login`

**Credentials:**
- **Email:** The email provided during enrollment
- **Password:** `Student@123` (default)

**Example:**
```
Email: john.doe@example.com
Password: Student@123
```

### 2. **Login Flow**

**Frontend (`/app/(auth)/login/page.tsx`):**
1. Student enters email and password
2. Calls `POST /api/auth/login`
3. Receives JWT token and user data
4. Checks user role
5. **If role is STUDENT:** Redirects to `/ems/student/dashboard`

**Backend (`POST /api/auth/login`):**
1. Validates credentials
2. Fetches user with roles
3. Generates JWT token
4. Returns user data with role information

---

## 📊 Student Dashboard (Dynamic & Real-time)

### **URL:** `/ems/student/dashboard`

### **Features:**

#### 1. **Personalized Welcome**
- Shows student name and student code
- Displays personalized greeting

#### 2. **Real-time Statistics**
- **Total Courses:** Number of enrolled courses
- **Active Assignments:** Pending assignments count
- **Pending Quizzes:** Quizzes not yet attempted
- **Average Progress:** Overall course completion percentage

#### 3. **Enrolled Courses Section**
- Shows all courses the student is enrolled in
- Displays:
  - Course name and level
  - Thumbnail image
  - Progress bar with percentage
  - Lessons completed vs total lessons
  - "Continue Learning" button

#### 4. **Upcoming Assignments**
- Lists pending assignments with:
  - Assignment title
  - Course name
  - Due date
  - Submission status
  - Quick action button

#### 5. **Upcoming Quizzes**
- Shows available quizzes with:
  - Quiz title
  - Total questions and marks
  - Attempts taken vs max attempts
  - Best score achieved
  - Time limit

#### 6. **Upcoming Live Classes**
- Displays scheduled live classes:
  - Class title
  - Course name
  - Date and time
  - "Join Class" button with meeting link

---

## 🔄 Data Flow

### **Dashboard API:** `GET /api/ems/students/dashboard`

**Request:**
- Requires valid JWT token in Authorization header
- Automatically identifies student from token

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "student_code": "STU001"
    },
    "stats": {
      "total_courses": 3,
      "active_assignments": 5,
      "pending_quizzes": 2,
      "average_progress": 68.5,
      "upcoming_classes": 1
    },
    "enrolled_courses": [
      {
        "id": 1,
        "enrollment_date": "2024-01-15",
        "completion_percentage": 68,
        "total_lessons": 20,
        "lessons_completed": 14,
        "course": {
          "id": 1,
          "course_name": "Web Development Fundamentals",
          "course_level": "Beginner",
          "thumbnail_url": "...",
          "duration_hours": 40
        }
      }
    ],
    "pending_assignments": [
      {
        "id": 1,
        "assignment_title": "Build a Landing Page",
        "deadline": "2024-02-10T23:59:59Z",
        "max_marks": 100,
        "status": "NOT_SUBMITTED",
        "course": {
          "id": 1,
          "course_name": "Web Development Fundamentals"
        }
      }
    ],
    "upcoming_quizzes": [
      {
        "id": 1,
        "quiz_title": "HTML & CSS Basics",
        "total_questions": 20,
        "total_marks": 100,
        "duration_minutes": 30,
        "attempts_taken": 0,
        "attempts_remaining": 3,
        "best_score": 0
      }
    ],
    "upcoming_live_classes": [
      {
        "id": 1,
        "class_title": "Introduction to JavaScript",
        "scheduled_date": "2024-02-05",
        "start_time": "10:00:00",
        "meeting_link": "https://meet.google.com/abc-defg-hij"
      }
    ]
  }
}
```

---

## 🗄️ Database Tables Involved

### 1. **Student Enrollment**
```sql
-- Main student record
ems.students (id, user_id, student_code, first_name, last_name, email, ...)

-- User authentication
app_auth.users (id, email, password_hash, ...)

-- Role assignment
app_auth.user_roles (user_id, role_id, company_id, branch_id)
```

### 2. **Course Enrollment**
```sql
-- Enrollment record
ems.student_enrollments (
  id, 
  student_id, 
  course_id, 
  batch_id,
  completion_percentage,
  total_lessons,
  lessons_completed,
  enrollment_status
)
```

### 3. **Assignments**
```sql
-- Assignment definition
ems.assignments (id, course_id, assignment_title, deadline, max_marks, ...)

-- Student submissions
ems.assignment_submissions (
  id, 
  assignment_id, 
  student_id,
  submission_status,
  marks_obtained,
  submitted_at
)
```

### 4. **Quizzes**
```sql
-- Quiz definition
ems.quizzes (id, course_id, quiz_title, total_questions, max_attempts, ...)

-- Student attempts
ems.quiz_attempts (
  id,
  quiz_id,
  student_id,
  attempt_number,
  marks_obtained,
  percentage,
  status
)
```

### 5. **Live Classes**
```sql
ems.live_classes (
  id,
  course_id,
  class_title,
  scheduled_date,
  start_time,
  meeting_link,
  class_status
)
```

---

## 🧪 Testing the Complete Flow

### **Step 1: Create a Student**
1. Login as Academic Manager
2. Go to Students page
3. Click "Add Student"
4. Fill in details:
   ```
   First Name: Test
   Last Name: Student
   Email: test.student@example.com
   Phone: 9876543210
   Student Code: STU001
   ```
5. Submit
6. **Note the credentials** shown in the success message

### **Step 2: Enroll Student in a Course**
1. Go to Courses page
2. Create a course (if not exists)
3. Go to Students page
4. Click on the student
5. Enroll in course

### **Step 3: Create Assignment for the Course**
1. Go to Assignments page
2. Create assignment for the course
3. Set deadline

### **Step 4: Login as Student**
1. Logout from Academic Manager
2. Go to login page
3. Enter student credentials:
   ```
   Email: test.student@example.com
   Password: Student@123
   ```
4. **Auto-redirect to:** `/ems/student/dashboard`

### **Step 5: Verify Dashboard**
- Check if student name is displayed
- Verify course appears in "Continue Learning"
- Check if assignment appears in "Upcoming Assignments"
- Verify progress percentage
- Test "Continue Learning" button

---

## 🎯 Key Features

### ✅ **Auto-Generated Credentials**
- Email: Provided during enrollment
- Password: `Student@123` (standardized)
- Student Code: Auto-generated unique identifier

### ✅ **Automatic Role Assignment**
- Student role automatically assigned
- Proper permissions configured
- Company and branch linkage

### ✅ **Dynamic Dashboard**
- Real-time data from database
- No hardcoded values
- Automatic updates when:
  - New courses enrolled
  - Assignments created
  - Quizzes added
  - Live classes scheduled

### ✅ **Proper Redirects**
- Login automatically detects student role
- Redirects to student dashboard
- No manual navigation needed

---

## 📱 Student Dashboard Pages

### Current Implementation:
- ✅ `/ems/student/dashboard` - Main dashboard (DYNAMIC)
- 🔄 `/ems/student/courses` - Course listing
- 🔄 `/ems/student/courses/[id]` - Course details
- 🔄 `/ems/student/assignments` - Assignment listing
- 🔄 `/ems/student/assignments/[id]` - Assignment submission
- 🔄 `/ems/student/assessments` - Quiz listing
- 🔄 `/ems/student/progress` - Progress tracking
- 🔄 `/ems/student/attendance` - Attendance records

---

## 🔧 Configuration

### **Default Password**
To change the default student password, edit:
```typescript
// backend/app/api/ems/students/route.ts
const generatedPassword = 'Student@123'; // Change this
```

### **Student Role ID**
Default student role ID is `6`. To verify:
```sql
SELECT id, name FROM app_auth.roles WHERE name = 'STUDENT';
```

---

## 🚀 Next Steps

1. **Password Reset:** Implement password change functionality
2. **Email Notifications:** Send credentials via email
3. **Course Pages:** Build detailed course viewing pages
4. **Assignment Submission:** Create submission interface
5. **Quiz Taking:** Implement quiz attempt interface
6. **Progress Tracking:** Build detailed analytics

---

## 📞 Support

For issues or questions:
- Check backend logs: `npm run dev` in backend folder
- Check frontend console: Browser DevTools
- Verify database: Check if student record exists in `ems.students`
- Verify enrollment: Check `ems.student_enrollments` table

---

**Last Updated:** 2024-02-02
**Version:** 1.0.0
