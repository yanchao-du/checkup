# Enhancement: Show Both Approval and Agency Submission in Timeline

## Overview
When a doctor approves a submission, it is automatically submitted to the relevant government agency. The timeline now shows both events separately with appropriate labels and agency names.

## Changes Made

### Backend - Approvals Service
**File**: `backend/src/approvals/approvals.service.ts`

#### Previous Behavior (Lines 85-91)
```typescript
// Only created one audit log for 'approved'
await this.prisma.auditLog.create({
  data: {
    submissionId: id,
    userId: doctorId,
    eventType: 'approved',
    changes: { notes },
  },
});
```

#### New Behavior (Lines 86-110)
```typescript
// Determine agency based on exam type
const agency = updated.examType === 'AGED_DRIVERS' 
  ? 'Singapore Police Force' 
  : 'Ministry of Manpower';

// Create audit logs for both approval and agency submission
await this.prisma.auditLog.createMany({
  data: [
    {
      submissionId: id,
      userId: doctorId,
      eventType: 'approved',
      changes: { notes },
    },
    {
      submissionId: id,
      userId: doctorId,
      eventType: 'submitted',
      changes: { 
        status: 'submitted',
        agency,
      },
    },
  ],
});
```

**Key Changes**:
1. **Agency determination logic** - Based on exam type:
   - `AGED_DRIVERS` → "Singapore Police Force"
   - `SIX_MONTHLY_MDW` → "Ministry of Manpower"
   - `WORK_PERMIT` → "Ministry of Manpower"

2. **Dual audit log entries** - Using `createMany()` to create both:
   - `approved` event - Records doctor's approval with optional notes
   - `submitted` event - Records agency submission with agency name

### Frontend - Timeline Display
**File**: `frontend/src/components/ViewSubmission.tsx`

#### Updated Event Description Logic (Lines 337-348)
```typescript
const getEventDescription = (eventType: string, details: any) => {
  if (eventType === 'submitted') {
    // If routed for approval, show assigned doctor
    if (details?.assignedDoctorName || submission.assignedDoctorName) {
      return `Assigned to: ${details?.assignedDoctorName || submission.assignedDoctorName}`;
    }
    // If actually submitted to agency, show agency name from event details
    if (details?.status === 'submitted' || details?.agency) {
      return details?.agency || (submission.examType === 'AGED_DRIVERS' 
        ? 'Singapore Police Force' 
        : 'Ministry of Manpower');
    }
  }
  // ...
}
```

**Key Changes**:
- Now checks for `details?.agency` from the audit log
- Falls back to exam type-based agency determination
- Prioritizes agency name from event details for accuracy

## Timeline Display Flow

### When Doctor Approves a Submission

**Step 1**: Doctor clicks "Approve Submission" button

**Step 2**: Backend creates TWO audit log entries:
1. **Approved by Doctor**
   - Event type: `approved`
   - Changes: `{ notes: "optional approval notes" }`
   - User: Doctor who approved

2. **Submitted to Agency**
   - Event type: `submitted`
   - Changes: `{ status: 'submitted', agency: 'Ministry of Manpower' }`
   - User: Same doctor (who triggered the submission)

**Step 3**: Timeline displays both events:
```
✅ Submitted to Agency
   Ministry of Manpower
   Dr. Sarah Tan
   23 Oct 2025, 3:45 PM

✅ Approved by Doctor
   By: Dr. Sarah Tan
   Dr. Sarah Tan
   23 Oct 2025, 3:45 PM
```

## Agency Mapping Logic

| Exam Type | Agency Name |
|-----------|-------------|
| `SIX_MONTHLY_MDW` | Ministry of Manpower |
| `WORK_PERMIT` | Ministry of Manpower |
| `AGED_DRIVERS` | Singapore Police Force |

## User Experience

### Before
- ✅ Timeline showed "Approved by Doctor"
- ❌ No indication submission was sent to agency
- ❌ User had to infer agency submission from status

### After
- ✅ Timeline shows "Approved by Doctor" with doctor name
- ✅ Timeline shows "Submitted to Agency" with agency name
- ✅ Clear visibility of complete submission workflow
- ✅ Agency name matches the exam type

## Testing Checklist

### As a Doctor
1. ✅ Log in as doctor (e.g., doctor@clinic.sg)
2. ✅ Navigate to Pending Approvals
3. ✅ Click on a pending submission
4. ✅ Click "Approve Submission" button
5. ✅ Add optional approval notes
6. ✅ Confirm approval

### Verify Timeline
1. ✅ Navigate to Submissions list
2. ✅ Click on the just-approved submission
3. ✅ Check timeline shows TWO events:
   - "Approved by Doctor" with doctor name
   - "Submitted to Agency" with correct agency name
4. ✅ Verify agency name matches exam type:
   - Aged Drivers → Singapore Police Force
   - MDW/Work Permit → Ministry of Manpower

### Verify Different Exam Types
1. ✅ Approve a SIX_MONTHLY_MDW submission
   - Timeline should show "Ministry of Manpower"
2. ✅ Approve a WORK_PERMIT submission
   - Timeline should show "Ministry of Manpower"
3. ✅ Approve an AGED_DRIVERS submission
   - Timeline should show "Singapore Police Force"

## Related Files
- `backend/src/approvals/approvals.service.ts` - Creates dual audit logs
- `frontend/src/components/ViewSubmission.tsx` - Displays timeline with agency
- `backend/src/prisma/schema.prisma` - AuditLog model (stores events)

## Database Impact

### New Audit Log Entries
After approval, the `audit_log` table will have TWO consecutive entries:
```sql
-- Entry 1: Approval
INSERT INTO audit_log (submission_id, user_id, event_type, changes, timestamp)
VALUES ('abc-123', 'doctor-id', 'approved', '{"notes": "Looks good"}', NOW());

-- Entry 2: Agency Submission
INSERT INTO audit_log (submission_id, user_id, event_type, changes, timestamp)
VALUES ('abc-123', 'doctor-id', 'submitted', '{"status": "submitted", "agency": "Ministry of Manpower"}', NOW());
```

## Status
✅ **Completed** - Timeline now shows both doctor approval and agency submission with correct agency names

## Future Enhancements
- Consider adding agency submission confirmation/tracking
- Add agency-specific submission reference numbers
- Track actual agency response/acknowledgment
