# Quick Start - Student Login Setup

## 🚀 Quick Setup (3 Steps)

### 1️⃣ Run Database Script
Open Supabase SQL Editor and run:
```
backend/database/seed_student_test_data.sql
```

### 2️⃣ Test Login
Go to: `http://localhost:3001/login`

**Credentials:**
- Email: `rajesh.sharma@student.dipl.edu`
- Password: `student@123`

### 3️⃣ Verify Dashboard
After login, you should see the Student Dashboard at:
```
http://localhost:3001/ems/student
```

## ✅ What's Been Set Up

### Backend
- ✅ STUDENT role created (Level 0, EMS product)
- ✅ 6 student-specific permissions
- ✅ Test company "DIPL" created
- ✅ Test student "Rajesh Kumar Sharma" (DIPL2026001)
- ✅ User account with hashed password
- ✅ Sample course enrollment (25% progress)

### Frontend
- ✅ Login redirect for STUDENT role → `/ems/student`
- ✅ EMS Service with auto-authentication
- ✅ Student Dashboard layout (sidebar + header)
- ✅ Dashboard home page with stats

## 📋 Files Created/Modified

### New Files
1. `backend/database/seed_student_test_data.sql` - Database setup
2. `frontend/src/services/emsService.ts` - API service layer
3. `frontend/src/app/ems/student/layout.tsx` - Dashboard layout
4. `frontend/src/app/ems/student/page.tsx` - Dashboard home
5. `STUDENT_SETUP_README.md` - Full documentation

### Modified Files
1. `frontend/src/app/(auth)/login/page.tsx` - Added STUDENT role redirect

## 🎯 Next Development Tasks

### For 2 Developers Working in Parallel

**Developer A - Course Management:**
- [ ] Create `src/components/ems/student/CourseCard.tsx`
- [ ] Build "My Courses" page (`/ems/student/courses`)
- [ ] Implement course viewer with video player
- [ ] Add lesson completion tracking

**Developer B - Analytics & Schedule:**
- [ ] Create dynamic stats cards component
- [ ] Build live class schedule page
- [ ] Implement attendance calendar
- [ ] Add progress charts (Chart.js or Recharts)

**Shared:**
- [ ] Create `src/store/emsStore.ts` (Zustand)
- [ ] Build UI component library in `src/components/ui/`
- [ ] Add loading states and error handling
- [ ] Implement real-time data fetching

## 🔐 Test Credentials Summary

| Role | Email | Password | Redirect |
|------|-------|----------|----------|
| Platform Admin | admin@durkkas.com | durkkas@2026 | /platform/dashboard |
| Student | rajesh.sharma@student.dipl.edu | student@123 | /ems/student |

## 📞 Quick Help

**Login not working?**
1. Check if SQL script ran (look for success message)
2. Clear browser cookies
3. Check browser console for errors

**API calls failing?**
1. Verify backend is running on port 3000
2. Check JWT token in cookies (DevTools → Application → Cookies)
3. Look at Network tab for API responses

## 📚 Full Documentation
See `STUDENT_SETUP_README.md` for complete details.
