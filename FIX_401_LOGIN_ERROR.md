# Fix 401 Login Error - Password Reset Guide

## Problem
Getting "Request failed with status code 401" even with correct credentials.
- Email: `rkvmcrackers@gmail.com`
- Password: `rkvm@123`

## Root Cause
The password in the database might not be hashed correctly with bcrypt, or the user doesn't exist.

## Solution Steps

### Step 1: Check if User Exists

```sql
-- Check user details
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_active,
    is_locked,
    created_at,
    LENGTH(password_hash) as hash_length
FROM app_auth.users
WHERE email = 'rkvmcrackers@gmail.com';
```

**Expected Results:**
- `is_active` should be `true`
- `is_locked` should be `false`
- `hash_length` should be around 60 characters (bcrypt hash)

### Step 2: Reset Password with Correct Bcrypt Hash

The login API uses `bcrypt.compare()`, so the password MUST be hashed with bcrypt.

#### Option A: Using PostgreSQL's `crypt()` function

```sql
-- Reset password using PostgreSQL crypt (bcrypt)
UPDATE app_auth.users
SET password_hash = crypt('rkvm@123', gen_salt('bf'))
WHERE email = 'rkvmcrackers@gmail.com';

-- Verify the update
SELECT email, first_name, is_active, LENGTH(password_hash) as hash_length
FROM app_auth.users
WHERE email = 'rkvmcrackers@gmail.com';
```

#### Option B: If `crypt()` doesn't work, use this bcrypt hash

```sql
-- Pre-generated bcrypt hash for 'rkvm@123'
-- Generated with: bcrypt.hash('rkvm@123', 10)
UPDATE app_auth.users
SET password_hash = '$2a$10$YourBcryptHashHere'
WHERE email = 'rkvmcrackers@gmail.com';
```

### Step 3: Check User Roles

```sql
-- Verify user has proper roles assigned
SELECT 
    u.email,
    r.name as role_name,
    r.level as role_level,
    ur.company_id,
    ur.branch_id,
    c.name as company_name,
    b.name as branch_name
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.companies c ON ur.company_id = c.id
LEFT JOIN core.branches b ON ur.branch_id = b.id
WHERE u.email = 'rkvmcrackers@gmail.com';
```

**Expected Results:**
- Should have at least one role (e.g., `EMS_ADMIN`, `BRANCH_ADMIN`)
- `company_id` and `branch_id` should be set
- Company should be active

### Step 4: Check Company Status

```sql
-- Verify company is active
SELECT 
    c.id,
    c.name,
    c.is_active,
    c.subscription_status
FROM core.companies c
JOIN app_auth.user_roles ur ON c.id = ur.company_id
JOIN app_auth.users u ON ur.user_id = u.id
WHERE u.email = 'rkvmcrackers@gmail.com';
```

**Expected Results:**
- `is_active` should be `true`
- `subscription_status` should be `ACTIVE`

## Quick Fix Script (Run All Together)

```sql
-- 1. Check current status
SELECT 
    u.email,
    u.is_active,
    u.is_locked,
    r.name as role,
    c.name as company,
    c.is_active as company_active
FROM app_auth.users u
LEFT JOIN app_auth.user_roles ur ON u.id = ur.user_id
LEFT JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.companies c ON ur.company_id = c.id
WHERE u.email = 'rkvmcrackers@gmail.com';

-- 2. Reset password
UPDATE app_auth.users
SET 
    password_hash = crypt('rkvm@123', gen_salt('bf')),
    is_active = true,
    is_locked = false
WHERE email = 'rkvmcrackers@gmail.com';

-- 3. Activate company if needed
UPDATE core.companies
SET is_active = true
WHERE id IN (
    SELECT company_id 
    FROM app_auth.user_roles ur
    JOIN app_auth.users u ON ur.user_id = u.id
    WHERE u.email = 'rkvmcrackers@gmail.com'
);

-- 4. Verify everything
SELECT 
    u.email,
    u.is_active as user_active,
    u.is_locked,
    r.name as role,
    c.name as company,
    c.is_active as company_active,
    LENGTH(u.password_hash) as hash_length
FROM app_auth.users u
LEFT JOIN app_auth.user_roles ur ON u.id = ur.user_id
LEFT JOIN app_auth.roles r ON ur.role_id = r.id
LEFT JOIN core.companies c ON ur.company_id = c.id
WHERE u.email = 'rkvmcrackers@gmail.com';
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| User not found | Create user first or check email spelling |
| `is_active = false` | Run: `UPDATE app_auth.users SET is_active = true WHERE email = '...'` |
| `is_locked = true` | Run: `UPDATE app_auth.users SET is_locked = false WHERE email = '...'` |
| No roles assigned | Assign a role via user_roles table |
| Company inactive | Run: `UPDATE core.companies SET is_active = true WHERE id = ...` |
| Wrong password hash | Use `crypt('password', gen_salt('bf'))` |

## Test Login

After running the fix script:

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Refresh the login page** (Ctrl + F5)
3. **Login with:**
   - Email: `rkvmcrackers@gmail.com`
   - Password: `rkvm@123`

## Debug: Check Backend Logs

If still getting 401, check your backend terminal for detailed error messages:

```bash
# Look for these log messages:
❌ [LOGIN] User Resolution Error
🚨 SECURITY GATEKEEPING
📉 [BG_LOG_ERROR]
```

## Alternative: Create New Admin

If the user doesn't exist, create a new one:

```sql
-- Create new branch admin
INSERT INTO app_auth.users (email, password_hash, first_name, last_name, is_active)
VALUES (
    'rkvmcrackers@gmail.com',
    crypt('rkvm@123', gen_salt('bf')),
    'RKVM',
    'Admin',
    true
)
RETURNING id;

-- Then assign role (replace USER_ID, ROLE_ID, COMPANY_ID, BRANCH_ID)
INSERT INTO app_auth.user_roles (user_id, role_id, company_id, branch_id)
VALUES (
    'USER_ID_FROM_ABOVE',
    (SELECT id FROM app_auth.roles WHERE name = 'EMS_ADMIN' LIMIT 1),
    YOUR_COMPANY_ID,
    YOUR_BRANCH_ID
);
```
