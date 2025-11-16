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

---

### Requirement: ICA exam type support
The system SHALL support three new exam types for Immigration and Checkpoints Authority (ICA) medical examinations: `PR_MEDICAL`, `STUDENT_PASS_MEDICAL`, and `LTVP_MEDICAL`.

#### Scenario: Database schema includes ICA exam types
**Given** the Prisma schema defines ExamType enum  
**When** the schema is inspected  
**Then** the ExamType enum shall include `PR_MEDICAL` with mapping "Medical Examination for Permanent Residency (ICA)"  
**And** the ExamType enum shall include `STUDENT_PASS_MEDICAL` with mapping "Medical Examination for Student Pass (ICA)"  
**And** the ExamType enum shall include `LTVP_MEDICAL` with mapping "Medical Examination for Long Term Visit Pass (ICA)"  
**And** all three enum values shall be available for MedicalSubmission.examType field

#### Scenario: Backend accepts ICA exam types in submissions
**Given** a nurse creates a new medical submission  
**When** the examType is set to one of "PR_MEDICAL", "STUDENT_PASS_MEDICAL", or "LTVP_MEDICAL"  
**Then** the backend shall accept and validate the submission  
**And** the submission shall be stored in the database  
**And** the submission shall appear in pending approvals for doctors

#### Scenario: Frontend displays ICA options in exam type selector
**Given** a nurse is on the new submission page  
**When** the exam type dropdown is opened  
**Then** the dropdown shall include option "Medical Examination for Permanent Residency (ICA)"  
**And** the dropdown shall include option "Medical Examination for Student Pass (ICA)"  
**And** the dropdown shall include option "Medical Examination for Long Term Visit Pass (ICA)"  
**And** selecting any ICA option shall set the appropriate examType value

---

### Requirement: ICA exam form disables patient lookup
ICA exam forms SHALL require manual entry of patient information and SHALL NOT use the patient lookup API.

#### Scenario: ICA exam form hides patient lookup button
**Given** a user has selected any ICA exam type (PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL)  
**When** the patient information section is rendered  
**Then** the "Lookup Patient" button shall NOT be displayed  
**And** the patient name field shall be a manual text input  
**And** the patient NRIC field shall be a manual text input  
**And** no API call shall be made to fetch patient data

#### Scenario: Non-ICA exams retain patient lookup functionality
**Given** a user has selected a non-ICA exam type (e.g., SIX_MONTHLY_MDW, WORK_PERMIT)  
**When** the patient information section is rendered  
**Then** the "Lookup Patient" button shall be displayed  
**And** clicking the button shall trigger the patient lookup API call

---

### Requirement: ICA exam form renders simplified test requirements
ICA exam forms SHALL display only HIV test and Chest X-ray test fields without body measurements or other vitals.

#### Scenario: ICA form component renders test results only
**Given** a user has selected any ICA exam type (PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL)  
**When** the exam-specific form section is rendered  
**Then** it shall display the IcaExamFields component  
**And** the component shall render HIV test checkbox field with label "HIV test" and checkbox label "Positive/Reactive"  
**And** the component shall render Chest X-ray checkbox field with label "Chest X-ray to screen for TB" and checkbox label "Positive/Reactive"  
**And** the component shall render remarks section with checkbox-based input (using MdwRemarksField)  
**And** the component shall NOT render height/weight/BMI fields  
**And** the component shall NOT render blood pressure fields  
**And** the component shall NOT render pregnancy test, syphilis test, or other exam-specific fields

#### Scenario: ICA form displays HIV test note
**Given** a user is viewing an ICA exam form  
**When** the HIV test field is displayed  
**Then** a note shall be shown: "Note: HIV test must be done by an MOH-approved laboratory."

#### Scenario: ICA form validation requires only test data
**Given** a user is completing an ICA exam form  
**When** the form is submitted for approval  
**Then** the system shall validate patient name is present  
**And** the system shall validate patient NRIC is present  
**And** the system shall validate examination date is present  
**And** the system shall NOT require height, weight, or blood pressure values  
**And** the system shall NOT require physical examination responses

---

### Requirement: ICA exam declaration includes patient consent
ICA exam forms SHALL display a declaration that includes patient consent statement in addition to standard examination declaration.

#### Scenario: ICA declaration section displays patient consent
**Given** a user is reviewing an ICA exam submission summary  
**When** the declaration section is rendered  
**Then** it shall display the standard MOM declaration text  
**And** it shall additionally display: "In addition, the patient has consented to this medical examination and understands that the results will be submitted to the Immigration and Checkpoints Authority (ICA) for the purpose of their visa/residency application."  
**And** the user must check the declaration checkbox before submitting

