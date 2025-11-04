# Patient Name Masking Feature

## Overview

This feature implements visual masking for patient names retrieved from the database for Six-Monthly MDW, Six-Monthly FMW, and Work Permit exam types. The masking provides human verification capability while protecting patient privacy during the data entry phase.

## Purpose

When a nurse or doctor enters a valid NRIC/FIN for MOM exam types (MDW, FMW, Work Permit), the system automatically looks up the patient in the database and retrieves their name. To protect privacy while still allowing the medical professional to verify they have the correct patient, the name is partially masked.

## Masking Rules

The `maskName()` function implements the following masking logic:

### Single Character Names
- Not masked (too short for privacy concerns)
- Example: `A` → `A`

### Two Character Names
- Show first character + asterisk
- Example: `Li` → `L*`

### Three or More Characters
- Show approximately half the characters (rounded up)
- Maximum 4 characters visible (for longer names)
- Formula: `Math.min(4, Math.ceil(length / 2))`

### Examples

| Original Name | Masked Name | Explanation |
|--------------|-------------|-------------|
| `Mariange Thok` | `Mari**** Th**` | 8 chars → 4 visible (cap), 4 chars → 2 visible |
| `Nur Aisyah Binte Rahman` | `Nu* Ais*** Bin** Rah***` | Each word masked individually |
| `Maria Elena Santos` | `Mar** Ele** San***` | 5, 5, 6 chars → 3, 3, 3 visible |
| `Siti Nurhaliza` | `Si** Nurh*****` | 4 chars → 2, 9 chars → 4 (cap) |
| `Tan Ah Kow` | `Ta* A* Ko*` | Short names show ~half |

## When Names Are Masked

### Masked (Draft Phase)
- ✅ During initial NRIC/FIN lookup
- ✅ In the patient name input field (read-only)
- ✅ In success toast message: "Patient found: Mari**** Th**"
- ✅ While editing a draft (before submission)

### Not Masked (After Submission)
- ✅ In the summary/review page (before final submission)
- ✅ After submission for approval (pending_approval status)
- ✅ In doctor's approval view
- ✅ After final submission to agency (submitted status)
- ✅ In view submission page
- ✅ When editing existing drafts (that were already saved)

## Implementation Details

### Files Modified

1. **`frontend/src/lib/nameMasking.ts`** - Core masking utility
2. **`frontend/src/lib/nameMasking.test.ts`** - Comprehensive test suite (13 tests)
3. **`frontend/src/components/NewSubmission.tsx`** - Integration with form component

### Key Code

```typescript
// Masking function
export function maskName(fullName: string): string {
  if (!fullName) return '';
  
  return fullName
    .split(/\s+/)
    .map(part => {
      const clean = part.trim();
      if (!clean) return '';
      
      if (clean.length === 1) return clean;
      if (clean.length === 2) return clean[0] + '*';
      
      const visible = Math.min(4, Math.ceil(clean.length / 2));
      const masked = '*'.repeat(clean.length - visible);
      
      return clean.slice(0, visible) + masked;
    })
    .filter(part => part !== '')
    .join(' ');
}
```

### Usage in Component

```tsx
// In NewSubmission.tsx patient name input
<Input
  id="patientName"
  name="patientName"
  value={isNameFromApi && !id ? maskName(patientName) : patientName}
  readOnly={isNameFromApi}
  className={isNameFromApi ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
/>
{isNameFromApi && !id && (
  <p className="text-xs text-slate-600 flex items-center gap-1">
    <span className="inline-block w-1 h-1 rounded-full bg-green-500"></span>
    Name retrieved and masked for verification. Full name will be visible after submission.
  </p>
)}
```

## User Experience Flow

### 1. Nurse Creates New MDW Exam
1. Select exam type: "Six-monthly Medical Exam for Migrant Domestic Worker"
2. Enter NRIC/FIN: `G2345678M`
3. System looks up patient in database
4. Toast message: "Patient found: Si** Nurh*****"
5. Name field shows: `Si** Nurh*****` (read-only, grayed out)
6. Helper text: "Name retrieved and masked for verification. Full name will be visible after submission."

### 2. Nurse Completes Exam
1. Fill in all required fields (height, weight, test results, etc.)
2. Navigate to summary page
3. **Full name is now visible**: `Siti Nurhaliza` 
4. Nurse can verify all details before submission

### 3. Nurse Submits for Approval
1. Click "Submit for Approval"
2. Select doctor
3. Submission status: `pending_approval`
4. **Full name visible** in submitted exam record

### 4. Doctor Reviews and Approves
1. Doctor opens pending approval
2. **Full name visible**: `Siti Nurhaliza`
3. Doctor reviews medical details
4. Doctor approves and submits to MOM
5. Status: `submitted`

## Security & Privacy Benefits

### Data Protection
- **During Data Entry**: Name is masked to prevent casual observation by unauthorized individuals
- **During Transit**: Only authorized medical professionals with valid session can view data
- **After Submission**: Full name required for official government submission and audit trail

### Compliance
- Follows PDPA principles of data minimization during data entry
- Maintains data accuracy through human verification capability
- Ensures complete data for government agency submission
- Provides audit trail with full names for accountability

## Testing

### Test Coverage
- 13 comprehensive test cases covering:
  - Single, double, and multi-word names
  - Short names (1-3 characters)
  - Medium names (4-7 characters)
  - Long names (8+ characters)
  - Names with extra spaces
  - Common Singapore names (Chinese, Malay, Indian)
  - Foreign worker names

### Running Tests

```bash
cd frontend
npm test -- nameMasking.test.ts
```

Expected: All 13 tests pass ✅

## Future Enhancements

1. **Configurable Masking Rules**
   - Allow clinics to configure masking strictness
   - Option to disable masking for trusted environments

2. **Additional Masking**
   - Mask NRIC/FIN during display (e.g., `G2345***M`)
   - Mask date of birth partially

3. **Audit Logging**
   - Log when masked names are viewed
   - Track who accessed full names and when

## Notes

- Masking only applies to **MOM exam types** (MDW, FMW, Work Permit) where patient lookup is automatic
- Other exam types (Driver, ICA) do not have automatic name lookup, so no masking is applied
- The masking is purely visual - the backend always stores and transmits the full name
- Medical professionals must still visually verify the masked name matches their patient before proceeding

---

**Last Updated**: 4 November 2025
**Version**: 1.0
**Author**: CheckUp Development Team
