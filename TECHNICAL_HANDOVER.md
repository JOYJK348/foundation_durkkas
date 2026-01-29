# 📄 Technical Handover & Architecture Guide
**Project Name:** DURKKAS ERP Foundation
**Target Audience:** Development Team / System Architects

## 🏗️ Technology Stack
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Lucide Icons.
- **Backend:** Next.js Route Handlers (Serverless/Edge compatible).
- **Database:** Supabase (PostgreSQL) with multiple schemas (`core`, `app_auth`, `crm`).
- **Cache/Concurrency:** Redis (Upstash) for session tracking and limit enforcement.
- **State Management:** Zustand (Client-side) & React Context.

## 🔐 Core Architecture Logic

### 1. Multi-Tenancy (Tenant Isolation)
The system is built to handle multiple companies (Tenants) and multiple branches under each company.
- **Logic:** Every record in the DB has a `company_id` and `branch_id`.
- **Enforcement:** Middleware and API helpers (`apiRoute`) automatically filter data based on the logged-in user's tenant.

### 2. Role-Based Access Control (RBAC)
We use a level-based system:
- **Level 1 (BRANCH_ADMIN):** Can only see data for their specific branch.
- **Level 4 (COMPANY_ADMIN):** Can see all data for all branches in their company.
- **Level 10 (SUPER_ADMIN):** Full platform control.

### 3. CRM Lead Engine
The CRM is designed as a "Lead Centre". 
- **Applications:** Separate tables for `internship`, `job_seeker`, `vendor`, etc.
- **Synchronization:** The `crmService.ts` in the frontend handles API calls with cache-busting to ensure real-time data visibility.

## 🛠️ Key Files to Maintain
- `backend/lib/supabase.ts`: Database client configuration.
- `backend/middleware.ts`: Global security and route protection.
- `backend/lib/redis.ts`: Logic for session limits and caching.
- `frontend/src/lib/api.ts`: Central Axios instance for API communication.

## 🚀 How to Add a New Module
1. Create a new schema in PostgreSQL (if needed).
2. Add API routes in `backend/app/api/[module_name]`.
3. Use `apiRoute` wrapper for automatic authentication and error handling.
4. Update `FeatureAccessContext.tsx` if the module needs subscription-based access.

---
*Prepared by Antigravity AI Assistant.*
