👤 ROLE DEFINITIONS (CLEAR SEPARATION)
1️⃣ PLATFORM ADMIN (SYSTEM OWNER)
Who is this?

One super person

System owner / product owner

Day-to-day company operation involve ஆக மாட்டார்

Platform Admin Dashboard-ல என்ன visible?

✔ All companies
✔ All branches
✔ All departments
✔ All designations
✔ All employees
✔ All login IDs & roles
✔ Full reports (global)

👉 Read + override power only

❗ Important Rule

Platform Admin menu access control set பண்ண மாட்டார்
Platform Admin company-level decisions-க்கு interfere பண்ண மாட்டார்

2️⃣ COMPANY ADMIN (REAL CONTROLLER)

👉 இந்த role தான் system-ல key role

Who is this?

One Company = One Company Admin

Business owner / Operations head

Company Admin Responsibilities

Own company full control

Branch creation

Branch Admin creation

Employee creation

Menu access control (VERY IMPORTANT)

🚨 CRITICAL POINT (Your Requirement)

Menu access & permissions Company Admin தான் decide பண்ணணும்

Example:

Branch Admin-க்கு:

Attendance menu yes / no

Reports yes / no

HR access yes / no

Employee-க்கு:

View only

Edit allowed or not

👉 Platform Admin இதை change பண்ண மாட்டார்

3️⃣ BRANCH ADMIN
Who is this?

One branch = One Branch Admin

Day-to-day branch operations

Branch Admin can see

Own branch only

Own branch employees only

Branch Admin cannot see

Other branches

Other companies

Company-level settings

🧠 EMPLOYEE ASSIGNMENT LOGIC (VERY CLEAR)

Employee company-level common இல்லை

Employee branch-level assign

One employee → one branch only

🏭 COMPANY STRUCTURE (DATA IS SAME – VISIBILITY CHANGES)
COMPANY 1 – Durkkas Innovations Private Limited (India)
Branches

Aruppukottai – HQ

Coimbatore

Madurai

Chennai

Each Branch Has:

Own departments

Own employees

👉 Platform Admin dashboard-ல:

All 4 branches visible

All employees visible

👉 Company Admin (Sathish) dashboard-ல:

All 4 branches visible

All employees visible

Menu control panel visible

👉 Branch Admin dashboard-ல:

Only assigned branch visible

COMPANY 2 – Durkkas Technologies LLC (USA)
Branches

Austin – HQ

Dallas

San Jose

Same logic:

Platform Admin → all visible

Company Admin (John) → USA company full

Branch Admin → own branch only

COMPANY 3 – Durkkas Academy of Research and Education (India)
Branches

Madurai – HQ

Trichy

Salem

Same visibility rule applies.

🔐 LOGIN & ACCESS FLOW (SIMPLE WORDS)
Step 1 – User Login

System checks:

Which company?

Which branch?

Which role?

Step 2 – Dashboard Load
Role	Dashboard Behaviour
Platform Admin	Show everything
Company Admin	Show own company only
Branch Admin	Show own branch only
Employee	Show self data only
Step 3 – Menu Load (IMPORTANT)

👉 Menu access is NOT global

Platform Admin → all menus visible (read-only)

Company Admin → menu control screen visible

Branch Admin / Employee → menus based on permission set by Company Admin

🔐 MENU CONTROL OWNERSHIP (KEY POINT TO TELL DEV)

Menu permission table should be controlled ONLY by Company Admin

Example:

Company Admin decides:

Branch Admin can see Reports ❌

Branch Admin can approve leave ✅

Employee can edit profile only ✅

👉 Platform Admin cannot override unless emergency.

📌 WHY THIS MODEL IS CORRECT (FOR DEV CONFIRMATION)

✔ Matches real corporate hierarchy
✔ Avoids platform admin misuse
✔ Company autonomy preserved
✔ Easy to scale (new company / branch)
✔ Clean permission logic
✔ No cross-data leakage

🧾 FINAL MERGED SUMMARY (DO NOT SKIP)

Platform Admin

Sees everything

No daily control

Company Admin

Own company only

Full branch & employee control

Menu access controller

Branch Admin

Own branch only

Employees

Assigned branch only

Data visibility is global for Platform Admin,
but authority to control access lies with Company Admin

✅ ONE-LINE HANDOVER STATEMENT (Senior Dev-க்கு சொல்ல)

“Platform Admin has full visibility but no operational control.
Company Admin owns access control, menu permissions, and branch authority.
Branch Admin and Employees are strictly branch-scoped.”