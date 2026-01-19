# 🏗️ Implementation Guide

**Complete Backend Implementation with Menu-Based Access Control**

---

## 📁 Project Structure (Complete)

```
backend/
├── config/
│   └── constants.ts          ✅ Application constants
│
├── lib/
│   ├── supabase.ts           ✅ Supabase client
│   ├── redis.ts              ✅ Redis cache client
│   ├── jwt.ts                ✅ JWT utilities
│   ├── permissions.ts        ✅ RBAC utilities
│   ├── menuAccess.ts         ✅ Menu-based access control
│   ├── logger.ts             ✅ Logging utility
│   ├── errorHandler.ts       ✅ Error handling
│   └── validation.ts         ✅ Zod validation schemas
│
├── middleware/
│   ├── authenticate.ts       ✅ JWT authentication
│   ├── checkPermission.ts    ✅ Permission checking
│   ├── menuAccess.ts         ✅ Menu access control
│   └── rateLimiter.ts        ✅ Rate limiting
│
├── pages/api/
│   ├── auth/
│   │   ├── login.ts          ✅ Login endpoint
│   │   ├── logout.ts         ✅ Logout endpoint
│   │   └── menus.ts          ✅ Get user menus
│   └── hrms/
│       └── employees.ts      ✅ Employee CRUD (example)
│
├── types/
│   ├── database.ts           ✅ Database types
│   └── api.ts                ✅ API types
│
├── database/
│   ├── 00_init.sql           ✅ Database initialization
│   └── README.md             ✅ Deployment guide
│
├── .env.example              ✅ Environment template
├── package.json              ✅ Dependencies
├── tsconfig.json             ✅ TypeScript config
├── README.md                 ✅ Main documentation
└── QUICKSTART.md             ✅ Quick start guide
```

---

## 🎯 Key Features Implemented

### 1. **Menu-Based Access Control** ⭐
- Users can only access menus they have permissions for
- Hierarchical menu structure with parent-child relationships
- Menu permissions cached in Redis for performance
- Route-based access control

### 2. **Professional Security**
- JWT authentication with access + refresh tokens
- Redis-based session management
- RBAC with granular permissions
- Rate limiting to prevent abuse
- Password hashing with bcrypt
- Account locking after failed attempts

### 3. **Enterprise-Grade Code**
- TypeScript for type safety
- Centralized error handling
- Structured logging
- Input validation with Zod
- Consistent API responses

### 4. **Performance Optimization**
- Redis caching for:
  - User sessions
  - Permissions
  - Menus
  - Master data
- Efficient database queries
- Connection pooling (Supabase)

---

## 🔐 Menu-Based Access Flow

```
1. User Login
   ↓
2. Fetch User Roles
   ↓
3. Fetch Role Permissions
   ↓
4. Fetch Allowed Menus (based on permissions)
   ↓
5. Cache Menus in Redis
   ↓
6. Return Hierarchical Menu Structure
   ↓
7. Frontend Renders Menu
   ↓
8. User Clicks Menu Item
   ↓
9. API Request with JWT Token
   ↓
10. Middleware Validates JWT
    ↓
11. Middleware Checks Menu Access
    ↓
12. API Executes if Authorized
```

---

## 📝 How to Create New API Endpoints

### Example: Create Students API

**File**: `pages/api/ems/students.ts`

```typescript
import type { NextApiResponse } from 'next';
import { withAuth, type AuthenticatedRequest } from '@/middleware/authenticate';
import { withMenuAccess } from '@/middleware/menuAccess';
import { supabase } from '@/lib/supabase';
import { sendSuccess, handleError } from '@/lib/errorHandler';
import { createStudentSchema, paginationSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

// GET handler
async function handleGet(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const offset = (page - 1) * limit;

    let query = supabase
      .schema('ems')
      .from('students')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    sendSuccess(res, {
      students: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
}

// POST handler
async function handlePost(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const validatedData = createStudentSchema.parse(req.body);

    const { data, error } = await supabase
      .schema('ems')
      .from('students')
      .insert({
        ...validatedData,
        created_by: req.user.userId,
      })
      .select()
      .single();

    if (error) throw error;

    sendSuccess(res, { student: data }, 'Student created successfully', 201);
  } catch (error) {
    handleError(res, error);
  }
}

// Main handler with menu-based access control
export default withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return withMenuAccess('ems_students', handleGet)(req, res);
    case 'POST':
      return withMenuAccess('ems_students_create', handlePost)(req, res);
    default:
      return res.status(405).json({
        success: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
        timestamp: new Date().toISOString(),
      });
  }
});
```

