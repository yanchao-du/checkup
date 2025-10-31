# submission-forms Specification

## Purpose
TBD - created by archiving change refactor-submission-form. Update Purpose after archive.
## Requirements
### Requirement: Accordion-based form organization
The system SHALL use an accordion UI pattern to organize medical examination form fields into collapsible sections for improved usability and maintainability.

#### Scenario: User views exam form with accordion sections
**Given** a nurse or doctor has selected an exam type  
**When** the medical examination details form is displayed  
**Then** the form shall contain accordion sections for:
- Common Vitals (height, weight, blood pressure)
- Exam-Specific Fields (conditional based on exam type)
- Additional Remarks (free text)

**And** all accordion sections shall be expanded by default  
**And** users can collapse/expand individual sections  
**And** the accordion shall support multiple sections open simultaneously

---

### Requirement: Reusable form field components
Form fields SHALL be implemented as reusable, self-contained components with built-in validation logic to reduce code duplication and improve maintainability.

#### Scenario: HeightField component handles validation
**Given** a user is entering height data  
**When** the HeightField component is rendered  
**Then** it shall accept only numeric input (2-3 digits)  
**And** it shall validate the value is between 10 and 300 cm  
**And** it shall display validation errors below the input field  
**And** it shall clear errors when the user starts editing

#### Scenario: WeightField component handles validation
**Given** a user is entering weight data  
**When** the WeightField component is rendered  
**Then** it shall accept only numeric input (1-3 digits)  
**And** it shall validate the value is between 1 and 500 kg  
**And** it shall display validation errors below the input field  
**And** it shall clear errors when the user starts editing

#### Scenario: BloodPressureField component handles compound validation
**Given** a user is entering blood pressure data  
**When** the BloodPressureField component is rendered  
**Then** it shall display two input fields (systolic and diastolic)  
**And** systolic shall validate values between 50 and 250 mmHg  
**And** diastolic shall validate values between 30 and 150 mmHg  
**And** it shall display individual error messages for each field  
**And** it shall maintain side-by-side layout with descriptive labels

---

### Requirement: Exam-type specific form components
Each exam type SHALL have a dedicated form component that renders only the relevant fields for that examination type.

#### Scenario: Six-Monthly MDW form renders specific fields
**Given** a user has selected "SIX_MONTHLY_MDW" as the exam type  
**When** the exam-specific accordion section is rendered  
**Then** it shall display the SixMonthlyMdwFields component  
**And** the component shall render PregnancyTestField  
**And** the component shall render ChestXrayField  
**And** no other exam-type fields shall be visible

#### Scenario: Work Permit form renders specific fields
**Given** a user has selected "WORK_PERMIT" as the exam type  
**When** the exam-specific accordion section is rendered  
**Then** it shall display the WorkPermitFields component  
**And** the component shall render HivTestField  
**And** the component shall render TbTestField  
**And** no other exam-type fields shall be visible

#### Scenario: Aged Drivers form renders specific fields
**Given** a user has selected "AGED_DRIVERS" as the exam type  
**When** the exam-specific accordion section is rendered  
**Then** it shall display the AgedDriversFields component  
**And** the component shall render VisualAcuityField  
**And** the component shall render HearingTestField  
**And** the component shall render DiabetesField  
**And** no other exam-type fields shall be visible

---

### Requirement: Component-level validation
Form field components SHALL encapsulate their own validation logic, eliminating the need for centralized validation state management for basic field rules.

#### Scenario: Field component manages its own error state
**Given** a form field component with validation rules  
**When** the user enters invalid data and blurs the field  
**Then** the component shall validate the input  
**And** the component shall display an error message if validation fails  
**And** the component shall notify the parent of the error state  
**And** the error shall clear when valid input is entered

---

### Requirement: Pregnancy test visual indicator
The pregnancy test field for Six-Monthly MDW exams SHALL provide clear visual feedback when a positive result is indicated.

#### Scenario: Pregnancy test shows visual indicator for positive result
**Given** a user is completing a Six-Monthly MDW exam form  
**When** the PregnancyTestField checkbox is checked  
**Then** the label text "Positive" shall be displayed in orange color  
**And** the label shall be displayed in bold font weight  
**And** the field shall return the value 'Positive'  
**When** the checkbox is unchecked  
**Then** the field shall return the value 'Negative'

---

### Requirement: Organized component file structure
Form components SHALL be organized in a clear directory structure that separates field components from exam-specific form components.

#### Scenario: Component directory structure supports maintainability
**Given** the submission form codebase  
**Then** field components shall be located in `components/submission-form/fields/`  
**And** exam-specific form components shall be located in `components/submission-form/exam-forms/`  
**And** each component shall be in its own file with a descriptive name  
**And** the main NewSubmission component shall import from these directories

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

