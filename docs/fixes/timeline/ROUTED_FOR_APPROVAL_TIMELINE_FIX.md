# Routed for Approval Timeline Fix

**Date**: October 23, 2024  
**Issue**: "Routed for Approval" event was missing from submission timeline when nurses created submissions directly with approval routing

## Problem

When a nurse created a submission and immediately routed it for approval (using the "Submit for Approval" button), the timeline was not showing the "Routed for Approval" event. Only a single "Draft Created" event was visible.

### Expected Behavior

For a submission that is created and routed for approval in one action, the timeline should show TWO events:
1. **Draft Created** - when the submission was initially created
2. **Routed for Approval** - when it was routed to the doctor (immediately after creation)

### Root Cause

The backend was only creating a single audit log entry when a submission was created with `routeForApproval: true`:
- One `eventType: 'created'` with `status: 'pending_approval'`

This didn't properly represent that two conceptual actions occurred: creation AND routing.

## Solution

### Backend Changes (`submissions.service.ts`)

**Updated audit log creation** to create TWO separate audit log entries when a submission is created and routed for approval:

```typescript
// Always create a 'created' event for draft creation
await this.prisma.auditLog.create({
  data: {
    submissionId: submission.id,
    userId,
    eventType: 'created',
    changes: { 
      status: 'draft', 
      examType: dto.examType,
    },
  },
});

// If created with pending_approval status, also create a 'submitted' event for routing
if (status === 'pending_approval') {
  await this.prisma.auditLog.create({
    data: {
      submissionId: submission.id,
      userId,
      eventType: 'submitted',
      changes: { 
        status: 'pending_approval',
        ...(submission.assignedDoctor && {
          assignedDoctorName: submission.assignedDoctor.name,
        }),
      },
    },
  });
}
```

### Key Design Decision

The audit log now treats "create and route for approval" as two separate actions:
1. **Created** event with `status: 'draft'` - represents the initial creation
2. **Submitted** event with `status: 'pending_approval'` - represents the routing action

This maintains consistency with the workflow where a nurse:
1. Saves a draft
2. Later submits it for approval

Both workflows now produce identical audit trails.

## Timeline Display Logic

The timeline now correctly shows both events for all flows:

| User Action | Audit Log Events | Timeline Display |
|------------|------------------|------------------|
| Create as draft only | `created` (status: draft) | "Draft Created" |
| Create & route for approval | `created` (status: draft)<br/>`submitted` (status: pending_approval) | "Draft Created"<br/>"Routed for Approval" |
| Save draft, then submit for approval | `created` (status: draft)<br/>`submitted` (status: pending_approval) | "Draft Created"<br/>"Routed for Approval" |
| Doctor creates and submits directly | `created` (status: draft)<br/>`submitted` (status: submitted) | "Draft Created"<br/>"Submitted to Agency" |

## Testing Checklist

- [ ] Create new submission as nurse, immediately route for approval
  - [ ] Timeline shows "Draft Created" AND "Routed for Approval" (2 events)
  - [ ] "Routed for Approval" shows assigned doctor name
  
- [ ] Create draft, save, then submit for approval later
  - [ ] Timeline shows "Draft Created" then "Routed for Approval" (2 events)
  - [ ] Both workflows produce identical timeline display
  
- [ ] Doctor creates and submits directly
  - [ ] Timeline shows "Draft Created" then "Submitted to Agency" (2 events)
  
- [ ] Verify assigned doctor name appears in description for routed submissions
- [ ] Verify events are in correct chronological order

## Files Modified

### Backend
- `backend/src/submissions/submissions.service.ts`
  - Updated `create()` method to generate TWO audit log entries when routing for approval
  - First entry: `eventType: 'created'` with `status: 'draft'`
  - Second entry (conditional): `eventType: 'submitted'` with `status: 'pending_approval'`

### Frontend
- `frontend/src/components/ViewSubmission.tsx`
  - No changes needed - existing logic already handles `submitted` events correctly
  - `getEventLabel()` shows "Routed for Approval" for `submitted` + `pending_approval`
  - `getEventDescription()` shows assigned doctor for these events

## Impact

- ✅ Complete audit trail showing both creation and routing actions
- ✅ Consistent timeline display regardless of workflow (create+route vs draft→submit)
- ✅ Assigned doctor information displayed in "Routed for Approval" event
- ✅ Maintains chronological ordering of events
- ✅ Better visibility into submission lifecycle for all stakeholders

## Notes

- The approach ensures that every submission has a clear "Draft Created" event as the starting point
- The separation of creation and routing into two events provides better audit trail clarity
- This pattern is consistent with how draft→submit workflow already worked
- No frontend changes were needed since the display logic already handled `submitted` events correctly
