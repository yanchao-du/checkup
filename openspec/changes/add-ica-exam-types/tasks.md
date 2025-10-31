# Implementation Tasks

**Change ID:** add-ica-exam-types  
**Status:** Not Started  
**Assignee:** Development Team

---

## Task Checklist

### 1. Database Schema Update
- [ ] Add `PR_MEDICAL`, `STUDENT_PASS_MEDICAL`, and `LTVP_MEDICAL` to ExamType enum in `backend/prisma/schema.prisma` with appropriate @map labels
- [ ] Create Prisma migration: `npx prisma migrate dev --name add_ica_exam_types`
- [ ] Verify migration runs successfully in local dev environment
- [ ] **Validation**: Run `npx prisma db push` and confirm no errors

### 2. Backend Type Definitions
- [ ] Verify DTOs in `backend/src/submissions/dto/submission.dto.ts` already support string examType (no changes needed)
- [ ] Check that backend tests reference ExamType values and update if needed
- [ ] **Validation**: Run `npm test` in backend and ensure no type errors

### 3. Frontend Type Updates
- [ ] Update ExamType union in `frontend/src/types/api.ts` to include all 3 ICA exam types
- [ ] Update ExamType in `frontend/src/services/api.ts` to include all 3 ICA exam types
- [ ] **Validation**: Run `npm run build` in frontend and confirm TypeScript compiles

### 4. Frontend Form Component
- [ ] Create `frontend/src/components/submission-form/exam-forms/IcaExamFields.tsx`
  - Import CheckboxField component for test results
  - Import MdwRemarksField component for remarks section
  - Render HIV test checkbox (label: "HIV test", checkboxLabel: "Positive")
  - Render Chest X-ray checkbox (label: "Chest X-ray to screen for TB", checkboxLabel: "Positive")
  - Render remarks section using MdwRemarksField with appropriate label
  - Accept formData and onChange props
  - Component should work for all 3 ICA exam types (PR, Student Pass, LTVP)
- [ ] **Validation**: Manually test rendering IcaExamFields in dev environment

### 5. Frontend Summary Component
- [ ] Create `frontend/src/components/submission-form/summary/IcaExamSummary.tsx`
  - Display test results (HIV and Chest X-ray)
  - Display remarks if present
  - Follow same pattern as SixMonthlyMdwSummary and SixMonthlyFmwSummary
  - Accept formData prop
- [ ] Create `frontend/src/components/submission-form/summary/IcaDeclarationSection.tsx`
  - Implement ICA-specific declaration text (to be provided separately)
  - Accept declarationChecked and onDeclarationChange props
  - Follow same structure as existing DeclarationSection component
- [ ] **Validation**: Manually test summary displays correctly

### 6. Frontend View Component
- [ ] Create `frontend/src/components/submission-view/IcaExamDetails.tsx`
  - Display test results in read-only format
  - Display remarks if present
  - Follow same pattern as SixMonthlyMdwDetails and SixMonthlyFmwDetails
  - Accept submission prop
- [ ] **Validation**: Manually test view displays correctly for submitted exams

### 7. Update NewSubmission Component
- [ ] Add 3 ICA exam type options to examTypes array in `frontend/src/components/NewSubmission.tsx`:
  - `{ value: 'PR_MEDICAL', label: 'Medical Examination for Permanent Residency (ICA)' }`
  - `{ value: 'STUDENT_PASS_MEDICAL', label: 'Medical Examination for Student Pass (ICA)' }`
  - `{ value: 'LTVP_MEDICAL', label: 'Medical Examination for Long Term Visit Pass (ICA)' }`
- [ ] Detect ICA exam types and disable patient lookup API call
  - Create helper: `const isIcaExam = ['PR_MEDICAL', 'STUDENT_PASS_MEDICAL', 'LTVP_MEDICAL'].includes(examType)`
  - Conditionally hide "Lookup Patient" button for ICA exams
  - Render patient name and NRIC as manual input fields (no API retrieval)
