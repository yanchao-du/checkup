# Implementation Tasks

## Phase 1: Database & Backend (2 days)

### Task 1.1: Update Database Schema
- [ ] Add three new enum values to `ExamType` in `backend/prisma/schema.prisma`:
  - `DRIVING_LICENCE_TP @map("Driving Licence Medical Examination Report (TP)")`
  - `DRIVING_VOCATIONAL_TP_LTA @map("Driving Licence and Vocational Licence (TP & LTA)")`
  - `VOCATIONAL_LICENCE_LTA @map("Vocational Licence Medical Examination (LTA)")`
- [ ] Create Prisma migration: `npx prisma migrate dev --name add-driver-exam-types`
- [ ] Apply migration to development database
- [ ] Verify enum values in database

**Validation:** Query database to confirm new enum values exist

---

### Task 1.2: Update Backend Types
- [ ] Update `ExamType` type in `backend/src/submissions/dto/create-submission.dto.ts`
- [ ] Update `ExamType` export in `backend/src/common/types.ts` (if exists)
- [ ] Ensure TypeScript compilation succeeds with new enum values

**Validation:** Run `npm run build` in backend, check for type errors

---

### Task 1.3: Add Validation Rules
- [ ] Create `validateDriverExamTiming()` function in `backend/src/submissions/validation/`
  - Check examination date is within 2 months before patient's birthday
  - Return appropriate error message if validation fails
- [ ] Create `validateDriverExamFormData()` function
  - Validate AMT required for TP exams
  - Validate LTA vocational required for LTA exams
  - Validate medical declaration required for all driver exams
  - Validate medical history required for all driver exams
  - Validate assessment required for all driver exams
- [ ] Integrate validation into `CreateSubmissionDto` validation pipeline
- [ ] Add unit tests for validation functions

**Validation:** Unit tests pass, invalid data rejected with clear error messages

---

### Task 1.4: Update Submissions Service
- [ ] Update `SubmissionsService.create()` to handle new exam types
- [ ] Ensure formData JSONB structure supports driver exam fields
- [ ] Add helper method `isDriverExam(examType)` to check if exam is driver-related
- [ ] Test creating submissions with each new exam type

**Validation:** Create test submissions via API, verify stored correctly in database

---

### Task 1.5: Backend Testing
- [ ] Add E2E tests in `backend/test/submissions.e2e-spec.ts`
  - Test creating draft with `DRIVING_LICENCE_TP`
  - Test creating draft with `DRIVING_VOCATIONAL_TP_LTA`
  - Test creating draft with `VOCATIONAL_LICENCE_LTA`
  - Test validation errors for missing required fields
  - Test exam timing validation
- [ ] Run all backend tests: `npm run test:e2e`
- [ ] Fix any failing tests

**Validation:** All E2E tests pass

---

## Phase 2: Frontend Shared Components (2 days)

### Task 2.1: Create CommonMedicalFields Component
- [ ] Create `frontend/src/components/submission-form/fields/CommonMedicalFields.tsx`
- [ ] Include fields: height, weight, BMI (auto-calculated), blood pressure, pulse
- [ ] Reuse existing field components where possible
- [ ] Add prop types for formData and onChange
- [ ] Add inline validation and error display
- [ ] Style consistently with existing forms

**Validation:** Component renders correctly, auto-calculations work, validation fires

---

### Task 2.2: Create MedicalDeclarationSection Component
- [ ] Create `frontend/src/components/submission-form/fields/MedicalDeclarationSection.tsx`
- [ ] Add checkbox group for 6-month medical occurrences:
  - Loss of consciousness
  - Seizures/fits
  - Sudden dizziness/fainting
  - Chest pain/discomfort
  - Breathlessness
  - Alcohol/substance abuse
  - Psychiatric condition
  - Other (with text field)
- [ ] Default all to unchecked
- [ ] Add "Clear all" helper button
- [ ] Store in formData.medicalDeclaration object

**Validation:** All checkboxes functional, data saves correctly, "Clear all" works

---

