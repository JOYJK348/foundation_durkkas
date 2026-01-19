# 🎯 Main Backend Hub: Centralized API Architecture

This repository is defined as the **MAIN BACKEND HUB** for all Durkkas Innovation products (EMS, ERP, HRMS, CRM, etc.). 

## 🏗️ Architecture Overview

Unlike traditional web apps where the frontend and backend live together, we are using a **Headless Centralized Backend** approach.

1.  **Main Backend (This Repo)**: 
    *   Hosts all 7 Database Schemas (Core, Auth, HRMS, EMS, Finance, Backoffice, CRM).
    *   Centralized Authentication (JWT + Redis Session).
    *   Shared Business Logic & Utilities.
    *   Serves as the Single Source of Truth.
2.  **Separate Frontends (CMS / Products)**:
    *   **EMS Frontend**: Separate Repo -> Connects to `api/ems/*`
    *   **HRMS Frontend**: Separate Repo -> Connects to `api/hrms/*`
    *   **ERP Master Dashboard**: Separate Repo -> Connects to `api/core/*`
    *   **Public Website**: Separate Repo -> Connects to `api/events/*` or `api/leads/*`

---

## 🛠️ Key Global Features Added

### 1. Global CORS Support (`lib/cors.ts`)
Since your frontends (EMS, HRMS, etc.) will be hosted on different URLs (e.g., `ems.durkkas.com`, `hrms.durkkas.com`), we have added a **Global CORS Handler**.
*   Configure allowed URLs in `config/constants.ts` -> `ALLOWED_ORIGINS`.

### 2. Standardized API Routes (App Router)
The `app/api/` folder is logically separated by product using the latest Next.js 14+ conventions:
*   `/api/auth/login/route.ts` -> Shared by ALL frontends.
*   `/api/ems/attendance/route.ts` -> Used by EMS (HR) frontend.
*   `/api/education/students/route.ts` -> Used by Education frontend.

### 3. Global Health Check (`/api/health`)
A single endpoint to check the pulse of the entire ecosystem backend.

---

## 🧹 Cleanup & Organization (Keep Main Folder Clean)

To keep this "HUB" clean, we have moved detailed documentation into the `docs/` folder:
*   `docs/IMPLEMENTATION.md`: How the backend is built.
*   `docs/QUICKSTART.md`: How to run this hub.
*   `docs/COMPLETE.md`: Final feature summary.

---

## 🚀 How to connect a new Frontend Repo?

1.  **Create your new Repo** (e.g., `durkkas-ems-frontend`).
2.  **Set Environment Variable**:
    ```env
    NEXT_PUBLIC_API_URL=https://your-main-backend.vercel.app/api
    ```
3.  **Fetch Data**:
    ```javascript
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ems/batches`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    ```

---

**Status**: Ready to serve as the Hub. ✅
**Goal**: Achieved. 🚀
