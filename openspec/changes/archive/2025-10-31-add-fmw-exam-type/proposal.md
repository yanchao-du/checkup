# Proposal: Add Female Migrant Worker Exam Type

## Overview
Add a new exam type `SIX_MONTHLY_FMW` (Six-monthly Medical Examination for Female Migrant Worker) to the system. This exam type is similar to `SIX_MONTHLY_MDW` but includes only the essential test results section (pregnancy, syphilis, HIV, chest X-ray for TB screening) without body measurements or physical examination details.

## Motivation
- Support clinics in submitting female migrant worker medical examinations to MOM
- Reuse existing UI components and backend infrastructure
- Maintain consistency with current exam type patterns while providing a simplified form for FMW exams

## Scope

### In Scope
- Database schema update to add `SIX_MONTHLY_FMW` to ExamType enum
- Backend validation and DTOs to support the new exam type
- **Backend unit tests** for FMW exam type handling
- **Backend E2E tests** for FMW submission CRUD operations and approval workflow
- Frontend type definitions and exam type selection
- New FMW-specific form component with test results only
- View submission page rendering for FMW exams
- Filtering and display of FMW exams in submission lists
- **Frontend Cypress E2E tests** for FMW user workflows (optional)
- Seed data updates with sample FMW submissions for dev/test environments

### Out of Scope
- Changes to existing exam types (SIX_MONTHLY_MDW, WORK_PERMIT, AGED_DRIVERS)
- Modifications to approval workflow logic
- Agency-specific submission rules beyond what exists

## Technical Approach
1. **Database**: Add `SIX_MONTHLY_FMW` enum value to Prisma schema's ExamType
2. **Backend**: No DTO changes needed (string validation already supports any ExamType)
3. **Frontend**: 
   - Add to ExamType union types
   - Create `SixMonthlyFmwFields.tsx` component (reuses CheckboxField for test results)
   - Update NewSubmission to conditionally render FMW fields
   - Update ViewSubmission to display FMW exam data
   - Update formatters and filter dropdowns

## Dependencies
- None (standalone addition)

## Risks & Mitigation
- **Risk**: Form validation might not properly handle absence of height/weight fields
  - **Mitigation**: Explicitly check exam type in validation logic (already done for SIX_MONTHLY_MDW)
- **Risk**: Summary view might assume all exams have body measurements
  - **Mitigation**: Conditional rendering based on exam type (existing pattern)

## Success Criteria
- ✅ Database migration runs successfully
- ✅ Backend accepts and stores FMW exam submissions
- ✅ **Backend unit tests pass with ≥95% coverage maintained**
- ✅ **Backend E2E tests cover FMW CRUD operations and approval workflow**
- ✅ Frontend displays FMW option in exam type dropdown
- ✅ FMW form renders only test results section
- ✅ FMW submissions appear in lists with correct exam type label
- ✅ **Frontend Cypress tests cover FMW user workflows (if applicable)**
- ✅ TypeScript compilation succeeds with no errors
- ✅ No regressions in existing exam types
- ✅ **All test suites pass (unit + E2E) with 100% pass rate**

## Related Changes
- None (net-new capability)

## Reviewers
- [ ] Backend engineer (schema and DTO review)
- [ ] Frontend engineer (component and UX review)
- [ ] QA (E2E test coverage)
