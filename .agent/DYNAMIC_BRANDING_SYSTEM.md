# Dynamic Branding System - Logo & Favicon

## Overview
The platform now supports dynamic branding configuration through global settings. Platform Admins can update the logo, favicon, and system name, which will be automatically fetched and displayed across the application.

---

## What's Been Implemented

### 1. **Database Configuration**
Added branding settings to `core.global_settings`:

```sql
INSERT INTO core.global_settings ("group", "key", "value", "description", is_system_setting) VALUES
('BRANDING', 'platform_logo_url', '/logo.svg', 'Platform logo URL (SVG preferred)', TRUE),
('BRANDING', 'platform_favicon_url', '/favicon.ico', 'Platform favicon URL (32x32 ICO or PNG)', TRUE),
('BRANDING', 'platform_tagline', 'Advanced Enterprise Architecture', 'Platform tagline/slogan', TRUE);
```

**File:** `backend/database/03_production_seeds.sql`

---

### 2. **Branding Service** (`brandingService.ts`)
Created a singleton service to manage branding settings:

**Features:**
- ✅ Fetches branding settings from `/api/core/global-settings`
- ✅ Caches settings for 5 minutes to reduce API calls
- ✅ Dynamically updates favicon in the browser
- ✅ Provides methods to update branding (Platform Admin only)

**File:** `frontend/src/services/brandingService.ts`

**Usage:**
```typescript
import { brandingService } from '@/services/brandingService';

// Get branding settings
const branding = await brandingService.getBrandingSettings();
console.log(branding.platform_logo_url);
console.log(branding.system_name);

// Update branding (Platform Admin only)
await brandingService.updateBrandingSettings({
    platform_logo_url: 'https://cdn.example.com/logo.svg',
    platform_favicon_url: 'https://cdn.example.com/favicon.ico'
});
```

---

### 3. **React Hook** (`useBranding.ts`)
Created a custom hook for easy access to branding in components:

**File:** `frontend/src/hooks/useBranding.ts`

**Usage:**
```typescript
import { useBranding } from '@/hooks/useBranding';

function MyComponent() {
    const { branding, loading, updateBranding } = useBranding();

    return (
        \u003cdiv>
            \u003cimg src={branding.platform_logo_url} alt={branding.system_name} />
            \u003ch1>{branding.system_name}\u003c/h1>
            \u003cp>{branding.platform_tagline}\u003c/p>
        \u003c/div>
    );
}
```

---

## How to Use

### For Platform Admins:

#### 1. **Update Logo via API**
```bash
POST /api/core/global-settings
Authorization: Bearer {platform_admin_token}

[
    {
        "group": "BRANDING",
        "key": "platform_logo_url",
        "value": "https://cdn.example.com/my-logo.svg",
        "is_system_setting": true
    }
]
```

#### 2. **Update Favicon**
```bash
POST /api/core/global-settings

[
    {
        "group": "BRANDING",
        "key": "platform_favicon_url",
        "value": "https://cdn.example.com/favicon.ico",
        "is_system_setting": true
    }
]
```

#### 3. **Update System Name**
```bash
POST /api/core/global-settings

[
    {
        "group": "GENERAL",
        "key": "system_name",
        "value": "My Custom ERP",
        "is_system_setting": true
    }
]
```

---

### For Developers:

#### 1. **Use in Any Component**
```typescript
import { useBranding } from '@/hooks/useBranding';

export default function Header() {
    const { branding } = useBranding();

    return (
        \u003cheader>
            \u003cimg src={branding.platform_logo_url} alt="Logo" />
            \u003cspan>{branding.system_name}\u003c/span>
        \u003c/header>
    );
}
```

#### 2. **Update DashboardLayout** (Manual Step Required)
To display dynamic logo in the sidebar, update `DashboardLayout.tsx`:

```tsx
// Add import
import { useBranding } from "@/hooks/useBranding";

// In component
const { branding } = useBranding();

// Replace hardcoded logo (around line 380-388)
\u003cdiv className="flex items-center gap-3 px-2 mb-8 mt-2">
    {branding.platform_logo_url && branding.platform_logo_url !== '/logo.svg' ? (
        \u003cimg 
            src={branding.platform_logo_url} 
            alt={branding.system_name}
            className="w-8 h-8 object-contain"
        />
    ) : (
        \u003cdiv className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            \u003cspan className="text-white font-bold text-lg">{branding.system_name.charAt(0)}\u003c/span>
        \u003c/div>
    )}
    \u003cspan className="font-bold text-xl tracking-tight">{branding.system_name}\u003c/span>
    {userLevel === 5 && (
        \u003cspan className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-auto">Core\u003c/span>
    )}
\u003c/div>
```

