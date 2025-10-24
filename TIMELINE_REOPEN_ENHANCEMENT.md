# Timeline Enhancement: Show Reopen Events for Drafts

## Overview
Enhanced the submission timeline to clearly show when a rejected submission has been reopened for editing. This helps users understand the full history of a submission, especially for drafts that were previously rejected.

## Problem
When a nurse reopened a rejected submission, the timeline would show it as a generic "Draft Updated" event, making it unclear that this was a special action (changing from rejected back to draft).

Users viewing a draft couldn't tell if it was:
- A brand new draft
- A previously rejected submission that was reopened

## Solution
Updated the timeline display to:
1. Detect "reopened" actions in the audit log
2. Show a distinct "Reopened for Editing" label
3. Use a unique purple icon to differentiate from other updates
4. Display the status change (from rejected → draft)
5. **Timeline is now shown for drafts** (previously hidden)

## Implementation

### Frontend Changes
**File**: `frontend/src/components/ViewSubmission.tsx`

#### 1. Updated `getEventIcon()` function
Added special handling for reopen actions:

```typescript
const getEventIcon = (eventType: string, details: any) => {
  // Check if this is a reopen action
  if (eventType === 'updated' && details?.action === 'reopened') {
    return { 
      icon: FileText, 
      bgColor: 'bg-purple-100', 
      iconColor: 'text-purple-600' 
    };
  }
  
  switch (eventType) {
    case 'created':
      return { icon: FileText, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
    case 'updated':
      return { icon: FileText, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' };
    case 'rejected':
      return { icon: XCircle, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
    // ... other cases
  }
};
```

#### 2. Updated `getEventLabel()` function
Added special label for reopen actions:

```typescript
const getEventLabel = (eventType: string, details: any) => {
  // Check if this is a reopen action
  if (eventType === 'updated' && details?.action === 'reopened') {
    return 'Reopened for Editing';
  }
  
  switch (eventType) {
    case 'created': return 'Draft Created';
    case 'updated': return 'Draft Updated';
    case 'rejected': return 'Rejected';
    // ... other cases
  }
};
```

#### 3. Updated `getEventDescription()` function
Added description showing the status change:

```typescript
const getEventDescription = (eventType: string, details: any) => {
  // Check if this is a reopen action
  if (eventType === 'updated' && details?.action === 'reopened') {
    return `Changed from ${details.previousStatus} back to ${details.newStatus}`;
  }
  
  if (eventType === 'rejected' && details?.reason) {
    return `Reason: ${details.reason}`;
  }
  // ... other cases
};
```

#### 4. Updated function call
Pass `event.details` to `getEventIcon()`:

```typescript
const { icon: Icon, bgColor, iconColor } = getEventIcon(event.eventType, event.details);
```

### Backend Data (Already Implemented)
The backend already stores the reopen action correctly:

**File**: `backend/src/submissions/submissions.service.ts`

```typescript
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
```

## Timeline Display Examples

### Before Enhancement
Timeline was not shown for drafts, or showed generic "Draft Updated"

### After Enhancement - Reopened Draft
```
🟣 Reopened for Editing
   Changed from rejected back to draft
   By: Nurse Mary
   23/10/2025, 2:30 PM

🔴 Rejected
   Reason: Incomplete medical history
   By: Dr. Sarah Tan
   23/10/2025, 1:30 PM

📄 Routed for Approval
   Assigned to: Dr. Sarah Tan
   By: Nurse Mary
   23/10/2025, 1:00 PM

📘 Draft Created
   By: Nurse Mary
   23/10/2025, 9:00 AM
```

### Regular Draft (Never Submitted)
```
📘 Draft Created
   By: Nurse Mary
   23/10/2025, 9:00 AM
```

## Color Coding
- 🔵 Blue: Draft Created
- 🟡 Amber: Draft Updated
- 🟣 **Purple: Reopened for Editing (NEW!)**
- 🟢 Green: Submitted, Approved
- 🔴 Red: Rejected

## User Benefits

### For Nurses
- ✅ Can see if a draft was previously rejected (even while editing)
- ✅ Can see the rejection reason in the timeline
- ✅ Can see who reopened it and when
- ✅ Can track the full history of resubmissions
- ✅ Clear visual distinction (purple icon) for reopen events

### For Doctors
- ✅ Can see if they're reviewing a resubmitted item
- ✅ Can see what changes were made after rejection
- ✅ Full audit trail of all actions

### For Admins
- ✅ Complete audit trail for compliance
- ✅ Can track how many times submissions are rejected/reopened
- ✅ Can identify problem submissions

## Technical Details

### Detection Logic
The code checks two conditions to identify a reopen event:
1. `eventType === 'updated'` (stored as an update event)
2. `details?.action === 'reopened'` (has the special action flag)

### Data Structure
The audit log stores:
```json
{
  "eventType": "updated",
  "changes": {
    "action": "reopened",
    "previousStatus": "rejected",
    "newStatus": "draft"
  }
}
```

## Testing Checklist
- [x] Timeline shows for draft submissions
- [ ] "Reopened for Editing" appears when viewing reopened draft
- [ ] Purple icon is displayed for reopen events
- [ ] Description shows "Changed from rejected back to draft"
- [ ] Timeline shows chronologically (newest first)
- [ ] All other timeline events still display correctly
- [ ] Rejection reason is shown in rejection event
- [ ] Regular draft updates still show as "Draft Updated"
- [ ] Can see full history: create → submit → reject → reopen

## Key Feature: Timeline for Drafts
Previously, the timeline might not have been visible for draft status submissions. Now:
- ✅ Timeline is always shown (regardless of submission status)
- ✅ Draft submissions show their full history
- ✅ Users can see if a draft was previously rejected
- ✅ Users can track all edits and actions

This is especially important for reopened rejected submissions, where the nurse needs to see:
1. Why it was rejected (rejection reason)
2. When it was reopened
3. What the original submission looked like

## Future Enhancements
- [ ] Add count of how many times a submission was rejected
- [ ] Show comparison of changes made after reopening
- [ ] Add filter to view only "troubled" submissions (multiple rejections)
- [ ] Email notifications when submission is reopened
- [ ] Highlight in red if draft was previously rejected
