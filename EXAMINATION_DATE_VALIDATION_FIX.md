# Empty examinationDate Validation Fix

## Issue
When saving a draft (especially reopened drafts), the save operation failed with HTTP 400 Bad Request:
```
Error: examinationDate must be a valid ISO 8601 date string
PUT http://localhost:3344/v1/submissions/50cb3763-7a65-4f13-910e-28a5698e37b8 400 (Bad Request)
```

## Root Cause

The `examinationDate` field was initialized as an empty string and was always included in the submission data, even when not filled:

```typescript
const [examinationDate, setExaminationDate] = useState('');

// Later...
const submissionData = {
  //...
  examinationDate,  // ❌ Sends empty string "" when not filled
};
```

The backend DTO validation rejects empty strings:
```typescript
@IsOptional()
@IsDateString()  // ← Rejects empty strings, requires valid ISO date or undefined
examinationDate?: string;
```

## Solution

Only include `examinationDate` in the payload when it has a value:

```typescript
const submissionData = {
  examType,
  patientName,
  patientNric,
  patientDateOfBirth,
  ...(examinationDate && { examinationDate }), // ✅ Only include if not empty
  formData,
  routeForApproval: false,
  assignedDoctorId: assignedDoctorId || undefined,
};
```

## Files Modified

- **frontend/src/components/NewSubmission.tsx**: 
  - Fixed `handleSaveDraft()` - line 109
  - Fixed `handleSubmit()` - line 149

## Technical Details

**Conditional Spreading**:
```typescript
...(examinationDate && { examinationDate })
```

- If `examinationDate = "2025-10-23"` → spreads `{ examinationDate: "2025-10-23" }`
- If `examinationDate = ""` → spreads nothing (empty object)
- If `examinationDate = undefined` → spreads nothing

## Testing

✅ Save draft without examination date → Success  
✅ Save draft with examination date → Success  
✅ Update reopened draft without examination date → Success  
✅ Update reopened draft with examination date → Success  

## Status
✅ **Fixed** - Empty examination dates no longer cause validation errors
