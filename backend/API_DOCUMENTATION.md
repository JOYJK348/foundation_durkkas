# 📚 DURKKAS ERP - API Documentation

**Version**: 2.0  
**Last Updated**: 2026-01-07  
**Base URL**: `http://localhost:3000/api` (Development)  
**Production URL**: `https://your-domain.com/api`

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Response Format

All API responses follow this standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-01-07T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2026-01-07T12:00:00.000Z"
}
```

---

## 📋 Table of Contents

1. [Authentication APIs](#1-authentication-apis)
2. [Core APIs](#2-core-apis)
3. [HRMS APIs](#3-hrms-apis)
4. [EMS APIs](#4-ems-apis)
5. [Finance APIs](#5-finance-apis)
6. [CRM APIs](#6-crm-apis)
7. [Backoffice APIs](#7-backoffice-apis)

---

## 1. Authentication APIs

### 1.1 Login

**Endpoint:** `POST /api/auth/login`  
**Authentication:** Not Required  
**Description:** Authenticate user and receive access tokens

**Request Body:**
```json
{
  "email": "admin@durkkas.com",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@durkkas.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["SUPER_ADMIN"]
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "message": "Login successful"
}
```

**Security Features:**
- Automatic IP address tracking
- User agent logging
- Failed login attempt tracking
- Account locking after 5 failed attempts
- Audit log creation for all login attempts

**Test Cases:**
```bash
# Valid Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@durkkas.com","password":"Admin@123"}'

# Invalid Credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@durkkas.com","password":"wrong"}'
```

---

### 1.2 Logout

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Required  
**Description:** Invalidate user session and tokens

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Test Case:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 1.3 Get User Menus

**Endpoint:** `GET /api/auth/menus`  
**Authentication:** Required  
**Description:** Fetch hierarchical menu structure based on user permissions

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "menus": [
      {
        "id": 1,
        "menu_key": "hrms_dashboard",
        "display_name": "HRMS Dashboard",
        "route": "/hrms/dashboard",
        "icon": "dashboard",
        "children": [...]
      }
    ]
  }
}
```

**Test Case:**
```bash
curl -X GET http://localhost:3000/api/auth/menus \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 1.4 Get Users

**Endpoint:** `GET /api/auth/users`  
**Authentication:** Required  
**Description:** Fetch all system users (excludes password_hash)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@durkkas.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 1.5 Get Roles

**Endpoint:** `GET /api/auth/roles`  
**Authentication:** Required  
**Description:** Fetch all system roles

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SUPER_ADMIN",
      "display_name": "Super Administrator",
      "role_type": "SYSTEM",
      "is_active": true
    }
  ]
}
```

---

### 1.6 Get Permissions

**Endpoint:** `GET /api/auth/permissions`  
**Authentication:** Required  
**Description:** Fetch all system permissions

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "hrms.employees.view",
      "display_name": "View Employees",
      "schema_name": "hrms",
      "resource": "employees",
      "action": "view"
    }
  ]
}
```

---

### 1.7 Get User Roles

**Endpoint:** `GET /api/auth/user-roles`  
**Authentication:** Required  
**Description:** Fetch user-role mappings with user and role details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "role_id": 1,
      "user": {
        "email": "admin@durkkas.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "role": {
        "name": "SUPER_ADMIN",
        "display_name": "Super Administrator"
      }
    }
  ]
}
```

---

### 1.8 Get Audit Logs

**Endpoint:** `GET /api/auth/audit-logs`  
**Authentication:** Required (Admin Only)  
**Description:** Fetch security audit logs with user details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "action": "LOGIN",
      "table_name": "users",
      "record_id": "1",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-01-07T12:00:00.000Z",
      "user": {
        "email": "admin@durkkas.com",
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ]
}
```

---

### 1.9 Get Login History

**Endpoint:** `GET /api/auth/login-history`  
**Authentication:** Required (Admin Only)  
**Description:** Fetch login attempt history with user details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "login_at": "2026-01-07T12:00:00.000Z",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "status": "SUCCESS",
      "failure_reason": null,
      "user": {
        "email": "admin@durkkas.com",
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ]
}
```

---

## 2. Core APIs

Core APIs manage organizational master data.

### 2.1 Get Companies

**Endpoint:** `GET /api/core/companies`  
**Authentication:** Required  
**Description:** Fetch all companies

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Durkkas Innovations",
      "legal_name": "Durkkas Innovations Private Limited",
      "company_code": "DURK001",
      "email": "info@durkkas.com",
      "phone": "+91-9876543210",
      "is_active": true
    }
  ]
}
```

**Test Case:**
```bash
curl -X GET http://localhost:3000/api/core/companies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.2 Get Branches

