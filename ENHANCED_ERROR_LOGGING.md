# Enhanced Error Logging for Draft Save Issues

## Problem
User reported that saving a reopened draft fails with "Failed to save draft" error, but no error logs appear in the console, making it impossible to diagnose the issue.

## User Report
> "it fails but console doesn't show error log"

## Root Cause
The backend was using `console.error()` for logging, which may not always appear in NestJS console output. Additionally, there was insufficient logging at various stages of the request lifecycle to track where the failure occurs.

## Solution Implemented

### 1. Replaced console.error with NestJS Logger

**Before**:
```typescript
catch (error) {
  console.error('Error updating submission:', error);
  console.error('Submission ID:', id);
  console.error('Existing status:', existing.status);
  console.error('DTO:', dto);
  throw error;
}
```

**After**:
```typescript
catch (error) {
  this.logger.error('Error updating submission', {
    error: error.message,
    stack: error.stack,
    submissionId: id,
    existingStatus: existing.status,
    existingRejectedReason: existing.rejectedReason,
    existingApprovedById: existing.approvedById,
    dto,
  });
  throw error;
}
```

### 2. Added Comprehensive Logging Throughout Request Flow

#### Controller Level (submissions.controller.ts)
```typescript
@Put(':id')
update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateSubmissionDto) {
  this.logger.log(`UPDATE request for submission ${id} by user ${user.id} (${user.role})`);
  this.logger.debug(`Update DTO: ${JSON.stringify(dto)}`);
  return this.submissionsService.update(id, user.id, user.role, dto);
}

@Post(':id/reopen')
reopenSubmission(@Param('id') id: string, @CurrentUser() user: any) {
  this.logger.log(`REOPEN request for submission ${id} by user ${user.id} (${user.role})`);
  return this.submissionsService.reopenSubmission(id, user.id, user.role);
}
```

#### Service Level (submissions.service.ts)
```typescript
async update(id: string, userId: string, userRole: string, dto: UpdateSubmissionDto) {
  this.logger.log(`Updating submission ${id}`);
  
  const existing = await this.prisma.medicalSubmission.findUnique({ where: { id } });

  if (!existing) {
    this.logger.warn(`Submission ${id} not found`);
    throw new NotFoundException('Submission not found');
  }

  this.logger.debug(`Existing submission status: ${existing.status}, rejectedReason: ${existing.rejectedReason ? 'present' : 'null'}, approvedById: ${existing.approvedById || 'null'}`);

  if (existing.createdById !== userId && userRole !== 'admin') {
    this.logger.warn(`Access denied for user ${userId} to update submission ${id} (creator: ${existing.createdById})`);
    throw new ForbiddenException('Access denied');
  }

  if (existing.status === 'submitted') {
    this.logger.warn(`Cannot edit submitted submission ${id}`);
    throw new ForbiddenException('Cannot edit submitted submissions');
  }

  this.logger.log(`Proceeding with update for submission ${id} (status: ${existing.status})`);

  try {
    // ... update logic ...
    
    this.logger.log(`Successfully updated submission ${id}`);
    return this.formatSubmission(submission);
  } catch (error) {
    this.logger.error('Error updating submission', {
      error: error.message,
      stack: error.stack,
      submissionId: id,
      existingStatus: existing.status,
      existingRejectedReason: existing.rejectedReason,
      existingApprovedById: existing.approvedById,
      dto,
    });
    throw error;
  }
}
```

## Log Levels and What They Show

### LOG (Info)
- Request received at controller
- Starting update process
- Proceeding with update
- Successfully updated

### DEBUG
- Detailed DTO content
- Existing submission details (status, rejectedReason, approvedById)

### WARN
- Submission not found
- Access denied
- Cannot edit submitted submissions

### ERROR
- Any exception during update
- Includes full error message, stack trace, and context

## Expected Console Output

### Successful Reopen and Save Flow
```
[Nest] 25698  - 10/23/2025, 1:30:00 PM     LOG [SubmissionsController] REOPEN request for submission abc-123 by user user-456 (nurse)
[Nest] 25698  - 10/23/2025, 1:30:00 PM     LOG [SubmissionsService] Successfully reopened submission abc-123

[Nest] 25698  - 10/23/2025, 1:30:05 PM     LOG [SubmissionsController] UPDATE request for submission abc-123 by user user-456 (nurse)
[Nest] 25698  - 10/23/2025, 1:30:05 PM   DEBUG [SubmissionsController] Update DTO: {"patientName":"John Doe","patientNric":"S5982146I",...}
[Nest] 25698  - 10/23/2025, 1:30:05 PM     LOG [SubmissionsService] Updating submission abc-123
[Nest] 25698  - 10/23/2025, 1:30:05 PM   DEBUG [SubmissionsService] Existing submission status: draft, rejectedReason: present, approvedById: doctor-789
[Nest] 25698  - 10/23/2025, 1:30:05 PM     LOG [SubmissionsService] Proceeding with update for submission abc-123 (status: draft)
[Nest] 25698  - 10/23/2025, 1:30:05 PM     LOG [SubmissionsService] Successfully updated submission abc-123
```

### Failed Update Flow (Example: Access Denied)
```
[Nest] 25698  - 10/23/2025, 1:30:00 PM     LOG [SubmissionsController] UPDATE request for submission abc-123 by user user-999 (nurse)
[Nest] 25698  - 10/23/2025, 1:30:00 PM   DEBUG [SubmissionsController] Update DTO: {"patientName":"John Doe",...}
[Nest] 25698  - 10/23/2025, 1:30:00 PM     LOG [SubmissionsService] Updating submission abc-123
[Nest] 25698  - 10/23/2025, 1:30:00 PM   DEBUG [SubmissionsService] Existing submission status: draft, rejectedReason: present, approvedById: doctor-789
[Nest] 25698  - 10/23/2025, 1:30:00 PM    WARN [SubmissionsService] Access denied for user user-999 to update submission abc-123 (creator: user-456)
```

