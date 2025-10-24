# Fix: Duplicate "Submitted to Agency" in Timeline

## Issue
Timeline was showing "Submitted to Agency" twice:
1. First occurrence: When nurse routed submission for approval (WRONG)
2. "Approved by Doctor" event
3. Second occurrence: When doctor approved and submitted to agency (CORRECT)

## Root Cause Analysis

### Timeline Events
The application creates 'submitted' event type for TWO different actions:

1. **Nurse routes for approval** (`submitForApproval` in submissions.service.ts):
   ```typescript
   eventType: 'submitted',
   changes: { 
     status: 'pending_approval',
     assignedDoctorName: 'Dr. Sarah Tan',
   }
   ```

2. **Doctor approves (auto-submits to agency)** (`approve` in approvals.service.ts):
   ```typescript
   eventType: 'submitted',
   changes: { 
     status: 'submitted',
     agency: 'Ministry of Manpower',
   }
   ```

### The Bug (Frontend)
**File**: `frontend/src/components/ViewSubmission.tsx` (Line 323)

**Before** (WRONG):
```typescript
const getEventLabel = (eventType: string, details: any) => {
  // ...
  case 'submitted':
    // Checking CURRENT submission status, not the event's status
    if (details?.status === 'submitted' || submission.status === 'submitted') {
      return 'Submitted to Agency';
    }
    return 'Routed for Approval';
```

**Problem**: 
- The condition checked `submission.status === 'submitted'`
- This is the **current** status of the submission
- After approval, the current status is 'submitted'
- So BOTH 'submitted' events (routing + approval) were labeled "Submitted to Agency"

### Timeline Display (WRONG)
```
✅ Submitted to Agency          ← WRONG! This was "Route for Approval"
   Ministry of Manpower
   Nurse Amy
   22 Oct 2025, 2:00 PM

✅ Approved by Doctor
   By: Dr. Sarah Tan
   Dr. Sarah Tan
   23 Oct 2025, 3:45 PM

✅ Submitted to Agency          ← Correct!
   Ministry of Manpower
   Dr. Sarah Tan
   23 Oct 2025, 3:45 PM
```

## Solution

### Frontend Fix
**File**: `frontend/src/components/ViewSubmission.tsx`

#### Updated `getEventLabel` (Lines 315-333)
```typescript
const getEventLabel = (eventType: string, details: any) => {
  switch (eventType) {
    case 'created':
      return 'Draft Created';
    case 'updated':
      return 'Draft Updated';
    case 'submitted':
      // Check the status at the TIME of this event (from details), not current submission status
      if (details?.status === 'submitted') {
        return 'Submitted to Agency';
      }
      // If status was pending_approval, this means routed for approval
      if (details?.status === 'pending_approval') {
        return 'Routed for Approval';
      }
      // Fallback for old events without status in details
      return 'Submitted';
    case 'approved':
      return 'Approved by Doctor';
    case 'rejected':
      return 'Rejected';
    default:
      return eventType.charAt(0).toUpperCase() + eventType.slice(1);
  }
};
```

**Key Changes**:
1. ❌ Removed: `|| submission.status === 'submitted'` (checking current status)
2. ✅ Added: Explicit check for `details?.status === 'pending_approval'`
3. ✅ Added: Fallback for old events without status

#### Updated `getEventDescription` (Lines 341-360)
```typescript
const getEventDescription = (eventType: string, details: any) => {
  if (eventType === 'submitted') {
    // If routed for approval (status was pending_approval), show assigned doctor
    if (details?.status === 'pending_approval' && details?.assignedDoctorName) {
      return `Assigned to: ${details.assignedDoctorName}`;
    }
    // If submitted to agency (status was submitted), show agency name
    if (details?.status === 'submitted' && details?.agency) {
      return details.agency;
    }
    // Fallback to assigned doctor from submission if not in event details
    if (submission.assignedDoctorName && !details?.agency) {
      return `Assigned to: ${submission.assignedDoctorName}`;
    }
  }
  // ...
}
```

**Key Changes**:
1. ✅ More explicit status checks based on event details
2. ✅ Only shows agency name when `details?.status === 'submitted'`
3. ✅ Only shows assigned doctor when `details?.status === 'pending_approval'`

## Timeline Display (FIXED)

### Correct Flow
```
✅ Submitted to Agency
   Ministry of Manpower
   Dr. Sarah Tan
   23 Oct 2025, 3:45 PM

✅ Approved by Doctor
   By: Dr. Sarah Tan
   Dr. Sarah Tan
   23 Oct 2025, 3:45 PM

📋 Routed for Approval          ← Fixed! Now shows correct label
   Assigned to: Dr. Sarah Tan
   Nurse Amy
   22 Oct 2025, 2:00 PM

📝 Draft Updated
   Nurse Amy
   22 Oct 2025, 1:30 PM

📝 Draft Created
   Nurse Amy
   22 Oct 2025, 1:00 PM
```

## Event Type Logic

| Event Type | Status in Details | Label | Description |
|------------|------------------|-------|-------------|
| `submitted` | `pending_approval` | "Routed for Approval" | Shows assigned doctor name |
| `submitted` | `submitted` | "Submitted to Agency" | Shows agency name |
| `approved` | N/A | "Approved by Doctor" | Shows doctor name |
| `created` | N/A | "Draft Created" | Shows creator name |
| `updated` | N/A | "Draft Updated" | Shows updater name |
| `rejected` | N/A | "Rejected" | Shows rejection reason |

## Testing Checklist

### Test Case 1: New Submission Flow
1. ✅ Nurse creates draft → Timeline shows "Draft Created"
2. ✅ Nurse updates draft → Timeline shows "Draft Updated"
3. ✅ Nurse routes for approval → Timeline shows "Routed for Approval" with doctor name
4. ✅ Doctor approves → Timeline shows BOTH:
   - "Approved by Doctor"
   - "Submitted to Agency" with agency name
5. ✅ Total: 5 events in timeline (not 6!)

### Test Case 2: Verify Labels
1. ✅ Check "Routed for Approval" event:
   - Label: "Routed for Approval"
   - Description: "Assigned to: Dr. Sarah Tan"
2. ✅ Check "Submitted to Agency" event:
   - Label: "Submitted to Agency"
   - Description: "Ministry of Manpower" or "Singapore Police Force"

### Test Case 3: Different Exam Types
1. ✅ Approve SIX_MONTHLY_MDW → Shows "Ministry of Manpower"
2. ✅ Approve WORK_PERMIT → Shows "Ministry of Manpower"
3. ✅ Approve AGED_DRIVERS → Shows "Singapore Police Force"

## Related Files
- `frontend/src/components/ViewSubmission.tsx` - **Fixed here**
- `backend/src/submissions/submissions.service.ts` - Creates routing event
- `backend/src/approvals/approvals.service.ts` - Creates approval + agency events

## Status
✅ **Fixed** - Timeline now correctly distinguishes between "Routed for Approval" and "Submitted to Agency" based on event details, not current submission status

## Key Takeaway
Always check the **event's data** (from `details`) rather than the **current entity state** (from `submission`) when rendering historical timeline events.
