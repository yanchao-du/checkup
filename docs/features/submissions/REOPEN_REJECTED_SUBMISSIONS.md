# Reopen Rejected Submissions Feature

## Overview
Nurses can now reopen their rejected submissions, edit them, and resubmit for approval. This provides a complete workflow for handling rejected submissions without needing to create new submissions from scratch.

## Feature Details

### User Story
**As a nurse**, when my submission is rejected by a doctor, I want to be able to:
1. View the rejection reason
2. Reopen the rejected submission
3. Edit the submission to fix the issues
4. Resubmit for approval

### Workflow
```
Nurse creates submission → Doctor rejects → Submission status = 'rejected'
                                                     ↓
Nurse views rejected submission → Clicks "Reopen" → Status changes to 'draft'
                                                     ↓
Nurse edits draft → Clicks "Submit for Approval" → Status changes to 'pending_approval'
                                                     ↓
                                           Doctor reviews again
```

## Implementation Details

### Backend Changes

#### 1. New Endpoint: `POST /v1/submissions/:id/reopen`
**File**: `backend/src/submissions/submissions.controller.ts`

```typescript
@Post(':id/reopen')
reopenSubmission(@Param('id') id: string, @CurrentUser() user: any) {
  return this.submissionsService.reopenSubmission(id, user.id, user.role);
}
```

#### 2. Service Method: `reopenSubmission()`
**File**: `backend/src/submissions/submissions.service.ts`

**Features**:
- Validates user owns the submission (or is admin)
- Ensures submission status is 'rejected'
- Changes status back to 'draft'
- Clears rejection data:
  - `rejectedReason` → `null`
  - `approvedById` → `null`
  - `approvedDate` → `null`
- Creates audit log with action='reopened'

**Code**:
```typescript
async reopenSubmission(id: string, userId: string, userRole: string) {
  const existing = await this.prisma.medicalSubmission.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundException('Submission not found');
  }

  if (existing.createdById !== userId && userRole !== 'admin') {
    throw new ForbiddenException('Access denied: You can only reopen your own submissions');
  }

  if (existing.status !== 'rejected') {
    throw new ForbiddenException('Only rejected submissions can be reopened');
  }

  const submission = await this.prisma.medicalSubmission.update({
    where: { id },
    data: {
      status: 'draft',
      rejectedReason: null,
      approvedById: null,
      approvedDate: null,
    },
    include: {
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
      assignedDoctor: { select: { name: true } },
    },
  });

  // Audit log
  await this.prisma.auditLog.create({
    data: {
      submissionId: id,
      userId,
      eventType: 'updated',
      changes: { 
        action: 'reopened',
        previousStatus: 'rejected',
        newStatus: 'draft',
      },
    },
  });

  return this.formatSubmission(submission);
}
```

### Frontend Changes

#### 3. Service Method
**File**: `frontend/src/services/submissions.service.ts`

```typescript
// Reopen rejected submission (convert back to draft)
reopenSubmission: async (id: string): Promise<MedicalSubmission> => {
  return apiClient.post<MedicalSubmission>(`/submissions/${id}/reopen`);
},
```

#### 4. RejectedSubmissions Component
**File**: `frontend/src/components/RejectedSubmissions.tsx`

**Added**:
- Import: `useNavigate`, `Button`, `RotateCcw` icon
- State: `reopeningId` to track which submission is being reopened
- Handler: `handleReopen()` function
- UI: "Reopen" button for nurses (only, not doctors)

**Features**:
- Button shows loading state while reopening
- On success: Shows toast message and redirects to draft edit page
- On error: Shows error toast
- Only visible for nurses (doctors see only "View" button)

**Code**:
```typescript
const handleReopen = async (submissionId: string) => {
  try {
    setReopeningId(submissionId);
    await submissionsApi.reopenSubmission(submissionId);
    toast.success('Submission reopened and moved to drafts');
    navigate(`/draft/${submissionId}`);
  } catch (error) {
    console.error('Failed to reopen submission:', error);
    toast.error('Failed to reopen submission');
  } finally {
    setReopeningId(null);
  }
};

// In the table Actions column:
{user?.role === 'nurse' && (
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleReopen(submission.id)}
    disabled={reopeningId === submission.id}
    className="text-green-600 hover:text-green-700 hover:bg-green-50"
  >
    {reopeningId === submission.id ? (
      <>
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Reopening...
      </>
    ) : (
      <>
        <RotateCcw className="w-3 h-3 mr-1" />
        Reopen
      </>
    )}
  </Button>
)}
```

