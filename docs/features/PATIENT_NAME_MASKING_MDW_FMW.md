# Patient Name Masking for MDW and FMW Exams

## Overview

Patient names for **Six-Monthly Medical Examinations for Migrant Domestic Workers (MDW)** and **Six-Monthly Medical Examinations for Female Migrant Workers (FMW)** are automatically masked throughout the application to protect worker privacy during the examination and approval process.

Full names are only revealed once the medical examination has been officially **submitted** to the Ministry of Manpower (MOM).

## Purpose

- **Privacy Protection**: Safeguard foreign worker identity during internal clinic workflows
- **Data Minimization**: Limit exposure of personal information to essential personnel only
- **Regulatory Compliance**: Align with data protection best practices for sensitive personal data
- **Professional Standards**: Maintain appropriate privacy boundaries during medical record processing

## Masking Rules

### When Names Are Masked

Patient names are masked for MDW and FMW exams in the following statuses:

- ✅ **draft** - Initial data entry and ongoing work
- ✅ **pending_approval** - Submitted by nurse, awaiting doctor approval
- ✅ **rejected** - Returned by doctor for corrections
- ✅ **revision_requested** - Requires modifications before resubmission

### When Full Names Are Shown

Full names are displayed **only** when:

- ✅ **submitted** - Official submission to MOM completed

### Exam Types Affected

| Exam Type | Masking Applied |
|-----------|-----------------|
| `SIX_MONTHLY_MDW` | ✅ Yes |
| `SIX_MONTHLY_FMW` | ✅ Yes |
| `WORK_PERMIT` | ❌ No |
| `AGED_DRIVERS` | ❌ No |
| `PR_MEDICAL` | ❌ No |
| `STUDENT_PASS_MEDICAL` | ❌ No |
| `LTVP_MEDICAL` | ❌ No |
| `DRIVING_LICENCE_TP` | ❌ No |
| `DRIVING_VOCATIONAL_TP_LTA` | ❌ No |
| `VOCATIONAL_LICENCE_LTA` | ❌ No |

## Masking Algorithm

The system uses a consistent masking pattern that:

- Shows approximately 50% of each word (minimum 1 character, maximum 4 characters)
- Masks the remaining characters with asterisks (`*`)
- Preserves word boundaries for readability

### Examples

| Full Name | Masked Name |
|-----------|-------------|
| Mariange Thok | Mari**** Th** |
| John Doe | Jo** D** |
| A | A |
| Alexandra Johnson | Alex***** John*** |
| Li Wei | Li W** |

## Implementation Details

### Frontend Components

#### Core Utility: `nameDisplay.ts`

```typescript
function getDisplayName(
  fullName: string,
  examType: ExamType | string,
  status?: SubmissionStatus | string
): string
```

**Parameters:**
- `fullName`: The complete patient name
- `examType`: Type of medical examination
- `status`: Current submission status (optional)

**Returns:** Either the full name or masked name based on exam type and status

**Logic:**
1. Check if exam type is MDW or FMW
2. If no status provided (e.g., on new submission form), mask the name
3. If status is "submitted", show full name
4. Otherwise, show masked name

#### Updated Components

All components that display patient names now use `getDisplayName()`:

1. **Summary Pages**
   - `SixMonthlyMdwSummary.tsx` - Patient info section
   - `SixMonthlyFmwSummary.tsx` - Patient info section

2. **List Views**
   - `DraftsList.tsx` - Draft records table
   - `SubmissionsList.tsx` - Submitted reports table
   - `PendingApprovals.tsx` - Pending approvals table
   - `RejectedSubmissions.tsx` - Rejected submissions table
   - `Dashboard.tsx` - Activity feed and rejected submissions preview

3. **Detail Views**
   - `ViewSubmission.tsx` - Patient information card, approval/rejection dialogs

### Masking Utility: `nameMasking.ts`

The underlying masking logic is provided by:

```typescript
function maskName(fullName: string): string
```

This function:
- Cleans the name (removes extra spaces, special characters)
- Splits into words
- Masks each word showing ~50% of characters (max 4 visible)
- Joins words back together

## User Experience

### For Nurses (Data Entry)

When creating or editing MDW/FMW exams:
1. Enter full patient name from NRIC/FIN lookup
2. **See masked name immediately** in form displays
3. Summary page shows masked name: "Mari**** Th**"
4. Draft list shows masked names
5. After submission, name remains masked in pending approvals

### For Doctors (Review & Approval)

