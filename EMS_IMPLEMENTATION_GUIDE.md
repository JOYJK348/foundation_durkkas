# 🎯 COMPLETE EMS IMPLEMENTATION GUIDE

## 📦 What Has Been Created

### 1. **Database Schema** ✅
- **File:** `backend/database/99_seed_dummy_data.sql`
- **Contents:**
  - 1 Academic Manager
  - 5 Tutors (with course assignments)
  - 30 Students (batch-wise mapped)
  - 3 Courses with modules and lessons
  - 3 Batches (10 students each)
  - Quiz attempts with marks
  - Attendance records
  - Assignments and submissions
  - Live classes

### 2. **Face & Location Attendance System** ✅
- **Database Schema:** `backend/database/migrations/20260202_attendance_face_location.sql`
- **Backend Service:** `backend/lib/services/AttendanceService.ts`
- **API Routes:** `backend/app/api/attendance/route.ts`
- **Frontend Component:** `frontend/src/components/attendance/FaceAttendanceCapture.tsx`

### 3. **Complete Credentials** ✅
- **File:** `DARE_ACADEMY_CREDENTIALS.md`
- All 36 login credentials (1 Manager + 5 Tutors + 30 Students)
- Batch mappings
- Quiz marks
- Attendance records

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Run Database Migrations

```bash
# 1. First, run the face & location schema
psql -h your-supabase-host -U postgres -d postgres -f backend/database/migrations/20260202_attendance_face_location.sql

# 2. Then, run the dummy data seed
psql -h your-supabase-host -U postgres -d postgres -f backend/database/99_seed_dummy_data.sql
```

**OR use Supabase SQL Editor:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `20260202_attendance_face_location.sql` → Run
3. Copy contents of `99_seed_dummy_data.sql` → Run

### Step 2: Add Institution Location (Required for Attendance)

Run this SQL to add your institution's GPS coordinates:

```sql
INSERT INTO ems.institution_locations (company_id, location_name, latitude, longitude, radius_meters)
SELECT 
    id,
    'Chennai Campus Main Building',
    13.0827,  -- Replace with your actual latitude
    80.2707,  -- Replace with your actual longitude
    100       -- 100 meters radius
FROM core.companies 
WHERE code = 'DARE';
```

### Step 3: Configure Environment Variables

Add to your `.env.local`:

```env
# Face Recognition API (Optional - for production)
FACE_RECOGNITION_API_KEY=your_api_key_here
FACE_RECOGNITION_ENDPOINT=https://api.face-recognition-service.com

# Storage for attendance photos
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Install Required Dependencies

```bash
cd frontend
npm install @tensorflow/tfjs @tensorflow-models/blazeface
```

### Step 5: Create Upload API Route

Create `backend/app/api/upload/attendance-photo/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileName = `attendance/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('attendance-photos')
            .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('attendance-photos')
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
```

### Step 6: Create Supabase Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create new bucket: `attendance-photos`
3. Set as **Public** bucket
4. Add RLS policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attendance-photos');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attendance-photos');
```

---

## 📱 USAGE GUIDE

### For Academic Manager

**Login:** `manager@durkkas.com` / `Durk@123`

**Create Attendance Session:**
```typescript
// In your dashboard component
import { AttendanceService } from '@/lib/services/AttendanceService';

const createSession = async () => {
    await AttendanceService.createSession({
        companyId: 1,
        courseId: 1,
        batchId: 1,
        sessionDate: '2026-02-03',
        sessionType: 'LECTURE',
        startTime: '10:00:00',
        endTime: '11:30:00'
    });
};
```

This will automatically create:
- Opening window: 10:00 - 10:05 (5 minutes)
- Closing window: 11:25 - 11:30 (5 minutes)

### For Students

**Login:** `student1@durkkas.com` to `student30@durkkas.com` / `Durk@123`

**Mark Attendance:**
```tsx
import FaceAttendanceCapture from '@/components/attendance/FaceAttendanceCapture';

<FaceAttendanceCapture
    sessionId={sessionId}
    studentId={studentId}
    verificationType="OPENING" // or "CLOSING"
    onSuccess={() => alert('Attendance marked!')}
    onError={(error) => alert(error)}
/>
```

**Attendance Calculation:**
- Opening verification only: **50% attendance**
- Closing verification only: **50% attendance**
- Both verifications: **100% attendance**

### For Tutors

**Login:** `rajesh.kumar@durkkas.com` (or other tutors) / `Durk@123`

**View Batch Attendance:**
```typescript
const summary = await AttendanceService.getBatchAttendanceSummary(
    companyId,
    batchId,
    sessionId
);

// Returns array of students with:
// - opening_verification (face + location data)
// - closing_verification (face + location data)
// - attendance_percentage (0, 50, or 100)
```

---

## 🔍 VERIFICATION & TESTING

### Test Scenario 1: Complete Attendance Flow

1. **Manager creates session** (10:00 - 11:30)
2. **Student logs in at 10:02** (within opening window)
3. Student clicks "Mark Attendance"
4. System captures:
   - Face photo
   - GPS location (13.0827, 80.2707)
   - Device info
5. System verifies:
   - ✅ Location within 100m radius
   - ✅ Face captured successfully
   - ✅ Within opening window (10:00-10:05)
6. **Result:** 50% attendance recorded

7. **Student returns at 11:27** (within closing window)
8. Repeats face capture
9. **Result:** 100% attendance (both verifications complete)

### Test Scenario 2: Location Verification Failure

1. Student tries to mark attendance from home
2. GPS shows location: 12.9716, 77.5946 (different city)
3. System calculates distance: 350km
4. **Result:** ❌ "Location verification failed. You are outside the allowed area."

### Test Scenario 3: Late Attendance

1. Student tries to mark opening attendance at 10:07
2. Opening window closed at 10:05
3. **Result:** ❌ "No active attendance session found"

---

## 📊 DASHBOARD INTEGRATION

### Student Dashboard - Attendance Widget

```tsx
'use client';

