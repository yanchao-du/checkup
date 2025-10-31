# Implementation Tasks

**Change ID:** add-fmw-exam-type  
**Status:** Completed  
**Assignee:** Development Team

---

## Task Checklist

### 1. Database Schema Update
- [x] Add `SIX_MONTHLY_FMW` to ExamType enum in `backend/prisma/schema.prisma` with mapping "Six-monthly Medical Exam for Female Migrant Workers (MOM)"
- [x] Create Prisma migration: `npx prisma migrate dev --name add_fmw_exam_type`
- [x] Verify migration runs successfully in local dev environment
- [x] **Validation**: Run `npx prisma db push` and confirm no errors

### 2. Backend Type Definitions
- [x] Verify DTOs in `backend/src/submissions/dto/submission.dto.ts` already support string examType (no changes needed)
- [x] Check that backend tests reference ExamType values and update if needed
- [x] **Validation**: Run `npm test` in backend and ensure no type errors

### 3. Frontend Type Updates
- [x] Update ExamType union in `frontend/src/types/api.ts` to include `'SIX_MONTHLY_FMW'`
- [x] Update ExamType in `frontend/src/services/api.ts` to include `'SIX_MONTHLY_FMW'`
- [x] **Validation**: Run `npm run build` in frontend and confirm TypeScript compiles

### 4. Frontend Form Component
- [x] Create `frontend/src/components/submission-form/exam-forms/SixMonthlyFmwFields.tsx`
  - Import CheckboxField component
  - Render pregnancy test checkbox
  - Render syphilis test checkbox
  - Render HIV test checkbox
  - Render chest X-ray checkbox with TB note
  - Accept formData and onChange props
- [x] Update `frontend/src/components/NewSubmission.tsx`:
  - Add FMW option to examTypes array: `{ value: 'SIX_MONTHLY_FMW', label: 'Six-monthly Medical Exam for Female Migrant Worker (MOM)' }`
  - Add conditional rendering for SixMonthlyFmwFields in exam-specific section
  - Update patient NRIC lookup logic to include FMW (should already work for 'SIX_MONTHLY_MDW' || 'WORK_PERMIT')
  - Update validation logic to exclude height/weight requirements for FMW
- [x] **Validation**: Manually test creating an FMW exam in dev environment

### 5. Frontend Display Updates
- [x] Update `frontend/src/components/ViewSubmission.tsx`:
  - Add case for 'SIX_MONTHLY_FMW' in exam type label display (line ~185)
  - Add conditional rendering for FMW test results section (similar to MDW, line ~263)
  - Add case for agency information display (line ~410)
- [x] Update `frontend/src/components/SubmissionsList.tsx`:
  - Add SelectItem for FMW in exam type filter (line ~111)
  - Add case for FMW in exam type display cell (line ~168)
- [x] Update `frontend/src/components/PendingApprovals.tsx`:
  - Verify formatExamType utility handles FMW (check and update if needed)
- [x] Update `frontend/src/lib/formatters.ts`:
  - Add case for 'SIX_MONTHLY_FMW' in formatExamType function
  - Add case for 'SIX_MONTHLY_FMW' in formatAgency function
- [x] **Validation**: Manually verify FMW submissions display correctly in all lists

### 6. Backend Unit Tests
- [x] Update validation tests if needed (DTOs should already pass)
- [x] Add test case in relevant service specs to verify FMW submissions are handled correctly
- [x] Verify exam type filtering includes FMW in query results
- [x] **Validation**: Run `npm test` in backend and ensure all unit tests pass (95%+ coverage maintained)

### 7. Backend E2E Tests
- [x] Add FMW test cases to `backend/test/submissions.e2e-spec.ts`:
  - Test POST /v1/submissions with examType='SIX_MONTHLY_FMW' returns 201
  - Test creating FMW submission with only test results (no height/weight)
  - Test GET /v1/submissions/:id returns FMW submission correctly
  - Test GET /v1/submissions?examType=SIX_MONTHLY_FMW filters correctly
  - Test updating FMW submission (PUT /v1/submissions/:id)
  - Test deleting FMW submission (soft delete)
- [x] Add FMW test cases to `backend/test/approvals.e2e-spec.ts`:
  - Test GET /v1/approvals includes FMW submissions in pending list
  - Test GET /v1/approvals?examType=SIX_MONTHLY_FMW filters correctly
  - Test POST /v1/approvals/:id/approve for FMW submission
  - Test POST /v1/approvals/:id/reject for FMW submission
  - Verify FMW submission status transitions (draft → pending_approval → submitted)
- [x] Add FMW test case to `backend/test/auth.e2e-spec.ts` or relevant auth tests if exam type permissions are tested
- [x] **Validation**: Run `npm run test:e2e` in backend and ensure all E2E tests pass (100% pass rate)

### 8. Frontend Cypress E2E Tests (Optional but Recommended)
- [x] Add FMW test cases to Cypress specs if frontend E2E tests exist:
  - Test selecting FMW exam type in NewSubmission form
  - Test FMW form renders only test results section
  - Test submitting FMW exam for approval
  - Test FMW submission appears in SubmissionsList with correct label
  - Test viewing FMW submission detail page
- [x] **Validation**: Run `npm run test:e2e` in frontend (if Cypress tests exist)

### 9. Manual Integration Testing
- [x] Run frontend dev server and backend together
- [x] Create a new FMW exam submission end-to-end:
  - Select FMW exam type
  - Enter patient details with NRIC lookup
  - Fill in test results only (no height/weight)
  - Route for approval
- [x] Approve FMW submission as doctor
- [x] Verify FMW submission appears correctly in all lists
- [x] Test edge cases:
  - FMW submission without assigned doctor
  - FMW submission rejection flow
  - Reopening rejected FMW submission
  - Filtering FMW submissions in all list views
- [x] **Validation**: Complete workflow works without errors

### 10. Documentation & Cleanup
- [x] Update seed data in `backend/prisma/seed.ts` to include sample FMW submission (optional but recommended for dev/test environments)
- [x] Verify no console errors or warnings in browser during manual testing
- [x] Verify no TypeScript errors: `npm run build` in both frontend and backend
- [x] Run full test suite:
  - Backend unit tests: `cd backend && npm test`
  - Backend E2E tests: `cd backend && npm run test:e2e`
  - Frontend build: `cd frontend && npm run build`
  - Frontend Cypress (if exists): `cd frontend && npm run test:e2e`
- [x] Check test coverage reports:
  - Backend coverage should remain ≥95%
  - No uncovered branches for FMW-specific code paths
- [x] **Validation**: All tests pass, clean build with zero errors, coverage maintained

---

## Dependencies
- None (standalone addition)

## Rollback Plan
- If issues arise, run `npx prisma migrate rollback` to revert database migration
- Remove FMW enum value from schema and revert code changes

## Notes
- FMW exam reuses existing CheckboxField components, no new field components needed
- Patient lookup behavior should mirror SIX_MONTHLY_MDW (auto-fetch name by NRIC)
- No changes to approval workflow logic required
- Form validation should explicitly check exam type to exclude height/weight for FMW