**Endpoint:** `GET /api/core/branches`  
**Authentication:** Required  
**Description:** Fetch all branches with company details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "name": "Head Office",
      "branch_code": "HO001",
      "branch_type": "HQ",
      "is_active": true,
      "company": {
        "name": "Durkkas Innovations"
      }
    }
  ]
}
```

---

### 2.3 Get Departments

**Endpoint:** `GET /api/core/departments`  
**Authentication:** Required  
**Description:** Fetch all departments

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "name": "Information Technology",
      "department_code": "IT",
      "is_active": true
    }
  ]
}
```

---

### 2.4 Get Designations

**Endpoint:** `GET /api/core/designations`  
**Authentication:** Required  
**Description:** Fetch all designations

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "title": "Software Engineer",
      "designation_code": "SE",
      "level": 2,
      "is_active": true
    }
  ]
}
```

---

### 2.5 Get Academic Years

**Endpoint:** `GET /api/core/academic-years`  
**Authentication:** Required  
**Description:** Fetch all academic years

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "name": "2025-2026",
      "start_date": "2025-06-01",
      "end_date": "2026-05-31",
      "is_active": true
    }
  ]
}
```

---

### 2.6 Get Countries

**Endpoint:** `GET /api/core/countries`  
**Authentication:** Required  
**Description:** Fetch all countries

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "India",
      "iso_code": "IN",
      "phone_code": "+91"
    }
  ]
}
```

---

### 2.7 Get States

**Endpoint:** `GET /api/core/states`  
**Authentication:** Required  
**Description:** Fetch all states with country details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "country_id": 1,
      "name": "Tamil Nadu",
      "state_code": "TN",
      "country": {
        "name": "India"
      }
    }
  ]
}
```

---

### 2.8 Get Cities

**Endpoint:** `GET /api/core/cities`  
**Authentication:** Required  
**Description:** Fetch all cities with state details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "state_id": 1,
      "name": "Chennai",
      "state": {
        "name": "Tamil Nadu"
      }
    }
  ]
}
```

---

### 2.9 Get Locations

**Endpoint:** `GET /api/core/locations`  
**Authentication:** Required  
**Description:** Fetch all locations with branch and city details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "branch_id": 1,
      "name": "Main Office",
      "address_line1": "123 Main Street",
      "city_id": 1,
      "pincode": "600001",
      "is_active": true,
      "branch": {
        "name": "Head Office"
      },
      "city": {
        "name": "Chennai"
      }
    }
  ]
}
```

---

### 2.10 Get Global Settings

**Endpoint:** `GET /api/core/global-settings`  
**Authentication:** Required (Admin Only)  
**Description:** Fetch all global system settings

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "setting_key": "company_name",
      "setting_value": "Durkkas Innovations",
      "description": "Company display name",
      "is_system_setting": true
    }
  ]
}
```

---

## 3. HRMS APIs

HRMS APIs manage employee data, recruitment, training, and performance.

### 3.1 Get Employees

**Endpoint:** `GET /api/hrms/employees`  
**Authentication:** Required  
**Description:** Fetch all employees with related details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_code": "EMP001",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john.doe@durkkas.com",
      "phone": "+91-9876543210",
      "employment_type": "FULL_TIME",
      "date_of_joining": "2024-01-01",
      "is_active": true,
      "company": {
        "name": "Durkkas Innovations"
      },
      "branch": {
        "name": "Head Office"
      },
      "department": {
        "name": "Information Technology"
      },
      "designation": {
        "title": "Software Engineer"
      }
    }
  ]
}
```

**Test Case:**
```bash
curl -X GET http://localhost:3000/api/hrms/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3.2 Get Attendance

**Endpoint:** `GET /api/hrms/attendance`  
**Authentication:** Required  
**Description:** Fetch attendance records with employee details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "attendance_date": "2026-01-07",
      "check_in_time": "09:00:00",
      "check_out_time": "18:00:00",
      "status": "PRESENT",
      "total_hours": 9,
      "employee": {
        "full_name": "John Doe",
        "employee_code": "EMP001"
      }
    }
  ]
}
```

---

### 3.3 Get Leave Requests

**Endpoint:** `GET /api/hrms/leaves`  
**Authentication:** Required  
**Description:** Fetch leave requests with employee and leave type details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "leave_type_id": 1,
      "from_date": "2026-01-10",
      "to_date": "2026-01-12",
      "total_days": 3,
      "status": "PENDING",
      "employee": {
        "full_name": "John Doe",
        "employee_code": "EMP001"
      },
      "leave_type": {
        "name": "Casual Leave",
        "code": "CL"
      }
    }
  ]
}
```

---

### 3.4 Get Payroll

**Endpoint:** `GET /api/hrms/payroll`  
**Authentication:** Required  
**Description:** Fetch payroll records (payslips) with employee and cycle details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "payroll_cycle_id": 1,
      "employee_id": 1,
      "net_salary": 50000,
      "payment_status": "PAID",
      "employee": {
        "full_name": "John Doe",
        "employee_code": "EMP001"
      },
      "payroll_cycle": {
        "cycle_name": "January 2026",
        "cycle_month": 1,
        "cycle_year": 2026
      }
    }
  ]
}
```

