# submission-forms Specification Delta

## MODIFIED Requirements

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

---

### Requirement: FMW exam form renders test results dynamically
The system SHALL conditionally render test result checkboxes for Six-Monthly FMW exams based on the patient's required tests determined from their historical data.

#### Scenario: Display all required tests for patient
**Given** a nurse is creating a submission for a patient  
**And** the patient lookup API returns `requiredTests.hiv = true`  
**And** the patient lookup API returns `requiredTests.chestXray = true`  
**When** the FMW exam form is rendered  
**Then** the form SHALL display 4 test result checkboxes:
- Pregnancy test (always required)
- Syphilis test (always required)
- HIV test (required for this patient)
- Chest X-ray test (required for this patient)

#### Scenario: Display only baseline tests
**Given** a nurse is creating a submission for a patient  
**And** the patient lookup API returns `requiredTests.hiv = false`  
**And** the patient lookup API returns `requiredTests.chestXray = false`  
**When** the FMW exam form is rendered  
**Then** the form SHALL display ONLY 2 test result checkboxes:
- Pregnancy test
- Syphilis test  
**And** the form SHALL NOT display HIV test checkbox  
**And** the form SHALL NOT display Chest X-ray checkbox

#### Scenario: Display baseline plus HIV test only
**Given** a nurse is creating a submission for a patient  
**And** the patient lookup API returns `requiredTests.hiv = true`  
**And** the patient lookup API returns `requiredTests.chestXray = false`  
**When** the FMW exam form is rendered  
**Then** the form SHALL display 3 test result checkboxes:
- Pregnancy test
- Syphilis test
- HIV test  
**And** the form SHALL NOT display Chest X-ray checkbox  
**And** the HIV test note about MOH-approved laboratory SHALL be visible

#### Scenario: New patient with no history
**Given** a nurse is creating a submission for a new patient  
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
**Given** a submission has been created with only Pregnancy and Syphilis tests required  
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

#### Scenario: View MDW or FMW submission shows filtered tests
**Given** a user is viewing a submitted medical exam (MDW or FMW)  
**And** the submission formData indicates only 3 tests were required (Pregnancy, Syphilis, HIV)  
**When** the view submission page is rendered  
**Then** the page SHALL display results for 3 tests only  
**And** Chest X-ray result SHALL NOT be displayed  
**And** the page SHALL clearly indicate which tests were performed

#### Scenario: View submission shows filtered tests
**Given** a user is viewing a submitted medical exam  
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

#### Scenario: Submit MDW or FMW form with subset of tests
**Given** a nurse has filled out a form where only Pregnancy and Syphilis are required  
**And** the form displays only 2 test checkboxes  
**When** the nurse submits the form  
**Then** the formData SHALL contain only:
- `pregnancyTestPositive` field
- `syphilisTestPositive` field  
**And** the formData SHALL NOT contain `hivTestPositive` field  
**And** the formData SHALL NOT contain `chestXrayPositive` field  
**And** the submission SHALL be valid and accepted

#### Scenario: Validation allows omitting non-required tests for MDW and FMW
**Given** a submission being created has only 2 required tests  
**When** the form validation runs  
**Then** validation SHALL NOT require `hivTestPositive` data  
**And** validation SHALL NOT require `chestXrayPositive` data  
**And** the form SHALL be considered complete with only required test data
