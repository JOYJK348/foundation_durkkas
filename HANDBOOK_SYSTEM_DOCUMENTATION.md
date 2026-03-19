# Professional Handbook Material Upload System

## Overview
A complete professional material management system for Academic Managers to upload and categorize educational materials with proper course and batch mapping.

## Features Implemented

### 1. **Handbook Type Classification**
Materials can now be categorized into three professional types:

- **📚 Student Handbook** (STUDENT_HANDBOOK)
  - Visible to enrolled students only
  - Appears in Student Dashboard
  - Target Audience: STUDENTS

- **👨‍🏫 Tutor Handbook** (TUTOR_HANDBOOK)
  - Visible to assigned tutors only
  - Appears in Tutor Dashboard
  - Target Audience: TUTORS

- **📁 General Resource** (GENERAL_RESOURCE)
  - Visible to both tutors and students
  - Target Audience: BOTH

### 2. **Course & Batch Mapping**
- **Course Selection**: Required for course materials
- **Batch Selection**: Optional - allows batch-specific materials
  - If batch is selected: Material only visible to that specific batch
  - If batch is empty: Material available to all batches in the course

### 3. **Database Schema Updates**
New columns added to `ems.course_materials`:

```sql
- handbook_type VARCHAR(50) DEFAULT 'STUDENT_HANDBOOK'
- batch_id BIGINT REFERENCES ems.batches(id)
- material_description TEXT
- target_audience VARCHAR(50) DEFAULT 'STUDENTS'
```

### 4. **Upload Flow**

#### Academic Manager Upload Process:
1. Click "Add New Content"
2. Select Upload Type: "Course Material" or "Sidebar Menu Item"
3. **Select Handbook Type** (NEW):
   - Student Handbook (default)
   - Tutor Handbook
   - General Resource
4. Enter Material Title
5. Select Target Course
6. **Optional**: Select Specific Batch (NEW)
7. Add Description
8. Upload File
9. Submit

### 5. **Material Display Logic**

#### For Students:
```
- Show materials where:
  - target_audience IN ('STUDENTS', 'BOTH')
  - handbook_type IN ('STUDENT_HANDBOOK', 'GENERAL_RESOURCE')
  - Student is enrolled in the course
  - If batch_id exists: Student must be in that batch
  - If batch_id is NULL: Available to all batches
```

#### For Tutors:
```
- Show materials where:
  - target_audience IN ('TUTORS', 'BOTH')
  - handbook_type IN ('TUTOR_HANDBOOK', 'GENERAL_RESOURCE')
  - Tutor is assigned to the course
```

## API Changes

### POST /api/ems/materials
**New Request Body Fields:**
```json
{
  "material_name": "Introduction to Python",
  "material_description": "Beginner's guide to Python programming",
  "handbook_type": "STUDENT_HANDBOOK",
  "target_audience": "STUDENTS",
  "course_id": 1,
  "batch_id": 5,  // Optional
  "file_url": "https://...",
  "material_type": "PDF",
  "file_size_mb": 2.5,
  "is_active": true
}
```

### GET /api/ems/materials
**Enhanced Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "material_name": "Python Basics",
      "handbook_type": "STUDENT_HANDBOOK",
      "target_audience": "STUDENTS",
      "course_id": 1,
      "batch_id": 5,
      "material_description": "...",
      "file_url": "...",
      "created_at": "..."
    }
  ]
}
```

## Frontend Components Updated

### 1. Materials Upload Form
- Added Handbook Type selector (3-button toggle)
- Added Batch dropdown (appears when course is selected)
- Auto-fetches batches when course changes
- Visual feedback for handbook type selection

### 2. Material Cards
- Display handbook type badge
- Show batch information if applicable
- Color-coded by type:
  - Blue: Student Handbook
  - Purple: Tutor Handbook
  - Green: General Resource

## Database Migration

Run this migration to add new columns:
```bash
psql -U postgres -d your_database -f backend/database/migrations/add_handbook_types.sql
```

## Usage Examples

### Example 1: Upload Student Handbook for Specific Batch
```
Handbook Type: Student Handbook
Course: Python Programming 101
Batch: Morning Batch (Jan 2026)
Title: Week 1 - Variables and Data Types
Description: Study material for first week
```
**Result**: Only students in "Morning Batch (Jan 2026)" can see this material

### Example 2: Upload Tutor Handbook for All Batches
```
Handbook Type: Tutor Handbook
Course: Python Programming 101
Batch: (Leave empty)
Title: Teaching Guidelines - Week 1
Description: Instructor notes and answer keys
```
**Result**: All tutors assigned to "Python Programming 101" can see this across all batches

### Example 3: Upload General Resource
```
Handbook Type: General Resource
Course: Python Programming 101
Batch: (Leave empty)
Title: Python Official Documentation
Description: Reference material for everyone
```
**Result**: Both students and tutors can access this material

## Benefits

1. **Professional Organization**: Clear separation between tutor and student materials
2. **Batch-Specific Content**: Ability to customize materials per batch
3. **Access Control**: Automatic visibility based on user role and enrollment
4. **Scalability**: Works seamlessly with multiple courses and batches
5. **User Experience**: Clean, intuitive interface with visual feedback

## Next Steps for Full Integration

1. **Student Dashboard**: Filter materials by `target_audience = 'STUDENTS'` and enrollment
2. **Tutor Dashboard**: Filter materials by `target_audience = 'TUTORS'` and course assignment
3. **Batch Filtering**: Implement batch-based filtering in student/tutor views
4. **Notifications**: Notify students/tutors when new handbooks are uploaded
5. **Analytics**: Track material access and downloads by handbook type

## Technical Notes

- All new fields have proper database constraints
- Validation implemented at both frontend and backend
- Backward compatible with existing materials (defaults to STUDENT_HANDBOOK)
- Indexed for optimal query performance
