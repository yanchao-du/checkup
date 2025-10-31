# Tasks: Dynamic Test Requirements

## Backend Changes

### Task 1: Update Patient Lookup Endpoint to POST
- [ ] Change `GET /patients/lookup` to `POST /patients/lookup` in `backend/src/patients/patients.controller.ts`
- [ ] Create DTO for request body with `nric` field
- [ ] Add validation for NRIC format in request body
- [ ] Update controller to accept body parameter instead of query parameter

**Validation**: API accepts POST requests with JSON body

### Task 2: Update PatientInfo Interface
- [ ] Add `requiredTests` property to `PatientInfo` interface in `backend/src/patients/patients.service.ts`
- [ ] Define structure with `pregnancy`, `syphilis`, `hiv`, `chestXray` boolean fields
- [ ] Update JSDoc comments to document new field

**Validation**: TypeScript compilation succeeds

### Task 3: Extract Test Requirements from formData
- [ ] Modify `lookupByNric` method to parse `formData` JSON
- [ ] Extract `hivTestRequired` field (default to `true` if missing)
- [ ] Extract `chestXrayRequired` field (default to `true` if missing)
- [ ] Set `pregnancy` and `syphilis` to always `true` for FMW exams
- [ ] Return populated `requiredTests` in PatientInfo response

**Validation**: Unit test verifies correct extraction from sample formData

### Task 4: Add Backend Unit Tests
- [ ] Create test cases for formData with all test requirements
- [ ] Create test cases for formData with partial requirements (only HIV)
- [ ] Create test cases for formData with no test requirement fields
- [ ] Create test case for patient with no history (returns null)
- [ ] Verify backward compatibility with existing data

**Validation**: `npm test` passes all new tests

---

## Frontend Service Layer

### Task 5: Update Frontend API Call to Use POST
- [ ] Change `patientsApi.getByNric()` to use `axios.post()` instead of `axios.get()`
- [ ] Pass NRIC in request body `{ nric: "XXX" }` instead of query params
- [ ] Update error handling for POST request

**Validation**: Frontend successfully calls POST endpoint

### Task 6: Update Frontend PatientInfo Interface
- [ ] Update `PatientInfo` interface in `frontend/src/services/patients.service.ts`
- [ ] Add `requiredTests` property matching backend structure
- [ ] Update JSDoc comments

**Validation**: TypeScript compilation succeeds

---

## Frontend Form Components

### Task 7: Add Required Tests State to NewSubmission
- [ ] Add `requiredTests` state variable with default values (all true)
- [ ] Update patient lookup effect to populate `requiredTests` from API response
- [ ] Pass `requiredTests` to `SixMonthlyFmwFields` component
- [ ] Pass `requiredTests` to `SixMonthlyMdwFields` component (for consistency)
- [ ] Reset `requiredTests` when exam type changes or NRIC is cleared

**Validation**: React dev tools show state updates correctly

### Task 8: Update SixMonthlyFmwFields for Conditional Rendering
- [ ] Accept `requiredTests` prop in component interface
- [ ] Conditionally render Pregnancy test checkbox (always show for FMW)
- [ ] Conditionally render Syphilis test checkbox (always show for FMW)
- [ ] Conditionally render HIV test checkbox based on `requiredTests.hiv`
- [ ] Conditionally render Chest X-ray checkbox based on `requiredTests.chestXray`
- [ ] Update note about HIV test to show only when HIV test is required

**Validation**: Component renders only required tests in Storybook/dev

### Task 9: Update SixMonthlyMdwFields for Conditional Rendering
- [ ] Accept `requiredTests` prop in component interface
- [ ] Apply same conditional rendering logic as FMW fields
- [ ] Ensure vitals section remains unaffected

**Validation**: Component renders only required tests in Storybook/dev

---

## Frontend Summary & View Components

### Task 10: Update SixMonthlyFmwSummary Component
- [ ] Accept `requiredTests` prop (extract from formData if viewing existing submission)
- [ ] Filter displayed test results to only show required tests
- [ ] Ensure Pregnancy and Syphilis always show
- [ ] Conditionally show HIV based on requirement
- [ ] Conditionally show Chest X-ray based on requirement

**Validation**: Summary displays only 2-4 tests depending on requirements

### Task 11: Update SixMonthlyMdwSummary Component
- [ ] Apply same filtering logic as FmwSummary
- [ ] Maintain vitals display logic

**Validation**: Summary displays only required tests

### Task 12: Update ViewSubmission Component
- [ ] Extract test requirements from submission formData when displaying
- [ ] Pass requirements to summary components
- [ ] Handle legacy submissions (all tests shown if no requirement flags)

**Validation**: View page shows correct tests for various patients

---

## Testing

### Task 13: Add Frontend Component Tests
- [ ] Test `SixMonthlyFmwFields` with all tests required
- [ ] Test `SixMonthlyFmwFields` with only Pregnancy + Syphilis
- [ ] Test `SixMonthlyFmwFields` with Pregnancy + Syphilis + HIV
- [ ] Test `SixMonthlyFmwFields` with all tests required
- [ ] Test summary component filtering

**Validation**: `npm test` passes in frontend

### Task 14: Add E2E Tests
- [ ] Create Cypress test: lookup patient with all tests required
- [ ] Create Cypress test: lookup patient with only 2 tests required
- [ ] Create Cypress test: lookup patient with 3 tests required
- [ ] Verify form shows correct number of test checkboxes
- [ ] Verify submission saves correctly with varying requirements
- [ ] Verify view page displays correct tests

**Validation**: `npm run cypress:run` passes all tests

### Task 15: Manual Testing with Seeded Data
- [ ] Test with multiple seeded patients (varying requirements)
- [ ] Verify 25% of patients show HIV test
- [ ] Verify 10% of patients show Chest X-ray test
- [ ] Test editing existing submissions maintains requirements
- [ ] Test creating new submission for new patient (all tests shown)

**Validation**: Manual verification checklist complete

---

## Documentation

### Task 16: Update Feature Documentation
- [ ] Document dynamic test requirements in relevant feature docs
- [ ] Update PATIENT_SEED_README.md to explain test requirements
- [ ] Add API documentation for `requiredTests` field

**Validation**: Documentation reviewed and approved

---

## Deployment Sequence
1. Backend changes (Tasks 1-4) - Low risk, includes API change to POST
2. Frontend service layer (Tasks 5-6) - Update API call to POST, no UI impact
3. Frontend forms (Tasks 7-9) - User-visible changes
4. Frontend views (Tasks 10-12) - User-visible changes
5. Testing (Tasks 13-15) - Validation
6. Documentation (Task 16) - Final step
