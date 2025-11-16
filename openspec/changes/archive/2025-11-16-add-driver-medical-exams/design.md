# Design: Driver Medical Exam Types

## Overview
This design extends the CheckUp system to support three new driver medical exam types required by Singapore Traffic Police (TP) and Land Transport Authority (LTA). The implementation maximizes component reuse while introducing new form sections specific to driver fitness assessments.

## Architecture Decisions

### 1. Exam Type Enumeration
**Decision:** Add three new values to the existing `ExamType` enum in the database schema.

```typescript
enum ExamType {
  // Existing types...
  SIX_MONTHLY_MDW
  SIX_MONTHLY_FMW
  WORK_PERMIT
  AGED_DRIVERS
  PR_MEDICAL
  STUDENT_PASS_MEDICAL
  LTVP_MEDICAL
  
  // New driver exam types
  DRIVING_LICENCE_TP        @map("Driving Licence Medical Examination Report (TP)")
  DRIVING_VOCATIONAL_TP_LTA @map("Driving Licence and Vocational Licence (TP & LTA)")
  VOCATIONAL_LICENCE_LTA    @map("Vocational Licence Medical Examination (LTA)")
}
```

**Rationale:**
- Consistent with existing exam type architecture
- Simple to query and filter in the database
- Frontend can easily detect and route to appropriate form components
- Allows for exam-type-specific validation rules

**Alternatives Considered:**
- Single "DRIVER_MEDICAL" type with sub-categories → Rejected: Less flexible for reporting and filtering
- Separate table for driver exam metadata → Rejected: Over-engineered for current needs

---

### 2. Form Data Storage
**Decision:** Continue using JSONB `formData` column for exam-specific fields.

**Rationale:**
- Existing pattern works well for diverse exam types
- Flexibility to add/modify fields without schema migrations
- Easy to extend in the future
- Consistent with current implementation

**Driver Exam Form Data Structure:**
```typescript
{
  // Common fields (reused from existing exams)
  height: string;
  weight: string;
  bmi: string;
  bloodPressure: string;
  pulse: string;
  visualAcuity: string;
  hearingTest: string;
  diabetes: string;
  
  // Medical declaration by examinee (past 6 months)
  medicalDeclaration: {
    lossOfConsciousness: boolean;
    seizures: boolean;
    suddenDizziness: boolean;
    chestPain: boolean;
    breathlessness: boolean;
    substanceAbuse: boolean;
    psychiatricCondition: boolean;
    otherConditions: string; // free text
  };
  
  // Medical history of examinee
  medicalHistory: {
    cardiovascular: boolean;
    neurological: boolean;
    psychiatric: boolean;
    diabetes: boolean;
    vision: boolean;
    hearing: boolean;
    musculoskeletal: boolean;
    other: string; // free text
  };
  
  // TP-specific: Abbreviated Mental Test (AMT)
  amt?: {
    age: boolean;
    time: boolean;
    address: boolean;
    year: boolean;
    place: boolean;
    recognition: boolean;
    birthDate: boolean;
    yearWWI: boolean;
    currentLeader: boolean;
    countBackward: boolean;
    score: number; // 0-10
  };
  
  // LTA-specific: Vocational Licence Medical Details
  ltaVocational?: {
    colorVision: string;
    peripheralVision: string;
    nightVision: string;
    cardiacCondition: string;
    respiratoryCondition: string;
    renalCondition: string;
    endocrineCondition: string;
    fitForDuty: boolean;
    restrictions: string; // free text
  };
  
  // Medical practitioner's assessment
  assessment: {
    fitToDrive: boolean; // TP
    fitForVocational?: boolean; // LTA
    requiresSpecialistReview: boolean;
    specialistType?: string;
    remarks: string;
  };
}
```

---

### 3. Component Architecture
**Decision:** Create dedicated form components following existing pattern, with maximum reuse.

