# Role Routing & Dashboard Guide

## Question
> "If HR Admin and Finance Administrator login, where will they go?"

## Answer
Both **HR Admin** and **Finance Administrator** will be routed to the **Branch Dashboard** (`/branch/dashboard`).

### 1. Routing Logic (How it works)
The system routes users based on their **Role Level**:
- **Level 5 (Platform Admin):** `→ /platform/dashboard`
- **Level 4 (Company Admin):** `→ /workspace/dashboard`
- **Level 1-3 (Branch/Product Admin):** `→ /branch/dashboard`

Since HR_ADMIN and FINANCE_ADMIN are **Level 2** roles, they go to the Branch Dashboard.

### 2. Dynamic Dashboard Content
Even though they go to the *same* URL, they will see *different* things because the dashboard is smart:

| Role | What They See |
|------|---------------|
| **HR Admin** | **"Branch Workforce"** widget, Staff List, Attendance, Leave Approvals. (Hidden: Finance stats) |
| **Finance Admin** | **"Pending Dues"** widget, Invoices, Accounts. (Hidden: HR stats) |
| **Branch Admin** | **Everything**. Sees all HR, Finance, and Operational stats for their branch. |

### 3. Permissions Check
The dashboard detects permissions (`hrms.view`, `finance.view`) to decide what to show.

- If you notice a "Specific Role" seeing an empty dashboard, ensure they have the `view` permissions for their module in the database.
