# Fix: Empty Rejected Submissions List

## Issue
When navigating to the Rejected Submissions page, the list was empty even though submissions had been rejected.

## Root Cause

### The Problem
When a doctor rejected a submission, the `reject()` method in `approvals.service.ts` was:
1. Setting `status = 'rejected'`
2. Setting `rejectedReason = reason`
3. **NOT** setting who rejected it

### The Query Issue
The `findRejectedSubmissions()` method filtered by:
```typescript
OR: [
  { assignedDoctorId: doctorId },
  { approvedById: doctorId },
]
```

However:
- `assignedDoctorId` was set when nurse routed for approval
- `approvedById` was **NOT** set during rejection
- So the query couldn't find rejections by the doctor

## Solution

### Backend Changes

#### 1. Track Who Rejected (`approvals.service.ts`)
**File**: `backend/src/approvals/approvals.service.ts`

**Updated `reject()` method** (line 130):
```typescript
const updated = await this.prisma.medicalSubmission.update({
  where: { id },
  data: {
    status: 'rejected',
    rejectedReason: reason,
    approvedById: doctorId, // ✅ Track who rejected it (reusing approvedById field)
  },
  include: {
    createdBy: { select: { name: true } },
    approvedBy: { select: { name: true } }, // ✅ Include rejector's name
  },
});
```

**Why reuse `approvedById`?**
- The Prisma schema doesn't have a separate `rejectedById` field
- `approvedById` tracks who **processed** the submission (approved or rejected)
- We can determine if it was approval or rejection by checking the `status` field

#### 2. Include Rejector Info (`approvals.service.ts`)
**Updated `findRejectedSubmissions()` method** (line 178):
```typescript
include: {
  createdBy: { select: { name: true } },
  assignedDoctor: { select: { name: true } },
  approvedBy: { select: { name: true } }, // ✅ Rejector's name
},
```

### Frontend Changes

#### 3. Display Rejector Name (`RejectedSubmissions.tsx`)
**File**: `frontend/src/components/RejectedSubmissions.tsx`

**Added "Rejected By" column** (line 76):
```tsx
<TableHead>Rejected By</TableHead>
```

**Display rejector name** (line 98):
```tsx
<TableCell>{submission.approvedByName || 'Unknown'}</TableCell>
```

## How It Works Now

### Rejection Flow
1. **Doctor rejects submission**:
   - `status` → `'rejected'`
   - `rejectedReason` → reason from doctor
   - `approvedById` → doctor's ID
   - `approvedByName` → doctor's name (via relation)

2. **Query for rejected submissions**:
   ```typescript
   WHERE status = 'rejected'
     AND (assignedDoctorId = doctorId OR approvedById = doctorId)
   ```

3. **Results include**:
   - Submissions assigned to this doctor
   - Submissions rejected by this doctor
   - Rejector's name (`approvedByName`)

## Rejected Submissions Table

| Column | Data | Source |
|--------|------|--------|
| Patient Name | submission.patientName | Direct field |
| NRIC/FIN | submission.patientNric | Direct field |
| Exam Type | submission.examType | Formatted |
| Rejection Reason | submission.rejectedReason | Set during rejection |
| Submitted By | submission.createdByName | Creator relation |
| **Rejected By** | **submission.approvedByName** | **Approver/Rejector relation** |
| Rejected Date | submission.createdDate | Creation date |
| Status | "Rejected" badge | Status field |
| Actions | View button | Link to details |

## Database State

### Before Fix
```sql
-- Rejected submission (WRONG)
status: 'rejected'
rejected_reason: 'Incomplete information'
approved_by_id: NULL  ❌ Who rejected it?
```

### After Fix
```sql
-- Rejected submission (CORRECT)
status: 'rejected'
rejected_reason: 'Incomplete information'
approved_by_id: '550e8400-e29b-41d4-a716-446655440001'  ✅ Dr. Sarah Tan
```

## Testing Checklist

### Test Case 1: Reject and View
1. ✅ Log in as doctor (e.g., doctor@clinic.sg)
2. ✅ Navigate to Pending Approvals
3. ✅ Click on a submission
4. ✅ Click "Reject with Remarks"
5. ✅ Enter rejection reason
6. ✅ Click "Reject Submission"
7. ✅ Navigate to "Rejected Submissions"
8. ✅ **Verify**: Rejected submission appears in list
9. ✅ **Verify**: "Rejected By" column shows doctor's name
10. ✅ **Verify**: Rejection reason is displayed

### Test Case 2: Multiple Doctors
1. ✅ Doctor A rejects submission 1
2. ✅ Doctor B rejects submission 2
3. ✅ Doctor A logs in
4. ✅ **Verify**: Only sees submission 1 in Rejected Submissions
5. ✅ Doctor B logs in
6. ✅ **Verify**: Only sees submission 2 in Rejected Submissions

### Test Case 3: Assigned vs Rejected By
1. ✅ Nurse assigns submission to Doctor A
2. ✅ Doctor B (different doctor) somehow rejects it
3. ✅ Both Doctor A and Doctor B should see it in their Rejected Submissions
   - Doctor A: via `assignedDoctorId`
   - Doctor B: via `approvedById` (rejector)

## Field Semantics

### `approvedById` Field Meaning
- **When status = 'submitted'**: Doctor who approved the submission
- **When status = 'rejected'**: Doctor who rejected the submission
- **When status = 'pending_approval'**: NULL (not yet processed)
- **When status = 'draft'**: NULL (not submitted)

### `approvedByName` Field Meaning
- For approved submissions: Approver's name
- For rejected submissions: Rejector's name
- Better named `processedByName` but we reuse existing field

## Related Files
- `backend/src/approvals/approvals.service.ts` - Rejection logic and query
- `frontend/src/components/RejectedSubmissions.tsx` - Display component
- `backend/prisma/schema.prisma` - Database schema (approvedById field)

## Alternative Solutions Considered

### Option 1: Add `rejectedById` Field
**Pros**: Clearer semantics, separate fields
**Cons**: Requires schema migration, more database columns

### Option 2: Use Audit Logs Only
**Pros**: No schema changes needed
**Cons**: More complex queries, performance issues

### Option 3: Reuse `approvedById` (CHOSEN)
**Pros**: No schema changes, simple query, works immediately
**Cons**: Field name doesn't match all use cases

## Status
✅ **Fixed** - Rejected submissions now appear in the list with rejector's name displayed

## Future Improvements
- Consider adding `rejectedById` and `rejectedByName` fields in future schema update
- Add migration to populate `approvedById` for historical rejections
- Add rejected date field (currently using createdDate)
