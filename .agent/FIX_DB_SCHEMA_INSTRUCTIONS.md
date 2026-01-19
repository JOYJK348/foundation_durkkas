# 🚨 CRITICAL: Database Schema Update Required

## The Problem
You are seeing this error:
> `Failed to fetch notifications: column notifications.target_role_level does not exist`

This means your database is missing columns that are required for the new **Notification Isolation System**. The backend code is trying to query columns (`target_role_level`, `target_type`) that don't exist in your database yet.

## The Solution
You must run a SQL update to add these columns.

---

## 🛠️ INSTRUCTIONS: Run this SQL

Please open your SQL Client (Supabase Dashboard, pgAdmin, or VS Code) and run the following command found in:
**`backend/database/99_hotfix_notifications.sql`**

```sql
SET search_path TO app_auth, core, public;

-- Add missing columns for Tenant Isolation
ALTER TABLE app_auth.notifications 
ADD COLUMN IF NOT EXISTS target_type VARCHAR(50),      -- 'GLOBAL', 'COMPANY', 'BRANCH'
ADD COLUMN IF NOT EXISTS target_role_level INT,        -- 5, 4, 1
ADD COLUMN IF NOT EXISTS sender_id BIGINT REFERENCES app_auth.users(id),
ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES core.branches(id),
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'INFO';

-- Add Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_branch_id ON app_auth.notifications(branch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON app_auth.notifications(target_type);
```

---

## After You Run It
1. **Refresh the Branch Notifications page**.
2. The error should be GONE.
3. You will either see a list of notifications or "Stream Silence".

I have already updated the main schema file (`backend/database/12_notifications_schema.sql`) so this issue won't happen for new database setups.
