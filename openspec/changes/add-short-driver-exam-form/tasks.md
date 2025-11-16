# Implementation Tasks: Add Short Driver Exam Form

## Overview
These tasks implement simplified short-form driver medical examinations. Work sequentially through each task, completing tests before moving to the next. Mark tasks complete as you finish them.

---

## Phase 1: Database Schema

### Task 1.1: Add short form exam types to Prisma schema
- [ ] Open `backend/prisma/schema.prisma`
- [ ] Add three new enum values to `ExamType`:
  - `DRIVING_LICENCE_TP_SHORT        @map("Short Form: Driving Licence (TP)")`
  - `DRIVING_VOCATIONAL_TP_LTA_SHORT @map("Short Form: Driving Licence & Vocational (TP & LTA)")`
  - `VOCATIONAL_LICENCE_LTA_SHORT    @map("Short Form: Vocational Licence (LTA)")`
- [ ] Verify enum ordering (place after existing driver exam types)

**Validation:**
- Run `npx prisma format` to validate syntax
- Review the formatted schema for correctness

### Task 1.2: Generate and apply database migration
- [ ] Run `cd backend && npx prisma migrate dev --name add-short-driver-exam-types`
- [ ] Verify migration file created in `backend/prisma/migrations/`
- [ ] Review migration SQL for correctness (ALTER TYPE statement)
- [ ] Apply migration to development database

**Validation:**
- Check migration applied: `npx prisma migrate status`
- Query database: `SELECT unnest(enum_range(NULL::ExamType)) AS exam_type;` should include new types

---

## Phase 2: Backend Validation

### Task 2.1: Create short form validation module
- [ ] Create file `backend/src/submissions/validation/driver-exam-short.validation.ts`
- [ ] Implement `isShortDriverExam(examType: string): boolean` function
- [ ] Implement `validateShortDriverExam(dto: CreateSubmissionDto): void` function
- [ ] Add validations:
  - Patient NRIC required and valid format
  - Patient name required
  - Mobile number required and matches `+65XXXXXXXX` pattern
  - Examination date required
  - Purpose of exam is one of 4 valid values (AGE_65_ABOVE_TP_ONLY, AGE_65_ABOVE_TP_LTA, AGE_64_BELOW_LTA_ONLY, BAVL_ANY_AGE)
  - Fitness determination(s) required based on purpose:
    - AGE_65_ABOVE_TP_ONLY: requires fitToDriveMotorVehicle
    - AGE_65_ABOVE_TP_LTA: requires fitToDrivePublicService AND fitBusAttendant
    - AGE_64_BELOW_LTA_ONLY: requires fitToDrivePublicService AND fitBusAttendant
    - BAVL_ANY_AGE: requires fitBusAttendant only
  - Declaration confirmed (true)

**Dependencies:** None

**Validation:**
- Code compiles without errors
- Export statements are correct

### Task 2.2: Update isDriverExam helper to include short forms
- [ ] Open `backend/src/submissions/validation/driver-exam.validation.ts`
- [ ] Update `isDriverExam()` function to include three new short form types
- [ ] Verify function returns true for all 6 driver exam types (3 long + 3 short)

**Validation:**
- Function logic is correct
- No existing tests break

### Task 2.3: Write unit tests for short form validation
- [ ] Create file `backend/src/submissions/validation/driver-exam-short.validation.spec.ts`
- [ ] Test `isShortDriverExam()` returns true for short form types only
- [ ] Test `validateShortDriverExam()` passes with valid minimal data
- [ ] Test validation fails when NRIC missing → error "Patient NRIC is required"
- [ ] Test validation fails when mobile number missing → error "Mobile number is required"
- [ ] Test validation fails when mobile number invalid format → error mentions format
- [ ] Test validation fails when fitness determination missing → error mentions fitness
- [ ] Test validation fails when declaration not confirmed → error "Declaration confirmation is required"
- [ ] Test TP short form requires `fitToDrive` only
- [ ] Test combined short form requires both `fitToDrive` and `fitToDrivePublicService`
- [ ] Test LTA short form requires `fitForVocational` only
- [ ] Test short form accepts submission without height, weight, DOB, email

