# Durkkas ERP - Architectural Documentation

This document explains the foundational architectural decisions, folder structure, technology choices, and future-proofing strategies for the Durkkas ERP backend.

---

## 1. Centralized Foundation Architecture

We have chosen a **Modular Monolith** architecture over Microservices for this stage of the Durkkas ERP.

### 🏛️ What is Modular Monolith?
Instead of separating every module (HR, Finance, EMS) into completely different servers (Microservices), we keep them in a **single repository** but separate them logically into strict **modules**.

*   **Single Codebase**: Easy to maintain, debug, and deploy.
*   **Modular Folders**: `api/hrms`, `api/ems`, `api/finance` are strictly separated.
*   **Shared Core**: Common utilities (Auth, Database, Logging) are shared, reducing code duplication.

### ❓ Why NOT Microservices? (The "Why")
Microservices are powerful but introduce huge complexity ("Over-Engineering") for a project at this stage:
1.  **Deployment Hell**: You would need to manage & pay for 7+ different servers/containers instead of 1.
2.  **Data Consistency**: Joining data between HR and Finance would be extremely hard (No SQL Joins allowed across microservices).
3.  **Cost**: Infrastructure costs would triple immediately.
4.  **Team Overhead**: Requires a dedicated DevOps team just to keep services talking to each other.

**Conclusion:** Our "Modular Monolith" gives us the **organization of microservices** with the **simplicity of a monolith**. We can split it later if needed (e.g., when you have 100+ devs).

---

## 2. Backend Folder & File Structure Explained

Our structure follows Domain-Driven Design (DDD) principles adapted for Next.js App Router.

```
backend/
├── app/
│   └── api/                # API Routes (Entry Points)
│       ├── auth/           # Authentication Module (Login, RBAC)
│       ├── core/           # Foundation Data (Companies, Locations)
│       ├── hrms/           # HR Module (Employees, Payroll)
│       ├── ems/            # Education Module (Students, Courses)
│       └── ...             # Other modules (crm, finance)
├── lib/
│   ├── services/           # Business Logic Layer (The "Brain")
│   │   ├── EmployeeService.ts
│   │   └── ...
│   ├── supabase.ts         # Database Connection (Single Source)
│   ├── redis.ts            # Caching Layer (Upstash)
│   ├── jwt.ts              # Security Token Logic
│   └── errorHandler.ts     # Standardized Error Responses
├── database/               # SQL Schemas & Migrations (Infrastructure as Code)
├── middleware.ts           # Global Security Gatekeeper
└── .env.local              # Secrets & Config
```

### 🔑 Key Design Decisions:
*   **Service Layer Pattern**: APIs (`app/api/...`) are "dumb". They just receive requests and call `lib/services/...`. The actual complex logic lives in Services. This makes testing easy.
*   **Centralized Config**: All schemas, constants, and error codes are in `config/constants.ts`. No hardcoded strings scattered around.

---

## 3. API Endpoints & Implementation Status

We have successfully implemented and verified the Core, Auth, and HRMS layers.

### ✅ Completed Modules:

**1. Authentication (`/api/auth`)**
*   Secure Login with JWT (Access + Refresh Tokens).
*   RBAC (Role-Based Access Control) with `roles`, `permissions`, and `menus`.
*   Audit Logging & Login History.

**2. Core (`/api/core`)**
*   Master data for `Companies`, `Branches`, `Departments`, `Designations`.
*   Location services (`Country`, `State`, `City`) with proper mapping.

**3. HRMS (`/api/hrms`)**
*   **Strategic HR**: `job-openings`, `candidates`, `interviews`.
*   **Employee Master**: Centralized employee data linked to Core.
*   **Operations**: `leaves`, `attendance`, `payroll`.
*   **Performance**: `appraisals`, `performance-reviews`.

### 🔗 Linkage Strategy (The "Skeleton")
*   **Core is the Backbone**: All modules link back to `core.companies` or `core.employees`.
*   **HRMS `employees` Table**: This is the single source of truth for ALL staff (Teachers, Drivers, Admins).
*   **Cross-Schema Joins**: We solved the complex problem of joining `hrms` data with `core` data using explicit Foreign Key Hints in Supabase.

---

## 4. Tech Stack Breakdown

### ☁️ Database: Supabase (PostgreSQL)
*   **Why?**: Enterprise-grade SQL, Real-time capabilities, and built-in Auth support.
*   **Schema Design**: 7 Separate Schemas (`core`, `hrms`, `ems`...) to ensure data isolation and cleanliness.

### ⚡ Caching: Redis (Upstash)
*   **Why?**: Speed and Protection.
*   **Use Cases**:
    1.  **Session Caching**: Reduces DB calls for checking "Is user logged in?".
    2.  **Permissions**: Instant access checks without hitting DB.
    3.  **Rate Limiting**: Protects API from spam/attacks.

### 🔐 Security: JWT (JSON Web Tokens)
*   **Dual Token System**: Short-lived Access Token (Security) + Long-lived Refresh Token (UX).
*   **Edge Compatible**: Uses `jose` library to work seamlessly in Next.js Middleware (Edge Runtime).

---

## 5. Future Payment Integration Strategy

When the time comes to add **Finance/Payment** features (e.g., Fee Collection, Payroll Payouts), our architecture is ready.

### 💳 Strategy:
1.  **Payment Gateway abstraction**: We will create a `PaymentService.ts` in `lib/services`.
2.  **Webhooks**: Create `/api/finance/webhooks/razorpay` (or Stripe) to handle payment success/failure events securely.
3.  **Idempotency**: Use Redis to store "transaction_id" to prevent double-charging users if they click "Pay" twice.

### 🔗 Integration Points:
*   Student pays fees -> Hits `PaymentService` -> Updates `finance.invoices` -> Updates `finance.payments`.

---

## 6. Multi-Team Collaboration Guide

As Durkkas scales, multiple teams can work on this repo without stepping on each other's toes.

*   **Strict Folders**: Team A touches only `api/hrms`. Team B touches only `api/ems`.
*   **Shared Libs**: Core libraries (`jwt.ts`, `db.ts`) are locked and managed by Senior Architects only.
*   **Git Branches**: `feature/ems-grading`, `feature/hrms-payroll` branches ensure isolation before merging.