#### Scenario: Non-ICA exams display standard declaration only
**Given** a user is reviewing a non-ICA exam submission summary (e.g., SIX_MONTHLY_MDW)  
**When** the declaration section is rendered  
**Then** it shall display only the standard MOM declaration text  
**And** it shall NOT display the ICA patient consent statement

---

### Requirement: ICA exam display in submission views
ICA exam submissions SHALL be displayed consistently in all submission lists and detail views with appropriate labels and agency attribution.

#### Scenario: Submission list shows ICA exam type labels
**Given** a submission list contains ICA exam submissions  
**When** the list is rendered  
**Then** PR_MEDICAL submissions shall display "PR Medical (ICA)" or "Permanent Residency (ICA)"  
**And** STUDENT_PASS_MEDICAL submissions shall display "Student Pass Medical (ICA)" or "Student Pass (ICA)"  
**And** LTVP_MEDICAL submissions shall display "LTVP Medical (ICA)" or "Long Term Visit Pass (ICA)"  
**And** all three exam types shall be filterable in the exam type dropdown

#### Scenario: View submission page displays ICA exam details
**Given** a user views an ICA exam submission detail page  
**When** the page is rendered  
**Then** the exam type shall display the full label (e.g., "Medical Examination for Permanent Residency")  
**And** the agency shall be displayed as "ICA" or "Immigration and Checkpoints Authority"  
**And** the test results section shall display HIV test result  
**And** the test results section shall display Chest X-ray result  
**And** the remarks section shall display remarks if present, or "-" if empty  
**And** the declaration section shall display with ICA patient consent statement  
**And** the page shall NOT display body measurements section  
**And** the page shall NOT display blood pressure section

#### Scenario: Formatters return correct agency for ICA exam types
**Given** the formatAgency utility function is called  
**When** the exam type is one of PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL  
**Then** the function shall return "ICA"  
**When** the exam type is SIX_MONTHLY_MDW, SIX_MONTHLY_FMW, or WORK_PERMIT  
**Then** the function shall return "MOM"

---

### Requirement: ICA exam type integration with existing features
ICA exam types SHALL integrate seamlessly with existing system features including approval workflow, filtering, and audit logging.

#### Scenario: ICA exam follows standard approval workflow
**Given** a nurse submits an ICA exam for approval  
**When** the submission is routed to a doctor  
**Then** the submission shall appear in the doctor's pending approvals list  
**And** the doctor shall be able to approve the submission  
**And** upon approval, the submission shall be marked as "submitted" to ICA  
**And** rejection shall return the submission to draft status

#### Scenario: ICA exam filtering works in all lists
**Given** the submissions list contains multiple exam types  
**When** a user filters by PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL  
**Then** only submissions of the selected ICA exam type shall be displayed  
**And** the filter shall work in pending approvals list  
**And** the filter shall work in submitted submissions list

#### Scenario: ICA exam appears in audit logs
**Given** an ICA exam submission is created, updated, or approved  
**When** audit log events are recorded  
**Then** the events shall include the specific examType (PR_MEDICAL, STUDENT_PASS_MEDICAL, or LTVP_MEDICAL)  
**And** the submission history timeline shall display ICA-specific events correctly

---

### Requirement: ICA exam type uses shared component
All three ICA exam types SHALL use a single shared form component to reduce code duplication and ensure consistency.

#### Scenario: Single IcaExamFields component handles all ICA exam types
**Given** the system supports PR_MEDICAL, STUDENT_PASS_MEDICAL, and LTVP_MEDICAL exam types  
**When** any ICA exam type is selected  
**Then** the same IcaExamFields component shall be rendered  
**And** the component shall handle form data for all three exam types identically  
**And** there shall NOT be separate form components for each ICA exam type

#### Scenario: ICA components are reusable across form, summary, and view
**Given** ICA exam type is implemented  
**Then** there shall be one IcaExamFields component for form input  
**And** there shall be one IcaExamSummary component for form review  
**And** there shall be one IcaExamDetails component for read-only view  
**And** all three components shall work for PR_MEDICAL, STUDENT_PASS_MEDICAL, and LTVP_MEDICAL exam types

---

### Requirement: ICA exam type test coverage
The ICA exam types SHALL have comprehensive test coverage including unit tests and E2E tests to ensure reliability.

#### Scenario: Backend unit tests validate ICA exam types
**Given** the backend test suite is executed  
**When** unit tests run  
**Then** the tests shall verify ICA submissions are created correctly  
**And** the tests shall verify all three ICA exam types are accepted in DTOs  
**And** the tests shall verify ICA filtering works in queries  
**And** test coverage shall remain at or above 95%