### Task 2.3: Create MedicalHistorySection Component
- [ ] Create `frontend/src/components/submission-form/fields/MedicalHistorySection.tsx`
- [ ] Add checkbox group for medical history:
  - Cardiovascular disease
  - Neurological disorder
  - Psychiatric condition
  - Diabetes
  - Vision problems
  - Hearing problems
  - Musculoskeletal disorder
  - Other (with text field)
- [ ] Default all to unchecked
- [ ] Add "All normal" helper button (unchecks all)
- [ ] Store in formData.medicalHistory object

**Validation:** All checkboxes functional, data saves correctly, "All normal" works

---

### Task 2.4: Create AbbreviatedMentalTestSection Component
- [ ] Create `frontend/src/components/submission-form/fields/AbbreviatedMentalTestSection.tsx`
- [ ] Add 10 AMT questions as checkboxes:
  1. Age
  2. Time (to nearest hour)
  3. Address for recall (give address, ask later)
  4. Year
  5. Name of place/building
  6. Recognition of two persons
  7. Date of birth
  8. Year of World War I
  9. Name of current national leader
  10. Count backwards from 20 to 1
- [ ] Auto-calculate score (1 point per correct answer)
- [ ] Display score prominently: "Score: X/10"
- [ ] Show warning if score < 8: "Low AMT score may indicate cognitive impairment"
- [ ] Add "All passed" helper button (checks all 10)
- [ ] Store in formData.amt object with individual question results and total score

**Validation:** Auto-calculation works, warning displays correctly, helper button functional

---

### Task 2.5: Create LtaVocationalSection Component
- [ ] Create `frontend/src/components/submission-form/fields/LtaVocationalSection.tsx`
- [ ] Add fields for LTA vocational licence requirements:
  - Color vision (dropdown: Pass/Fail)
  - Peripheral vision (dropdown: Pass/Fail)
  - Night vision (dropdown: Pass/Fail)
  - Cardiac condition (text field)
  - Respiratory condition (text field)
  - Renal condition (text field)
  - Endocrine condition (text field)
  - Fit for vocational duty (Yes/No radio)
  - Restrictions (textarea)
- [ ] Store in formData.ltaVocational object
- [ ] Add tooltips for medical terminology

**Validation:** All fields render, data saves correctly, tooltips display

---

### Task 2.6: Create AssessmentSection Component
- [ ] Create `frontend/src/components/submission-form/fields/AssessmentSection.tsx`
- [ ] Add fields:
  - Fit to drive (Yes/No radio) - for TP exams
  - Fit for vocational licence (Yes/No radio) - for LTA exams
  - Requires specialist review (Yes/No radio)
  - Specialist type (text field, shown if requires review = Yes)
  - Medical practitioner remarks (textarea, 500 char limit)
- [ ] Conditionally show fields based on exam type
- [ ] Store in formData.assessment object
- [ ] Add character counter for remarks

**Validation:** Conditional rendering works, character counter accurate, data saves

---

## Phase 3: Frontend Form Components (2 days)

### Task 3.1: Create DrivingLicenceTpFields Component
- [ ] Create `frontend/src/components/submission-form/exam-forms/DrivingLicenceTpFields.tsx`
- [ ] Import and use shared components:
  - CommonMedicalFields
  - VisualAcuityField (reuse from AgedDriversFields)
  - HearingTestField (reuse from AgedDriversFields)
  - MedicalDeclarationSection
  - MedicalHistorySection
  - AbbreviatedMentalTestSection
  - AssessmentSection (TP mode only)
- [ ] Organize in accordion sections:
  - General Medical Examination
  - Medical Declaration
  - Medical History
  - Abbreviated Mental Test
  - Assessment
- [ ] Add props: formData, onChange
- [ ] Auto-expand next section when current is complete

**Validation:** Form renders, all sections functional, auto-expand works

---

### Task 3.2: Create DrivingVocationalTpLtaFields Component
- [ ] Create `frontend/src/components/submission-form/exam-forms/DrivingVocationalTpLtaFields.tsx`
- [ ] Import and use shared components (same as 3.1 plus):
  - LtaVocationalSection
  - AssessmentSection (TP + LTA mode)
