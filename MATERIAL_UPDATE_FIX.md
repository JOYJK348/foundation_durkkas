# Material Update 400 Error - Fix Documentation

## 🔴 Problem

When trying to update a material with Rich Content, the API returned:
```
Request failed with status code 400
```

## 🎯 Root Cause

The backend PUT endpoint (`/api/ems/materials/[id]`) was using **full schema validation** which requires `company_id` as a mandatory field:

```typescript
// OLD CODE - BROKEN
const validatedData = courseMaterialSchema.parse(data);
```

However, the frontend update request **does not send `company_id`** because:
1. It's not editable by the user
2. It should be preserved from the existing record
3. It's a security risk to allow clients to change company_id

The validation schema requires:
```typescript
company_id: z.coerce.number(), // REQUIRED - causes 400 error
```

## ✅ Solution

Updated the PUT endpoint to:

### 1. **Fetch Existing Material First**
```typescript
const { data: existingMaterial, error: fetchError } = await ems.courseMaterials()
    .select('*')
    .eq('id', id)
    .eq('company_id', scope.companyId!)
    .single();
```

This ensures:
- Material exists
- User has access (company_id matches their tenant)
- We can preserve the original company_id

### 2. **Use Partial Schema Validation**
```typescript
const updateSchema = courseMaterialSchema.partial().extend({
    company_id: z.coerce.number().optional(), // Now optional
});

const validatedData = updateSchema.parse(data);
```

This allows updates to send only the fields they want to change.

### 3. **Preserve company_id**
```typescript
const updateData = {
    ...validatedData,
    company_id: existingMaterial.company_id, // Always use existing
};
```

### 4. **Enhanced Error Logging**
```typescript
if (error.name === 'ZodError') {
    console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    return errorResponse(error.errors, 'Validation failed', 400);
}
```

## 📊 What Changed

**File**: `backend/app/api/ems/materials/[id]/route.ts`

**Changes**:
1. Added `z` import from `zod`
2. Added `getUserTenantScope` call to get user's company
3. Fetch existing material before update
4. Validate ownership (company_id match)
5. Use partial schema validation
6. Preserve company_id from existing record
7. Enhanced error logging

## 🧪 Testing

Try updating a material with Rich Content again. The update should now work correctly.

**Test Case**:
1. Edit an existing material
2. Switch to "Rich Content" mode
3. Add/modify content sections
4. Click "Update Resource"
5. ✅ Should succeed with "Material updated successfully!"

## 🔒 Security Benefits

The fix also improves security by:
- Validating user has access to the material (company_id check)
- Preventing company_id tampering
- Returning 404 if material doesn't exist or user doesn't have access

## 📝 Related Files

- `backend/app/api/ems/materials/[id]/route.ts` - Updated PUT endpoint
- `backend/lib/validations/ems.ts` - Validation schema (unchanged)
- `frontend/src/app/ems/academic-manager/materials/page.tsx` - Frontend form (unchanged)