---

### 3.5 Get Job Openings

**Endpoint:** `GET /api/hrms/job-openings`  
**Authentication:** Required  
**Description:** Fetch all job openings with department and designation details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "branch_id": 1,
      "title": "Senior Software Engineer",
      "description": "Looking for experienced developers",
      "employment_type": "FULL_TIME",
      "vacancies": 2,
      "status": "OPEN",
      "posted_at": "2026-01-01T00:00:00.000Z",
      "department": {
        "name": "Information Technology"
      },
      "designation": {
        "title": "Senior Software Engineer"
      }
    }
  ]
}
```

---

### 3.6 Get Candidates

**Endpoint:** `GET /api/hrms/candidates`  
**Authentication:** Required  
**Description:** Fetch all recruitment candidates

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+91-9876543211",
      "resume_url": "https://...",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience_years": 5,
      "source": "LinkedIn"
    }
  ]
}
```

---

### 3.7 Get Job Applications

**Endpoint:** `GET /api/hrms/job-applications`  
**Authentication:** Required  
**Description:** Fetch job applications with job opening and candidate details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "job_opening_id": 1,
      "candidate_id": 1,
      "status": "INTERVIEW",
      "applied_at": "2026-01-05T00:00:00.000Z",
      "job_opening": {
        "title": "Senior Software Engineer"
      },
      "candidate": {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@example.com"
      }
    }
  ]
}
```

---

### 3.8 Get Interviews

**Endpoint:** `GET /api/hrms/interviews`  
**Authentication:** Required  
**Description:** Fetch interview schedules with application and interviewer details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "application_id": 1,
      "interviewer_id": 2,
      "scheduled_at": "2026-01-08T10:00:00.000Z",
      "duration_minutes": 60,
      "location": "Conference Room A",
      "status": "SCHEDULED",
      "application": {
        "job_opening": {
          "title": "Senior Software Engineer"
        },
        "candidate": {
          "first_name": "Jane",
          "last_name": "Smith"
        }
      },
      "interviewer": {
        "full_name": "John Doe"
      }
    }
  ]
}
```

---

### 3.9 Get Performance Reviews

**Endpoint:** `GET /api/hrms/performance-reviews`  
**Authentication:** Required  
**Description:** Fetch performance reviews with employee and reviewer details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "reviewer_id": 2,
      "review_date": "2026-01-01",
      "rating": 4.5,
      "comments": "Excellent performance",
      "employee": {
        "full_name": "John Doe"
      },
      "reviewer": {
        "full_name": "Jane Manager"
      }
    }
  ]
}
```

---

### 3.10 Get Training Programs

**Endpoint:** `GET /api/hrms/training-programs`  
**Authentication:** Required  
**Description:** Fetch training programs with trainer details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "React Advanced Training",
      "description": "Advanced React concepts and best practices",
      "trainer_id": 3,
      "start_date": "2026-02-01",
      "end_date": "2026-02-05",
      "is_active": true,
      "trainer": {
        "full_name": "Expert Trainer"
      }
    }
  ]
}
```

---

### 3.11 Get Training Enrollments

**Endpoint:** `GET /api/hrms/training-enrollments`  
**Authentication:** Required  
**Description:** Fetch training enrollments with program and employee details

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "program_id": 1,
      "employee_id": 1,
      "enrollment_date": "2026-01-15",
      "status": "ENROLLED",
      "program": {
        "name": "React Advanced Training"
      },
      "employee": {
        "full_name": "John Doe"
      }
    }
  ]
}
```

---

## 4. EMS APIs

EMS (Education Management System) APIs handle student and course data.

### 4.1 Get Students

**Endpoint:** `GET /api/ems/students`  
**Authentication:** Required  
**Description:** Fetch all students from EMS (Education)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_code": "STU001",
      "first_name": "Alice",
      "last_name": "Johnson",
      "full_name": "Alice Johnson",
      "email": "alice.johnson@example.com",
      "phone": "+91-9876543212",
      "enrollment_date": "2025-06-01",
      "is_active": true
    }
  ]
}
```