- [ ] Add conditional rendering for IcaExamFields in exam-specific section
- [ ] Update form validation to handle ICA exam requirements (no height/weight, only test results)
- [ ] **Validation**: Manually test creating each ICA exam type in dev environment

### 8. Update Summary Section in NewSubmission
- [ ] Add conditional rendering for IcaExamSummary in the summary/review section
- [ ] Add conditional rendering for IcaDeclarationSection (for ICA exams only)
- [ ] Keep existing DeclarationSection for non-ICA exam types
- [ ] Ensure ICA exam summary displays correctly before submission
- [ ] **Validation**: Manually test summary for all 3 ICA exam types

### 9. Frontend Display Updates
- [ ] Update `frontend/src/components/ViewSubmission.tsx`:
  - Add cases for all 3 ICA exam types in exam type label display
  - Add conditional rendering for IcaExamDetails component
- [ ] Update `frontend/src/components/SubmissionsList.tsx`:
  - Add SelectItems for all 3 ICA exam types in exam type filter
  - Add cases for ICA exam types in exam type display cell
- [ ] Update `frontend/src/components/PendingApprovals.tsx`:
  - Verify formatExamType utility handles ICA exam types (check and update if needed)
- [ ] Update `frontend/src/lib/formatters.ts`:
  - Add cases for all 3 ICA exam types in formatExamType function
  - Add cases for all 3 ICA exam types in formatAgency function (should return "ICA")
- [ ] **Validation**: Manually verify ICA submissions display correctly in all lists and views

### 10. Backend Unit Tests
- [ ] Add test cases for ICA exam types in relevant service specs
- [ ] Verify exam type filtering includes all 3 ICA exam types in query results
- [ ] Test that ICA submissions are validated correctly (no height/weight required)
- [ ] **Validation**: Run `npm test` in backend and ensure all unit tests pass (95%+ coverage maintained)

### 11. Backend E2E Tests
- [ ] Add ICA exam type test cases to `backend/test/submissions.e2e-spec.ts`:
  - Test POST /v1/submissions with examType='PR_MEDICAL' returns 201
  - Test POST /v1/submissions with examType='STUDENT_PASS_MEDICAL' returns 201
  - Test POST /v1/submissions with examType='LTVP_MEDICAL' returns 201
  - Test creating ICA submissions with only test results (no height/weight/vitals)
  - Test GET /v1/submissions/:id returns ICA submissions correctly
  - Test GET /v1/submissions?examType=PR_MEDICAL filters correctly
  - Test updating ICA submissions (PUT /v1/submissions/:id)
  - Test deleting ICA submissions (soft delete)
- [ ] Add ICA exam type test cases to `backend/test/approvals.e2e-spec.ts`:
  - Test GET /v1/approvals includes ICA submissions in pending list
  - Test GET /v1/approvals?examType=PR_MEDICAL filters correctly
  - Test POST /v1/approvals/:id/approve for ICA submissions
  - Test POST /v1/approvals/:id/reject for ICA submissions
  - Verify ICA submission status transitions (draft → pending_approval → submitted)
- [ ] **Validation**: Run `npm run test:e2e` in backend and ensure all E2E tests pass (100% pass rate)

### 12. Frontend Unit Tests
- [ ] Create `frontend/src/components/submission-form/exam-forms/IcaExamFields.test.tsx`
  - Test component renders HIV test checkbox
  - Test component renders Chest X-ray checkbox
  - Test component renders remarks section
  - Test checkbox state changes trigger onChange callback
  - Test remarks input triggers onChange callback
- [ ] Create `frontend/src/components/submission-form/summary/IcaExamSummary.test.tsx`
  - Test summary displays HIV test result correctly
  - Test summary displays Chest X-ray result correctly
  - Test summary displays remarks when present
  - Test summary handles missing data gracefully
