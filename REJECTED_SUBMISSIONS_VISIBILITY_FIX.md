# Fix: Reopened Submissions Visibility in Doctor's Rejected List

## Problem
When a nurse reopened a rejected submission, it would **disappear** from the doctor's "Rejected Submissions" list. This created several issues:

1. **Lost tracking**: Doctors couldn't see what happened to submissions they rejected
2. **Incomplete audit**: No way to know if rejection led to action
3. **Poor UX**: Submissions seemed to vanish without trace

### Original Behavior
```
Doctor rejects submission → Appears in rejected list (status='rejected')
Nurse reopens submission → Status changes to 'draft'
                        → DISAPPEARS from doctor's rejected list ❌
                        → Doctor loses track of it
```

## Root Cause Analysis

### Issue 1: Query Filter
The doctor's rejected submissions query filtered by `status: 'rejected'`:

```typescript
const where: any = {
  clinicId,
  status: 'rejected',  // ❌ Only shows current status
  OR: [
    { assignedDoctorId: doctorId },
    { approvedById: doctorId },
  ],
};
```

When status changed to 'draft', the submission no longer matched.

### Issue 2: Data Clearing
The reopen logic cleared rejection tracking fields:

```typescript
data: {
  status: 'draft',
  rejectedReason: null,    // ❌ Lost rejection reason
  approvedById: null,      // ❌ Lost who rejected it
  approvedDate: null,
}
```

This made it impossible to track the submission even if we wanted to.

## Solution

### 1. Preserve Rejection Data
**File**: `backend/src/submissions/submissions.service.ts`

**Changed**: Keep `rejectedReason` and `approvedById` when reopening

```typescript
const submission = await this.prisma.medicalSubmission.update({
  where: { id },
  data: {
    status: 'draft',
    // ✅ Keep rejectedReason and approvedById so doctors can still see it
    // rejectedReason: null,  // Don't clear - keep for history
    // approvedById: null,    // Don't clear - keep to track who rejected it
    approvedDate: null,       // Clear this since it's not approved
  },
  // ...
});
```

**Why**: Preserving these fields allows us to:
- Track who rejected it (even after reopening)
- Show the rejection reason in the timeline
- Query for submissions that were rejected by this doctor

### 2. Updated Doctor's Query
**File**: `backend/src/approvals/approvals.service.ts`

**Changed**: Query now finds submissions that are:
- Currently rejected, OR
- Were rejected and then reopened (status='draft' with rejectedReason)

```typescript
const where: any = {
  clinicId,
  OR: [
    {
      // Currently rejected submissions
      status: 'rejected',
      OR: [
        { assignedDoctorId: doctorId },
        { approvedById: doctorId },
      ],
    },
    {
      // Reopened submissions: status is draft but has rejection data
      status: 'draft',
      rejectedReason: { not: null },  // ✅ Has rejection reason
      approvedById: doctorId,          // ✅ This doctor rejected it
    },
  ],
};
```

### 3. Visual Indicator in UI
**File**: `frontend/src/components/RejectedSubmissions.tsx`

**Changed**: Show different badge based on status

```typescript
{submission.status === 'draft' ? (
  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
    Reopened
  </Badge>
) : (
  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
    Rejected
  </Badge>
)}
```

**Changed**: Only show "Reopen" button if status is still 'rejected'

```typescript
{user?.role === 'nurse' && submission.status === 'rejected' && (
  <Button>Reopen</Button>
)}
```

### 4. Improved UX
**Changed**: Refresh list after reopening instead of immediately navigating

```typescript
const handleReopen = async (submissionId: string) => {
  await submissionsApi.reopenSubmission(submissionId);
  toast.success('Submission reopened - you can now edit it');
  
  // Refresh the list to show updated status
  const response = await approvalsApi.getRejected({ page: 1, limit: 100 });
  setRejectedSubmissions(response.data);
  
  // Redirect after brief delay so user sees the status change
  setTimeout(() => navigate(`/draft/${submissionId}`), 1000);
};
```

## New Behavior