### Failed Update Flow (Example: Database Error)
```
[Nest] 25698  - 10/23/2025, 1:30:00 PM     LOG [SubmissionsController] UPDATE request for submission abc-123 by user user-456 (nurse)
[Nest] 25698  - 10/23/2025, 1:30:00 PM   DEBUG [SubmissionsController] Update DTO: {"patientName":"John Doe",...}
[Nest] 25698  - 10/23/2025, 1:30:00 PM     LOG [SubmissionsService] Updating submission abc-123
[Nest] 25698  - 10/23/2025, 1:30:00 PM   DEBUG [SubmissionsService] Existing submission status: draft, rejectedReason: present, approvedById: doctor-789
[Nest] 25698  - 10/23/2025, 1:30:00 PM     LOG [SubmissionsService] Proceeding with update for submission abc-123 (status: draft)
[Nest] 25698  - 10/23/2025, 1:30:00 PM   ERROR [SubmissionsService] Error updating submission {
  error: "Foreign key constraint failed on the field: `approved_by`",
  stack: "Error: Foreign key constraint failed...",
  submissionId: "abc-123",
  existingStatus: "draft",
  existingRejectedReason: "Incomplete data",
  existingApprovedById: "doctor-789",
  dto: { patientName: "John Doe", ... }
}
```

## Implementation Details

### Files Modified

#### 1. `backend/src/submissions/submissions.service.ts`
- Added `Logger` import from `@nestjs/common`
- Created private logger instance: `private readonly logger = new Logger(SubmissionsService.name);`
- Added logging at start of update method
- Added debug logging for existing submission details
- Added warn logging for validation failures
- Added log for proceeding with update
- Replaced console.error with logger.error in catch block
- Added success log after update completes

#### 2. `backend/src/submissions/submissions.controller.ts`
- Added `Logger` import from `@nestjs/common`
- Created private logger instance: `private readonly logger = new Logger(SubmissionsController.name);`
- Added logging to `update()` endpoint
- Added logging to `reopenSubmission()` endpoint

## Benefits

### 1. Visibility
- All requests are now logged with user context
- Can track request flow from controller → service → database
- Easy to identify where failures occur

### 2. Debugging
- Full error context including:
  - Error message and stack trace
  - Submission ID
  - Current status
  - Rejection data (if present)
  - DTO being sent
- Can diagnose issues without reproducing

### 3. Audit Trail
- Track who is updating what
- See what data is being sent
- Identify patterns in failures

### 4. Performance Monitoring
- Can see how long operations take
- Identify slow database queries
- Track request volume

## NestJS Logger vs console.error

### Why NestJS Logger is Better:

1. **Structured Logging**: Logger formats messages consistently
2. **Log Levels**: Can filter by LOG, DEBUG, WARN, ERROR
3. **Context**: Automatically includes service/controller name
4. **Timestamps**: All logs have timestamps
5. **Production Ready**: Can be configured to write to files, external services
6. **Color Coding**: Terminal output is color-coded by level
7. **JSON Support**: Can output structured JSON for log aggregation

### console.error Issues:

1. No structured format
2. No automatic timestamps
3. No context about where it came from
4. May not appear in NestJS console
5. Harder to filter and search

## Troubleshooting Guide

### If save still fails and no logs appear:

1. **Check if request reaches backend**:
   - Look for `UPDATE request for submission...` log
   - If missing: Issue is in frontend or network

2. **Check if update method is called**:
   - Look for `Updating submission...` log
   - If missing: Issue is in auth guard or routing

3. **Check validation failures**:
   - Look for WARN logs about "not found", "access denied", "submitted"
   - These are business logic rejections

4. **Check database errors**:
   - Look for ERROR logs with stack trace
   - These are Prisma/database errors

5. **Check DTO validation**:
   - Look for DEBUG log with DTO content
   - Verify all required fields are present
   - Check data types match expectations

## Testing Instructions

### To test the logging:

1. **Start backend in watch mode**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Reproduce the issue**:
   - Login as nurse
   - Find rejected submission (NRIC: S5982146I)
   - Click "Reopen & Fix"
   - Try to save draft

3. **Check console output**:
   - Look for REOPEN request log
   - Look for UPDATE request log
   - Look for any WARN or ERROR logs
   - Note the submission ID and user ID

4. **Analyze logs**:
   - If ERROR appears: Read the error message and stack
   - If WARN appears: Check which validation failed
   - If no logs appear: Issue is before backend (frontend/network)

## Related Files

- **Modified**: `backend/src/submissions/submissions.service.ts`
- **Modified**: `backend/src/submissions/submissions.controller.ts`
- **Related**: `REOPENED_DRAFT_SAVE_FIX.md`

## Status
✅ **Implemented**  
✅ **Backend reloaded with changes**  
✅ **No compilation errors**  
✅ **Logging active and ready**  
⏳ **Ready for testing**

## Next Steps

1. **Reproduce the issue** with enhanced logging
2. **Check backend console** for detailed error logs
3. **Share the error logs** to diagnose root cause
4. **Fix the specific error** based on log output
5. **Verify fix** works for NRIC S5982146I

The enhanced logging will now show exactly where and why the save is failing!