- [ ] Organize in accordion sections:
  - General Medical Examination
  - Medical Declaration
  - Medical History
  - Abbreviated Mental Test (TP)
  - LTA Vocational Licence Medical Details
  - Assessment
- [ ] Add props: formData, onChange
- [ ] Auto-expand next section when current is complete

**Validation:** Form renders, all sections functional, auto-expand works

---

### Task 3.3: Create VocationalLicenceLtaFields Component
- [ ] Create `frontend/src/components/submission-form/exam-forms/VocationalLicenceLtaFields.tsx`
- [ ] Import and use shared components:
  - CommonMedicalFields
  - VisualAcuityField
  - HearingTestField
  - MedicalDeclarationSection
  - MedicalHistorySection
  - LtaVocationalSection
  - AssessmentSection (LTA mode only, no AMT)
- [ ] Organize in accordion sections:
  - General Medical Examination
  - Medical Declaration
  - Medical History
  - LTA Vocational Licence Medical Details
  - Assessment
- [ ] Add props: formData, onChange
- [ ] Auto-expand next section when current is complete

**Validation:** Form renders without AMT section, all other sections functional

---

### Task 3.4: Integrate Forms into NewSubmission Component
- [ ] Update `frontend/src/components/NewSubmission.tsx`:
  - Add new exam types to `examTypes` dropdown array
  - Import new form components
  - Add conditional rendering logic in form section:
    ```tsx
    {examType === 'DRIVING_LICENCE_TP' && <DrivingLicenceTpFields formData={formData} onChange={handleFormDataChange} />}
    {examType === 'DRIVING_VOCATIONAL_TP_LTA' && <DrivingVocationalTpLtaFields formData={formData} onChange={handleFormDataChange} />}
    {examType === 'VOCATIONAL_LICENCE_LTA' && <VocationalLicenceLtaFields formData={formData} onChange={handleFormDataChange} />}
    ```
- [ ] Test switching between exam types
- [ ] Verify formData resets correctly when exam type changes

**Validation:** All three forms load correctly from NewSubmission, no console errors

---

### Task 3.5: Add Frontend Validation
- [ ] Create validation helper `isDriverExam(examType)` in `frontend/src/lib/utils.ts`
- [ ] Add validation for exam timing in NewSubmission:
  - Check examination date within 2 months before birthday
  - Display error message if validation fails
- [ ] Add validation for required sections:
  - AMT required for TP exams
  - LTA vocational required for LTA exams
  - Assessment required for all
- [ ] Prevent save/submit if validation fails
- [ ] Display error toast with specific validation message

**Validation:** Validation fires correctly, error messages clear, submission blocked when invalid

---

## Phase 4: Summary & View Components (2 days)

### Task 4.1: Create DrivingLicenceTpSummary Component
- [ ] Create `frontend/src/components/submission-form/summary/DrivingLicenceTpSummary.tsx`
- [ ] Display all form data in organized sections:
  - Patient Information
  - General Medical Examination (height, weight, BMI, BP, pulse, vision, hearing)
  - Medical Declaration (show only checked items)
  - Medical History (show only checked items)
  - Abbreviated Mental Test (display score prominently, show individual results)
  - Assessment (fit to drive decision, remarks)
- [ ] Style consistently with existing summary components
- [ ] Add props: formData, patientInfo, examinationDate

**Validation:** Summary displays all entered data accurately, formatting clean

---

### Task 4.2: Create DrivingVocationalTpLtaSummary Component
- [ ] Create `frontend/src/components/submission-form/summary/DrivingVocationalTpLtaSummary.tsx`
- [ ] Display all form data (same as 4.1 plus):
  - LTA Vocational Licence Medical Details
  - Fit for vocational licence decision
- [ ] Style consistently
- [ ] Add props: formData, patientInfo, examinationDate

**Validation:** Summary displays all entered data including LTA section, formatting clean

---