**Component Hierarchy:**
```
NewSubmission (existing)
├── DrivingLicenceTpFields (new)
│   ├── CommonMedicalFields (reused)
│   ├── MedicalDeclarationSection (new)
│   ├── MedicalHistorySection (new)
│   ├── AbbreviatedMentalTestSection (new)
│   └── AssessmentSection (new)
├── DrivingVocationalTpLtaFields (new)
│   ├── CommonMedicalFields (reused)
│   ├── MedicalDeclarationSection (reused)
│   ├── MedicalHistorySection (reused)
│   ├── AbbreviatedMentalTestSection (reused)
│   ├── LtaVocationalSection (new)
│   └── AssessmentSection (reused)
└── VocationalLicenceLtaFields (new)
    ├── CommonMedicalFields (reused)
    ├── MedicalDeclarationSection (reused)
    ├── MedicalHistorySection (reused)
    ├── LtaVocationalSection (reused)
    └── AssessmentSection (reused)
```

**Reused Components:**
- `VisualAcuityField` - from AgedDriversFields
- `HearingTestField` - from AgedDriversFields  
- `DiabetesField` - from AgedDriversFields
- Height/Weight/BMI/BP/Pulse inputs - from existing exams

**New Shared Components:**
- `CommonMedicalFields` - Bundle of height, weight, BP, pulse, vision, hearing
- `MedicalDeclarationSection` - Checkbox group for 6-month medical occurrences
- `MedicalHistorySection` - Checkbox group for medical history
- `AbbreviatedMentalTestSection` - AMT 10-question checklist with auto-score
- `LtaVocationalSection` - LTA-specific medical assessments
- `AssessmentSection` - Fit to drive/vocational determination + remarks

**Rationale:**
- Follows existing `AgedDriversFields`, `WorkPermitFields` pattern
- New shared components eliminate duplication across 3 forms
- Easy to maintain and test
- Clear separation of concerns

---

### 4. Summary and View Components
**Decision:** Create dedicated summary components following existing pattern.

**New Components:**
```
DrivingLicenceTpSummary
DrivingVocationalTpLtaSummary
VocationalLicenceLtaSummary
```

Each will display:
1. Patient information
2. Examination date and basic vitals
3. Medical declaration items (condensed, show only "Yes" answers)
4. Medical history items (condensed, show only "Yes" answers)
5. AMT score (if applicable)
6. LTA vocational details (if applicable)
7. Medical practitioner assessment and decision
8. Declaration checkbox before submission

**View Submission Components:**
```
DrivingLicenceTpDetails
DrivingVocationalTpLtaDetails
VocationalLicenceLtaDetails
```

**Rationale:**
- Consistent with `SixMonthlyMdwSummary`, `IcaExamSummary` pattern
- Separate components allow customization per exam type
- Can share sub-components for common sections

---

### 5. Validation Rules
**Decision:** Implement exam-type-specific validation functions.

**Key Validations:**
1. **Exam timing:** Must be within 2 months before examinee's birthday (per Road Traffic Rules)
2. **Required fields by exam type:**
   - TP exams: AMT must be completed
   - LTA exams: Vocational section must be completed
   - All: Medical declaration and history required
3. **AMT scoring:** Auto-calculate, warn if score < 8
4. **Age restrictions:** Warn if examinee under 65 for aged driver exam
5. **NRIC/FIN validation:** Reuse existing validators

**Implementation:**
```typescript
// backend/src/submissions/dto/validation.ts
export const validateDriverExam = (dto: CreateSubmissionDto) => {
  const { examType, patientDateOfBirth, examinationDate, formData } = dto;
  
  // Check exam within 2 months before birthday
  if (isDriverExam(examType)) {
    validateExamTiming(patientDateOfBirth, examinationDate);
  }
  
  // Type-specific validations
  if (examType === 'DRIVING_LICENCE_TP' || examType === 'DRIVING_VOCATIONAL_TP_LTA') {
    if (!formData.amt || typeof formData.amt.score !== 'number') {
      throw new BadRequestException('AMT is required for TP driving licence exams');
    }
  }
  
  if (examType === 'DRIVING_VOCATIONAL_TP_LTA' || examType === 'VOCATIONAL_LICENCE_LTA') {
    if (!formData.ltaVocational) {
      throw new BadRequestException('LTA vocational section is required');
    }
  }
  
  // Common driver exam validations
  if (!formData.medicalDeclaration) {
    throw new BadRequestException('Medical declaration is required');
  }
  
  if (!formData.medicalHistory) {
    throw new BadRequestException('Medical history is required');
  }
  
  if (!formData.assessment?.fitToDrive === undefined) {
    throw new BadRequestException('Fitness assessment is required');
  }
};
```

