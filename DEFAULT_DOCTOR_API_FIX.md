# Default Doctor API Fix

## Issue
When clicking "Save Default Doctor" in the SetDefaultDoctorDialog, the request was failing with:
1. First: "Failed to set default doctor" (body parsing issue)
2. After fix: Prisma validation error: `id: undefined`

## Root Causes

### Issue 1: Body Parameter Extraction
The backend controller was using `@Body('defaultDoctorId')` decorator which extracts a specific field from the request body. However, in some NestJS configurations, this syntax might not work correctly.

### Issue 2: Wrong User Property
After fixing the body extraction, the controller was using `user.userId` which doesn't exist. The `@CurrentUser()` decorator returns a user object with the property `id`, not `userId`.

The JWT strategy's `validateUser` method returns:
```typescript
{
  id: user.id,           // ✅ Correct property name
  email: user.email,
  name: user.name,
  role: user.role,
  clinicId: user.clinicId,
  clinicName: user.clinic.name,
}
```

## Solutions

### Fix 1: Body Extraction
Changed the backend controller to use the full `@Body()` decorator and extract the field manually from the body object.

**Before**:
```typescript
@Put('me/default-doctor')
@Roles('nurse')
async setDefaultDoctor(
  @CurrentUser() user: any,
  @Body('defaultDoctorId') defaultDoctorId: string,
) {
  return this.usersService.setDefaultDoctor(user.userId, defaultDoctorId);
}
```

**After**:
```typescript
@Put('me/default-doctor')
@Roles('nurse')
async setDefaultDoctor(
  @CurrentUser() user: any,
  @Body() body: { defaultDoctorId: string },
) {
  return this.usersService.setDefaultDoctor(user.id, body.defaultDoctorId);
}
```

### Fix 2: User Property Name
Changed both endpoints to use `user.id` instead of `user.userId`.

**Before**:
```typescript
async getDefaultDoctor(@CurrentUser() user: any) {
  return this.usersService.getDefaultDoctor(user.userId); // ❌ userId doesn't exist
}

async setDefaultDoctor(@CurrentUser() user: any, @Body() body: { defaultDoctorId: string }) {
  return this.usersService.setDefaultDoctor(user.userId, body.defaultDoctorId); // ❌ userId doesn't exist
}
```

**After**:
```typescript
async getDefaultDoctor(@CurrentUser() user: any) {
  return this.usersService.getDefaultDoctor(user.id); // ✅ Correct
}

async setDefaultDoctor(@CurrentUser() user: any, @Body() body: { defaultDoctorId: string }) {
  return this.usersService.setDefaultDoctor(user.id, body.defaultDoctorId); // ✅ Correct
}
```

## Frontend Request Format (Unchanged)
The frontend sends the request correctly:
```typescript
// frontend/src/services/users.service.ts
setDefaultDoctor: async (defaultDoctorId: string) => {
  return apiClient.put('/users/me/default-doctor', { defaultDoctorId });
}
```

Request body:
```json
{
  "defaultDoctorId": "some-uuid"
}
```

## Testing
After restarting the backend server:

1. Login as a nurse
2. Go to New Submission
3. Click "Submit for Approval" (should show default doctor dialog if no default set)
4. Select a doctor from the dropdown
5. Click "Save Default Doctor"
6. ✅ Should see success message: "Default doctor set successfully"
7. Doctor dropdown should be pre-filled
8. Submit dialog should open automatically

## Error Messages

### Before Fixes
```
PrismaClientValidationError: 
Invalid `this.prisma.user.findUnique()` invocation

Argument `where` of type UserWhereUniqueInput needs at least one of `id` or `email` arguments.

where: {
  id: undefined,  // ❌ userId was undefined
  ...
}
```

### After Fixes
✅ No errors - requests succeed with proper user ID

## Why These Fixes Work

1. **Body Extraction**: Using `@Body()` without a parameter name retrieves the entire request body as an object. This is more reliable than using `@Body('fieldName')` for field extraction.

2. **User Property**: The `@CurrentUser()` decorator returns the object from `JwtStrategy.validate()`, which includes `id` (not `userId`). Using the correct property name allows Prisma to query the database successfully.

## Files Modified
- `backend/src/users/users.controller.ts` - Fixed both parameter extraction and user property name

## Date
23 October 2025

## Related
- DEFAULT_DOCTOR_FEATURE.md - Main feature documentation