#### Scenario: Backend E2E tests cover ICA submission lifecycle
**Given** the backend E2E test suite is executed  
**When** E2E tests run  
**Then** tests shall verify POST /v1/submissions with PR_MEDICAL exam type returns 201  
**And** tests shall verify POST /v1/submissions with STUDENT_PASS_MEDICAL exam type returns 201  
**And** tests shall verify POST /v1/submissions with LTVP_MEDICAL exam type returns 201  
**And** tests shall verify ICA submissions can be created with only test results (no vitals)  
**And** tests shall verify GET /v1/submissions/:id retrieves ICA submissions correctly  
**And** tests shall verify filtering by examType=PR_MEDICAL works  
**And** tests shall verify ICA submissions can be updated  
**And** tests shall verify nurse approval flow for ICA submissions  
**And** all E2E tests shall pass with 100% pass rate

#### Scenario: Frontend unit tests cover ICA components
**Given** the frontend unit test suite is executed  
**When** component tests run  
**Then** tests shall verify IcaExamFields renders HIV and Chest X-ray checkboxes  
**And** tests shall verify IcaExamFields handles checkbox state changes  
**And** tests shall verify IcaExamFields renders remarks section  
**And** tests shall verify IcaExamSummary displays test results correctly  
**And** tests shall verify IcaExamSummary displays remarks when present  
**And** tests shall verify IcaExamSummary handles missing data gracefully  
**And** tests shall verify IcaExamDetails displays test results in read-only format  
**And** tests shall verify IcaExamDetails displays remarks  
**And** all frontend tests shall pass with 100% pass rate

---

### Requirement: Standardized remarks display
All exam types SHALL display remarks consistently, showing "-" when no remarks are present.

#### Scenario: Remarks display dash when empty
**Given** a user views a submission with no remarks  
**When** the submission detail page or summary is rendered  
**Then** the Remarks field shall display "-"  
**And** this behavior shall be consistent across all exam types (MDW, FMW, ICA, Work Permit, Aged Drivers)

#### Scenario: Remarks display content when present
**Given** a user views a submission with remarks "Patient has history of TB"  
**When** the submission detail page or summary is rendered  
**Then** the Remarks field shall display "Patient has history of TB"  
**And** multi-line remarks shall preserve whitespace and line breaks

---

### Requirement: Reusable declaration components
Declaration sections SHALL use reusable components to maintain consistency and reduce code duplication across exam types.

#### Scenario: Declaration component is used across exam types
**Given** the system supports multiple exam types (MDW, FMW, ICA)  
**When** the summary or view page is rendered  
**Then** MOM exam types shall use the Declaration component with MomDeclarationContent  
**And** ICA exam types shall use the Declaration component with IcaDeclarationContent  
**And** the Declaration component shall handle checkbox state for editable forms  
**And** the DeclarationView component shall display read-only declarations for submitted forms

#### Scenario: Declaration content helpers provide exam-specific text
**Given** the DeclarationContent helper module exists  
**When** MomDeclarationContent is called  
**Then** it shall return the standard MOM declaration text  
**When** IcaDeclarationContent is called  
**Then** it shall return the MOM declaration text plus ICA patient consent statement

---

### Requirement: MDW exam form renders test results dynamically
The system SHALL conditionally render test result checkboxes for Six-Monthly MDW exams based on the patient's required tests determined from their historical data.

#### Scenario: Display all required tests for MDW patient
**Given** a nurse is creating an MDW submission for a patient  
**And** the patient lookup API returns `requiredTests.hiv = true`  
**And** the patient lookup API returns `requiredTests.chestXray = true`  
**When** the MDW exam form is rendered  
**Then** the form SHALL display 4 test result checkboxes:
- Pregnancy test (always required)
- Syphilis test (always required)
- HIV test (required for this patient)
- Chest X-ray test (required for this patient)  
**And** the vitals section SHALL be unaffected

#### Scenario: Display only baseline tests for MDW patient
**Given** a nurse is creating an MDW submission for a patient  
**And** the patient lookup API returns `requiredTests.hiv = false`  
**And** the patient lookup API returns `requiredTests.chestXray = false`  
**When** the MDW exam form is rendered  
**Then** the form SHALL display ONLY 2 test result checkboxes:
- Pregnancy test
- Syphilis test  
**And** the form SHALL NOT display HIV test checkbox  
**And** the form SHALL NOT display Chest X-ray checkbox  
**And** the vitals section SHALL display height and weight fields normally