**Test Case:**
```bash
curl -X GET http://localhost:3000/api/ems/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4.2 Get Courses

**Endpoint:** `GET /api/ems/courses`  
**Authentication:** Required  
**Description:** Fetch all courses from EMS (Education)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Full Stack Web Development",
      "code": "FSWD101",
      "description": "Complete web development course",
      "course_type": "ONLINE",
      "duration_hours": 120,
      "fee": 25000,
      "is_active": true
    }
  ]
}
```

---

### 4.3 Get Teachers

**Endpoint:** `GET /api/ems/teachers`  
**Authentication:** Required  
**Description:** Fetch teachers (employees with teacher designation) for EMS

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "employee_code": "TCH001",
      "full_name": "Professor Smith",
      "email": "prof.smith@durkkas.com",
      "designation": {
        "title": "Senior Teacher"
      }
    }
  ]
}
```

---

## 5. Finance APIs

Finance APIs manage invoices, payments, and salary processing.

### 5.1 Get Invoices

**Endpoint:** `GET /api/finance/invoices`  
**Authentication:** Required  
**Description:** Fetch all invoices (placeholder - implement as needed)

---

### 5.2 Get Payments

**Endpoint:** `GET /api/finance/payments`  
**Authentication:** Required  
**Description:** Fetch all payments (placeholder - implement as needed)

---

### 5.3 Get Salary

**Endpoint:** `GET /api/finance/salary`  
**Authentication:** Required  
**Description:** Fetch salary records (placeholder - implement as needed)

---

## 6. CRM APIs

CRM APIs manage lead tracking and conversion.

### 6.1 Get Leads

**Endpoint:** `GET /api/crm/leads`  
**Authentication:** Required  
**Description:** Fetch all leads (placeholder - implement as needed)

---

## 7. Backoffice APIs

Backoffice APIs manage internal operations.

### 7.1 Get Tickets

**Endpoint:** `GET /api/backoffice/tickets`  
**Authentication:** Required  
**Description:** Fetch support tickets (placeholder - implement as needed)

---

## 🧪 Testing Guide

### Using cURL

**1. Login and Get Token:**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@durkkas.com","password":"Admin@123"}' \
  | jq -r '.data.tokens.accessToken' > token.txt

# Store token
export TOKEN=$(cat token.txt)
```

**2. Test Protected Endpoints:**
```bash
# Get Employees
curl -X GET http://localhost:3000/api/hrms/employees \
  -H "Authorization: Bearer $TOKEN" | jq

# Get Students
curl -X GET http://localhost:3000/api/ems/students \
  -H "Authorization: Bearer $TOKEN" | jq

# Get Companies
curl -X GET http://localhost:3000/api/core/companies \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### Using Postman

**1. Create Environment:**
- Variable: `baseUrl` = `http://localhost:3000/api`
- Variable: `token` = (will be set after login)

**2. Login Request:**
```
POST {{baseUrl}}/auth/login
Body (JSON):
{
  "email": "admin@durkkas.com",
  "password": "Admin@123"
}

Tests Script:
pm.environment.set("token", pm.response.json().data.tokens.accessToken);
```

**3. Protected Request Template:**
```
GET {{baseUrl}}/hrms/employees
Headers:
Authorization: Bearer {{token}}
```

---

### Using JavaScript/TypeScript (Frontend)

```typescript
// API Client Setup
const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      this.token = data.data.tokens.accessToken;
      localStorage.setItem('token', this.token);
    }
    return data;
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  async post(endpoint: string, body: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    });
    return response.json();
  }
}

// Usage Example
const api = new ApiClient();

// Login
await api.login('admin@durkkas.com', 'Admin@123');

// Fetch Employees
const employees = await api.get('/hrms/employees');
console.log(employees);

// Fetch Students
const students = await api.get('/ems/students');
console.log(students);
```

---

## 🔒 Security Best Practices

### For Frontend Developers:

1. **Token Storage:**
   - Store tokens in `httpOnly` cookies (preferred) or `localStorage`
   - Never store tokens in plain text or expose in URLs

2. **Token Refresh:**
   - Implement automatic token refresh before expiry
   - Handle 401 responses by redirecting to login

3. **HTTPS Only:**
   - Always use HTTPS in production
   - Never send credentials over HTTP

4. **Input Validation:**
   - Validate all user inputs on frontend
   - Don't rely solely on backend validation

5. **Error Handling:**
   - Never expose sensitive error details to users
   - Log errors securely for debugging

---

## 📊 API Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## 🆘 Support

For API issues or questions:
- **Email**: dev@durkkas.com
- **Documentation**: This file
- **Backend Team**: Durkkas Innovations

---

**Last Updated**: 2026-01-07  
**Version**: 2.0  
**Maintained By**: Durkkas Backend Team