#### 5. ViewSubmission Component
**File**: `frontend/src/components/ViewSubmission.tsx`

**Added**: New section after doctor action buttons for nurses viewing rejected submissions

**Features**:
- Only shows for nurses viewing their OWN rejected submissions
- Displays rejection reason in a highlighted box
- Shows "Reopen & Edit Submission" button
- Button has loading state
- Redirects to draft edit page on success

**Code**:
```typescript
{/* Nurse Reopen Button - only show for nurses viewing their own rejected submissions */}
{user?.role === 'nurse' && submission.status === 'rejected' && submission.createdById === user.id && (
  <Card>
    <CardHeader>
      <CardTitle>Submission Rejected</CardTitle>
      <CardDescription>
        This submission was rejected. You can reopen it to make changes and resubmit for approval.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {submission.rejectedReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-700">{submission.rejectedReason}</p>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            className="text-green-600 border-green-300 hover:bg-green-50"
            onClick={async () => {
              try {
                setIsSubmitting(true);
                await submissionsApi.reopenSubmission(id!);
                toast.success('Submission reopened and moved to drafts');
                navigate(`/draft/${id}`);
              } catch (error) {
                console.error('Failed to reopen submission:', error);
                toast.error('Failed to reopen submission');
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reopening...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Reopen & Edit Submission
              </>
            )}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

## Security & Validation

### Backend Validation
✅ User must own the submission (or be admin)  
✅ Submission must have status='rejected'  
✅ Cannot reopen drafts, pending, or submitted submissions  

### Frontend Validation
✅ Button only shows for nurses (not doctors)  
✅ In ViewSubmission: Only shows for nurse's OWN rejected submissions  
✅ Loading states prevent duplicate clicks  

## User Experience

### From Rejected Submissions List
1. Nurse navigates to "Rejected Submissions" page
2. Sees list of their rejected submissions with rejection reasons
3. Clicks "Reopen" button on a submission
4. Button shows loading state ("Reopening...")
5. Toast message: "Submission reopened and moved to drafts"
6. **Automatically redirects** to draft edit page (`/draft/:id`)
7. Nurse can edit the submission
8. Clicks "Submit for Approval" to resubmit

### From ViewSubmission Page
1. Nurse navigates to a rejected submission (from anywhere)
2. Sees rejection reason highlighted in red box
3. Sees "Reopen & Edit Submission" button
4. Clicks button
5. Button shows loading state ("Reopening...")
6. Toast message: "Submission reopened and moved to drafts"
7. **Automatically redirects** to draft edit page (`/draft/:id`)
8. Nurse can edit and resubmit

## Database Changes
No schema changes required. Uses existing fields:
- `status`: Changed from 'rejected' → 'draft'
- `rejectedReason`: Cleared (set to `null`)
- `approvedById`: Cleared (set to `null`)
- `approvedDate`: Cleared (set to `null`)

## Audit Trail
The reopen action is tracked in the audit_logs table:
```json
{
  "submissionId": "uuid",
  "userId": "nurse-uuid",
  "eventType": "updated",
  "changes": {
    "action": "reopened",
    "previousStatus": "rejected",
    "newStatus": "draft"
  }
}
```

## Testing Checklist
- [x] Backend endpoint created
- [x] Backend validation working
- [x] Frontend service method added
- [x] RejectedSubmissions component updated
- [x] ViewSubmission component updated
- [ ] Manual test: Nurse can reopen from rejected list
- [ ] Manual test: Nurse can reopen from view submission page
- [ ] Manual test: Reopened submission appears in drafts
- [ ] Manual test: Nurse can edit reopened draft
- [ ] Manual test: Nurse can resubmit for approval
- [ ] Manual test: Doctor can approve/reject resubmitted submission
- [ ] Manual test: Cannot reopen non-rejected submissions
- [ ] Manual test: Nurse cannot reopen another nurse's rejection

## Error Handling
- ✅ 404: Submission not found
- ✅ 403: Not the owner of the submission
- ✅ 403: Submission is not rejected
- ✅ Toast notifications for all error cases
- ✅ Loading states prevent duplicate actions

## Future Enhancements
- [ ] Track number of times a submission was rejected/reopened
- [ ] Show rejection history in timeline
- [ ] Email notification when submission is rejected
- [ ] Limit number of times a submission can be reopened