**Validation:**
- Run `cd backend && npm test driver-exam-short.validation.spec.ts`
- All tests pass
- Coverage > 90%

### Task 2.4: Integrate short form validation in submissions service
- [ ] Open `backend/src/submissions/submissions.service.ts`
- [ ] Import `isShortDriverExam` and `validateShortDriverExam`
- [ ] In `create()` method, add conditional routing:
  - If `isShortDriverExam(examType)`, call `validateShortDriverExam(dto)`
  - Else, use existing validation logic
- [ ] Ensure validation runs before database save

**Validation:**
- Service compiles without errors
- Existing long form submissions still work (manual test)

---

## Phase 3: Frontend Form Components

### Task 3.1: Create TP short form component with accordion structure
- [ ] Create file `frontend/src/components/submission-form/exam-forms/DrivingLicenceTpShortFields.tsx`
- [ ] Implement component with props: `formData`, `onChange`, `activeSection`, `onSectionChange`
- [ ] Import Accordion components from `@/components/ui/accordion`
- [ ] Create 3 accordion sections:

**Section 1 - Patient Information:**
  - NRIC input (required)
  - Name input (required)
  - Mobile number input with +65 prefix (required)
  - Purpose dropdown (required) with 4 options:
    1. AGE_65_ABOVE_TP_ONLY: "Age 65 and above - Renew Traffic Police Driving Licence only"
    2. AGE_65_ABOVE_TP_LTA: "Age 65 and above - Renew both Traffic Police & LTA Vocational Licence"
    3. AGE_64_BELOW_LTA_ONLY: "Age 64 and below - Renew LTA Vocational Licence only"
    4. BAVL_ANY_AGE: "Renew only Bus Attendant's Vocational Licence (BAVL) regardless of age"
  - Examination date picker (required)
  - "Continue to Overall Assessment" button

**Section 2 - Overall Assessment:**
  - Fitness question(s) that dynamically render based on selected purpose:
    - Purpose 1 (AGE_65_ABOVE_TP_ONLY): "Is the patient physically and mentally fit to drive a motor vehicle?" (Yes/No radio)
    - Purpose 2 (AGE_65_ABOVE_TP_LTA): "Is the patient physically and mentally fit to drive a public service vehicle?" AND "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?" (Yes/No radios for each)
    - Purpose 3 (AGE_64_BELOW_LTA_ONLY): "Is the patient physically and mentally fit to drive a public service vehicle?" AND "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?" (Yes/No radios for each)
    - Purpose 4 (BAVL_ANY_AGE): "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?" (Yes/No radio)
  - "Continue to Summary" button

**Section 3 - Review and Submit (Summary Page):**
  - Display summary of patient information
  - Display summary of fitness determination(s)
  - "Edit" button for each section (navigates back to accordion)
  - Declaration checkbox with text (required)
  - Standard declaration text

- [ ] Implement section validation before navigation
- [ ] Apply Tailwind styling consistent with existing forms
- [ ] Add inline validation errors for each field

**Dependencies:** Phase 1 complete (enum values exist)

**Validation:**
- Component renders without errors in dev environment
- All 3 accordion sections function correctly
- Section navigation works with validation
- Summary page displays all data correctly
- Edit button navigates back to sections

### Task 3.2: Create combined TP+LTA short form component
- [ ] Create file `frontend/src/components/submission-form/exam-forms/DrivingVocationalTpLtaShortFields.tsx`
- [ ] Implement component with same accordion structure as Task 3.1 (all 3 short form components share identical structure)
- [ ] Include the same 3 accordion sections (Patient Information, Overall Assessment, Review and Submit)
- [ ] Include the same 4-option purpose dropdown
- [ ] Include the same dynamic fitness questions based on selected purpose
- [ ] Include the same summary page with Edit functionality
- [ ] Note: All short forms use identical component structure - the purpose selection drives which fitness questions appear

**Validation:**
- Component renders correctly with 3 accordion sections
- Section navigation works properly
- Summary page functions correctly