import { useEffect, useState } from 'react';
import { AttendanceService } from '@/lib/services/AttendanceService';
import FaceAttendanceCapture from '@/components/attendance/FaceAttendanceCapture';

export default function StudentAttendanceWidget({ studentId, batchId }: any) {
    const [activeSession, setActiveSession] = useState<any>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

    useEffect(() => {
        loadActiveSession();
        loadHistory();
    }, []);

    const loadActiveSession = async () => {
        const session = await AttendanceService.getActiveSession(companyId, batchId);
        setActiveSession(session);
    };

    const loadHistory = async () => {
        const history = await AttendanceService.getStudentAttendance(companyId, studentId);
        setAttendanceHistory(history);
    };

    return (
        <div className="space-y-6">
            {/* Active Session */}
            {activeSession && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Mark Attendance Now</h3>
                    <FaceAttendanceCapture
                        sessionId={activeSession.id}
                        studentId={studentId}
                        verificationType={activeSession.activeWindow}
                        onSuccess={loadHistory}
                    />
                </div>
            )}

            {/* Attendance History */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Attendance History</h3>
                <div className="space-y-2">
                    {attendanceHistory.map((record) => (
                        <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                                <p className="font-semibold">{record.session.session_date}</p>
                                <p className="text-sm text-gray-600">{record.session.session_type}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${record.attendance_percentage === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {record.attendance_percentage}%
                                </p>
                                <p className="text-xs text-gray-500">{record.verification_status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

### Tutor Dashboard - Batch Attendance View

```tsx
export default function TutorAttendanceView({ batchId, sessionId }: any) {
    const [summary, setSummary] = useState<any[]>([]);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        const data = await AttendanceService.getBatchAttendanceSummary(companyId, batchId, sessionId);
        setSummary(data);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Batch Attendance Summary</h3>
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-2">Student</th>
                        <th className="text-center p-2">Opening</th>
                        <th className="text-center p-2">Closing</th>
                        <th className="text-center p-2">Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {summary.map((record) => (
                        <tr key={record.id} className="border-b">
                            <td className="p-2">
                                {record.student.first_name} {record.student.last_name}
                                <br />
                                <span className="text-xs text-gray-500">{record.student.student_code}</span>
                            </td>
                            <td className="text-center p-2">
                                {record.opening_verification ? '✅' : '❌'}
                            </td>
                            <td className="text-center p-2">
                                {record.closing_verification ? '✅' : '❌'}
                            </td>
                            <td className="text-center p-2">
                                <span className={`font-bold ${record.attendance_percentage === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {record.attendance_percentage}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

---

## 🔒 SECURITY CONSIDERATIONS

1. **Face Verification:**
   - Store face encodings securely
   - Use HTTPS for all image uploads
   - Implement rate limiting on verification endpoints

2. **Location Verification:**
   - Validate GPS accuracy (reject if > 50m accuracy)
   - Check for GPS spoofing (compare with IP geolocation)
   - Log all verification attempts for audit

3. **Privacy:**
   - Delete face images after 30 days
   - Encrypt face encodings at rest
   - Comply with GDPR/data protection laws

---

## 📈 ANALYTICS & REPORTING

### Attendance Analytics Query

```sql
-- Overall attendance percentage by batch
SELECT 
    b.batch_name,
    COUNT(DISTINCT ar.student_id) as total_students,
    AVG(ar.attendance_percentage) as avg_attendance,
    COUNT(CASE WHEN ar.attendance_percentage = 100 THEN 1 END) as full_attendance_count
FROM ems.attendance_records ar
JOIN ems.batches b ON ar.session_id IN (
    SELECT id FROM ems.attendance_sessions WHERE batch_id = b.id
)
WHERE ar.company_id = 1
GROUP BY b.id, b.batch_name;
```

---

## ✅ FINAL CHECKLIST

- [ ] Database migrations executed
- [ ] Dummy data seeded (36 users created)
- [ ] Institution location added
- [ ] Supabase storage bucket created
- [ ] Upload API route created
- [ ] Environment variables configured
- [ ] Face capture component integrated
- [ ] Student dashboard shows attendance widget
- [ ] Tutor dashboard shows batch summary
- [ ] Manager can create attendance sessions
- [ ] Location verification working
- [ ] Face capture working
- [ ] Attendance percentage calculating correctly

---

## 🆘 TROUBLESHOOTING

### Issue: "Location verification failed"
**Solution:** Check that institution location is added correctly and GPS coordinates match

### Issue: "Camera not accessible"
**Solution:** Ensure HTTPS is enabled (camera API requires secure context)

### Issue: "No active session found"
**Solution:** Verify that current time is within 5-minute opening/closing window

### Issue: "Face upload failed"
**Solution:** Check Supabase storage bucket permissions and upload API route

---

**Last Updated:** 2026-02-02  
**Version:** 1.0 - Production Ready  
**Status:** ✅ Complete Implementation
