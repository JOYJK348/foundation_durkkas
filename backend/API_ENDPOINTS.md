# 📚 DURKKAS ERP - API Endpoints Reference

**Version**: 2.0  
**Last Updated**: 2026-01-07  
**Base URL**: `http://localhost:3000/api` (Development)

---

## 🔐 Authentication APIs (9 Endpoints)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | POST | `/api/auth/login` | User login and token generation | ❌ |
| 2 | POST | `/api/auth/logout` | User logout and session invalidation | ✅ |
| 3 | GET | `/api/auth/menus` | Get user's accessible menus (RBAC) | ✅ |
| 4 | GET | `/api/auth/users` | Get all system users | ✅ |
| 5 | GET | `/api/auth/roles` | Get all system roles | ✅ |
| 6 | GET | `/api/auth/permissions` | Get all permissions | ✅ |
| 7 | GET | `/api/auth/user-roles` | Get user-role mappings | ✅ |
| 8 | GET | `/api/auth/audit-logs` | Get security audit logs | ✅ Admin |
| 9 | GET | `/api/auth/login-history` | Get login attempt history | ✅ Admin |

---

## 🏢 Core APIs (10 Endpoints)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | GET | `/api/core/companies` | Get all companies | ✅ |
| 2 | GET | `/api/core/branches` | Get all branches with company details | ✅ |
| 3 | GET | `/api/core/departments` | Get all departments | ✅ |
| 4 | GET | `/api/core/designations` | Get all designations | ✅ |
| 5 | GET | `/api/core/academic-years` | Get all academic years | ✅ |
| 6 | GET | `/api/core/countries` | Get all countries | ✅ |
| 7 | GET | `/api/core/states` | Get all states with country details | ✅ |
| 8 | GET | `/api/core/cities` | Get all cities with state details | ✅ |
| 9 | GET | `/api/core/locations` | Get all locations with branch/city details | ✅ |
| 10 | GET | `/api/core/global-settings` | Get global system settings | ✅ Admin |

---

## 👥 HRMS APIs (11 Endpoints)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | GET | `/api/hrms/employees` | Get all employees with full details | ✅ |
| 2 | GET | `/api/hrms/attendance` | Get attendance records | ✅ |
| 3 | GET | `/api/hrms/leaves` | Get leave requests | ✅ |
| 4 | GET | `/api/hrms/payroll` | Get payroll/payslips | ✅ |
| 5 | GET | `/api/hrms/job-openings` | Get job openings | ✅ |
| 6 | GET | `/api/hrms/candidates` | Get recruitment candidates | ✅ |
| 7 | GET | `/api/hrms/job-applications` | Get job applications | ✅ |
| 8 | GET | `/api/hrms/interviews` | Get interview schedules | ✅ |
| 9 | GET | `/api/hrms/performance-reviews` | Get performance reviews | ✅ |
| 10 | GET | `/api/hrms/training-programs` | Get training programs | ✅ |
| 11 | GET | `/api/hrms/training-enrollments` | Get training enrollments | ✅ |

---

## 🎓 EMS APIs (3 Endpoints)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | GET | `/api/ems/students` | Get all students (Education) | ✅ |
| 2 | GET | `/api/ems/courses` | Get all courses (Education) | ✅ |
| 3 | GET | `/api/ems/teachers` | Get all teachers (Education) | ✅ |

---

## 💰 Finance APIs (3 Endpoints)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | GET | `/api/finance/invoices` | Get all invoices | ✅ |
| 2 | GET | `/api/finance/payments` | Get all payments | ✅ |
| 3 | GET | `/api/finance/salary` | Get salary records | ✅ |

---

## 📞 CRM APIs (1 Endpoint)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | GET | `/api/crm/leads` | Get all leads | ✅ |

---

## 🏪 Backoffice APIs (1 Endpoint)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | GET | `/api/backoffice/tickets` | Get support tickets | ✅ |

---

## 🏥 Health Check (1 Endpoint)

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---------------|
| 1 | GET | `/api/health` | API health check | ❌ |

---

## 📊 Summary

| Module | Total Endpoints | Implemented | Pending |
|--------|----------------|-------------|---------|
| **Authentication** | 9 | ✅ 9 | - |
| **Core** | 10 | ✅ 10 | - |
| **HRMS** | 11 | ✅ 11 | - |
| **EMS** | 3 | ✅ 3 | - |
| **Finance** | 3 | ⚠️ 3 (Placeholder) | 3 |
| **CRM** | 1 | ⚠️ 1 (Placeholder) | 1 |
| **Backoffice** | 1 | ⚠️ 1 (Placeholder) | 1 |
| **Health** | 1 | ✅ 1 | - |
| **TOTAL** | **39** | **34** | **5** |

---

## 🔒 Authentication Header Format

All protected endpoints require:

```
Authorization: Bearer <your_access_token>
```

---

## 📝 Quick Test Examples

### 1. Login
```bash
POST http://localhost:3000/api/auth/login
Body: {"email":"admin@durkkas.com","password":"Admin@123"}
```

### 2. Get Employees
```bash
GET http://localhost:3000/api/hrms/employees
Header: Authorization: Bearer YOUR_TOKEN
```

### 3. Get Students
```bash
GET http://localhost:3000/api/ems/students
Header: Authorization: Bearer YOUR_TOKEN
```

---

## 📌 Notes

- ✅ = Fully Implemented
- ⚠️ = Placeholder (Needs Implementation)
- ❌ = No Authentication Required
- 🔒 = Authentication Required
- 👑 = Admin Only

---

**Maintained By**: Durkkas Backend Team  
**Last Updated**: 2026-01-07
