# Doctor Edit Pending Approval Workflow

## Overview
This feature allows doctors to edit submissions that are in `pending_approval` status, converting them to drafts that can be edited and submitted directly, instead of using the approve/reject workflow.

## User Story
When a nurse creates a submission and routes it to a doctor for approval, the doctor can now:
1. Click "Edit Submission" to make changes
2. The submission automatically converts to `draft` status on first save
3. Continue editing and saving as needed
4. Submit directly to ICA (auto-approves since doctor is submitting)

## Implementation

### Backend Changes

#### 1. Allow Doctors to Edit Pending Approval Submissions
**File:** `backend/src/submissions/submissions.service.ts`

**Method:** `update()` (lines 257-340)

Added access control to allow doctors to edit submissions in `pending_approval` status:

```typescript
const isDoctorEditingPendingApproval = 
  userRole === 'doctor' && existing.status === 'pending_approval';

if (
  !isCreator &&
  userRole !== 'admin' &&
  !isDoctorEditingPendingApproval
) {
  throw new ForbiddenException('Access denied');
}
```

#### 2. Auto-Convert Pending Approval to Draft
**File:** `backend/src/submissions/submissions.service.ts`

**Method:** `update()` (lines 257-340)

When a doctor edits a `pending_approval` submission, it automatically converts to `draft`:

```typescript
const shouldConvertToDraft = 
  userRole === 'doctor' && existing.status === 'pending_approval';

const updated = await this.prisma.submission.update({
  where: { id },
  data: {
    ...updateData,
    ...(shouldConvertToDraft && { status: 'draft' as any }),
  },
});
```

The conversion is tracked in the audit log:

```typescript
if (shouldConvertToDraft) {
  eventType = 'updated';
  description = 'Submission converted from pending_approval to draft by doctor';
  changes.statusChange = {
    from: 'pending_approval',
    to: 'draft',
  };
}
```

#### 3. Allow Doctors to Submit Converted Drafts
**File:** `backend/src/submissions/submissions.service.ts`

**Method:** `submitForApproval()` (lines 348-395)

Doctors can submit drafts even if they didn't create them (nurse created them):

```typescript
const isDoctorSubmittingConvertedDraft = 
  userRole === 'doctor' && existing.status === 'draft';

if (
  !isCreator &&
  userRole !== 'admin' &&
  !isDoctorSubmittingConvertedDraft
) {
  throw new ForbiddenException('Access denied');
}
```

When a doctor submits, the submission is auto-approved:

```typescript
if (userRole === 'doctor') {
  updateData.status = 'submitted';
  updateData.approvedById = userId;
  updateData.approvedDate = new Date();
}
```

### Frontend Changes

#### 1. Add Edit Button for Doctors
**File:** `frontend/src/components/ViewSubmission.tsx`

**Lines:** 470-510

Added an "Edit Submission" button for doctors viewing `pending_approval` submissions:

```tsx
{user?.role === 'doctor' && submission.status === 'pending_approval' && (
  <Button
    onClick={() => navigate(`/draft/${submission.id}`)}
    className="bg-blue-600 hover:bg-blue-700"
  >
    <Edit className="w-4 h-4 mr-2" />
    Edit Submission
  </Button>
)}
```

The button is positioned before the Reject and Approve buttons, making it the primary action.

#### 2. Simplified Draft Submission Flow
**File:** `frontend/src/components/NewSubmission.tsx`

Removed special handling for `pending_approval` submissions. All drafts now follow the same submission workflow:

- Doctor edits → saves → submission is automatically converted to draft (backend)
- Doctor submits → calls `submitForApproval` → auto-approves and sets status to `submitted`
- Navigates to acknowledgement page

## Workflow Diagram

```
Nurse creates submission
        ↓
Routes to doctor
        ↓
Status: pending_approval
        ↓
Doctor clicks "Edit Submission"
        ↓
Navigates to draft editor
        ↓
Doctor makes first save
        ↓
Backend converts: pending_approval → draft
        ↓
Audit log records status change
        ↓
Doctor continues editing (optional)
        ↓
Doctor clicks "Submit to ICA"
        ↓
Backend auto-approves (sets approvedById, approvedDate)
        ↓
Status: submitted
        ↓
Navigates to acknowledgement page
```

## Access Control Summary

| Role   | Action                          | Status            | Allowed? |
|--------|---------------------------------|-------------------|----------|
| Doctor | Edit                            | pending_approval  | ✅ Yes   |
| Doctor | Submit                          | draft             | ✅ Yes   |
| Doctor | Submit                          | pending_approval  | ❌ No    |
| Nurse  | Edit                            | pending_approval  | ❌ No    |
| Nurse  | Submit                          | draft (own)       | ✅ Yes   |
| Admin  | Edit/Submit                     | Any               | ✅ Yes   |

## Key Features

1. **Seamless Conversion**: Pending approval submissions automatically become drafts when doctors edit them
2. **Audit Trail**: All status conversions are logged with event type 'updated' and statusChange details
3. **Auto-Approval**: Doctors bypass the approval step when submitting their edits
4. **Ownership Transfer**: Doctors effectively take ownership when they edit a pending approval submission
5. **Preserved Creator**: The `createdById` field remains unchanged (still shows nurse who created it)

## Commits

1. `Fix access control for doctors editing pending_approval submissions`
2. `Add Edit button for doctors to edit pending_approval submissions`
3. `Convert pending_approval to draft when doctor edits`
4. `Allow doctors to submit drafts converted from pending_approval`

## Testing Checklist

- [ ] Nurse creates submission and routes to doctor
- [ ] Doctor can see "Edit Submission" button on pending_approval
- [ ] Clicking Edit navigates to draft editor
- [ ] First save converts status from pending_approval to draft
- [ ] Doctor can continue editing and saving
- [ ] Doctor can submit the draft successfully
- [ ] Submission shows status as "submitted" after doctor submits
- [ ] Audit log shows status conversion with correct details
- [ ] Doctor's user ID is recorded as approvedById
- [ ] Approval date is set when doctor submits

## Related Files

- `backend/src/submissions/submissions.service.ts`
- `frontend/src/components/ViewSubmission.tsx`
- `frontend/src/components/NewSubmission.tsx`
- `backend/prisma/schema.prisma` (AuditLog model)

## Notes

- The original `pending_approval` status still exists in the system for other workflows
- This change only affects the doctor's workflow when editing routed submissions
- Nurses continue to use the standard draft → submit → pending_approval workflow
- The approve/reject buttons are still available on the ViewSubmission page for simple approval cases