- [ ] Create `frontend/src/components/submission-form/summary/IcaDeclarationSection.test.tsx`
  - Test declaration checkbox renders
  - Test declaration text displays correctly
  - Test checkbox state changes trigger callback
- [ ] Create `frontend/src/components/submission-view/IcaExamDetails.test.tsx`
  - Test details view displays HIV test result
  - Test details view displays Chest X-ray result
  - Test details view displays remarks
  - Test details view handles missing data
- [ ] **Validation**: Run `npm test` in frontend and ensure all tests pass

### 13. Frontend Cypress E2E Tests (Optional but Recommended)
- [ ] Add ICA exam type test cases to Cypress specs:
  - Test selecting PR_MEDICAL exam type in NewSubmission form
  - Test ICA form renders with manual patient entry (no lookup button)
  - Test ICA form renders HIV + Chest X-ray test checkboxes
  - Test submitting ICA exam for approval
  - Test ICA submission appears in SubmissionsList with correct label
  - Test viewing ICA submission detail page
  - Test filtering by ICA exam types in lists
- [ ] **Validation**: Run `npm run test:e2e` in frontend (if Cypress tests exist)

### 14. Manual Integration Testing
- [ ] Run frontend dev server and backend together
- [ ] Create a new PR_MEDICAL exam submission end-to-end:
  - Select PR_MEDICAL exam type
  - Verify patient lookup button is hidden
  - Manually enter patient name and NRIC
  - Fill in exam date
  - Fill in HIV test and Chest X-ray test results
  - Add remarks (optional)
  - Route for approval
- [ ] Repeat for STUDENT_PASS_MEDICAL and LTVP_MEDICAL exam types
- [ ] Approve ICA submission as doctor
- [ ] Verify ICA submission appears correctly in all lists
- [ ] Test edge cases:
  - ICA submission without assigned doctor
  - ICA submission rejection flow
  - Reopening rejected ICA submission
  - Filtering ICA submissions in all list views
- [ ] **Validation**: Complete workflow works without errors for all 3 ICA exam types

### 15. Documentation & Cleanup
- [ ] Update seed data in `backend/prisma/seed.ts` to include sample ICA submissions (optional but recommended)
- [ ] Verify no console errors or warnings in browser during manual testing
- [ ] Verify no TypeScript errors: `npm run build` in both frontend and backend
- [ ] Run full test suite:
  - Backend unit tests: `cd backend && npm test`
  - Backend E2E tests: `cd backend && npm run test:e2e`
  - Frontend unit tests: `cd frontend && npm test`
  - Frontend build: `cd frontend && npm run build`
  - Frontend Cypress (if exists): `cd frontend && npm run test:e2e`
- [ ] Check test coverage reports:
  - Backend coverage should remain ≥95%
  - No uncovered branches for ICA-specific code paths
- [ ] **Validation**: All tests pass, clean build with zero errors, coverage maintained

### 16. OpenSpec Validation
- [ ] Run `openspec validate add-ica-exam-types --strict`
- [ ] Fix any validation issues reported
- [ ] **Validation**: OpenSpec validation passes with zero errors

---

## Dependencies
- None (standalone addition similar to add-fmw-exam-type)

## Rollback Plan
- If issues arise, run `npx prisma migrate rollback` to revert database migration
- Remove ICA enum values from schema and revert code changes
- Delete IcaExamFields.tsx, IcaExamSummary.tsx, IcaExamDetails.tsx components

## Notes
- All 3 ICA exam types share the same form component (IcaExamFields.tsx) because they have identical field requirements
- Patient lookup is disabled for ICA exams - all patient data must be manually entered
- ICA exams require only HIV and Chest X-ray tests (simpler than MOM exams)
- Remarks section reuses existing MdwRemarksField component
- Form validation should explicitly check exam type to exclude height/weight/vitals for ICA exams
- ICA exams follow the same approval workflow as MOM exams (no special handling needed)