#### Scenario: New MDW patient with no history
**Given** a nurse is creating an MDW submission for a new patient  
**And** the patient has no previous submissions in the database  
**When** the MDW exam form is rendered  
**Then** the form SHALL display all 4 test result checkboxes (default behavior)  
**And** all tests SHALL be considered required

---

### Requirement: FMW exam form renders test results dynamically
The system SHALL conditionally render test result checkboxes for Six-Monthly FMW exams based on the patient's required tests determined from their historical data.

#### Scenario: Display all required tests for FMW patient
**Given** a nurse is creating an FMW submission for a patient  
**And** the patient lookup API returns `requiredTests.hiv = true`  
**And** the patient lookup API returns `requiredTests.chestXray = true`  
**When** the FMW exam form is rendered  
**Then** the form SHALL display 4 test result checkboxes:
- Pregnancy test (always required)
- Syphilis test (always required)
- HIV test (required for this patient)
- Chest X-ray test (required for this patient)

#### Scenario: Display only baseline tests for FMW patient
**Given** a nurse is creating an FMW submission for a patient  
**And** the patient lookup API returns `requiredTests.hiv = false`  
**And** the patient lookup API returns `requiredTests.chestXray = false`  
**When** the FMW exam form is rendered  
**Then** the form SHALL display ONLY 2 test result checkboxes:
- Pregnancy test
- Syphilis test  
**And** the form SHALL NOT display HIV test checkbox  
**And** the form SHALL NOT display Chest X-ray checkbox

#### Scenario: Display baseline plus HIV test only for FMW patient
**Given** a nurse is creating an FMW submission for a patient  
**And** the patient lookup API returns `requiredTests.hiv = true`  
**And** the patient lookup API returns `requiredTests.chestXray = false`  
**When** the FMW exam form is rendered  
**Then** the form SHALL display 3 test result checkboxes:
- Pregnancy test
- Syphilis test
- HIV test  
**And** the form SHALL NOT display Chest X-ray checkbox  
**And** the HIV test note about MOH-approved laboratory SHALL be visible

#### Scenario: New FMW patient with no history
**Given** a nurse is creating an FMW submission for a new patient  
**And** the patient has no previous submissions in the database  
**When** the FMW exam form is rendered  
**Then** the form SHALL display all 4 test result checkboxes (default behavior)  
**And** all tests SHALL be considered required

---

### Requirement: MDW and FMW exam display in submission views shows only required tests
The system SHALL filter displayed test results in summary and view pages to show only the tests that were required for the specific submission, for both MDW and FMW exam types.

#### Scenario: MDW summary shows only required tests
**Given** an MDW submission has been created with all 4 tests required  
**And** the submission formData contains all test results  
**When** the submission summary is displayed  
**Then** the summary SHALL show all 4 test results  
**And** vitals (height/weight) SHALL be displayed

#### Scenario: FMW summary shows only required tests
**Given** an FMW submission has been created with only Pregnancy and Syphilis tests required  
**And** the submission formData contains:
- `pregnancyTestPositive: 'false'`
- `syphilisTestPositive: 'false'`
- No `hivTestRequired` field
- No `chestXrayRequired` field  
**When** the submission summary is displayed  
**Then** the summary SHALL show ONLY:
- Pregnancy test result
- Syphilis test result  
**And** the summary SHALL NOT show HIV test result  
**And** the summary SHALL NOT show Chest X-ray result

#### Scenario: View MDW submission shows filtered tests
**Given** a user is viewing a submitted MDW medical exam  
**And** the submission formData indicates only 3 tests were required (Pregnancy, Syphilis, HIV)  
**When** the view submission page is rendered  
**Then** the page SHALL display results for 3 tests only  
**And** Chest X-ray result SHALL NOT be displayed  
**And** the page SHALL clearly indicate which tests were performed

#### Scenario: View FMW submission shows filtered tests
**Given** a user is viewing a submitted FMW medical exam  
**And** the submission formData indicates only 3 tests were required (Pregnancy, Syphilis, HIV)  
**When** the view submission page is rendered  
**Then** the page SHALL display results for 3 tests only  
**And** Chest X-ray result SHALL NOT be displayed  
**And** the page SHALL clearly indicate which tests were performed

#### Scenario: View legacy submission with all tests
**Given** a user is viewing an older submission  
**And** the submission formData does NOT contain test requirement flags  
**When** the view submission page is rendered  
**Then** the page SHALL display all 4 test results (backward compatibility)

---

### Requirement: Form data collection respects required tests for MDW and FMW
The system SHALL only collect and validate test result data for tests that are required for the specific patient, for both MDW and FMW exam types.

