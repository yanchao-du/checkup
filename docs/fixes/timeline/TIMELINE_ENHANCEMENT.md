# Submission Timeline Enhancement

## Overview
Enhanced the submission timeline to display comprehensive audit trail information with clear status indicators.

## Changes Made

### 1. Frontend - ViewSubmission Component (`frontend/src/components/ViewSubmission.tsx`)

**Enhanced Timeline Display:**
- Now displays ALL events from the audit trail (created, updated, submitted, approved, rejected)
- Shows events in chronological order (oldest to newest)
- Each event displays:
  - Event type with appropriate icon and color
  - User who performed the action
  - Timestamp of the action
  - Additional context based on event type

**Event-Specific Features:**

- **Draft Created**: Blue icon, shows creator name
- **Draft Updated**: Amber icon, shows who updated it
- **Routed for Approval**: Green checkmark icon
  - Shows assigned doctor name: "Assigned to: Dr. [Name]"
  - Displays when status is `pending_approval`
- **Approved by Doctor**: Green icon, shows approver name
- **Submitted to Agency**: Only shows when status is actually `submitted` (not `pending_approval`)
  - Shows the agency name (MOM or SPF based on exam type)
- **Rejected**: Red icon, shows rejection reason if available

**Agency Information Card:**
- Now only displays when submission status is `submitted`
- Hidden for draft and pending_approval statuses
- Shows:
  - Agency name (Ministry of Manpower or Singapore Police Force)
  - Exam category

### 2. Backend - Submissions Service (`backend/src/submissions/submissions.service.ts`)

**Enhanced Audit Logging:**
- Updated `submitForApproval()` method to include assigned doctor name in audit log
- Audit log changes now include:
  ```typescript
  {
    status: 'pending_approval',
    assignedDoctorName: submission.assignedDoctor?.name
  }
  ```
- This allows the frontend to display which doctor the submission was assigned to

### 3. Timeline Logic

**Status Differentiation:**
```
1. Draft Created → Draft status
2. Draft Updated (multiple times possible) → Draft status  
3. Routed for Approval → pending_approval status
   - Shows: "Assigned to: Dr. [Name]"
4. Approved by Doctor → submitted status
   - Creates two entries:
     a) "Approved by Doctor" 
     b) "Submitted to Agency" (only shown when status = submitted)
```

**Key Improvements:**
1. ✅ Shows all draft updates with timestamps
2. ✅ Clearly distinguishes "Routed for Approval" from "Submitted to Agency"
3. ✅ Displays assigned doctor name when routed
4. ✅ Only shows agency submission when actually submitted (status = 'submitted')
5. ✅ Chronological timeline from oldest to newest
6. ✅ Color-coded icons for different event types

## Testing Recommendations

1. **Create a new submission** - Verify "Draft Created" appears
2. **Edit and save draft** - Verify "Draft Updated" entries appear
3. **Route for approval** - Verify:
   - "Routed for Approval" shows
   - Assigned doctor name displays
   - Agency Information card is hidden
4. **Doctor approves** - Verify:
   - "Approved by Doctor" shows
   - "Submitted to Agency" appears
   - Agency Information card becomes visible
5. **View old submissions** - Verify timeline shows complete history

## UI/UX Improvements

- **Visual Hierarchy**: Different colored icons make it easy to scan timeline
- **Clear Labels**: "Routed for Approval" vs "Submitted to Agency" prevents confusion
- **Contextual Information**: Shows relevant details (doctor names, reasons, etc.)
- **Conditional Display**: Agency info only when relevant

## Status Flow

```
DRAFT → PENDING_APPROVAL → SUBMITTED
  ↓          ↓                 ↓
Created   Routed to Dr.    Sent to Agency
Updated   (Shows doctor)   (Shows MOM/SPF)
```