---

### 6. UX Optimizations for Minimal Clicks
**Decision:** Implement several UX enhancements to reduce input time.

**Strategies:**

1. **Smart Defaults:**
   - Pre-fill examination date with today's date
   - Auto-calculate BMI from height/weight
   - Auto-calculate AMT score from checkboxes
   - Default "No" for medical declaration items (most common case)

2. **Progressive Disclosure:**
   - Use accordions for logical section grouping
   - Auto-expand next section when current section is complete
   - Collapse completed sections to reduce scrolling

3. **Keyboard Shortcuts:**
   - Tab navigation through all fields
   - Enter to submit when on last field
   - Ctrl+S to save draft

4. **Bulk Actions:**
   - "All normal" button for medical history (unchecks all)
   - "All passed" button for AMT (checks all 10 items)
   - Copy vitals from last exam (if patient has previous records)

5. **Contextual Help:**
   - Tooltips for medical terminology
   - Inline examples for expected values (e.g., "120/80" for BP)
   - Character countdown for text fields

6. **Single-Page Layout:**
   - All sections visible on one scrollable page
   - No multi-step wizard (reduces clicks)
   - Sticky summary bar at bottom showing completion %

**Rationale:**
- Reduces cognitive load
- Minimizes context switching
- Faster data entry for experienced users
- Clear progress indication

---

### 7. Integration with Approval Workflow
**Decision:** Reuse existing approval workflow without modifications.

**Flow:**
1. Nurse creates draft → saves with status "draft"
2. Nurse routes to doctor → status changes to "pending_approval"
3. Doctor reviews → approves or rejects
4. If approved → status "approved", ready for final submission
5. If rejected → status "rejected", returns to nurse with comments
6. Final submission → status "submitted"

**Rationale:**
- Existing workflow is well-established
- No special handling needed for driver exams
- Maintains consistency across all exam types
- Audit trail and timeline already capture all events

---

## Data Flow Diagrams

### Form Submission Flow
```
Nurse selects exam type
  ↓
System loads appropriate form component
  ↓
Nurse enters patient info + medical data
  ↓
System validates fields in real-time
  ↓
Nurse clicks "Save Draft" or "Route for Approval"
  ↓
Backend validates + saves to database
  ↓
If routed: Doctor receives notification
  ↓
Doctor reviews summary
  ↓
Doctor approves/rejects
  ↓
If approved: Available for final submission
  ↓
System changes status to "submitted"
  ↓
Record becomes read-only, visible in submissions list
```

### Component Data Flow
```
NewSubmission (parent)
  ↓ props: formData, onChange
DrivingLicenceTpFields (child)
  ↓ props: formData.section, onChange
MedicalDeclarationSection (grandchild)
  ↓ onChange('medicalDeclaration', {...})
Parent state updates
  ↓
Re-render with new formData
  ↓
Summary component receives updated formData
  ↓
Displays current state
```

---

## Database Schema Changes

### Migration Steps
1. Add new enum values to `ExamType`
2. No new tables or columns needed (uses existing structure)
3. Update seed data with sample driver exams (optional)

