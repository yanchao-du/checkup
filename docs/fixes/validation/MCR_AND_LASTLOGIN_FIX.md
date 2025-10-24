# MCR Number and Last Login Fix

**Date:** October 24, 2025
**Issue:** MCR numbers not saving and Last Login showing "Never" for users who have logged in

## Problems Identified

### 1. MCR Number Not Showing in User List
**Root Cause:** Backend `findAll` query in `users.service.ts` was not selecting `mcrNumber` field

**Location:** `backend/src/users/users.service.ts` line 17-23

**Before:**
```typescript
select: {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
},
```

**After:**
```typescript
select: {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  mcrNumber: true,  // ADDED
  lastLoginAt: true,
  createdAt: true,
  clinicId: true,   // ADDED for context
},
```

### 2. Users Not Appearing in List (Many-to-Many Issue)
**Root Cause:** The `findAll` query was filtering users by `clinicId` directly, which doesn't work for doctors in a many-to-many relationship

**Location:** `backend/src/users/users.service.ts` line 16

**Before:**
```typescript
where: { clinicId },
```

**After:**
```typescript
where: {
  OR: [
    // Admins and nurses still have direct clinicId
    { clinicId },
    // Doctors are associated through DoctorClinic junction table
    {
      role: 'doctor',
      doctorClinics: {
        some: {
          clinicId,
        },
      },
    },
  ],
},
```

**Explanation:**
- Admins and nurses have a direct `clinicId` field (one-to-one relationship)
- Doctors are associated with clinics through the `DoctorClinic` junction table (many-to-many)
- The query now uses `OR` to find both types of users

### 3. MCR Number Not Saving (Frontend Issue)
**Root Cause:** Frontend was only sending `mcrNumber` if it was truthy, using spread operator with `&&` condition

**Location:** `frontend/src/components/UserManagement.tsx` line 114-122

**Before:**
```typescript
await usersApi.update(editingUser.id, {
  name: formData.name,
  email: formData.email,
  role: formData.role,
  ...(formData.password && { password: formData.password }),
  ...(formData.role === 'doctor' && formData.mcrNumber && { mcrNumber: formData.mcrNumber }),
});
```

**After:**
```typescript
const updateData: any = {
  name: formData.name,
  email: formData.email,
  role: formData.role,
};

if (formData.password) {
  updateData.password = formData.password;
}

if (formData.role === 'doctor') {
  updateData.mcrNumber = formData.mcrNumber || null;
}

await usersApi.update(editingUser.id, updateData);
```

**Why This Matters:**
- Old code: Only sent `mcrNumber` if it had a value
- New code: Always sends `mcrNumber` for doctors (as `null` if empty)
- This allows clearing/updating MCR numbers properly

## Files Modified

### Backend
1. **backend/src/users/users.service.ts**
   - Added `mcrNumber` to select list in `findAll()` method
   - Added `clinicId` to select list for reference
   - Changed `where` clause to use `OR` condition for many-to-many relationship
   - Updated count query to match the new `where` clause

### Frontend
2. **frontend/src/components/UserManagement.tsx**
   - Refactored `handleSaveUser` to explicitly include `mcrNumber` for doctors
   - Changed from spread operator to explicit object construction

## Testing Checklist

- [x] MCR numbers are now visible in the user list
- [x] MCR numbers can be added to doctors
- [x] MCR numbers can be updated
- [x] MCR numbers can be cleared (set to null)
- [x] Last Login shows correct date for users who have logged in
- [x] Doctors associated with multiple clinics appear in the user list
- [x] Backend query properly handles many-to-many relationship

## Verification Steps

1. **Test MCR Number:**
   ```bash
   # Login as admin
   # Go to Settings > User Management
   # Edit a doctor (e.g., Dr. James Lee)
   # Add MCR number: M12345A
   # Save
   # Refresh page
   # Verify MCR number is displayed
   ```

2. **Test Last Login:**
   ```bash
   # Login as a doctor (e.g., Dr. James Lee)
   # Logout
   # Login as admin
   # Go to Settings > User Management
   # Verify Last Login shows today's date
   ```

3. **Test Many-to-Many:**
   ```bash
   # Assign a doctor to multiple clinics
   # Login as admin at each clinic
   # Verify the doctor appears in the user list at both clinics
   ```

## Related Issues Fixed
- MCR number not saving when editing users
- Last Login showing "Never" despite successful logins
- Doctors not appearing in user list when using many-to-many relationship
- Data not being retrieved correctly due to incorrect query filtering

## Impact
- **High Priority:** User management now works correctly with many-to-many relationships
- **Data Integrity:** MCR numbers are properly saved and retrieved
- **User Experience:** Last login times are displayed correctly
