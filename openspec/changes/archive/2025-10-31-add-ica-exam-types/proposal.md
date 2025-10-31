# Add ICA Exam Types

## Why
Currently, CheckUp supports only MOM and SPF exam types (migrant workers, work permits, aged drivers). The system needs to support medical examinations required by the Immigration and Checkpoints Authority (ICA) for visa and residency applications. These ICA exams have different requirements:
- No automatic patient data lookup (all data manually entered)
- Simpler test requirements (HIV + Chest X-ray only)
- Different remarks structure (checkbox-based like MDW)

This change enables clinics to handle ICA medical examinations alongside existing MOM/SPF exams, expanding the system's capability to cover all major Singapore government medical exam types.

## What Changes
- Add 3 new exam types to `ExamType` enum:
  - `PR_MEDICAL` - Medical Examination for Permanent Residency (ICA)
  - `STUDENT_PASS_MEDICAL` - Medical Examination for Student Pass (ICA)
  - `LTVP_MEDICAL` - Medical Examination for Long Term Visit Pass (ICA)
- Create new form component `IcaExamFields.tsx` for all 3 ICA exam types (shared component)
- Create summary component `IcaExamSummary.tsx` for form review
- Create view component `IcaExamDetails.tsx` for submitted exam display
- Update frontend to disable patient lookup API for ICA exams (manual entry only)
- Update backend to handle ICA exam types in submissions, approvals, and filtering
- Add comprehensive tests (backend unit, E2E, frontend unit tests)

## Impact
**Affected specs:**
- `submission-forms` - Add 3 new exam types with manual patient entry and simplified test requirements

**Affected code:**
- Backend:
  - `backend/prisma/schema.prisma` - Add 3 enum values
  - `backend/prisma/seed.ts` - Add sample ICA submissions
  - Backend tests - Add ICA test cases
- Frontend:
  - `frontend/src/types/api.ts` - Add ICA exam types to union
  - `frontend/src/components/NewSubmission.tsx` - Add ICA exam options, disable patient lookup
  - `frontend/src/components/submission-form/exam-forms/IcaExamFields.tsx` - New component
  - `frontend/src/components/submission-form/summary/IcaExamSummary.tsx` - New component
  - `frontend/src/components/submission-view/IcaExamDetails.tsx` - New component
  - `frontend/src/lib/formatters.ts` - Add ICA formatting
  - Frontend tests - Add ICA test cases

**Breaking changes:** None - additive only

## Success Criteria
- All 3 ICA exam types available in exam type dropdown
- Patient name and NRIC are manual input fields (no API lookup) for ICA exams
- ICA exam forms render HIV test + Chest X-ray checkboxes
- ICA exam forms include remarks section with checkbox (like MDW)
- ICA exams follow standard approval workflow (draft → pending_approval → submitted)
- All tests pass (backend 95%+ coverage, E2E 100% pass rate)
- OpenSpec validation passes with `--strict` flag