---

## 🗄️ Database Menu Setup

### Step 1: Insert Menu in Database

```sql
-- Insert parent menu
INSERT INTO auth.menu_registry (
  menu_name, menu_key, display_name, product, schema_name, 
  route, icon, sort_order, is_active, is_visible
) VALUES (
  'Students', 'ems_students', 'Student Management', 'EMS', 'ems',
  '/ems/students', 'users', 10, TRUE, TRUE
);

-- Insert child menu (if needed)
INSERT INTO auth.menu_registry (
  menu_name, menu_key, display_name, product, schema_name,
  route, icon, parent_menu_id, sort_order, is_active, is_visible
) VALUES (
  'Create Student', 'ems_students_create', 'Create New Student', 'EMS', 'ems',
  '/ems/students/create', 'user-plus', 
  (SELECT id FROM auth.menu_registry WHERE menu_key = 'ems_students'),
  1, TRUE, TRUE
);
```

### Step 2: Create Permissions

```sql
INSERT INTO auth.permissions (name, display_name, schema_name, resource, action) VALUES
('ems.students.view', 'View Students', 'ems', 'students', 'view'),
('ems.students.create', 'Create Students', 'ems', 'students', 'create'),
('ems.students.edit', 'Edit Students', 'ems', 'students', 'edit'),
('ems.students.delete', 'Delete Students', 'ems', 'students', 'delete');
```

### Step 3: Link Menu to Permissions

```sql
INSERT INTO auth.menu_permissions (menu_id, permission_id) VALUES
(
  (SELECT id FROM auth.menu_registry WHERE menu_key = 'ems_students'),
  (SELECT id FROM auth.permissions WHERE name = 'ems.students.view')
);
```

### Step 4: Assign Permissions to Role

```sql
INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM auth.roles WHERE name = 'EMS_ADMIN'),
  id
FROM auth.permissions
WHERE name LIKE 'ems.students.%';
```

---

## 🧪 Testing the API

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@durkkas.com",
    "password": "your_password"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@durkkas.com",
      "roles": ["SUPER_ADMIN"]
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### 2. Get User Menus

```bash
curl -X GET http://localhost:3000/api/auth/menus \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Access Protected Endpoint

```bash
curl -X GET "http://localhost:3000/api/hrms/employees?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use strong JWT secret (min 32 characters)
- ✅ Rotate secrets regularly

### 2. Password Security
- ✅ Minimum 8 characters
- ✅ Require uppercase, lowercase, and numbers
- ✅ Hash with bcrypt (cost factor 10)
- ✅ Lock account after 5 failed attempts

### 3. API Security
- ✅ Always validate JWT on protected routes
- ✅ Check permissions before executing actions
- ✅ Use menu-based access control
- ✅ Implement rate limiting
- ✅ Log all security events

### 4. Database Security
- ✅ Use service role key only in backend
- ✅ Enable Row Level Security (RLS)
- ✅ Validate all inputs
- ✅ Use parameterized queries

---

## 📊 Monitoring & Logging

### Log Levels

```typescript
import { logger } from '@/lib/logger';

// Debug (development only)
logger.debug('User data fetched', { userId: 123 });

// Info (general information)
logger.info('User logged in', { userId: 123, email: 'user@example.com' });

// Warning (potential issues)
logger.warn('Rate limit approaching', { ip: '192.168.1.1', requests: 95 });

// Error (actual errors)
logger.error('Database query failed', error, { query: 'SELECT...' });
```

---

## 🚀 Deployment Checklist

- [ ] Update all environment variables in Vercel
- [ ] Deploy database schema to Supabase
- [ ] Update Super Admin password
- [ ] Test all API endpoints
- [ ] Enable RLS policies
- [ ] Configure Redis (Upstash)
- [ ] Set up monitoring
- [ ] Configure CORS
- [ ] Test rate limiting
- [ ] Verify menu access control

---

## 📞 Support

For issues or questions:
- **Architecture Team**: Durkkas Innovations
- **Version**: 2.0 (Menu-Based)
- **Last Updated**: 2025-01-05

---

**✅ Complete professional backend with menu-based access control ready!**