### Task 4.3: Create VocationalLicenceLtaSummary Component
- [ ] Create `frontend/src/components/submission-form/summary/VocationalLicenceLtaSummary.tsx`
- [ ] Display all form data (no AMT section):
  - Patient Information
  - General Medical Examination
  - Medical Declaration
  - Medical History
  - LTA Vocational Licence Medical Details
  - Assessment
- [ ] Style consistently
- [ ] Add props: formData, patientInfo, examinationDate

**Validation:** Summary displays correctly without AMT, all other data shown

---

### Task 4.4: Integrate Summary into NewSubmission
- [ ] Update `frontend/src/components/NewSubmission.tsx` summary section
- [ ] Add conditional rendering for new summary components:
  ```tsx
  {examType === 'DRIVING_LICENCE_TP' && <DrivingLicenceTpSummary ... />}
  {examType === 'DRIVING_VOCATIONAL_TP_LTA' && <DrivingVocationalTpLtaSummary ... />}
  {examType === 'VOCATIONAL_LICENCE_LTA' && <VocationalLicenceLtaSummary ... />}
  ```
- [ ] Test "Review & Submit" flow
- [ ] Verify declaration checkbox appears and functions
- [ ] Test back navigation from summary

**Validation:** Summary displays when clicking "Review & Submit", can navigate back, declaration works

---

### Task 4.5: Create View Components
- [ ] Create `frontend/src/components/submission-view/DrivingLicenceTpDetails.tsx`
- [ ] Create `frontend/src/components/submission-view/DrivingVocationalTpLtaDetails.tsx`
- [ ] Create `frontend/src/components/submission-view/VocationalLicenceLtaDetails.tsx`
- [ ] Each component displays read-only formatted data
- [ ] Include all sections from summary plus:
  - Submission status badge
  - Submitted date/time
  - Submitted by (doctor name)
  - Approval timeline (if applicable)
- [ ] Style consistently with existing view components

**Validation:** View components display submitted data correctly, read-only, well formatted

---

### Task 4.6: Integrate View into ViewSubmission Component
- [ ] Update `frontend/src/components/ViewSubmission.tsx`
- [ ] Add conditional rendering for new view components
- [ ] Test viewing submitted driver exams
- [ ] Verify all data displays correctly
- [ ] Test with different submission statuses (draft, pending, approved, rejected, submitted)

**Validation:** Can view all three exam types, data accurate, status displays correctly

---

## Phase 5: Testing & Quality Assurance (2 days)

### Task 5.1: Unit Tests
- [ ] Add tests for `CommonMedicalFields` component
- [ ] Add tests for `MedicalDeclarationSection` component
- [ ] Add tests for `MedicalHistorySection` component
- [ ] Add tests for `AbbreviatedMentalTestSection` component (test auto-calculation)
- [ ] Add tests for `LtaVocationalSection` component
- [ ] Add tests for `AssessmentSection` component
- [ ] Add tests for validation helpers
- [ ] Run `npm test` in frontend, ensure all pass

**Validation:** All unit tests pass, code coverage > 70%

---

### Task 5.2: Integration Tests
- [ ] Test complete flow for DRIVING_LICENCE_TP:
  - Create draft
  - Save draft
  - Route for approval
  - Doctor approves
  - Final submission
  - View submission
- [ ] Test complete flow for DRIVING_VOCATIONAL_TP_LTA
- [ ] Test complete flow for VOCATIONAL_LICENCE_LTA
- [ ] Test rejection flow (doctor rejects, nurse edits, re-submits)
- [ ] Test validation error handling
- [ ] Test unsaved changes warning

**Validation:** All integration scenarios work end-to-end without errors

---

### Task 5.3: E2E Tests (Cypress)
- [ ] Create `frontend/cypress/e2e/driver-exams.cy.ts`
- [ ] Add test: "Create and submit TP driving licence exam"
  - Login as nurse
  - Select DRIVING_LICENCE_TP
  - Fill all required fields
  - Complete AMT
  - Save draft
  - Route to doctor
  - Login as doctor
  - Approve submission
  - Verify status updated
