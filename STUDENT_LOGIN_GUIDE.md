# 🔐 Student Login Troubleshooting Guide

## ❌ Error: 401 Unauthorized

**What happened:**
- You tried: `priya.patel@student.dipl.edu`
- Error: Request failed with status code 401
- Reason: This student account doesn't exist in database

---

## ✅ **SOLUTION: Use Correct Credentials**

### **Working Student Account**

```
📧 Email:    rajesh.sharma@student.dipl.edu
🔑 Password: student@123
```

**This account exists in your database from the seed script.**

---

## 🎯 **How to Login (Step-by-Step)**

1. **Open Login Page**
   ```
   http://localhost:3001/login
   ```

2. **Enter Credentials**
   - Email: `rajesh.sharma@student.dipl.edu`
   - Password: `student@123`

3. **Click "Sign In"**

4. **After Login, Navigate to Dashboard**
   ```
   http://localhost:3001/ems/student
   ```

---

## 🔍 **Why priya.patel Didn't Work**

The seed script (`seed_student_test_data.sql`) only creates **ONE** test student:

- ✅ **Rajesh Sharma** - `rajesh.sharma@student.dipl.edu`
- ❌ **Priya Patel** - Not created (doesn't exist)

---

## 🛠️ **Option: Create Priya Patel Account**

If you want to use `priya.patel@student.dipl.edu`, you need to:

### **Method 1: Via Supabase Dashboard**

1. Go to: https://app.supabase.com/project/waxbttxqhyoczmdshpzz
2. Navigate to: **Table Editor** → **app_auth.users**
3. Click **Insert Row**
4. Fill in:
   ```
   email: priya.patel@student.dipl.edu
   password_hash: $2a$10$k91.jqhvMdHoITckgcxzBuO56/cJuwIsFKr1GN.EVbMD/i9KzagY.
   first_name: Priya
   last_name: Patel
   display_name: Priya Patel
   is_active: true
   is_verified: true
   ```
5. Then create student record in **ems.students** table

### **Method 2: Via Backend API**

Use Postman or curl:

```bash
POST http://localhost:3000/api/ems/students
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "first_name": "Priya",
  "last_name": "Patel",
  "email": "priya.patel@student.dipl.edu",
  "student_code": "DIPL2026002",
  "date_of_birth": "2006-03-20",
  "gender": "Female",
  "phone": "+91-9876543210"
}
```

This will:
- Create user account
- Assign STUDENT role
- Create student record
- Set password to `Student@123`

---

## 📝 **All Available Test Accounts**

Currently in your database:

### **Student Account**
```
Email:    rajesh.sharma@student.dipl.edu
Password: student@123
Role:     STUDENT
Code:     DIPL2026001
```

### **Admin Accounts** (if you need)
Check your database for admin users with role level 4 or 5.

---

## ✅ **Quick Test Checklist**

- [ ] Backend running on `http://localhost:3000`
- [ ] Frontend running on `http://localhost:3001`
- [ ] Using correct email: `rajesh.sharma@student.dipl.edu`
- [ ] Using correct password: `student@123`
- [ ] Seed script was run (student exists in DB)

---

## 🚀 **Next Steps**

1. **Login with Rajesh account** (works immediately)
2. **Test your dashboard** (see if data loads)
3. **If you need more students**, create them via API or Supabase

---

## 🆘 **Still Not Working?**

### Check Backend Logs
Look at your backend terminal for errors when you try to login.

### Check Frontend Console
Open browser DevTools (F12) and check:
- Network tab for API calls
- Console for JavaScript errors

### Verify Supabase Connection
```bash
# In backend folder
npm run test:db
```

---

## 📞 **Common Issues**

### "Invalid credentials"
- Wrong email or password
- Use: `rajesh.sharma@student.dipl.edu` / `student@123`

### "User not found"
- Seed script not run
- Run: `backend/database/seed_student_test_data.sql` in Supabase

### "Role not assigned"
- Student role missing
- Check `app_auth.user_roles` table

---

**🎯 TL;DR: Use `rajesh.sharma@student.dipl.edu` with password `student@123`**
