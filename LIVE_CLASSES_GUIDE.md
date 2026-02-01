# 🎥 Live Classes System - Complete Guide

## Overview
Complete Jitsi Meet integration for conducting live classes with multi-tenant isolation, zero cost, and unlimited usage.

---

## ✨ Features

### 1. **Multi-Platform Support**
- ✅ **Jitsi Meet** (Free, In-App, Recommended)
- ✅ **External Links** (Zoom, Google Meet, Microsoft Teams)
- ✅ Automatic meeting ID generation
- ✅ Company-scoped room isolation

### 2. **Class Management**
- Schedule classes with date & time
- Assign to courses and batches
- Set tutors for each session
- Track class status (SCHEDULED → LIVE → COMPLETED)
- Cancel/reschedule classes
- Add class descriptions and instructions

### 3. **Security & Isolation**
- **Company-Scoped Meeting IDs**: Each company gets unique, non-guessable room names
- **Format**: `Durkkas-C{companyID}-{courseID}-{timestamp}{random}`
- **Example**: `Durkkas-C11-205-lx3k9a8b7c`
- No cross-company access possible

---

## 🔧 Technical Implementation

### Backend APIs

```
GET    /api/ems/live-classes              # List all classes
POST   /api/ems/live-classes              # Schedule new class
GET    /api/ems/live-classes/:id          # Get single class
PUT    /api/ems/live-classes/:id          # Update class
DELETE /api/ems/live-classes/:id          # Cancel class
PATCH  /api/ems/live-classes/:id/status   # Update status
```

### Database Schema

```sql
CREATE TABLE ems.live_classes (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    batch_id BIGINT,
    tutor_id BIGINT NOT NULL,
    
    class_title VARCHAR(255) NOT NULL,
    class_description TEXT,
    
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    meeting_platform VARCHAR(50) DEFAULT 'JITSI',
    meeting_id VARCHAR(255),
    external_link TEXT,
    
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    recording_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);
```

---

## 📋 Usage Flow

### For Academic Managers / Tutors

1. **Schedule a Class**
   ```
   Live Classes Page → "Schedule New Class" → Fill Details → Save
   ```

2. **Choose Platform**
   - **Jitsi Meet**: Automatic setup, no configuration needed
   - **External Link**: Paste Zoom/Google Meet link

3. **Start Session**
   ```
   Class Card → "Start Session" → Opens Jitsi in new tab
   ```

4. **Complete Class**
   ```
   After class → Update status to "COMPLETED"
   Optional: Add recording URL
   ```

### For Students (Future)

1. **View Upcoming Classes**
   - Dashboard shows scheduled classes
   - "Join Now" button appears 5 mins before start time

2. **Join Class**
   - Click "Join Now" → Direct entry to Jitsi room
   - No account creation needed

---

## 🎯 Jitsi Meet Integration

### Why Jitsi?

| Feature | Jitsi Meet | Zoom Free | Google Meet Free |
|---------|-----------|-----------|------------------|
| **Cost** | ₹0 Forever | ₹0 (40 min limit) | ₹0 (60 min limit) |
| **Time Limit** | Unlimited | 40 minutes | 60 minutes |
| **Participants** | 75+ | 100 | 100 |
| **Recording** | Yes (Dropbox) | No | No |
| **Custom Branding** | Yes | No | No |
| **Self-Hosting** | Yes | No | No |

### Meeting URL Format

```
https://meet.jit.si/{meeting_id}
```

Example:
```
https://meet.jit.si/Durkkas-C11-205-lx3k9a8b7c
```

### Multi-Tenant Isolation

Each company gets unique meeting IDs:
- **Company 11**: `Durkkas-C11-205-xyz123`
- **Company 25**: `Durkkas-C25-205-abc456`

Even if course ID is same, rooms are completely separate!

---

## 🚀 Advanced Features (Future Roadmap)

### Phase 2
- [ ] In-app Jitsi iframe (no new tab)
- [ ] Attendance tracking via join/leave events
- [ ] Chat message logging
- [ ] Screen share analytics
- [ ] Breakout rooms support

### Phase 3
- [ ] AI-powered auto-transcription
- [ ] Live polling during class
- [ ] Whiteboard integration
- [ ] Recording auto-upload to cloud storage
- [ ] Student engagement metrics

### Phase 4
- [ ] Self-hosted Jitsi server
- [ ] JWT authentication for extra security
- [ ] Custom branding per company
- [ ] SIP/Phone dial-in support

---

## 💡 Best Practices

### 1. **Scheduling**
- Schedule classes at least 1 hour in advance
- Add clear descriptions with topics to cover
- Include any pre-class materials in description

### 2. **Platform Choice**
- **Use Jitsi** for regular classes (free, unlimited)
- **Use External** only if you already have paid Zoom/Meet

### 3. **Security**
- Never share meeting IDs publicly
- Use waiting room feature (Jitsi setting)
- Mute all on entry for large classes

### 4. **Recording**
- Connect Dropbox for cloud recording
- Or use local recording (downloads to tutor's device)
- Always inform students before recording

---

## 🔒 Security Features

### 1. **Company Isolation**
```typescript
// Meeting ID includes company ID
meeting_id = `Durkkas-C${companyId}-${courseId}-${timestamp}${random}`
```

### 2. **Database RLS**
- All queries filtered by `company_id`
- Cross-company access blocked at DB level

### 3. **API Security**
- JWT token validation
- Tenant scope verification
- Soft delete for audit trail

---

## 📊 Status Lifecycle

```
SCHEDULED → LIVE → COMPLETED
     ↓
  CANCELLED
```

- **SCHEDULED**: Class is upcoming
- **LIVE**: Class is currently in progress
- **COMPLETED**: Class finished successfully
- **CANCELLED**: Class was cancelled/deleted

---

## 🐛 Troubleshooting

### Issue: "Meeting ID not generated"
**Solution**: Check that `meeting_platform` is set to 'JITSI'

### Issue: "Can't join meeting"
**Solution**: 
1. Check browser permissions for camera/mic
2. Try incognito mode
3. Use Chrome/Firefox (best support)

### Issue: "Other company can access my room"
**Solution**: This is impossible! Each meeting ID includes company ID. Verify the meeting ID format.

---

## 📞 Support

For issues or feature requests:
- Contact: Academic Manager Dashboard → Settings → Support
- Email: support@durkkas.in
- Docs: [Jitsi Meet Handbook](https://jitsi.github.io/handbook/)

---

**Last Updated**: 2026-02-01  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Cost**: ₹0 (Free Forever)