- [ ] Add test: "Create and submit TP+LTA exam"
- [ ] Add test: "Create and submit LTA vocational exam"
- [ ] Add test: "Validation errors prevent submission"
- [ ] Add test: "AMT score calculates correctly"
- [ ] Run Cypress tests: `npm run cypress:run`

**Validation:** All E2E tests pass

---

### Task 5.4: Manual Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test responsive design on tablet and mobile (basic check)
- [ ] Test keyboard navigation (tab through all fields)
- [ ] Test screen reader compatibility (basic check)
- [ ] Test with realistic data from Medical Examination Report Guide
- [ ] Test edge cases:
  - Very long text in remarks field
  - Minimum/maximum values for vitals
  - Special characters in text fields
  - Past/future examination dates
- [ ] Create manual testing checklist document

**Validation:** No critical bugs found, UX smooth, no console errors

---

### Task 5.5: Performance Testing
- [ ] Test form load time with network throttling
- [ ] Test auto-save performance (should not lag)
- [ ] Test with 100+ submissions in database (check query performance)
- [ ] Monitor bundle size impact of new components
- [ ] Ensure Lighthouse score > 90 for performance

**Validation:** Performance acceptable, no noticeable lag, bundle size increase < 50KB

---

## Phase 6: Documentation & Deployment (1 day)

### Task 6.1: Update Documentation
- [ ] Update `README.md` with new exam types
- [ ] Update API documentation for new ExamType values
- [ ] Document form field mappings in `docs/features/`
- [ ] Add screenshots of new forms to documentation
- [ ] Document validation rules for driver exams

**Validation:** Documentation complete, accurate, includes examples

---

### Task 6.2: Migration Guide
- [ ] Create migration runbook for production deployment
- [ ] Document rollback procedure if needed
- [ ] Test migration on staging database
- [ ] Verify no data loss during migration

**Validation:** Migration tested successfully on staging

---

### Task 6.3: Staging Deployment
- [ ] Deploy backend to staging
- [ ] Run Prisma migration on staging database
- [ ] Deploy frontend to staging
- [ ] Smoke test all three exam types on staging
- [ ] UAT with stakeholders (if applicable)
- [ ] Fix any bugs found in staging

**Validation:** Staging deployment successful, no critical issues

---

### Task 6.4: Production Deployment
- [ ] Create deployment checklist
- [ ] Schedule deployment window (low-traffic period)
- [ ] Backup production database
- [ ] Deploy backend to production
- [ ] Run Prisma migration on production
- [ ] Deploy frontend to production
- [ ] Verify health checks pass
- [ ] Smoke test production with test accounts
- [ ] Monitor error logs for 24 hours
- [ ] Communicate deployment to users

**Validation:** Production deployment successful, no errors, users can access new exam types

---

### Task 6.5: Post-Deployment Monitoring
- [ ] Monitor application logs for errors
- [ ] Track usage metrics for new exam types
- [ ] Gather user feedback
- [ ] Create backlog of enhancement requests
- [ ] Schedule retrospective meeting with team

**Validation:** No critical issues, usage tracking setup, feedback mechanism in place

---

## Summary

**Total Tasks:** 35
**Estimated Duration:** 11 days
**Dependencies:** Sequential by phase, some tasks within phases can be parallelized

**Critical Path:**
1. Database schema (Task 1.1) → Backend validation (Task 1.3) → Form components (Phase 3) → Integration (Task 3.4) → Summary (Phase 4) → Testing (Phase 5) → Deployment (Phase 6)

**Parallelizable Work:**
- Shared components (Task 2.1-2.6) can be built in parallel
- Form components (Task 3.1-3.3) can be built in parallel after shared components done
- Summary components (Task 4.1-4.3) can be built in parallel
- Tests (Task 5.1-5.3) can run concurrently

**Risk Mitigation:**
- Start with database and backend to unblock frontend work early
- Build shared components first to maximize reuse
- Test incrementally rather than waiting until end
- Use feature flags if needed to deploy without exposing to users initially
