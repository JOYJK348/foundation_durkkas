# 🔐 EXISTING USER CREDENTIALS

## ✅ **USERS ALREADY EXIST!**

Your database already has test users. Use these credentials:

---

## 📋 **STEP 1: FIND YOUR USERS**

Run this SQL query in Supabase:
```sql
-- File: CHECK_EXISTING_USERS.sql
-- This will show all existing users with their roles
```

---

## 🔑 **COMMON CREDENTIALS:**

### **👨‍💼 ACADEMIC MANAGER:**
Look for users with role `ACADEMIC_MANAGER`

**Likely credentials:**
```
Email: rajesh.kumar@durkkas.com (or similar)
Password: Manager@123
```

### **👨‍🏫 TUTOR:**
Look for users with role `TUTOR`

**Likely credentials:**
```
Email: priya.sharma@durkkas.com (or similar)
Email: arun.patel@durkkas.com (or similar)
Password: Tutor@123
```

### **👨‍🎓 STUDENT:**
Look for users with role `STUDENT`

**Likely credentials:**
```
Email: vikram.reddy@student.durkkas.com (or similar)
Email: sneha.iyer@student.durkkas.com (or similar)
Password: Student@123
```

---

## 🔄 **IF PASSWORDS DON'T WORK:**

Run this SQL to reset passwords:

```sql
-- Reset Manager passwords
UPDATE app_auth.users 
SET password_hash = crypt('Manager@123', gen_salt('bf'))
WHERE email IN (
    SELECT u.email FROM app_auth.users u
    JOIN app_auth.user_roles ur ON u.id = ur.user_id
    JOIN app_auth.roles r ON ur.role_id = r.id
    WHERE r.role_name = 'ACADEMIC_MANAGER'
);

-- Reset Tutor passwords
UPDATE app_auth.users 
SET password_hash = crypt('Tutor@123', gen_salt('bf'))
WHERE email IN (
    SELECT u.email FROM app_auth.users u
    JOIN app_auth.user_roles ur ON u.id = ur.user_id
    JOIN app_auth.roles r ON ur.role_id = r.id
    WHERE r.role_name = 'TUTOR'
);

-- Reset Student passwords
UPDATE app_auth.users 
SET password_hash = crypt('Student@123', gen_salt('bf'))
WHERE email IN (
    SELECT u.email FROM app_auth.users u
    JOIN app_auth.user_roles ur ON u.id = ur.user_id
    JOIN app_auth.roles r ON ur.role_id = r.id
    WHERE r.role_name = 'STUDENT'
);
```

---

## 🚀 **QUICK START:**

### **Step 1: Check Users**
```sql
-- Run: CHECK_EXISTING_USERS.sql
-- Copy the emails shown
```

### **Step 2: Login**
```
Open: http://localhost:3001/login
Use: email from Step 1
Password: Manager@123 or Tutor@123 or Student@123
```

### **Step 3: Test**
```
Follow the test scenarios in QUICK_TEST_GUIDE.md
```

---

## 📊 **WHAT TO EXPECT:**

After running `CHECK_EXISTING_USERS.sql`, you'll see:

```
email                                  | name           | role
---------------------------------------|----------------|------------------
rajesh.kumar@durkkas.com              | Rajesh Kumar   | ACADEMIC_MANAGER
priya.sharma@durkkas.com              | Priya Sharma   | TUTOR
arun.patel@durkkas.com                | Arun Patel     | TUTOR
vikram.reddy@student.durkkas.com      | Vikram Reddy   | STUDENT
sneha.iyer@student.durkkas.com        | Sneha Iyer     | STUDENT
```

**Use these emails with the standard passwords!**

---

## ✅ **READY TO TEST!**

1. ✅ Run `CHECK_EXISTING_USERS.sql`
2. ✅ Copy the emails
3. ✅ Login with standard passwords
4. ✅ Start testing!

**Bro, existing users ready! Just login!** 🦾🔥🚀