When reviewing MDW/FMW exams:
1. **See masked names** in pending approval queue
2. Patient info shows: "Mari**** Th**"
3. Can still verify patient using NRIC/FIN
4. After approving and submitting to MOM, **full name appears**

### For All Users (Viewing Submitted Reports)

Once submitted to MOM:
1. ✅ **Full name is visible** in submitted reports list
2. ✅ Patient details show complete name
3. ✅ Full transparency for official records

## Security Considerations

### What Is Protected

- ✅ Patient identity during data entry
- ✅ Worker privacy in internal workflows
- ✅ Names in approval queues
- ✅ Names in draft and pending states

### What Is Not Masked

- ❌ NRIC/FIN numbers (needed for patient identification)
- ❌ Other exam types (no masking requirement)
- ❌ Submitted reports (official government submissions)
- ❌ Date of birth, contact information

### Important Notes

⚠️ **Masking is UI-only**: The full name is still stored in the database and transmitted in API responses. This is a display-layer privacy feature, not encryption.

⚠️ **NRIC/FIN Visible**: The NRIC/FIN number is always displayed for patient verification purposes.

⚠️ **Audit Trails**: Full names appear in system logs and database records for audit purposes.

## Testing

### Automated Tests

Test file: `frontend/src/lib/nameDisplay.test.ts`

**Coverage:**
- ✅ 21 tests covering all scenarios
- ✅ MDW exam type masking (6 tests)
- ✅ FMW exam type masking (4 tests)
- ✅ Other exam types not masked (8 tests)
- ✅ Edge cases (3 tests)

### Manual Testing Scenarios

#### Scenario 1: Draft MDW Exam
1. Navigate to New Submission
2. Select "Six-monthly Medical Exam for MDW"
3. Enter NRIC: S1234567D
4. Verify name appears masked in patient info
5. Fill form and view summary
6. Verify masked name on summary page
7. Save as draft
8. Check drafts list - name should be masked

**Expected:** Name masked throughout (e.g., "Mari**** Th**")

#### Scenario 2: Nurse Routes MDW for Approval
1. Open draft MDW exam
2. Complete all required fields
3. Click "Submit for Approval"
4. Go to Pending Approvals (as doctor)
5. Verify name is masked in list

**Expected:** Name masked in pending approvals table

#### Scenario 3: Doctor Approves and Submits MDW
1. As doctor, open pending MDW exam
2. Verify name is masked in patient info
3. Review and approve
4. Submit to MOM
5. Go to Submitted Reports list
6. Verify **full name now visible**

**Expected:** Full name appears after submission

#### Scenario 4: Rejected MDW Exam
1. Doctor rejects MDW exam
2. Check Rejected Submissions list
3. Verify name remains masked

**Expected:** Name masked in rejected state

#### Scenario 5: Non-MDW/FMW Exam
1. Create Work Permit exam
2. Enter patient details
3. Verify full name shows everywhere

**Expected:** No masking for other exam types

## API Response Format

The backend returns full names in API responses. The frontend applies masking during display:

```json
{
  "id": "sub-123",
  "examType": "SIX_MONTHLY_MDW",
  "patientName": "Mariange Thok",
  "patientNric": "S1234567D",
  "status": "draft"
}
```

Frontend displays: `Mari**** Th**`

## Future Enhancements

Potential improvements for consideration:

1. **Backend Masking**: Apply masking at API level for enhanced security
2. **Configurable Rules**: Allow clinics to customize masking behavior
3. **Role-Based Masking**: Different masking rules for different user roles
4. **NRIC/FIN Masking**: Option to also mask identification numbers
5. **Audit Logging**: Track when full names are viewed
6. **Progressive Disclosure**: Require additional authentication to reveal full name

## Related Documentation

- [Patient Name Masking (Original Feature)](./PATIENT_NAME_MASKING.md) - Name masking during data entry
- [Patient Name Masking Tests](../testing/PATIENT_NAME_MASKING_TESTS.md) - Original test scenarios
- [Access Control](../architecture/ACCESS_CONTROL.md) - Role-based permissions
- [Data Privacy](../architecture/DATA_PRIVACY.md) - Overall privacy approach

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-04 | 1.0 | Initial implementation - Status-based name masking for MDW/FMW |
| 2025-11-04 | 1.0 | Added masking to all list and detail views |
| 2025-11-04 | 1.0 | Created comprehensive test suite (21 tests) |

## Support

For questions or issues related to patient name masking:

1. Check test coverage in `nameDisplay.test.ts`
2. Review implementation in `lib/nameDisplay.ts` and `lib/nameMasking.ts`
3. Verify component usage matches guidelines above
4. Contact system administrator for policy questions
