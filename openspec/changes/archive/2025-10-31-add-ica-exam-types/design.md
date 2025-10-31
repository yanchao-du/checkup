# Design: Add ICA Exam Types

## Overview
This change adds support for three Immigration and Checkpoints Authority (ICA) medical examination types. Unlike MOM exams which use patient lookup APIs, ICA exams require manual patient data entry and have simplified test requirements.

## Architecture Decisions

### 1. Single Shared Component for All ICA Exam Types
**Decision:** Create one `IcaExamFields.tsx` component used by all three ICA exam types (PR, Student Pass, LTVP) instead of three separate components.

**Rationale:**
- All three ICA exams have identical field requirements (HIV + Chest X-ray + Remarks)
- Reduces code duplication and maintenance burden
- Follows DRY principle
- Similar to how `CheckboxField` is reused across different exam types

**Alternative considered:** Three separate components (IcaPrFields, IcaStudentFields, IcaLtvpFields)
- Rejected because no unique fields per exam type justify the duplication

### 2. Disable Patient Lookup for ICA Exams
**Decision:** Conditionally disable the patient lookup API call based on exam type. For ICA exams, render standard text input fields for patient name and NRIC/FIN.

**Rationale:**
- ICA exams don't have a patient lookup API available
- Patient data must be manually entered by the user
- Maintains consistent UI pattern (same form fields, different behavior)
- Avoids unnecessary API calls

**Implementation:**
```tsx
const isIcaExam = ['PR_MEDICAL', 'STUDENT_PASS_MEDICAL', 'LTVP_MEDICAL'].includes(examType);

// In NewSubmission.tsx
{!isIcaExam && (
  <Button onClick={handlePatientLookup}>Lookup Patient</Button>
)}
```

### 3. Reuse Existing CheckboxField for Tests
**Decision:** Use the existing `CheckboxField` component for HIV and Chest X-ray tests, similar to MDW/FMW implementation.

**Rationale:**
- `CheckboxField` already handles the checkbox + label + validation pattern
- Consistent UX across all exam types
- No need to create ICA-specific test field components

### 4. Reuse MdwRemarksField Component
**Decision:** Reuse the existing `MdwRemarksField` component for ICA exam remarks section.

**Rationale:**
- MdwRemarksField already implements the exact pattern needed: checkbox trigger + textarea
- Component is generic enough to work for any exam type
- Label can be customized via props if needed
- Avoids duplicating the checkbox + textarea logic

**Alternative considered:** Create `IcaRemarksField`
- Rejected because MdwRemarksField is already generic and reusable

## Data Flow

### Creating ICA Exam Submission
1. User selects ICA exam type from dropdown
2. `NewSubmission` detects ICA exam type and disables patient lookup
3. User manually enters patient name and NRIC/FIN
4. User fills in HIV test, Chest X-ray test, and remarks (optional)
5. Form validation checks required fields (name, NRIC, exam date)
6. Submission saved to database with `examType` = PR_MEDICAL | STUDENT_PASS_MEDICAL | LTVP_MEDICAL

### Approval Workflow
- ICA exams follow the same workflow as MOM exams
- Nurse creates → routes to doctor → doctor approves → status = submitted
- No special handling needed for ICA exam types in approval logic

## Database Schema

### ExamType Enum Addition
```prisma
enum ExamType {
  // Existing
  SIX_MONTHLY_MDW @map("Six-monthly Medical Exam for Migrant Domestic Workers (MOM)")
  SIX_MONTHLY_FMW @map("Six-monthly Medical Exam for Female Migrant Workers (MOM)")
  WORK_PERMIT     @map("Full Medical Exam for Work Permit (MOM)")
  AGED_DRIVERS    @map("Medical Exam for Aged Drivers (SPF)")
  
  // New ICA exam types
  PR_MEDICAL              @map("Medical Examination for Permanent Residency (ICA)")
  STUDENT_PASS_MEDICAL    @map("Medical Examination for Student Pass (ICA)")
  LTVP_MEDICAL            @map("Medical Examination for Long Term Visit Pass (ICA)")
}
```

## Frontend Component Structure

```
components/
├── NewSubmission.tsx              # Updated to handle ICA exam types
├── submission-form/
│   ├── fields/
│   │   ├── CheckboxField.tsx      # Reused for HIV/X-ray tests
│   │   └── MdwRemarksField.tsx    # Reused for ICA remarks
│   ├── exam-forms/
│   │   └── IcaExamFields.tsx      # NEW - shared by all 3 ICA exam types
│   ├── summary/
│   │   ├── IcaExamSummary.tsx     # NEW - summary view for ICA exams
│   │   └── IcaDeclarationSection.tsx  # NEW - ICA-specific declaration text
│   └── submission-view/
│       └── IcaExamDetails.tsx     # NEW - detail view for submitted ICA exams
```

## ICA-Specific Declaration

**Note:** ICA exams require a different declaration text than MOM/SPF exams. The specific declaration text will be provided separately and implemented in the `IcaDeclarationSection.tsx` component.

The declaration logic in `NewSubmission.tsx` should conditionally render:
- `DeclarationSection` for MOM/SPF exam types
- `IcaDeclarationSection` for ICA exam types (PR_MEDICAL, STUDENT_PASS_MEDICAL, LTVP_MEDICAL)

## Backward Compatibility
- **Non-breaking:** All changes are additive (new enum values, new components)
- Existing exam types (MDW, FMW, WORK_PERMIT, AGED_DRIVERS) remain unchanged
- Existing submissions are not affected
- No data migration required (only schema extension)

## Validation Strategy
1. **Backend Unit Tests:** Verify ICA exam types are accepted in DTOs and services
2. **Backend E2E Tests:** Test full submission lifecycle (create, read, update, delete, approve, reject) for all 3 ICA exam types
3. **Frontend Unit Tests:** Test IcaExamFields component renders correctly, handles state changes
4. **Manual Testing:** Verify end-to-end workflow for each ICA exam type
5. **OpenSpec Validation:** `openspec validate add-ica-exam-types --strict`

## Rollback Plan
If issues arise:
1. Run `npx prisma migrate rollback` to revert database migration
2. Remove PR_MEDICAL, STUDENT_PASS_MEDICAL, LTVP_MEDICAL from ExamType enum
3. Delete IcaExamFields.tsx, IcaExamSummary.tsx, IcaExamDetails.tsx
4. Revert changes to NewSubmission.tsx and formatters.ts
5. Redeploy previous version

## Performance Considerations
- **No performance impact:** Adding enum values and conditional rendering has negligible overhead
- **Reduced API calls:** Disabling patient lookup for ICA exams actually reduces backend load
