# submission-forms Spec Delta

## ADDED Requirements

### Requirement: ICA exam type support
The system SHALL support three Immigration and Checkpoints Authority (ICA) medical examination types: Permanent Residency, Student Pass, and Long Term Visit Pass.

#### Scenario: Database schema includes ICA exam types
**Given** the Prisma schema defines ExamType enum  
**When** the schema is inspected  
**Then** the ExamType enum shall include `PR_MEDICAL` with mapping "Medical Examination for Permanent Residency (ICA)"  
**And** the ExamType enum shall include `STUDENT_PASS_MEDICAL` with mapping "Medical Examination for Student Pass (ICA)"  
**And** the ExamType enum shall include `LTVP_MEDICAL` with mapping "Medical Examination for Long Term Visit Pass (ICA)"  
**And** all three enum values shall be available for MedicalSubmission.examType field

#### Scenario: Backend accepts ICA exam types in submissions
**Given** a nurse creates a new medical submission  
**When** the examType is set to "PR_MEDICAL" or "STUDENT_PASS_MEDICAL" or "LTVP_MEDICAL"  
**Then** the backend shall accept and validate the submission  
**And** the submission shall be stored in the database  
**And** the submission shall appear in pending approvals for doctors

#### Scenario: Frontend displays ICA options in exam type selector
**Given** a nurse is on the new submission page  
**When** the exam type dropdown is opened  
**Then** the dropdown shall include option "Medical Examination for Permanent Residency (ICA)"  
**And** the dropdown shall include option "Medical Examination for Student Pass (ICA)"  
**And** the dropdown shall include option "Medical Examination for Long Term Visit Pass (ICA)"  
**And** selecting PR option shall set examType to "PR_MEDICAL"  
**And** selecting Student Pass option shall set examType to "STUDENT_PASS_MEDICAL"  
**And** selecting LTVP option shall set examType to "LTVP_MEDICAL"

---

### Requirement: ICA exam manual patient data entry
ICA exam types SHALL require manual patient data entry without automatic patient lookup, as ICA does not provide a patient lookup API.

#### Scenario: Patient lookup disabled for ICA exam types
**Given** a user has selected an ICA exam type (PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL)  
**When** the patient information section is rendered  
**Then** the patient lookup button shall NOT be displayed  
**And** the patient name field shall be a standard text input field  
**And** the patient NRIC/FIN field shall be a standard text input field  
**And** the user shall be able to manually enter patient name  
**And** the user shall be able to manually enter patient NRIC/FIN  
**And** no API call shall be made to fetch patient data

#### Scenario: Patient lookup enabled for non-ICA exam types
**Given** a user has selected a non-ICA exam type (SIX_MONTHLY_MDW, SIX_MONTHLY_FMW, WORK_PERMIT)  
**When** the patient information section is rendered  
**Then** the patient lookup button shall be displayed  
**And** clicking the button shall trigger an API call to fetch patient data  
**And** the patient name shall auto-populate if found

---

### Requirement: ICA exam form renders simplified test results
ICA exam forms SHALL display only HIV test and Chest X-ray test fields, along with an optional remarks section.

#### Scenario: ICA form component renders test results fields
**Given** a user has selected an ICA exam type  
**When** the exam-specific form section is rendered  
**Then** it shall display the IcaExamFields component  
**And** the component shall render HIV test checkbox field  
**And** the component shall render Chest X-ray checkbox field  
**And** the component shall render remarks section with checkbox trigger  
**And** the component shall NOT render pregnancy test field  
**And** the component shall NOT render syphilis test field  
**And** the component shall NOT render height/weight/BMI fields  
**And** the component shall NOT render physical examination detail fields  
**And** the component shall NOT render police report field

#### Scenario: ICA form validation requires only test result data
**Given** a user is completing an ICA exam form  
**When** the form is submitted for approval  
**Then** the system shall validate patient name is present  
**And** the system shall validate patient NRIC is present  
**And** the system shall validate examination date is present  
**And** the system shall NOT require height or weight values  
**And** the system shall NOT require pregnancy or syphilis test results  
**And** the system shall NOT require physical examination responses

#### Scenario: Single ICA component serves all three exam types
**Given** the IcaExamFields component exists  
**When** any ICA exam type is selected (PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL)  
**Then** the same IcaExamFields component shall be used  
**And** the component shall render identical fields for all three exam types  
**And** no exam-type-specific logic shall be needed within the component

---

### Requirement: ICA exam summary and view display
ICA exam submissions SHALL be displayed consistently in summary review and detail views with appropriate test result formatting.

#### Scenario: ICA summary displays test results before submission
**Given** a user is reviewing an ICA exam before submitting  
**When** the summary section is rendered  
**Then** the IcaExamSummary component shall display the HIV test result  
**And** the component shall display the Chest X-ray test result  
**And** the component shall display remarks if present  
**And** the component shall NOT display body measurements  
**And** the component shall NOT display physical examination details

