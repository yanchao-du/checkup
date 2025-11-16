# Design: Short Driver Exam Form Implementation

## Overview
This document outlines the technical approach for implementing simplified short-form driver medical examinations alongside the existing comprehensive long forms.

## Architecture Decisions

### 1. Separate Exam Types vs. Form Variants
**Decision**: Create separate `ExamType` enum values for short forms

**Rationale**:
- Clear separation in database queries and filtering
- Simpler validation logic (no conditional checks on "form mode")
- Easier to track usage analytics per form type
- Allows different PDF templates without complex conditionals
- Follows existing pattern (e.g., `SIX_MONTHLY_MDW` vs `SIX_MONTHLY_FMW`)

**Alternatives Considered**:
- Adding a `formVariant` field to existing exam types - rejected due to increased complexity in validation and PDF generation
- Using feature flags - rejected as both forms should coexist permanently

### 2. Form Data Structure
**Decision**: Use minimal formData schema for short forms

Short form `formData` JSON structure:
```json
{
  "patientInfo": {
    "nric": "S1234567D",
    "name": "John Doe",
    "mobileNumber": "+6591234567",
    "purposeOfExam": "AGE_65_ABOVE_TP_ONLY" | "AGE_65_ABOVE_TP_LTA" | "AGE_64_BELOW_LTA_ONLY" | "BAVL_ANY_AGE",
    "examinationDate": "2024-01-15"
  },
  "assessment": {
    "fitToDriveMotorVehicle": true | false,  // For purpose 1 only
    "fitToDrivePublicService": true | false, // For purposes 2 & 3
    "fitBusAttendant": true | false          // For purposes 2, 3 & 4
  },
  "declaration": {
    "confirmed": true,
    "declarationText": "I certify that I have examined..."
  }
}
```

**Rationale**:
- Minimal data storage reduces database size
- Clear schema makes validation straightforward
- Compatible with existing JSONB column without schema changes

### 3. Validation Strategy
**Decision**: Create separate validation helper functions for short forms

Implementation approach:
```typescript
// backend/src/submissions/validation/driver-exam-short.validation.ts
export function isShortDriverExam(examType: string): boolean
export function validateShortDriverExam(dto: CreateSubmissionDto): void
```

**Rationale**:
- Keeps short form validation isolated from complex long form rules
- Maintains existing `driver-exam.validation.ts` unchanged
- Clear separation of concerns for testing

**Validation Rules for Short Forms**:
- Patient NRIC: Required, valid format
- Patient Name: Required
- Mobile Number: Required, valid SG format (+65 followed by 8 digits)
- Purpose of Exam: Required, one of 4 valid values:
  - `AGE_65_ABOVE_TP_ONLY` - Age 65 and above - Renew TP Driving Licence only
  - `AGE_65_ABOVE_TP_LTA` - Age 65 and above - Renew both TP & LTA Vocational Licence
  - `AGE_64_BELOW_LTA_ONLY` - Age 64 and below - Renew LTA Vocational Licence only
  - `BAVL_ANY_AGE` - Renew only Bus Attendant's Vocational Licence (BAVL) regardless of age
- Examination Date: Required, valid date
- Fitness Determination: Based on purpose:
  - Purpose 1 (Age 65+ TP only): `fitToDriveMotorVehicle` required
  - Purpose 2 (Age 65+ TP & LTA): `fitToDrivePublicService` AND `fitBusAttendant` required
  - Purpose 3 (Age 64 below LTA): `fitToDrivePublicService` AND `fitBusAttendant` required
  - Purpose 4 (BAVL any age): `fitBusAttendant` required
- Declaration: Required (true)

**Fields NOT validated** (compared to long forms):
- Date of Birth
- Email
- Height/Weight/BMI
- Blood Pressure
- Medical declaration responses
- Medical history
- AMT score
- LTA vocational medical details

### 4. PDF Generation
**Decision**: Create separate PDF generator modules for short forms

Structure:
```typescript
// backend/src/pdf/generators/short-driver-exam.generator.ts
export class ShortDriverExamPdfGenerator {
  generateTpShort(submission: MedicalSubmission): Promise<Buffer>
  generateTpLtaShort(submission: MedicalSubmission): Promise<Buffer>
  generateLtaShort(submission: MedicalSubmission): Promise<Buffer>
}
```