#### Scenario: Submit MDW form with subset of tests
**Given** a nurse has filled out an MDW form where only Pregnancy and Syphilis are required  
**And** the form displays only 2 test checkboxes  
**When** the nurse submits the form  
**Then** the formData SHALL contain only:
- `pregnancyTestPositive` field
- `syphilisTestPositive` field  
**And** the formData SHALL NOT contain `hivTestPositive` field  
**And** the formData SHALL NOT contain `chestXrayPositive` field  
**And** the submission SHALL be valid and accepted

#### Scenario: Submit FMW form with subset of tests
**Given** a nurse has filled out an FMW form where only Pregnancy and Syphilis are required  
**And** the form displays only 2 test checkboxes  
**When** the nurse submits the form  
**Then** the formData SHALL contain only:
- `pregnancyTestPositive` field
- `syphilisTestPositive` field  
**And** the formData SHALL NOT contain `hivTestPositive` field  
**And** the formData SHALL NOT contain `chestXrayPositive` field  
**And** the submission SHALL be valid and accepted

#### Scenario: Validation allows omitting non-required tests for MDW
**Given** an MDW submission being created has only 2 required tests  
**When** the form validation runs  
**Then** validation SHALL NOT require `hivTestPositive` data  
**And** validation SHALL NOT require `chestXrayPositive` data  
**And** the form SHALL be considered complete with only required test data

#### Scenario: Validation allows omitting non-required tests for FMW
**Given** an FMW submission being created has only 2 required tests  
**When** the form validation runs  
**Then** validation SHALL NOT require `hivTestPositive` data  
**And** validation SHALL NOT require `chestXrayPositive` data  
**And** the form SHALL be considered complete with only required test data

---

### Requirement: PDF generation for approved submissions
The system SHALL provide secure server-side PDF generation for approved or submitted medical examination submissions, with access control matching submission viewing permissions.

#### Scenario: Authorized user downloads PDF for approved submission
**Given** a user is viewing an approved or submitted medical exam  
**And** the user has permission to view this submission  
**When** the user clicks the "Download PDF" button  
**Then** the system shall generate a PDF document on the server  
**And** the PDF shall be downloaded to the user's device  
**And** the PDF filename shall be `submission-{id}.pdf` format  
**And** the PDF shall contain all submission details visible in the view page

#### Scenario: PDF contains complete submission information
**Given** a user downloads a PDF for a medical submission  
**When** the PDF is generated  
**Then** the PDF shall include:
- goCheckUp branding header with exam type and reference number
- Patient information (name, NRIC/FIN, date of birth, sex)
- Body measurements (height, weight, BMI with category) for applicable exam types
- All exam-specific test results and findings
- Remarks section if remarks exist
- Medical practitioner declaration with doctor name and date
**And** the content shall match the information displayed in ViewSubmission page  
**And** the layout shall be professional and suitable for official records

#### Scenario: PDF generation supports all exam types
**Given** a user downloads a PDF  
**When** the submission is of any supported exam type  
**Then** the system shall generate exam-type specific content:
- Six-monthly MDW: Pregnancy, Syphilis, HIV, Chest X-ray tests (as required)
- Six-monthly FMW: Pregnancy, Syphilis, HIV, Chest X-ray tests (as required)
- Full Medical: HIV, Syphilis, TB, Chest X-ray tests
- ICA (PR/Student/LTVP): HIV, Chest X-ray tests
- Driver TP: Vision acuity, hearing, diabetes, other conditions
- Driver TP+LTA: Combined TP and LTA fields
- Driver LTA only: Vocational license specific fields

#### Scenario: Unauthorized user cannot download PDF
**Given** a user attempts to download a PDF for a submission  
**And** the user does not have permission to view this submission  
**When** the user makes a request to the PDF endpoint  
**Then** the system shall return a 403 Forbidden error  
**And** no PDF shall be generated

#### Scenario: PDF generation fails gracefully
**Given** a user attempts to download a PDF  
**When** PDF generation encounters an error  
**Then** the system shall log the error with submission details  
**And** the user shall see an error message indicating generation failed  
**And** the system shall not expose internal error details to the user

#### Scenario: PDF generation performance
**Given** a user requests a PDF download  
**When** the PDF is generated  
**Then** generation shall complete within 30 seconds (timeout threshold)  
**And** typical generation time shall be 100-500ms  
**And** memory usage shall be approximately 10-20MB per PDF generation

#### Scenario: PDF button only shown for appropriate submission states
**Given** a user is viewing a medical submission  
**When** the submission is in draft or pending_approval state  
**Then** the "Download PDF" button SHALL NOT be visible  
**When** the submission is in approved or submitted state  
**Then** the "Download PDF" button SHALL be visible  
**And** the button shall be clearly labeled and accessible


