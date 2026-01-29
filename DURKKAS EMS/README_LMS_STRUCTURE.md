# DURKKAS EMS - LMS Project Structure

## 📁 Project Structure

```
app/
├── login/                    # Unified Login Page (3 Portal Selection)
│   └── page.tsx             # Portal selection → Login form
│
├── dashboard/               # All Dashboard Routes
│   ├── online/              # Online Learning Portal
│   │   ├── student/         # Student Dashboard
│   │   ├── tutor/          # Tutor Dashboard
│   │   └── admin/           # Admin Dashboard
│   │
│   ├── offline/             # Offline Learning Portal
│   │   ├── student/         # Student Dashboard
│   │   ├── tutor/           # Tutor Dashboard
│   │   └── admin/           # Admin Dashboard
│   │
│   └── workshop/            # Workshop Portal
│       ├── student/         # Student Dashboard
│       ├── tutor/           # Tutor Dashboard
│       └── admin/           # Admin Dashboard
│
├── page.tsx                 # Home Page
├── layout.tsx               # Root Layout
└── globals.css              # Global Styles

components/
├── chat/                    # Chat Widget
├── layout/                  # Layout Components
├── loading/                 # Loading Animations
├── ui/                      # UI Components (Shadcn)
└── ...

lib/
├── store.ts                 # Zustand State Management
├── loading-config.ts        # Loading Configuration
└── utils.ts                 # Utilities
```

## 🚀 Portal Features

### 1. Online Learning Portal
**Full digital learning system:**
- Course Home with Syllabus
- Content Viewer (Videos, PDFs, Notes, Slides)
- Assessments (MCQ, Short assignments)
- Homework Submissions
- Doubt Sessions
- Attendance System
- Certificates

### 2. Offline Learning Portal
**Material & Attendance Focused:**
- 1-year free access to all digital materials
- Download permission (tutor-controlled)
- Full syllabus visibility
- Notes / PDFs / Reference materials
- Offline handouts
- Attendance tracking
- Batch announcements
- ❌ No doubt sessions
- ❌ No online assessments
- ❌ No live classes

### 3. Workshop Portal
**Event-Based Learning:**
- Workshop details (topic, trainer, time)
- Workshop materials
- Downloads
- Certificate
- Feedback

## 🎯 Universal Features (All Portals)

1. **Personalized Dashboard**
   - Dynamic greeting based on time
   - Current active course/workshop
   - Daily progress overview
   - Announcement ticker panel
   - Profile completion indicator
   - Quick links

2. **Tutor-Controlled Content Visibility**
   - Visibility Toggle (Show/Hide)
   - Release Scheduling (Date/Time)
   - Pre-requisite Linking
   - Completion Tracking

3. **UI/UX Standards**
   - Mobile-first design
   - No empty space (full-bleed illustrations)
   - High information density
   - Contextual visuals
   - Glass-morphism cards
   - Smooth transitions (Framer Motion)
   - Light/Dark Mode ready
   - Fully responsive

## 🔐 Login Flow

1. **Portal Selection** → User selects Online/Offline/Workshop
2. **Login Form** → Email/Phone + Password or OTP
3. **Role Detection** → Auto-detects Student/Tutor/Admin
4. **Dashboard Redirect** → `/dashboard/{portal}/{role}`

**Testing:** Login button works without filling form (auto-redirects to student dashboard)

## 📱 Mobile-First Design

- Touch-friendly zones (min 44x44px)
- Safe area insets support
- Responsive grid layouts
- Bottom sheet modals
- Optimized animations

## 🎨 Design System

- **Colors:** Portal-specific gradients
  - Online: Blue → Cyan
  - Offline: Green → Emerald
  - Workshop: Orange → Red
- **Typography:** Inter + Plus Jakarta Sans
- **Animations:** Framer Motion (2s max duration)
- **Components:** Shadcn UI

