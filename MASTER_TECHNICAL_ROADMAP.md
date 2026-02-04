# 🏛️ ERP Project Master Technical Documentation: Hyper-Detailed Roadmap

## 📋 Overview
This roadmap outlines the comprehensive documentation strategy implemented for the ERP Project. To ensure maximum technical accountability and 100% code-to-doc coverage, the documentation is structured as independent **"Technical Packs"** mapped directly to the project's functional folders.

### 🏗️ Documentation Structure (Atomic Level)
Each Technical Pack (Folder) contains exactly three professional records:
1.  **`01_DATABASE_DDL.sql`**: Full schema definition including `CREATE`, `ALTER`, `INDEX`, and `TRIGGER` specific to the module.
2.  **`02_BACKEND_CONTRACT.md`**: API routes, Zod validation schemas, Service layer logic, and Request/Response JSON structures.
3.  **`03_FRONTEND_WORKFLOW.md`**: Component mapping, State management logic (Redux/Zustand), and API integration hooks.

---

## 🛡️ MODULE 1: AUTHENTICATION & SECURITY ENGINE (`app_auth`)
*Total 17 Technical Packs*

1.  **Users Core Management** (`api/auth/users`) -> User registration and list.
2.  **Login Engine** (`api/auth/login`) -> Bcrypt, JWT, Cookie implementation.
3.  **Active Session Identity** (`api/auth/me`) -> Auth-guard source.
4.  **Logout Mechanism** (`api/auth/logout`) -> Server-side cookie clearing.
5.  **Roles Infrastructure** (`api/auth/roles`) -> Hierarchy level 1-5 definitions.
6.  **Permissions Registry** (`api/auth/permissions`) -> Action-based access (200+ keys).
7.  **User-Role Scoped Mapping** (`api/auth/user-roles`) -> Tenant-specific role assignments.
8.  **Role-Permission Mapping** (`api/auth/role-permissions`) -> Feature-access linking.
9.  **User-Granular Permissions** (`api/auth/user-permissions`) -> Direct user-level override.
10. **Menu Registry Central** (`api/auth/menu-registry`) -> Dashboard navigation DB.
11. **Menu Access Control** (`api/auth/menu-permissions`) -> Dynamic sidebar logic.
12. **Company Specific Menus** (`api/auth/company-menus`) -> Branding & White-labeling menus.
13. **Feature Access Controller** (`api/auth/feature-access`) -> Module toggle system.
14. **Forgot Password Flow** (`api/auth/forgot-password`) -> Token based recovery.
15. **Audit Logs Tracking** (`api/auth/audit-logs`) -> Global JSONB change tracker.
16. **Login History Audit** (`api/auth/login-history`) -> IP/Geo/Device security trail.
17. **Notification Alert Engine** (`api/auth/notifications`) -> System alerts and status.

---

## 🎓 MODULE 2: EMS - EDUCATION MANAGEMENT (`ems` schema)
*Total 16 Technical Packs*

18. **Students Master Repository** (`api/ems/students`) -> Primary student data management.
19. **Student Profile Gateway** (`api/ems/student`) -> "My Profile" for learners.
20. **Tutor/Faculty Registry** (`api/ems/tutors`) -> Academic staff management.
21. **Course & Curriculum Master** (`api/ems/courses`) -> Subjects & Academic Paths.
22. **Module Organization** (`api/ems/modules`) -> Syllabus breakdown logic.
23. **Lesson Content Hub** (`api/ems/lessons`) -> Multimedia content delivery.
24. **Batch Scheduling Logic** (`api/ems/batches`) -> Timing, Schedule & Conflict resolution.
25. **Admission & Enrollment** (`api/ems/enrollments`) -> Linking student to specific batches.
26. **Learning Progress Logic** (`api/ems/progress`) -> Real-time % Completion tracking.
27. **Quiz Engine (MCQ)** (`api/ems/quizzes`) -> Timed test & automatic grading logic.
28. **Assignment Workflow** (`api/ems/assignments`) -> File upload & review laboratory.
29. **Live Virtual Classrooms** (`api/ems/live-classes`) -> Streaming metadata and integration hooks.
30. **Digital Library Materials** (`api/ems/materials`) -> Notes, Assets, and Document management.
31. **Academic Analytics** (`api/ems/analytics`) -> Performance metrics and pass/fail data.
32. **Student Global Dashboard** (`api/ems/dashboard`) -> Learner home screen integration.
33. **Tutor Control Center** (`api/ems/tutor`) -> Academician operational dashboard.

---

## 💼 MODULE 3: HRMS & STAFF OPERATIONS (`hrms`/`core` schema)
*Total 6 Technical Packs*

34. **Employee Master Database** (`api/hrms/employees`) -> Internal HR profile management.
35. **Org Structure: Departments** (`api/core/departments`) -> Core organizational hierarchy.
36. **Org Structure: Designations** (`api/core/designations`) -> Position and level tracking.
37. **Branch Management** (`api/core/branches`) -> Geo-location based access control.
38. **Multi-Tenant Company Master** (`api/core/companies`) -> Business entity configuration.
39. **Employee Leave Management** (`api/hrms/leaves`) -> Tracking staff time-off and approvals.

---

## 📈 MODULE 4: CRM & LEAD CENTER (`crm` schema)
*Total 4 Technical Packs*

40. **Lead Intake Engine** (`api/crm/leads`) -> Direct enquiries and intake logic.
41. **Marketing Source Tracker** (`api/crm/sources`) -> Tracking lead acquisition channels.
42. **Pipeline Stage Logic** (`crm/stages`) -> Lead status transition and movement.
43. **CRM Management Dashboard** (`crm/dashboard`) -> Sales and conversion analytics.

---

## ⚙️ MODULE 5: INFRASTRUCTURE & MIDDLEWARE
*Total 5 Technical Packs*

44. **Multi-Tenant Global Filter** (`middleware/tenantFilter`) -> DB level data isolation logic.
45. **Feature Access Hub** (`middleware/featureAccess`) -> Router level module protection.
46. **Global Supabase Helper** (`lib/supabase.ts`) -> Database pooling and client orchestration.
47. **Validation Schemas (Zod)** (`lib/validations`) -> Global API safety and verification layer.
48. **Custom Global Services** (`lib/services/`) -> Reusable business logic layers.

---

## 🛡️ Scalability & Future-Proofing
This documentation is designed to evolve with the codebase:
*   **Modular Updates**: If a feature logic changes (e.g., updating the Quiz Engine), only the corresponding 3 files in that pack need to be updated.
*   **Permanent Accountability**: New developers or stakeholders can understand the full "Database-to-UI" flow of any specific module without searching through the entire codebase.

### 📊 Summary of Results
*   **Total Business Modules**: 5
*   **Total Technical Packs (Folders)**: 48+
*   **Total Documentation Files**: 144+
*   **Coverage Status**: ✅ 100% Technical Integrity confirmed.

---
**Last Updated**: February 03, 2026
**Status**: Ready for Delivery