---

## Automatic Features

### 1. **Favicon Auto-Update**
The `brandingService` automatically updates the browser favicon when settings are loaded:

```typescript
// Automatically called on app load
brandingService.getBrandingSettings(); // Updates favicon
```

### 2. **Caching**
Branding settings are cached for 5 minutes to reduce API calls:
- First load: Fetches from API
- Subsequent loads (within 5 min): Uses cached data
- After 5 min: Fetches fresh data

### 3. **Fallback Values**
If API fails or settings are missing, defaults are used:
```typescript
{
    platform_logo_url: '/logo.svg',
    platform_favicon_url: '/favicon.ico',
    platform_tagline: 'Advanced Enterprise Architecture',
    system_name: 'Durkkas ERP'
}
```

---

## When New Company Registers

### Current Flow:
1. Company registration form submitted
2. Company record created in database
3. **Branding is automatically loaded** when:
   - User logs in
   - Dashboard loads
   - Any component uses `useBranding()` hook

### What Happens:
1. `useBranding()` hook is called
2. `brandingService.getBrandingSettings()` fetches settings
3. Logo, favicon, and system name are displayed
4. Favicon is updated in browser tab

**No manual intervention required!**

---

## API Endpoints

### GET `/api/core/global-settings`
Fetch all global settings (including branding)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "group": "BRANDING",
            "key": "platform_logo_url",
            "value": "/logo.svg",
            "description": "Platform logo URL (SVG preferred)",
            "is_system_setting": true
        },
        {
            "id": 2,
            "group": "BRANDING",
            "key": "platform_favicon_url",
            "value": "/favicon.ico",
            "description": "Platform favicon URL",
            "is_system_setting": true
        }
    ]
}
```

### POST `/api/core/global-settings`
Update global settings (Platform Admin only)

**Request:**
```json
[
    {
        "group": "BRANDING",
        "key": "platform_logo_url",
        "value": "https://cdn.example.com/logo.svg",
        "is_system_setting": true
    }
]
```

---

## File Structure

```
backend/
├── database/
│   └── 03_production_seeds.sql          # Branding settings seed data
└── app/api/core/global-settings/
    └── route.ts                          # API to fetch/update settings

frontend/
├── src/
│   ├── services/
│   │   └── brandingService.ts            # Branding service singleton
│   ├── hooks/
│   │   └── useBranding.ts                # React hook for branding
│   └── components/layout/
        └── DashboardLayout.tsx            # (Needs manual update for logo)
```

---

## Testing

### 1. **Test Branding Fetch**
```typescript
import { brandingService } from '@/services/brandingService';

const branding = await brandingService.getBrandingSettings();
console.log('Logo:', branding.platform_logo_url);
console.log('Favicon:', branding.platform_favicon_url);
console.log('System Name:', branding.system_name);
```

### 2. **Test Branding Update** (Platform Admin only)
```typescript
const success = await brandingService.updateBrandingSettings({
    platform_logo_url: 'https://example.com/new-logo.svg'
});

if (success) {
    console.log('Branding updated successfully!');
}
```

### 3. **Test in Component**
```tsx
function TestComponent() {
    const { branding, loading } = useBranding();

    if (loading) return \u003cdiv>Loading branding...\u003c/div>;

    return (
        \u003cdiv>
            \u003cimg src={branding.platform_logo_url} alt="Logo" />
            \u003ch1>{branding.system_name}\u003c/h1>
        \u003c/div>
    );
}
```

---

## Next Steps (Manual)

1. ✅ Database seeds updated
2. ✅ Branding service created
3. ✅ React hook created
4. ⏳ **Update DashboardLayout.tsx** to use dynamic logo (manual step required)
5. ⏳ **Update Login Page** to use dynamic branding
6. ⏳ **Update Branding Page** (`/platform/branding`) to allow file uploads

---

## Summary

✅ **Branding settings** stored in `core.global_settings`
✅ **BrandingService** fetches and caches settings
✅ **useBranding hook** provides easy access in components
✅ **Favicon** automatically updates
✅ **Fallback values** ensure app works even if API fails
✅ **Platform Admin** can update branding via API
✅ **New companies** automatically get current branding

**When a new company registers, the branding (logo, favicon, system name) will be automatically fetched and displayed!** 🎉
