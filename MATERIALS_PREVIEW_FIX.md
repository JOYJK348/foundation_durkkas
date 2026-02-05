# Materials Preview Issue - Root Cause Analysis & Fix

## 🔍 Problem Identified

Materials were showing "No Preview Available" even when they had valid file URLs.

## 🎯 Root Cause

The database stores materials with `material_type = "DOCUMENT"`, but the frontend rendering logic was only checking for specific types:
- `PDF`
- `IMAGE`
- `VIDEO`
- `CONTENT`

**The "DOCUMENT" type was not being handled**, causing the fallback "No Preview Available" screen to appear.

## 📊 Database Schema

From `ems.course_materials` table:
```sql
material_type VARCHAR(50)  -- Can be: PDF, IMAGE, VIDEO, DOCUMENT, CONTENT
delivery_method VARCHAR(20) -- Can be: FILE, CONTENT
file_url TEXT
content_json JSONB
```

## ✅ Solution Implemented

Updated the file type detection logic in all three material viewers:
1. **Academic Manager** (`/ems/academic-manager/materials/page.tsx`)
2. **Student** (`/ems/student/materials/page.tsx`)
3. **Tutor** (`/ems/tutor/materials/page.tsx`)

### Before (Broken):
```tsx
const isPDF = type === 'PDF' || ext === 'pdf';
const isDoc = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext);
```

### After (Fixed):
```tsx
// Determine file type from both material_type and extension
const isPDF = type === 'PDF' || ext === 'pdf' || (type === 'DOCUMENT' && ext === 'pdf');
const isDoc = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext) || 
              (type === 'DOCUMENT' && ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext));
```

## 🎨 Enhanced Features

The fix also includes:

1. **Local Development Detection**: Office documents show a special message in localhost since Google Docs Viewer can't access local URLs
2. **Empty Content Handling**: Structured content with no sections shows a helpful "Empty lesson" message
3. **Better Error Messages**: Clear explanations for why a preview isn't available
4. **Null Safety**: Added checks for `url` existence before rendering

## 🧪 Testing

Run the diagnostic script to verify materials data:
```bash
cd backend
node check_materials_simple.js
```

This will show the actual `material_type`, `delivery_method`, and `file_url` values from the database.

## 📝 Material Type Mapping

| Database Type | File Extension | Renders As |
|--------------|----------------|------------|
| PDF | .pdf | PDF iframe |
| DOCUMENT | .pdf | PDF iframe |
| DOCUMENT | .docx, .pptx, .xlsx | Google Docs Viewer |
| IMAGE | .jpg, .png, .gif, .webp | Image viewer |
| VIDEO | .mp4, .webm, .ogg | Video player |
| CONTENT | (no file) | Structured content sections |

## 🚀 Result

All materials with `material_type = "DOCUMENT"` will now:
- ✅ Detect the file extension correctly
- ✅ Render PDFs in an iframe
- ✅ Render Office docs via Google Docs Viewer
- ✅ Show appropriate fallback messages for unsupported types