### Task 3.3: Create LTA vocational short form component
- [ ] Create file `frontend/src/components/submission-form/exam-forms/VocationalLicenceLtaShortFields.tsx`
- [ ] Implement component with same accordion structure as Tasks 3.1 and 3.2 (all 3 short form components are identical)
- [ ] Include the same 3 accordion sections (Patient Information, Overall Assessment, Review and Submit)
- [ ] Include the same 4-option purpose dropdown
- [ ] Include the same dynamic fitness questions based on selected purpose
- [ ] Include the same summary page with Edit functionality

**Validation:**
- Component renders correctly with 3 accordion sections
- All purposes are selectable regardless of exam type chosen
- Section navigation and summary page work correctly

### Task 3.4: Integrate short form components in NewSubmission
- [ ] Open `frontend/src/components/NewSubmission.tsx`
- [ ] Import three new short form components
- [ ] Add short form exam types to exam type dropdown:
  - "Short Form: Driving Licence (TP)"
  - "Short Form: Driving Licence & Vocational (TP & LTA)"
  - "Short Form: Vocational Licence (LTA)"
- [ ] Add conditional rendering to route exam type to correct component:
  - `DRIVING_LICENCE_TP_SHORT` → `<DrivingLicenceTpShortFields />`
  - `DRIVING_VOCATIONAL_TP_LTA_SHORT` → `<DrivingVocationalTpLtaShortFields />`
  - `VOCATIONAL_LICENCE_LTA_SHORT` → `<VocationalLicenceLtaShortFields />`
- [ ] Pass `activeSection` and `onSectionChange` props to short form components
- [ ] Update `isDriverExamType()` helper to recognize short form types
- [ ] Ensure "Save as Draft" button works for short forms
- [ ] Ensure "Submit for Approval" button works for short forms
- [ ] Ensure form submission validation checks fitness determination(s) present
- [ ] Ensure form submission validation checks declaration confirmed
- [ ] Ensure navigation blocking (unsaved changes warning) works for short forms
- [ ] Ensure submission details page displays short form data correctly

**Validation:**
- Dropdown includes all exam types (13 total)
- Selecting a short form type renders the correct component with accordion
- Section navigation works (Continue buttons advance sections)
- Summary page displays with Edit capability
- Switching exam types clears form data after confirmation
- Draft save and submit for approval both work
- View submission page shows short form details correctly

---

## Phase 4: PDF Generation

### Task 4.1: Create short form PDF generator module
- [ ] Create file `backend/src/pdf/generators/short-driver-exam.generator.ts`
- [ ] Implement `generateTpShort(submission: MedicalSubmission): Buffer` function
  - Single-page layout
  - Header: clinic info, exam type title
  - Patient info table: NRIC, Name, Mobile, Purpose, Date
  - Fitness determination: "Fit to drive motor vehicle: Yes/No" (prominent)
  - Declaration: checkbox + text
  - Footer: practitioner name, signature line
- [ ] Implement `generateTpLtaShort(submission)` function (includes two fitness determinations)
- [ ] Implement `generateLtaShort(submission)` function (vocational fitness only)
- [ ] Use pdfmake `TDocumentDefinitions` format

**Dependencies:** Phase 1, Phase 2 complete

**Validation:**
- Code compiles without errors
- PDF structure definitions are valid pdfmake schemas

### Task 4.2: Integrate short form PDF generator in PDF service
- [ ] Open `backend/src/pdf/pdf.service.ts`
- [ ] Import short form generator functions
- [ ] In `generateSubmissionPdf()` method, add conditional routing:
  - If exam type is `DRIVING_LICENCE_TP_SHORT`, call `generateTpShort()`
  - If exam type is `DRIVING_VOCATIONAL_TP_LTA_SHORT`, call `generateTpLtaShort()`
  - If exam type is `VOCATIONAL_LICENCE_LTA_SHORT`, call `generateLtaShort()`
- [ ] Return generated PDF buffer

**Validation:**
- Service compiles without errors
- Routing logic is correct (no overlap with existing long form logic)

### Task 4.3: Test PDF generation manually
- [ ] Create a short form submission via frontend (each type)
- [ ] Submit for approval
- [ ] As doctor, approve submission
- [ ] Download generated PDF
- [ ] Verify PDF structure:
  - Single page
  - All patient info visible
  - Fitness determination(s) prominent
  - Declaration section present
  - No medical history/AMT/detailed exam sections

