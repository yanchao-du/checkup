# Patient Name Masking - Testing Guide

## Quick Test Steps

### Test 1: MDW Exam with Name Lookup

**Objective**: Verify that patient names are masked during data entry for MDW exams.

1. **Login** as Nurse: `nurse@clinic.sg` / `password`

2. **Create New Submission**
   - Click "New Submission"
   - Select: "Six-monthly Medical Exam for Migrant Domestic Worker (MOM)"

3. **Enter NRIC/FIN**
   - Use a test FIN (if available, click "Use This" on the test FIN helper)
   - Or enter a valid FIN from the database
   - Example: `G2345678M`

4. **Observe Patient Name Field**
   - Wait for API lookup (should take < 1 second)
   - ✅ **Verify**: Toast appears: "Patient found: Si** Nurh*****" (masked)
   - ✅ **Verify**: Name field shows masked name: `Si** Nurh*****`
   - ✅ **Verify**: Name field is read-only (grayed out)
   - ✅ **Verify**: Helper text appears: "Name retrieved and masked for verification. Full name will be visible after submission."

5. **Complete the Exam**
   - Fill in required fields:
     - Height: `158 cm`
     - Weight: `52 kg`
     - Test Results: Check any positive tests if needed
   - Navigate through sections

6. **View Summary**
   - Click "Continue to Summary"
   - ✅ **Verify**: Full name is now visible: `Siti Nurhaliza`
   - ✅ **Verify**: No masking in summary section

7. **Submit for Approval**
   - Select a doctor
   - Click "Submit for Approval"
   - ✅ **Verify**: Success message
   - ✅ **Verify**: In submissions list, full name is visible

### Test 2: FMW Exam with Name Lookup

**Objective**: Verify masking works for FMW exams as well.

1. **Create New Submission**
   - Select: "Six-monthly Medical Exam for Female Migrant Worker (MOM)"

2. **Enter NRIC/FIN**
   - Use test FIN or known FIN
   - Example: `G1234567N`

3. **Observe Masking**
   - ✅ **Verify**: Toast shows masked name
   - ✅ **Verify**: Input field shows masked name
   - ✅ **Verify**: Field is read-only

4. **Complete and Submit**
   - Fill required test results
   - ✅ **Verify**: Summary shows full name
   - ✅ **Verify**: After submission, full name visible

### Test 3: Work Permit Exam

**Objective**: Verify masking for Work Permit exams.

1. **Create New Submission**
   - Select: "Full Medical Exam for Work Permit (MOM)"

2. **Enter NRIC/FIN**
   - Use test FIN
   - Example: `G3456789P`

3. **Verify Masking Behavior**
   - ✅ **Verify**: Name is masked during lookup
   - ✅ **Verify**: Full name visible after navigation to summary
   - ✅ **Verify**: Full name visible after submission

### Test 4: Driver Exam (No Masking)

**Objective**: Verify that driver exams do NOT have masking (no automatic lookup).

1. **Create New Submission**
   - Select: "Driving Licence Medical Examination Report (TP)"

2. **Enter Patient Details**
   - NRIC: `S7201234A`
   - ✅ **Verify**: No automatic name lookup
   - ✅ **Verify**: Name field is NOT read-only
   - Manually enter name: `TAN AH KOW`
   - ✅ **Verify**: Name is NOT masked

### Test 5: Editing Existing Draft with Masked Name

**Objective**: Verify behavior when editing a saved draft.

1. **Create MDW Exam Draft**
   - Select MDW exam type
   - Enter NRIC/FIN (name will be masked and retrieved)
   - ✅ **Verify**: Name is masked in input field
   - Click "Save as Draft"

2. **Edit the Draft**
   - Go to Drafts list
   - Click Edit on the saved draft
   - ✅ **Verify**: When loading draft, full name is shown (not masked)
   - This is correct behavior - once saved, masking no longer applies

### Test 6: Doctor Creating MDW Exam

**Objective**: Verify masking works for doctors as well.

1. **Login** as Doctor: `doctor@clinic.sg` / `password`

2. **Create New MDW Submission**
   - Follow same steps as Test 1
   - ✅ **Verify**: Same masking behavior
   - ✅ **Verify**: Doctor can see full name in summary before direct submission

### Test 7: Name Masking Patterns

**Objective**: Verify different name patterns are masked correctly.

Test with various name patterns:

| Test Name | NRIC/FIN | Expected Masked Display |
|-----------|----------|------------------------|
| Short 2-part | (lookup) | `Ta* Ah**` or similar |
| Long name | (lookup) | First ~4 chars visible per word |
| Single word | (lookup) | ~Half visible (max 4 chars) |
| 4-part name | (lookup) | Each part masked individually |

## Masking Examples

Based on the algorithm:

```
Single char: A → A (not masked)
Two chars:   Li → L*
Three chars: Tan → Ta*
Four chars:  John → Jo**
Five chars:  Maria → Mar**
Six chars:   Robert → Rob***
Seven chars: Michael → Mich***
Eight chars: Mariange → Mari****
Nine+ chars: Elizabeth → Eliz***** (capped at 4 visible)
```

## What to Check

### Visual Indicators
- ✅ Masked name in input field (e.g., `Mari**** Th**`)
- ✅ Read-only styling (gray background, disabled cursor)
- ✅ Green dot indicator with helper text
- ✅ Toast notification with masked name

### Functional Behavior
- ✅ Cannot edit masked name manually
- ✅ Full name visible in summary section
- ✅ Full name visible after submission/approval
- ✅ Masking only applies to new submissions (not editing drafts)
- ✅ Masking only for MOM exam types (MDW, FMW, Work Permit)

### Edge Cases
- ✅ Invalid NRIC/FIN → No masking (manual entry allowed)
- ✅ Patient not found → No masking (manual entry allowed)
- ✅ Network error → No masking (manual entry allowed)
- ✅ Editing existing draft → No masking (full name shown)

## Browser Console Checks

Open DevTools (F12) → Console tab:

- No errors related to `maskName` function
- API call to `/patients/nric/:nric` succeeds
- Patient data includes `name` field
- No warnings about undefined values

## Known Issues

None currently identified.

## Automated Tests

Run the test suite:

```bash
cd frontend
npm test -- nameMasking.test.ts
```

Expected result: **13 tests pass ✅**

## Demo Script for Stakeholders

> "When medical staff enter a patient's NRIC or FIN for MOM-related exams like domestic worker screenings, the system automatically looks up the patient's name from our database. To protect patient privacy during data entry, the name is partially masked - showing enough characters for the medical professional to verify they have the correct patient, but preventing casual observation by unauthorized individuals nearby.
>
> For example, if the patient's name is 'Siti Nurhaliza', the nurse will see 'Si** Nurh*****' during data entry. This allows them to confirm 'Yes, this matches my patient' without displaying the full name on screen where others might see it.
>
> Once the exam is submitted for approval or final submission, the full name becomes visible for official records and government submission. This balances privacy protection with data accuracy requirements."

---

**Last Updated**: 4 November 2025