```prisma
enum ExamType {
  SIX_MONTHLY_MDW      @map("Six-monthly Medical Exam for Migrant Domestic Workers (MOM)")
  SIX_MONTHLY_FMW      @map("Six-monthly Medical Exam for Female Migrant Workers (MOM)")
  WORK_PERMIT          @map("Full Medical Exam for Work Permit (MOM)")
  AGED_DRIVERS         @map("Medical Exam for Aged Drivers (SPF)")
  PR_MEDICAL           @map("Medical Examination for Permanent Residency (ICA)")
  STUDENT_PASS_MEDICAL @map("Medical Examination for Student Pass (ICA)")
  LTVP_MEDICAL         @map("Medical Examination for Long Term Visit Pass (ICA)")
  DRIVING_LICENCE_TP   @map("Driving Licence Medical Examination Report (TP)")
  DRIVING_VOCATIONAL_TP_LTA @map("Driving Licence and Vocational Licence (TP & LTA)")
  VOCATIONAL_LICENCE_LTA    @map("Vocational Licence Medical Examination (LTA)")
}
```

**Backward Compatibility:**
- Existing submissions unaffected
- Existing queries continue to work
- Frontend dropdown auto-populates with new options

---

## Testing Strategy

### Unit Tests
- Validate form data structure for each exam type
- Test auto-calculation (BMI, AMT score)
- Test validation rules (exam timing, required fields)
- Test component rendering with various data states

### Integration Tests
- Create draft for each exam type
- Route for approval
- Approve/reject workflow
- View submission
- Filter/search by exam type

### E2E Tests (Cypress)
- Complete flow: login → create → save → route → approve → submit
- Test all three exam types
- Test validation error handling
- Test summary display
- Test unsaved changes warning

### Manual Testing Checklist
- [ ] Form loads correctly for each exam type
- [ ] All fields save properly
- [ ] AMT score calculates automatically
- [ ] BMI calculates automatically
- [ ] Validation errors display clearly
- [ ] Summary shows all entered data
- [ ] Approval workflow functions correctly
- [ ] View submission displays formatted data
- [ ] Mobile responsive (basic test)

---

## Performance Considerations

### Expected Load
- Assume 100-200 driver exams per day across all clinics
- Each form submission < 1MB (mostly text data)
- JSONB indexing already in place for formData queries

### Optimizations
- Lazy load form components (code splitting)
- Debounce auto-save (every 30 seconds)
- Cache doctor list in memory
- Use React.memo for heavy summary components

### Monitoring
- Track average form completion time
- Monitor database query performance for new exam types
- Alert on validation failures > 5%

---

## Security Considerations

### Data Protection
- All medical data encrypted at rest (existing)
- HTTPS for all API calls (existing)
- JWT authentication required (existing)
- Role-based access control enforced (existing)

### Audit Trail
- All form modifications logged to audit_logs table (existing)
- Track who created, modified, approved each submission
- Immutable after submission (existing pattern)

### Validation
- Server-side validation for all inputs (prevent tampering)
- NRIC/FIN validation to prevent typos
- Exam date validation to prevent backdating

---

## Rollout Plan

### Phase 1: Development (Week 1-2)
- Database schema migration
- Backend API updates
- Form component development
- Summary component development

### Phase 2: Testing (Week 2)
- Unit tests
- Integration tests
- E2E tests
- Internal QA

### Phase 3: Staging Deployment (Week 3)
- Deploy to staging environment
- User acceptance testing with pilot clinic
- Gather feedback
- Bug fixes

### Phase 4: Production Rollout (Week 4)
- Deploy to production
- Monitor for errors
- Provide support to early adopters
- Iterate based on feedback

---

## Future Enhancements (Out of Scope)

1. **Specialist Report Attachments**
   - Allow upload of DARP/DARS reports
   - Store in S3 or similar
   - Link to submission record

2. **Direct TP/LTA Integration**
   - API integration for automatic submission
   - Real-time status updates
   - Automatic receipt generation

3. **Email Notifications**
   - Automated emails to examinee
   - Submission confirmation
   - Processing status updates

4. **Advanced AMT Scoring**
   - Cognitive impairment risk assessment
   - Historical score tracking
   - Trend analysis

5. **Mobile App**
   - Native iOS/Android app
   - Offline mode
   - Push notifications

6. **Analytics Dashboard**
   - Exam type distribution
   - Average processing time
   - Approval/rejection rates
   - Specialist referral patterns
