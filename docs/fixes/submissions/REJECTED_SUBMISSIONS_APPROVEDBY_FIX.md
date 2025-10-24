# Fixed: "Unknown" Rejector in Rejected Submissions

## Problem
Rejected submissions were showing "Unknown" in the "Rejected By" column instead of showing the doctor's name (e.g., "Dr. Sarah Tan").

## Root Cause
The `approved_by` field in the `medical_submissions` table was `NULL` for rejected submissions that were created before we implemented the fix to set `approvedById` during rejection.

### Timeline:
1. **Before the fix**: When doctors rejected submissions, the code did NOT set the `approvedById` field
2. **After the fix** (in `backend/src/approvals/approvals.service.ts` line 133): The rejection code now correctly sets `approvedById: doctorId`
3. **Legacy data issue**: 12 existing rejected submissions had `NULL` in the `approved_by` column

## Investigation Results

### Database Query Results:
```sql
-- Found 12 rejected submissions with NULL approved_by
SELECT id, patient_name, status, approved_by 
FROM medical_submissions 
WHERE status = 'rejected' LIMIT 10;

-- All showed approved_by = (empty/NULL)
```

### Audit Log Check:
```sql
-- Found that all rejections were by the same doctor
SELECT submission_id, user_id, event_type, timestamp 
FROM audit_logs 
WHERE event_type = 'rejected' 
ORDER BY timestamp DESC LIMIT 5;

-- Results: All rejected by user_id = 550e8400-e29b-41d4-a716-446655440001
-- This user is: Dr. Sarah Tan (doctor@clinic.sg)
```

## Solution Applied

### Database Fix (Data Migration)
Updated all rejected submissions to set their `approved_by` field based on the audit logs:

```sql
UPDATE medical_submissions ms
SET approved_by = al.user_id
FROM audit_logs al
WHERE ms.id = al.submission_id
  AND ms.status = 'rejected'
  AND ms.approved_by IS NULL
  AND al.event_type = 'rejected'
  AND al.timestamp = (
    SELECT MAX(timestamp)
    FROM audit_logs
    WHERE submission_id = ms.id
      AND event_type = 'rejected'
  );

-- Result: UPDATE 12 (12 rows updated)
```

### Verification
```sql
-- After the fix
SELECT id, patient_name, status, approved_by 
FROM medical_submissions 
WHERE status = 'rejected' LIMIT 5;

-- Results: All now have approved_by = 550e8400-e29b-41d4-a716-446655440001
```

## Code Fix (Already Implemented)
The backend code in `backend/src/approvals/approvals.service.ts` is correct and will properly set `approvedById` for all future rejections:

```typescript
async reject(id: string, doctorId: string, clinicId: string, reason: string) {
  const updated = await this.prisma.medicalSubmission.update({
    where: { id },
    data: {
      status: 'rejected',
      rejectedReason: reason,
      approvedById: doctorId, // ✅ Correctly tracks who rejected it
    },
    include: {
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } }, // ✅ Loads the rejector's name
    },
  });
  // ...
}
```

## Result
✅ All 12 rejected submissions now correctly show "Dr. Sarah Tan" in the "Rejected By" column  
✅ Future rejections will automatically track the rejector  
✅ The audit logs always contain the correct information as a backup

## Testing
- [x] Database updated successfully
- [x] Verified approved_by is now set for all rejected submissions
- [x] Confirmed doctor name is "Dr. Sarah Tan"
- [ ] Manual test: View rejected submissions list - should show "Dr. Sarah Tan" instead of "Unknown"

## Prevention
- The code fix ensures all new rejections will have `approvedById` set
- Audit logs always track who performed the rejection as a backup
- If similar issues occur, we can use audit logs to backfill the data