**PDF Layout**:
- Single page format
- Header: Clinic info, exam type title
- Section 1: Patient Information (compact table)
- Section 2: Fitness Determination (prominent Yes/No boxes)
- Section 3: Declaration (checkbox + signature line)
- Footer: Date, practitioner details

**Rationale**:
- Clean, focused PDF for quick review
- Follows existing PDF generation patterns
- Easy to modify independently from long forms

### 5. Frontend Component Structure
**Decision**: Create dedicated short form components mirroring long form structure

Component hierarchy:
```
NewSubmission.tsx (main form container)
└── submission-form/
    └── exam-forms/
        ├── DrivingLicenceTpShortFields.tsx
        ├── DrivingVocationalTpLtaShortFields.tsx
        └── VocationalLicenceLtaShortFields.tsx
```

Each short form component contains:
- Patient info fields (NRIC, Name, Mobile, Purpose, Date)
- Purpose-specific fitness radio buttons
- Declaration checkbox

**Rationale**:
- Consistent with existing exam form component pattern
- Easy to maintain and test independently
- Clear file naming distinguishes short from long forms

### 6. Type Detection
**Decision**: Extend existing helper functions to recognize short forms

```typescript
// backend/src/submissions/validation/driver-exam.validation.ts
export function isDriverExam(examType: string): boolean {
  return (
    examType === 'DRIVING_LICENCE_TP' ||
    examType === 'DRIVING_VOCATIONAL_TP_LTA' ||
    examType === 'VOCATIONAL_LICENCE_LTA' ||
    examType === 'DRIVING_LICENCE_TP_SHORT' ||
    examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT' ||
    examType === 'VOCATIONAL_LICENCE_LTA_SHORT'
  );
}

export function isShortForm(examType: string): boolean {
  return examType.endsWith('_SHORT');
}
```

**Rationale**:
- Maintains backward compatibility
- Clear detection logic for branching validation/PDF generation

## Database Schema Changes

### ExamType Enum Addition
```prisma
enum ExamType {
  // ... existing types ...
  DRIVING_LICENCE_TP_SHORT        @map("Short Form: Driving Licence (TP)")
  DRIVING_VOCATIONAL_TP_LTA_SHORT @map("Short Form: Driving Licence & Vocational (TP & LTA)")
  VOCATIONAL_LICENCE_LTA_SHORT    @map("Short Form: Vocational Licence (LTA)")
}
```

**Migration Required**: Yes - add enum values only

## Integration Points

### Affected Services
1. **SubmissionsService** (`backend/src/submissions/submissions.service.ts`)
   - Add short form type detection
   - Route to appropriate validation function

2. **PdfService** (`backend/src/pdf/pdf.service.ts`)
   - Add short form PDF generation routing
   - Call appropriate short form generator

3. **NewSubmission Component** (`frontend/src/components/NewSubmission.tsx`)
   - Add short form types to dropdown
   - Route to appropriate short form component
   - Simplify navigation (fewer sections)

### Workflow Integration
Short forms follow the same approval workflow as long forms:
1. Nurse creates submission → `draft` status
2. Nurse submits for approval → `pending_approval` status
3. Doctor reviews and approves → `submitted` status
4. System generates PDF

No workflow changes required.

## Testing Strategy

### Unit Tests
- `driver-exam-short.validation.spec.ts`: Validation logic for all 3 short types
- Short form component tests: Field rendering, validation errors

### E2E Tests
- Create short form submission (all 3 types)
- Submit for approval
- Doctor approval flow
- PDF generation
- Verify audit logs

### Test Data
Seed database with:
- 5 completed short form submissions (mix of types)
- 3 draft short form submissions

## Performance Considerations
- Short forms use less database storage (~200 bytes vs ~2KB for long forms)
- PDF generation faster (single page vs 3-5 pages)
- Form submission time reduced by ~70% (2 min vs 7 min estimated)

## Error Handling
- If mobile number invalid → display inline error "Please enter a valid Singapore mobile number"
- If fitness determination missing → block submission, show error "Please answer the fitness question"
- If declaration not checked → block submission, show error "Please confirm the declaration"

## Rollout Plan
1. Deploy database migration (enum values)
2. Deploy backend validation and PDF generation
3. Deploy frontend form components
4. Smoke test in staging with sample data
5. Production deployment (no feature flag needed - new types are opt-in)

## Future Considerations
- Analytics dashboard to compare short vs long form usage
- Bulk import for short forms (CSV upload for mass screenings)
- Mobile-optimized short form layout
