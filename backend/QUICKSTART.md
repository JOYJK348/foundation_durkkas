# 🚀 Quick Start Guide

## 1. Setup Supabase

1. Create account at https://supabase.com
2. Create new project
3. Copy credentials from Settings → API

## 2. Setup Redis (Upstash)

1. Create account at https://upstash.com
2. Create Redis database
3. Copy REST URL and token

## 3. Install Dependencies

```bash
cd backend
npm install
```

## 4. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

## 5. Deploy Database

1. Open Supabase SQL Editor
2. Run files in `database/` folder in order (00 → 07)
3. Update Super Admin password

## 6. Run Development Server

```bash
npm run dev
```

## 7. Test API

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@durkkas.com","password":"your_password"}'
```

## 📚 Next Steps

- Read `README.md` for full documentation
- Check `database/README.md` for deployment guide
- Explore example API routes in `pages/api/`

**✅ You're ready to build!**