**Validation:**
- PDFs generate without errors for all 3 short form types
- PDF layout is clean and professional
- All data matches submission formData

---

## Phase 5: End-to-End Testing

### Task 5.1: Write E2E tests for short form submission workflow
- [ ] Create or update file `backend/test/short-driver-exam.e2e-spec.ts` or add to existing E2E suite
- [ ] Test: Nurse creates TP short form submission
  - POST `/v1/submissions` with minimal data → 201 Created
  - Verify submission saved with `draft` status
- [ ] Test: Nurse submits TP short form for approval
  - PATCH `/v1/submissions/:id/submit` → 200 OK
  - Verify status changes to `pending_approval`
- [ ] Test: Doctor approves TP short form
  - PATCH `/v1/submissions/:id/approve` → 200 OK
  - Verify status changes to `submitted`
- [ ] Test: Repeat for combined TP+LTA short form
- [ ] Test: Repeat for LTA vocational short form
- [ ] Test: Backend rejects short form with missing NRIC → 400 error
- [ ] Test: Backend rejects short form with missing fitness determination → 400 error
- [ ] Test: Backend accepts short form without height/weight/DOB → 201 Created

**Dependencies:** Phase 1-4 complete

**Validation:**
- Run `cd backend && npm run test:e2e`
- All new E2E tests pass
- Existing E2E tests still pass (no regression)

### Task 5.2: Write frontend integration tests (Cypress - optional)
- [ ] Create Cypress test file `frontend/cypress/e2e/short-driver-exam.cy.ts`
- [ ] Test: User selects short form exam type → form renders correctly
- [ ] Test: User fills short form with valid data → submit succeeds
- [ ] Test: User leaves fitness question blank → error displays
- [ ] Test: User unchecks declaration → error displays on submit

**Validation:**
- Run `cd frontend && npm run cypress:run` (if Cypress configured)
- All tests pass

---

## Phase 6: Documentation and Cleanup

### Task 6.1: Update project.md with short form information
- [ ] Open `openspec/project.md`
- [ ] In "Medical Exam Types" section, add note about short forms
- [ ] Update exam type count (from 10 to 13)
- [ ] Mention short form validation differences

**Validation:**
- Documentation is accurate and clear

### Task 6.2: Update README files if necessary
- [ ] Review `backend/README.md` and `frontend/README.md`
- [ ] Add any relevant notes about short forms if user-facing

**Validation:**
- READMEs are current

### Task 6.3: Run full test suite and verify no regressions
- [ ] Run backend unit tests: `cd backend && npm test`
- [ ] Run backend E2E tests: `cd backend && npm run test:e2e`
- [ ] Run frontend tests (if configured)
- [ ] Manually test existing long form submissions (all 10 original exam types)
- [ ] Verify no existing functionality broken

**Validation:**
- All tests pass
- Zero regressions in existing features
- Short forms work end-to-end

---

## Phase 7: Deployment Preparation

### Task 7.1: Create seed data for short forms (optional)
- [ ] Open `backend/prisma/seed.ts` or create separate seed script
- [ ] Add 3-5 sample short form submissions (mix of draft and submitted)
- [ ] Ensure data is realistic and valid

**Validation:**
- Run seed script: `cd backend && npx ts-node prisma/seed.ts`
- Verify short form submissions appear in database

### Task 7.2: Smoke test in staging environment
- [ ] Deploy to staging (database migration + backend + frontend)
- [ ] Create one submission of each short form type
- [ ] Submit for approval
- [ ] Approve as doctor
- [ ] Download PDFs
- [ ] Verify audit logs

**Validation:**
- All short form types work end-to-end in staging
- No errors in logs

---

## Summary Checklist

Before marking this change as complete, verify:

- [ ] All 7 phases completed
- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Database migration applied without errors
- [ ] PDF generation works for all 3 short form types
- [ ] Frontend correctly routes to short form components
- [ ] No regressions in existing long form functionality
- [ ] Code reviewed and follows project conventions
- [ ] Documentation updated (project.md)

**Estimated Effort:** 3-5 days for full implementation and testing