#### Scenario: View submission page displays ICA exam details
**Given** a user views an ICA exam submission detail page  
**When** the page is rendered  
**Then** the exam type shall be labeled with the appropriate ICA exam type name  
**And** the IcaExamDetails component shall display HIV test result  
**And** the IcaExamDetails component shall display Chest X-ray result  
**And** the IcaExamDetails component shall display remarks if present  
**And** the page shall NOT display body measurements section  
**And** the page shall NOT display physical examination section

---

### Requirement: ICA exam display in submission lists
ICA exam submissions SHALL be displayed consistently in all submission lists with appropriate exam type labels and filtering.

#### Scenario: Submission list shows ICA exam type labels
**Given** a submission list contains ICA exam submissions  
**When** the list is rendered  
**Then** PR_MEDICAL submissions shall display "PR Medical (ICA)" or "Permanent Residency (ICA)"  
**And** STUDENT_PASS_MEDICAL submissions shall display "Student Pass (ICA)"  
**And** LTVP_MEDICAL submissions shall display "LTVP (ICA)" or "Long Term Visit Pass (ICA)"  
**And** all three ICA exam types shall be filterable in the exam type dropdown

#### Scenario: Agency formatting returns ICA for all three exam types
**Given** the formatAgency function exists in formatters.ts  
**When** the function is called with PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL  
**Then** the function shall return "ICA" for all three exam types

---

### Requirement: ICA exam type integration with existing features
ICA exam types SHALL integrate seamlessly with existing system features including approval workflow, audit logging, and filtering.

#### Scenario: ICA exam follows standard approval workflow
**Given** a nurse submits an ICA exam for approval  
**When** the submission is routed to a doctor  
**Then** the submission shall appear in the doctor's pending approvals list  
**And** the doctor shall be able to approve the submission  
**And** upon approval, the submission shall be marked as "submitted" to ICA  
**And** rejection shall return the submission to draft status  
**And** the workflow shall be identical to MOM exam workflows

#### Scenario: ICA exam appears in audit logs
**Given** an ICA exam submission is created, updated, or approved  
**When** audit log events are recorded  
**Then** the events shall include the examType (PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL)  
**And** the submission history timeline shall display ICA-specific events correctly

#### Scenario: ICA exam filtering works in all list views
**Given** the submissions list or approvals list is displayed  
**When** a user applies an exam type filter  
**Then** filtering by PR_MEDICAL shall show only PR submissions  
**And** filtering by STUDENT_PASS_MEDICAL shall show only Student Pass submissions  
**And** filtering by LTVP_MEDICAL shall show only LTVP submissions  
**And** filtering by multiple exam types shall work correctly

---

### Requirement: ICA exam type test coverage
ICA exam types SHALL have comprehensive test coverage including backend unit tests, E2E tests, and frontend unit tests.

#### Scenario: Backend unit tests validate ICA exam types
**Given** the backend test suite is executed  
**When** unit tests run  
**Then** the tests shall verify ICA submissions are created correctly for all three exam types  
**And** the tests shall verify ICA exam types are accepted in DTOs  
**And** the tests shall verify ICA filtering works in queries  
**And** test coverage shall remain at or above 95%

#### Scenario: Backend E2E tests cover ICA submission lifecycle
**Given** the backend E2E test suite is executed  
**When** E2E tests run  
**Then** tests shall verify POST /v1/submissions with PR_MEDICAL exam type  
**And** tests shall verify POST /v1/submissions with STUDENT_PASS_MEDICAL exam type  
**And** tests shall verify POST /v1/submissions with LTVP_MEDICAL exam type  
**And** tests shall verify ICA submissions can be created with only test results (no vitals)  
**And** tests shall verify GET /v1/submissions/:id retrieves ICA submissions  
**And** tests shall verify filtering by examType=PR_MEDICAL works  
**And** tests shall verify ICA submissions can be updated and soft-deleted  
**And** all E2E tests shall pass with 100% pass rate

#### Scenario: Backend E2E tests cover ICA approval workflow
**Given** the backend approval E2E test suite is executed  
**When** approval workflow tests run  
**Then** tests shall verify ICA submissions appear in pending approvals  
**And** tests shall verify ICA exam type filtering in approvals list  
**And** tests shall verify POST /v1/approvals/:id/approve for ICA submissions  
**And** tests shall verify POST /v1/approvals/:id/reject for ICA submissions  
**And** tests shall verify ICA status transitions (draft → pending_approval → submitted)

#### Scenario: Frontend unit tests validate ICA components
**Given** the frontend test suite is executed  
**When** unit tests run  
**Then** tests shall verify IcaExamFields renders HIV and Chest X-ray checkboxes  
**And** tests shall verify IcaExamFields handles state changes correctly  
**And** tests shall verify IcaExamSummary displays test results correctly  
**And** tests shall verify IcaExamDetails displays test results in read-only format  
**And** all component tests shall pass

#### Scenario: Frontend E2E tests validate ICA user workflows (optional)
**Given** frontend Cypress E2E tests exist  
**When** the test suite is executed  
**Then** tests should verify users can select ICA exam types  
**And** tests should verify patient lookup is disabled for ICA exams  
**And** tests should verify ICA form renders correctly with test results only  
**And** tests should verify ICA submissions can be submitted for approval  
**And** tests should verify ICA submissions display correctly in lists
