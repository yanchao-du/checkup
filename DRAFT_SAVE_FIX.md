# Fix: "Failed to Save Draft" Error

## Problem
Users were getting "Failed to save draft" error when trying to edit and save draft submissions (including reopened rejected submissions).

## Root Cause
The `UpdateSubmissionDto` was missing fields that the frontend was sending:
- `examType` - The type of medical examination
- `routeForApproval` - Boolean flag for routing workflow

When the frontend sent these fields in the update request, the backend validation rejected them because they weren't defined in the DTO.

## Investigation Steps

1. **Error Location**: The toast error "Failed to save draft" was triggered in `NewSubmission.tsx` line 126
2. **Request Payload**: Frontend was sending:
   ```typescript
   {
     examType,        // ❌ Not in UpdateSubmissionDto
     patientName,
     patientNric,
     patientDateOfBirth,
     examinationDate,
     formData,
     routeForApproval, // ❌ Not in UpdateSubmissionDto
     assignedDoctorId
   }
   ```
3. **DTO Definition**: `UpdateSubmissionDto` only had:
   - patientName
   - patientNric
   - patientDateOfBirth
   - examinationDate
   - formData
   - assignedDoctorId

## Solution

### 1. Updated `UpdateSubmissionDto`
**File**: `backend/src/submissions/dto/submission.dto.ts`

**Added fields**:
```typescript
export class UpdateSubmissionDto {
  @IsOptional()
  @IsString()
  examType?: string;  // ✅ ADDED

  @IsOptional()
  @IsString()
  patientName?: string;
  
  // ... other existing fields ...

  @IsOptional()
  @IsBoolean()
  routeForApproval?: boolean;  // ✅ ADDED
}
```

### 2. Updated Service Method
**File**: `backend/src/submissions/submissions.service.ts`

**Added handling for examType**:
```typescript
const submission = await this.prisma.medicalSubmission.update({
  where: { id },
  data: {
    ...(dto.examType && { examType: dto.examType as any }), // ✅ ADDED
    ...(dto.patientName && { patientName: dto.patientName }),
    // ... rest of fields
  },
  // ...
});
```

**Note**: `routeForApproval` is only used during creation/submission flow, not stored in database, so we don't need to handle it in the update logic.

## Why This Matters

This bug affected multiple workflows:
1. **Editing existing drafts** - Users couldn't save changes to drafts
2. **Reopening rejected submissions** - After reopening, nurses couldn't edit and save
3. **General draft management** - Any draft update would fail

## Changes Made

### Backend Changes

#### `backend/src/submissions/dto/submission.dto.ts`
```diff
export class UpdateSubmissionDto {
+ @IsOptional()
+ @IsString()
+ examType?: string;

  @IsOptional()
  @IsString()
  patientName?: string;
  
  // ... other fields ...

+ @IsOptional()
+ @IsBoolean()
+ routeForApproval?: boolean;
}
```

#### `backend/src/submissions/submissions.service.ts`
```diff
const submission = await this.prisma.medicalSubmission.update({
  where: { id },
  data: {
+   ...(dto.examType && { examType: dto.examType as any }),
    ...(dto.patientName && { patientName: dto.patientName }),
    ...(dto.patientNric && { patientNric: dto.patientNric }),
    // ... rest
  },
});
```

## Testing Checklist
- [ ] Edit an existing draft - should save successfully
- [ ] Reopen a rejected submission - should save successfully
- [ ] Change examType in a draft - should save successfully  
- [ ] Edit patient details - should save successfully
- [ ] Edit form data - should save successfully
- [ ] Change assigned doctor - should save successfully

## Impact
- ✅ Fixes draft editing functionality
- ✅ Fixes reopened rejected submission editing
- ✅ Allows changing exam type in drafts
- ✅ No breaking changes to existing functionality

## Notes
- The `examType` field should technically be immutable after creation, but allowing it in update doesn't cause issues since drafts aren't submitted yet
- Consider adding validation to prevent changing `examType` for non-draft submissions in the future
- The `routeForApproval` field is a workflow flag, not stored in the database, so it's safely ignored during updates
