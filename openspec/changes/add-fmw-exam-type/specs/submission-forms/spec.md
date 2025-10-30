## ADDED Requirements

### Requirement: Six-Monthly FMW exam type support
The system SHALL support a new exam type `SIX_MONTHLY_FMW` for Six-monthly Medical Examination for Female Migrant Workers submitted to MOM.

#### Scenario: Database schema includes FMW exam type
**Given** the Prisma schema defines ExamType enum  
**When** the schema is inspected  
**Then** the ExamType enum shall include `SIX_MONTHLY_FMW` with mapping "Six-monthly Medical Exam for Female Migrant Workers (MOM)"  
**And** the enum value shall be available for MedicalSubmission.examType field

#### Scenario: Backend accepts FMW exam type in submissions
**Given** a nurse creates a new medical submission  
**When** the examType is set to "SIX_MONTHLY_FMW"  
**Then** the backend shall accept and validate the submission  
**And** the submission shall be stored in the database  
**And** the submission shall appear in pending approvals for doctors

#### Scenario: Frontend displays FMW option in exam type selector
**Given** a nurse is on the new submission page  
**When** the exam type dropdown is opened  
**Then** the dropdown shall include option "Six-monthly Medical Exam for Female Migrant Worker (MOM)"  
**And** selecting this option shall set examType to "SIX_MONTHLY_FMW"

---

### Requirement: FMW exam form renders test results only
The FMW exam form SHALL display only the test results section without body measurements or physical examination details.

#### Scenario: FMW form component renders test results fields
**Given** a user has selected "SIX_MONTHLY_FMW" as the exam type  
**When** the exam-specific form section is rendered  
**Then** it shall display the SixMonthlyFmwFields component  
**And** the component shall render pregnancy test checkbox field  
**And** the component shall render syphilis test checkbox field  
**And** the component shall render HIV test checkbox field  
**And** the component shall render chest X-ray checkbox field  
**And** the component shall NOT render height/weight/BMI fields  
**And** the component shall NOT render physical examination detail fields  
**And** the component shall NOT render police report field

#### Scenario: FMW form validation requires only test result data
**Given** a user is completing an FMW exam form  
**When** the form is submitted for approval  
**Then** the system shall validate patient name is present  
**And** the system shall validate patient NRIC is present  
**And** the system shall validate examination date is present  
**And** the system shall NOT require height or weight values  
**And** the system shall NOT require physical examination responses

---

### Requirement: FMW exam display in submission views
FMW exam submissions SHALL be displayed consistently in all submission lists and detail views with appropriate labels.

#### Scenario: Submission list shows FMW exam type label
**Given** a submission list contains an FMW exam submission  
**When** the list is rendered  
**Then** the exam type column shall display "FMW Six-monthly (MOM)" or "Female Migrant Worker (MOM)"  
**And** the exam type shall be filterable in the exam type dropdown

#### Scenario: View submission page displays FMW exam details
**Given** a user views an FMW exam submission detail page  
**When** the page is rendered  
**Then** the exam type shall be labeled "Six-monthly Medical Exam for Female Migrant Worker"  
**And** the test results section shall display pregnancy test result  
**And** the test results section shall display syphilis test result  
**And** the test results section shall display HIV test result  
**And** the test results section shall display chest X-ray result  
**And** the page shall NOT display body measurements section  
**And** the page shall NOT display physical examination section

---

### Requirement: FMW exam type integration with existing features
The FMW exam type SHALL integrate seamlessly with existing system features including patient lookup, approval workflow, and audit logging.

#### Scenario: Patient NRIC lookup works for FMW exams
**Given** a user is creating an FMW exam submission  
**When** a valid NRIC is entered  
**Then** the system shall attempt to fetch the patient name from the API  
**And** the patient name shall auto-populate if found  
**And** the system shall NOT auto-populate height or weight (as FMW form has no such fields)

#### Scenario: FMW exam follows standard approval workflow
**Given** a nurse submits an FMW exam for approval  
**When** the submission is routed to a doctor  
**Then** the submission shall appear in the doctor's pending approvals list  
**And** the doctor shall be able to approve the submission  
**And** upon approval, the submission shall be marked as "submitted" to MOM  
**And** rejection shall return the submission to draft status

#### Scenario: FMW exam appears in audit logs
**Given** an FMW exam submission is created, updated, or approved  
**When** audit log events are recorded  
**Then** the events shall include the examType "SIX_MONTHLY_FMW"  
**And** the submission history timeline shall display FMW-specific events correctly

---

### Requirement: FMW exam type test coverage
The FMW exam type SHALL have comprehensive test coverage including unit tests and E2E tests to ensure reliability.

#### Scenario: Backend unit tests validate FMW exam type
**Given** the backend test suite is executed  
**When** unit tests run  
**Then** the tests shall verify FMW submissions are created correctly  
**And** the tests shall verify FMW exam type is accepted in DTOs  
**And** the tests shall verify FMW filtering works in queries  
**And** test coverage shall remain at or above 95%

#### Scenario: Backend E2E tests cover FMW submission lifecycle
**Given** the backend E2E test suite is executed  
**When** E2E tests run  
**Then** tests shall verify POST /v1/submissions with SIX_MONTHLY_FMW exam type  
**And** tests shall verify FMW submissions can be created with only test results (no vitals)  
**And** tests shall verify GET /v1/submissions/:id retrieves FMW submissions  
**And** tests shall verify filtering by examType=SIX_MONTHLY_FMW works  
**And** tests shall verify FMW submissions can be updated and soft-deleted  
**And** all E2E tests shall pass with 100% pass rate

#### Scenario: Backend E2E tests cover FMW approval workflow
**Given** the backend approval E2E test suite is executed  
**When** approval workflow tests run  
**Then** tests shall verify FMW submissions appear in pending approvals  
**And** tests shall verify FMW exam type filtering in approvals list  
**And** tests shall verify POST /v1/approvals/:id/approve for FMW submissions  
**And** tests shall verify POST /v1/approvals/:id/reject for FMW submissions  
**And** tests shall verify FMW status transitions (draft → pending_approval → submitted)

#### Scenario: Frontend E2E tests validate FMW user workflows (optional)
**Given** frontend Cypress E2E tests exist  
**When** the test suite is executed  
**Then** tests should verify users can select FMW exam type  
**And** tests should verify FMW form renders correctly with test results only  
**And** tests should verify FMW submissions can be submitted for approval  
**And** tests should verify FMW submissions display correctly in lists
