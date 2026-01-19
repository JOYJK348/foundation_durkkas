# DURKKAS ERP - Backend Architecture

**Enterprise-Grade Backend for Vercel Deployment**  
**Supabase + Next.js API Routes + Redis Cache**

---

## 📁 Project Structure

```
backend/
├── database/                    # Supabase SQL Migration Files
│   ├── 00_init.sql             # Database initialization
│   ├── 01_core_schema.sql      # Core organizational schema
│   ├── 02_auth_schema.sql      # Authentication & RBAC
│   ├── 03_hrms_schema.sql      # Human Resources
│   ├── 04_ems_schema.sql       # Education Management
│   ├── 05_finance_schema.sql   # Finance & Payments
│   ├── 06_backoffice_schema.sql # Internal Operations
│   ├── 07_crm_schema.sql       # Lead Management
│   └── README.md               # Database deployment guide
│
├── api/                        # Next.js API Routes (Vercel-compatible)
│   ├── auth/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── refresh.ts
│   │   └── logout.ts
│   ├── core/
│   │   ├── companies.ts
│   │   ├── branches.ts
│   │   └── departments.ts
│   ├── hrms/
│   │   ├── employees.ts
│   │   ├── attendance.ts
│   │   └── payroll.ts
│   ├── ems/
│   │   ├── students.ts
│   │   ├── courses.ts
│   │   ├── batches.ts
│   │   └── events.ts
│   ├── finance/
│   │   ├── invoices.ts
│   │   ├── payments.ts
│   │   └── refunds.ts
│   └── crm/
│       ├── leads.ts
│       ├── followups.ts
│       └── conversions.ts
│
├── lib/                        # Shared utilities
│   ├── supabase.ts            # Supabase client
│   ├── redis.ts               # Redis cache client
│   ├── jwt.ts                 # JWT utilities
│   ├── permissions.ts         # RBAC middleware
│   ├── logger.ts              # Logging utility
│   └── errorHandler.ts        # Error handling
│
├── middleware/                 # API middleware
│   ├── authenticate.ts        # JWT verification
│   ├── checkPermission.ts     # RBAC enforcement
│   ├── rateLimiter.ts         # Rate limiting
│   └── cors.ts                # CORS configuration
│
├── types/                      # TypeScript types
│   ├── database.ts            # Database types
│   ├── api.ts                 # API types
│   └── auth.ts                # Auth types
│
├── config/                     # Configuration
│   ├── database.ts            # DB config
│   ├── redis.ts               # Redis config
│   └── constants.ts           # App constants
│
├── .env.example               # Environment variables template
├── .env.local                 # Local environment (gitignored)
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

---

## 🚀 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Database** | Supabase (PostgreSQL) | Primary data store |
| **Cache** | Redis (Upstash) | Session & data caching |
| **API** | Next.js API Routes | Serverless functions |
| **Auth** | JWT + Supabase Auth | Authentication |
| **RBAC** | Custom middleware | Permission enforcement |
| **Deployment** | Vercel | Serverless hosting |
| **Language** | TypeScript | Type safety |

---

## 📋 Prerequisites

1. **Supabase Account** (https://supabase.com)
2. **Upstash Redis** (https://upstash.com) - Free tier available
3. **Vercel Account** (https://vercel.com)
4. **Node.js 18+**

---

## ⚙️ Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis (Upstash)
REDIS_URL=your_upstash_redis_url
REDIS_TOKEN=your_upstash_token

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# App
NODE_ENV=development
API_BASE_URL=http://localhost:3000
```

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### Required Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@upstash/redis": "^1.28.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "typescript": "^5.3.0"
  }
}
```

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for database provisioning
4. Copy connection details

### Step 2: Run Migrations

```bash
# Navigate to database folder
cd database

# Run migrations in order (using Supabase SQL Editor)
# Copy and paste each file in order:
# 1. 00_init.sql
# 2. 01_core_schema.sql
# 3. 02_auth_schema.sql
# 4. 03_hrms_schema.sql
# 5. 04_ems_schema.sql
# 6. 05_finance_schema.sql
# 7. 06_backoffice_schema.sql
# 8. 07_crm_schema.sql
```

**OR** use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## 🔐 Authentication Flow

```
User Login
    ↓
POST /api/auth/login
    ↓
Validate credentials (bcrypt)
    ↓
Generate JWT token
    ↓
Cache user session (Redis)
    ↓
Return { user, token, permissions }
    ↓
Frontend stores token
    ↓
All API requests include: Authorization: Bearer <token>
    ↓
Middleware validates JWT
    ↓
Middleware checks permissions
    ↓
API executes if authorized
```

---

## 🛡️ RBAC (Role-Based Access Control)

### Permission Format

```
<schema>.<resource>.<action>

Examples:
- hrms.employees.view
- hrms.employees.create
- ems.students.edit
- finance.invoices.delete
```

### Middleware Usage

```typescript
// In API route
import { authenticate, checkPermission } from '@/middleware';

export default async function handler(req, res) {
  // Verify JWT
  const user = await authenticate(req, res);
  
  // Check permission
  await checkPermission(user.id, 'hrms.employees.view');
  
  // Execute API logic
  // ...
}
```

---

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-01-05T15:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You do not have permission to access this resource",
    "details": null
  },
  "timestamp": "2025-01-05T15:30:00Z"
}
```

---

## 🚀 Deployment (Vercel)

### Step 1: Connect Repository

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Import your repository
3. Add environment variables
4. Deploy

### Step 3: Configure Environment

Add all `.env.local` variables in Vercel dashboard

---

## 📈 Performance Optimization

### 1. Redis Caching

```typescript
// Cache user permissions
await redis.set(`user:${userId}:permissions`, permissions, { ex: 3600 });

// Cache frequently accessed data
await redis.set(`branches:all`, branches, { ex: 7200 });
```

### 2. Database Indexing

All foreign keys are indexed automatically in schema files.

### 3. Query Optimization

- Use `SELECT` specific columns, not `SELECT *`
- Use pagination for large datasets
- Use database views for complex queries

---

## 🔍 Monitoring & Logging

### Logging Levels

- `INFO`: General information
- `WARN`: Warning messages
- `ERROR`: Error messages
- `DEBUG`: Debug information (dev only)

### Example

```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: 123 });
logger.error('Payment failed', { error, invoiceId });
```

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run in watch mode
npm test:watch
```

---

## 📚 API Documentation

API documentation will be available at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://your-domain.vercel.app/api/docs`

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📞 Support

For questions or issues:
- **Architecture Team**: Durkkas Innovations
- **Document Version**: 1.0
- **Last Updated**: 2025-01-05
- **Status**: Production Ready ✅

---

**🚀 Ready to build the future of Durkkas Innovations! 🚀**