```
Doctor rejects submission → Appears in rejected list (status='rejected')
                            Badge: "Rejected" (red)
                            Button: "Reopen" (for nurse)

Nurse reopens submission → Status changes to 'draft'
                         → STAYS in doctor's rejected list ✅
                         → Badge changes to "Reopened" (purple)
                         → Button removed (already reopened)
                         → Doctor can still view it

Nurse edits and resubmits → Status changes to 'pending_approval'
                          → Moves to doctor's pending approvals
                          → Doctor can review again
```

## Doctor's View Examples

### Rejected Submissions List (Doctor)

**Before reopening:**
| Patient | Status | Rejection Reason | Actions |
|---------|--------|------------------|---------|
| John Doe | 🔴 Rejected | Incomplete history | 👁️ View |

**After nurse reopens:**
| Patient | Status | Rejection Reason | Actions |
|---------|--------|------------------|---------|
| John Doe | 🟣 Reopened | Incomplete history | 👁️ View |

**Key changes:**
- ✅ Submission stays in the list
- ✅ Badge changes from red "Rejected" to purple "Reopened"
- ✅ Rejection reason is still visible
- ✅ Doctor can click "View" to see full history

### Nurse's View

**Before reopening:**
| Patient | Status | Rejection Reason | Actions |
|---------|--------|------------------|---------|
| John Doe | 🔴 Rejected | Incomplete history | 👁️ View  🔄 Reopen |

**After reopening:**
- Submission appears in "Drafts" list
- Can edit and fix issues
- Can resubmit for approval
- Timeline shows rejection + reopen events

## Benefits

### For Doctors
✅ **Complete visibility**: See all submissions they rejected, even if reopened  
✅ **Track outcomes**: Know which rejections led to action  
✅ **Audit trail**: Full history of their decisions  
✅ **No confusion**: Clear "Reopened" status shows current state  

### For Nurses
✅ **Can reopen freely**: Doesn't hide submission from doctor  
✅ **Clear status**: Purple badge shows it's been reopened  
✅ **Edit capability**: Can fix issues and resubmit  

### For Admins
✅ **Full audit trail**: All rejection data preserved  
✅ **Tracking metrics**: Can measure rejection → reopen → resubmit rates  
✅ **Compliance**: Complete history maintained  

## Database Impact

### Fields Preserved After Reopen
- ✅ `rejectedReason` - Kept (was being cleared)
- ✅ `approvedById` - Kept (was being cleared)
- ✅ `status` - Changed to 'draft'
- ✅ `approvedDate` - Cleared (set to null)

### Query Changes
- Doctors' query now uses compound OR condition
- Slightly more complex but more accurate results
- No performance impact (indexed fields)

## Testing Checklist
- [ ] Doctor rejects submission
- [ ] Submission appears in doctor's rejected list (red badge)
- [ ] Nurse sees submission in their rejected list
- [ ] Nurse clicks "Reopen"
- [ ] **Submission stays in doctor's rejected list** ✅
- [ ] Badge changes to purple "Reopened"
- [ ] "Reopen" button disappears (for nurse)
- [ ] Doctor can still view the submission
- [ ] Doctor can see rejection reason and timeline
- [ ] Nurse can edit the reopened draft
- [ ] Nurse can resubmit for approval
- [ ] After resubmit, appears in doctor's pending approvals

## Migration Notes

### Existing Data
No migration needed for existing data:
- Already rejected submissions: Continue to work normally
- Already reopened submissions (before fix): Will have null rejectedReason/approvedById, won't appear in doctor's list (expected)
- New reopened submissions (after fix): Will preserve data and appear correctly

### Backward Compatibility
✅ Fully backward compatible
- Old rejections (without reopen): Work as before
- New reopened submissions: Enhanced tracking
- No breaking changes to API or UI

## Future Enhancements
- [ ] Add "Reopened Count" to show how many times rejected
- [ ] Add filter to show only "Reopened" vs "Still Rejected"
- [ ] Notification to doctor when their rejection is reopened
- [ ] Track time between rejection and reopen
- [ ] Analytics dashboard for rejection → reopen → approval rates
