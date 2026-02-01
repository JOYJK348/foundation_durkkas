# How to Find Branch Admin Credentials

## Problem
You created a new branch with LMS access but forgot the admin login credentials (email and password).

## Solution: Find Admin Email from Database

### Step 1: Find the Branch Admin User

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Find all users associated with a specific branch
-- Replace 'YOUR_BRANCH_NAME' with your actual branch name

SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    r.name as role_name,
    b.name as branch_name,
    b.code as branch_code,
    u.created_at
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.branches b ON ur.branch_id = b.id
WHERE b.name ILIKE '%YOUR_BRANCH_NAME%'  -- Replace with your branch name
ORDER BY u.created_at DESC;
```

### Step 2: Find by Company (ALL INDIA private limited)

```sql
-- Find all branch admins in your company
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    r.name as role_name,
    b.name as branch_name,
    b.code as branch_code,
    c.name as company_name,
    u.created_at
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.branches b ON ur.branch_id = b.id
LEFT JOIN core.companies c ON ur.company_id = c.id
WHERE c.name = 'ALL INDIA private limited'
  AND r.name IN ('EMS_ADMIN', 'BRANCH_ADMIN', 'HRMS_ADMIN', 'FINANCE_ADMIN', 'CRM_ADMIN')
ORDER BY u.created_at DESC;
```

### Step 3: Reset the Password

Once you find the admin email, you have two options:

#### Option A: Update Password Directly (Quick Fix)

```sql
-- Update password for the admin
-- Replace 'admin@branch.com' with the actual email
-- Replace 'NewPassword123' with your desired password

UPDATE app_auth.users
SET password_hash = crypt('NewPassword123', gen_salt('bf'))
WHERE email = 'admin@branch.com';

-- Verify the update
SELECT email, first_name, last_name, created_at 
FROM app_auth.users 
WHERE email = 'admin@branch.com';
```

#### Option B: Use Forgot Password Flow (Recommended)

1. Go to the login page
2. Click "Forgot Password"
3. Enter the admin email
4. Follow the reset link sent to email

### Step 4: Find Most Recently Created Branch Admin

```sql
-- Get the last 5 branch admins created
SELECT 
    u.id,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    r.name as role_type,
    b.name as branch_name,
    b.code as branch_code,
    u.created_at
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.branches b ON ur.branch_id = b.id
WHERE r.name LIKE '%ADMIN'
  AND r.name != 'COMPANY_ADMIN'
  AND r.name != 'PLATFORM_ADMIN'
ORDER BY u.created_at DESC
LIMIT 5;
```

## Quick Reference Table

| What You Need | SQL Query |
|--------------|-----------|
| Find by branch name | `WHERE b.name ILIKE '%branch_name%'` |
| Find by company | `WHERE c.name = 'company_name'` |
| Find by role type | `WHERE r.name = 'EMS_ADMIN'` |
| Find recent admins | `ORDER BY u.created_at DESC LIMIT 5` |
| Reset password | `UPDATE app_auth.users SET password_hash = crypt('password', gen_salt('bf'))` |

## Example: Complete Flow

```sql
-- 1. Find your branch admin
SELECT u.email, b.name, r.name as role
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
JOIN core.branches b ON ur.branch_id = b.id
WHERE b.name ILIKE '%your_branch%'
ORDER BY u.created_at DESC
LIMIT 1;

-- Result example:
-- email: lms.admin@aipl.com
-- branch: AIPL Chennai Branch
-- role: EMS_ADMIN

-- 2. Reset password
UPDATE app_auth.users
SET password_hash = crypt('Welcome@123', gen_salt('bf'))
WHERE email = 'lms.admin@aipl.com';

-- 3. Login with:
-- Email: lms.admin@aipl.com
-- Password: Welcome@123
```

## Alternative: Check Backend Logs

If you just created the branch, check your backend terminal logs. The credentials might be logged there during creation.

## Future: Add Credentials Display

I can add a feature to the branch details page to show admin credentials with a "Reset Password" button. Would you like me to implement that?
