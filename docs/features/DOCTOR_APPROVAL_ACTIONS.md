# Doctor Approval Actions Feature

## Overview
Added approve and reject buttons with remarks functionality for doctors viewing pending submissions.

## Changes Made

### Frontend - ViewSubmission Component
**File**: `frontend/src/components/ViewSubmission.tsx`

#### New Features

1. **Approval/Reject Buttons**
   - Visible only to doctors (`user.role === 'doctor'`)
   - Only shown when submission status is `pending_approval`
   - Positioned in the header section next to the status badge

2. **Approve Dialog**
   - Title: "Approve Medical Submission"
   - Shows patient name
   - Optional notes field (textarea)
   - Green-themed action button
   - Calls `approvalsApi.approve(id, { notes })`
   - Shows loading state during submission
   - Refreshes submission data after approval
   - Navigates back to pending approvals list after 1 second

3. **Reject Dialog**
   - Title: "Reject Medical Submission"
   - Shows patient name
   - **Required** reason field (textarea with validation)
   - Red-themed action button
   - Calls `approvalsApi.reject(id, { reason })`
   - Submit button disabled if reason is empty
   - Shows loading state during submission
   - Refreshes submission data after rejection
   - Navigates back to pending approvals list after 1 second

#### State Management
```typescript
const [showApproveDialog, setShowApproveDialog] = useState(false);
const [showRejectDialog, setShowRejectDialog] = useState(false);
const [approvalNotes, setApprovalNotes] = useState('');
const [rejectionReason, setRejectionReason] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
```

#### API Integration
- Uses `approvalsApi.approve(id, { notes?: string })`
- Uses `approvalsApi.reject(id, { reason: string })`
- Both endpoints already exist in `frontend/src/services/approvals.service.ts`

## User Experience

### For Doctors
1. Navigate to a pending approval submission
2. View submission details
3. Click "Approve" button:
   - Modal opens
   - Optionally add notes
   - Confirm approval
   - Success toast shown
   - Redirected to pending approvals list
4. Click "Reject" button:
   - Modal opens
   - **Must** provide rejection reason
   - Confirm rejection
   - Success toast shown
   - Redirected to pending approvals list

### Visual Design
- **Approve Button**: Green background (`bg-green-600`) with CheckCircle icon
- **Reject Button**: Red border/text (`border-red-300 text-red-600`) with XCircle icon
- Both buttons show loading spinners during submission
- Dialogs use AlertDialog component for consistency

## Backend Requirements
The following backend endpoints must exist (already implemented):
- `POST /v1/approvals/:id/approve` - Accepts `{ notes?: string }`
- `POST /v1/approvals/:id/reject` - Accepts `{ reason: string }`

## Testing Recommendations

1. **As a Doctor**:
   - Log in as doctor (e.g., doctor@clinic.sg)
   - Navigate to pending approvals
   - Click on a pending submission
   - Test approve flow with and without notes
   - Test reject flow with and without reason
   - Verify validation (reject requires reason)
   - Check that submission status updates correctly
   - Verify toast notifications appear
   - Confirm navigation back to pending approvals

2. **As a Nurse**:
   - Verify buttons DO NOT appear when viewing submissions
   - Confirm only doctors see approval/reject actions

3. **Edge Cases**:
   - Test with empty rejection reason (should be disabled)
   - Test clicking cancel in dialogs
   - Test network errors during submission
   - Verify loading states work correctly

## Related Files
- `frontend/src/components/ViewSubmission.tsx` - Main component
- `frontend/src/services/approvals.service.ts` - API service
- `frontend/src/types/api.ts` - Type definitions (ApproveRequest, RejectRequest)
- `backend/src/approvals/approvals.controller.ts` - Backend API
- `backend/src/approvals/approvals.service.ts` - Business logic

## Status
✅ **Completed** - Feature implemented and ready for testing
