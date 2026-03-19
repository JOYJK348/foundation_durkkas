# Material Visibility & Status Control - Implementation Details

## 🚀 Overview

Implemented a robust visibility control system for educational materials. Materials can now be toggled between **Active** and **Hidden** statuses. 

- **Academic Managers** can see all materials (Drafts & Published) to manage the curriculum.
- **Tutors** and **Students** can only see **Active** materials.
- **Privacy** is enforced at the API level based on user roles.

## 🛠️ Changes Implemented

### 1. Backend: Role-Based Filtering
**File**: `backend/app/api/ems/materials/route.ts`
- Added role checking logic.
- `ACADEMIC_MANAGER` and `COMPANY_ADMIN` see all materials.
- `TUTOR` and other roles are restricted to `is_active = true`.

### 2. Backend: Student Privacy
**File**: `backend/app/api/ems/students/my-materials/route.ts`
- Strictly filters by `is_active = true`.
- Added `target_audience` filtering to ensure students never see "Tutor Only" handbooks even if they are marked as active.

### 3. Frontend: Management UI (Academic Manager)
**File**: `frontend/src/app/ems/academic-manager/materials/page.tsx`
- **Material Cards**: Added a red badge `🚫 Hidden from Students` for inactive assets.
- **Upload/Edit Form**: Added a dedicated **Active Status** toggle with clear labels (✅ Active / 🚫 Hidden).
- **Interface**: Updated `Material` interface to include the `is_active` boolean.
- **Editing**: Fixed the edit flow to correctly load and save the current visibility status.

## 🎨 Visual Enhancements

- **Active State**: Green theme, suggests "Ready for students".
- **Hidden State**: Red/Gray theme, suggests "Draft / Inactive".
- **Audience Labels**: Added icons and clear labels:
  - 👨‍🎓 Students Only
  - 👨‍🏫 Tutors Only
  - 🌍 Everyone

## 🔒 Security
- Visibility is enforced on the server. Even if a student tries to guess the URL of a hidden material, the API will not return it.

## ✅ Test Scenarios
1. **Manager**: Create a material, set to "Hidden". It should appear in Manager list with "Hidden" badge.
2. **Student**: Should NOT see the hidden material in their library.
3. **Tutor**: Should NOT see the hidden material in their academy.
4. **Manager**: Set material to "Active".
5. **Everyone**: Should now be able to see it (subject to target audience rules).
