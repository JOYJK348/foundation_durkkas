# 📄 Frontend Architecture Approval Document: Durkkas ERP

**Project Name:** Durkkas Multi-Tenant ERP System  
**Document version:** 1.0  
**Date:** January 11, 2026  
**Subject:** Selection of Scalable Frontend Architecture for Multi-Product Ecosystem (HRMS, EMS, Finance, CRM)

---

## 1. Executive Summary
The Durkkas ERP is designed to be a multi-tenant, multi-product platform. As we move into the frontend development phase, we need an architecture that ensures a **Premium UI consistency**, **simplified user authentication (SSO)**, and **cost-effective deployment** on platforms like Vercel.

After technical analysis, we recommend a **Modular Monorepo (Single Repository)** approach over the traditional Multi-Repo setup.

---

## 2. Comparison of Architectural Strategies

### Option A: Modular Monorepo (Recommended 🏆)
*In this approach, all products (HRMS, EMS, Finance) live within a single codebase but are organized into independent modules.*

*   **Design Consistency:** A single "UI Library" ensures every product looks premium and identical.
*   **Single Sign-On (SSO):** Users log in once and switch between HRMS and EMS seamlessly.
*   **Maintenance:** Global updates (e.g., security patches, branding changes) are applied once and reflected everywhere.
*   **Deployment:** Optimized for Vercel; single pipeline management but can still host products on different subdomains (e.g., `hrms.durkkas.com`, `ems.durkkas.com`).

### Option B: Multi-Repo Strategy
*Every product has its own separate code repository.*

*   **Isolation:** Changes in Finance cannot break HRMS code.
*   **Drawbacks:** Extremely difficult to maintain a consistent "Premium look." Branding changes must be manually copied to 10+ repos.
*   **Auth Challenges:** Users may have to re-login when switching apps.
*   **Overhead:** High operational cost for the DevOps team to manage 10+ deployment pipelines.

---

## 3. Technical Benefits for Durkkas Groups

| Feature | Modular Monorepo (A) | Multi-Repo (B) |
| :--- | :--- | :--- |
| **Branding Control** | High (Global CSS/Theme) | Low (Fragmented styles) |
| **Development Speed** | Fast (Shared Components) | Slow (Duplicate efforts) |
| **Auth Experience** | Seamless (Single Token) | Complex (Cross-domain auth) |
| **Vercel Host Cost** | Optimized (Shared build) | High (Multiple projects) |
| **Scalability** | Extremely High | Moderate/Complex |

---

## 4. Multi-Team Collaboration & Governance Strategy
To ensure that multiple teams (HRMS Team, EMS Team, Finance Team) can work independently within a single repository without conflicts, we will implement the following enterprise standards:

### A. Code Ownership & Security (CODEOWNERS)
*   **Granular Control:** We will use a `CODEOWNERS` file in the root of the repository.
*   **Enforcement:** Changes to `/src/modules/hrms` will strictly require approval from the HRMS Lead, while `/src/modules/ems` will require approval from the EMS Lead. This prevents one team from accidentally breaking another team's code.

### B. Intelligent Build System (Turborepo)
*   **Dependency Graph:** We will use **Turborepo** to manage the monorepo. It understands the links between modules.
*   **Selective Builds:** If the HRMS team pushes code, Turborepo and Vercel will only build and test the HRMS module, leaving EMS and Finance untouched. This significantly reduces CI/CD time and prevents global regressions.

### C. CI/CD Automation (GitHub Actions / GitLab CI)
*   **Automated Testing:** Every Pull Request will trigger a GitHub Action to run Lints, Type-checks, and Unit tests specific to the modified module.
*   **Automated Previews:** Vercel will generate unique "Preview URLs" for every branch, allowing HR and Managers to test new features (e.g., `pre-ems.durkkas.com`) before they go live.

### D. Shared Design System (Tailwind + Vanilla CSS)
*   Teams will consume a shared `@durkkas/ui` package. This ensures that even with 50+ developers, the login page, sidebar, and buttons remain 100% consistent across all products.

## 5. Technology Stack Summary
*   **Framework:** Next.js 14+ (App Router)
*   **Monorepo Tool:** Turborepo
*   **Styling:** Vanilla CSS (Rich Custom UI) + Tailwind (Layout)
*   **CI/CD:** GitHub Actions / Vercel
*   **Version Control:** GitHub/GitLab with Strict `CODEOWNERS` Policy

## 6. Proposed Implementation Roadmap
1.  **Phase 1:** Initialize the `frontend` root using **Next.js & Turborepo**.
2.  **Phase 2:** Develop the **Core UI Package & Auth Middleware**.
3.  **Phase 3:** Setup **GitHub Actions** for automated PR validation.
4.  **Phase 4:** Launch **HRMS** as the first business vertical.
5.  **Future Expansion:** Plug-in EMS, Finance, and CRM modules into the existing architecture.

## 7. Approval & Verdict
The **Modular Monorepo** approach, supported by **Turborepo and GitHub Governance**, provides the perfect balance between team independence and platform-wide consistency. It is the most robust way to build the Durkkas ERP ecosystem.

**Final Recommendation:** Proceed with the **Modular Monorepo Setup** in the current project root.

---

**Submitted By:** Development Team  
**Approved By (Manager):** ____________________  
**Approved By (HR):** ____________________

