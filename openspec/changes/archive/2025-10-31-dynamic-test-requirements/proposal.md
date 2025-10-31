# Proposal: Dynamic Test Requirements

## Problem
Currently, the system always displays all 4 medical tests (Pregnancy, Syphilis, HIV, Chest X-ray) for Six-Monthly MDW and FMW exams, regardless of which tests are actually required for a specific patient. The mock patient data in the database already contains individualized test requirements (e.g., only 25% require HIV test, only 10% require TB test), but the frontend UI and submission views don't respect these requirements.

This creates UX issues:
- Users must review all 4 tests even when only 2 are required for a patient
- Test results are collected for tests that aren't required
- Summary and view pages show irrelevant test fields
- Data validation doesn't align with actual requirements

## Proposed Solution
Implement dynamic test requirement loading throughout the submission workflow for both MDW and FMW exam types:

1. **Backend API Enhancement**: Extend the patient lookup API (`POST /patients/lookup`) to return which tests are required for a patient based on their historical data stored in `formData`
2. **Frontend Form Rendering**: Conditionally render test result fields based on the required tests returned from the patient lookup for both MDW and FMW forms
3. **Summary Pages**: Display only required tests in submission summaries and view pages for both exam types
4. **Data Validation**: Validate that only required test results are submitted

## Affected Components
- **Backend**: `patients.service.ts` (PatientInfo interface, lookupByNric method)
- **Frontend Forms**: `SixMonthlyMdwFields.tsx`, `SixMonthlyFmwFields.tsx` (both exam types)
- **Frontend Summary**: `SixMonthlyMdwSummary.tsx`, `SixMonthlyFmwSummary.tsx` (both exam types)
- **Frontend Views**: `ViewSubmission.tsx`
- **Services**: `patients.service.ts` (frontend)

## Capabilities Affected
- `submission-forms`: Form rendering logic changes to conditionally display tests for MDW and FMW
- New capability `patient-lookup`: Backend API for retrieving patient test requirements

## Benefits
- Improved UX: Users only see relevant tests for each patient
- Better data quality: No collection of unnecessary test results
- Accurate workflow: Aligns with real-world medical exam requirements
- Consistency: Database, API, and UI all respect individual patient requirements

## Risks & Mitigation
- **Risk**: Breaking existing submissions that have all 4 tests in formData
  - **Mitigation**: Maintain backward compatibility - if no requirements specified, show all tests
- **Risk**: Validation logic complexity increase
  - **Mitigation**: Use clear test requirement flags in API response
- **Risk**: Test coverage gaps
  - **Mitigation**: Add comprehensive unit and E2E tests for dynamic rendering

## Success Criteria
- Patient lookup API returns required tests array
- Frontend conditionally renders only required test fields
- Summary and view pages display only required tests
- All existing tests pass
- New tests validate dynamic test requirements
