# submission-validation Specification

## Purpose
TBD - created by archiving change add-driver-medical-exams. Update Purpose after archive.
## Requirements
### Requirement: The system SHALL enforce Driver Exam Timing Validation
Examination timing rules for driver medical examinations per Road Traffic (Motor Vehicles, Driving Licence) Rules SHALL be enforced.

#### Scenario: Exam must be within 2 months before birthday
**Given** a nurse is creating a driver medical exam  
**And** the patient's date of birth is 15-March-1960  
**And** the patient's next birthday is 15-March-2026  
**When** the nurse enters examination date as 10-January-2026  
**Then** the system SHALL accept the date (within 2 months before birthday)  
**When** the nurse enters examination date as 10-December-2025  
**Then** the system SHALL reject with error: "Examination must be conducted within 2 months before the examinee's birthday per Road Traffic Rules"

#### Scenario: Validation calculates birthday proximity correctly
**Given** a patient's birthday is 15-March-2026  
**When** examination date is 15-January-2026 (exactly 2 months before)  
**Then** the system SHALL accept the date  
**When** examination date is 14-January-2026 (2 months + 1 day before)  
**Then** the system SHALL reject the date with timing error

#### Scenario: Future examination dates rejected
**Given** today is 01-February-2026  
**When** a nurse enters examination date as 05-February-2026 (future date)  
**Then** the system SHALL reject with error: "Examination date cannot be in the future"

#### Scenario: Backend validates exam timing on submission
**Given** a nurse bypasses frontend validation (e.g., via API)  
**When** the submission is sent to the backend with invalid exam timing  
**Then** the backend SHALL return 400 Bad Request  
**And** the error message SHALL specify the timing requirement  
**And** the submission SHALL not be saved

---

### Requirement: The system SHALL validate TP Exam Required Fields
All required fields for TP driving licence exams SHALL be validated.

#### Scenario: AMT required for TP exams
**Given** a nurse is submitting a TP driving licence exam  
**When** the AMT section is not completed (score is null or undefined)  
**Then** the system SHALL display error: "Abbreviated Mental Test is required for TP driving licence examinations"  
**And** the submission SHALL be blocked

#### Scenario: AMT must have valid score
**Given** a nurse is submitting a TP exam  
**When** the AMT score is present but invalid (e.g., -1 or 11)  
**Then** the system SHALL display error: "AMT score must be between 0 and 10"  
**And** the submission SHALL be blocked

#### Scenario: Medical declaration required for TP exams
**Given** a nurse is submitting a TP exam  
**When** the medicalDeclaration object is missing or null  
**Then** the system SHALL display error: "Medical Declaration by Examinee is required"  
**And** the submission SHALL be blocked

#### Scenario: Medical history required for TP exams
**Given** a nurse is submitting a TP exam  
**When** the medicalHistory object is missing or null  
**Then** the system SHALL display error: "Medical History of Examinee is required"  
**And** the submission SHALL be blocked

#### Scenario: Fitness assessment required for TP exams
**Given** a nurse is submitting a TP exam  
**When** the assessment.fitToDrive field is null or undefined  
**Then** the system SHALL display error: "Fitness to drive determination is required"  
**And** the submission SHALL be blocked

#### Scenario: Remarks required for TP exams
**Given** a nurse is submitting a TP exam  
**When** the assessment.remarks field is empty or null  
**Then** the system SHALL display error: "Medical practitioner remarks are required"  
**And** the submission SHALL be blocked

---

### Requirement: The system SHALL validate LTA Exam Required Fields
All required fields for LTA vocational licence exams SHALL be validated.

#### Scenario: LTA vocational section required for LTA exams
**Given** a nurse is submitting an LTA vocational exam (LTA-only or combined)  
**When** the ltaVocational object is missing or null  
**Then** the system SHALL display error: "LTA Vocational Licence Medical Details are required"  
**And** the submission SHALL be blocked

#### Scenario: Vision assessments required for LTA exams
**Given** a nurse is submitting an LTA exam  
**When** colorVision, peripheralVision, or nightVision fields are empty  
**Then** the system SHALL display error: "All vision assessments (color, peripheral, night) are required for LTA vocational exams"  
**And** the submission SHALL be blocked

#### Scenario: Vocational fitness determination required
**Given** a nurse is submitting an LTA exam  
**When** the assessment.fitForVocational field is null or undefined  
**Then** the system SHALL display error: "Fitness for vocational duty determination is required"  
**And** the submission SHALL be blocked

#### Scenario: Medical declaration required for LTA exams
**Given** a nurse is submitting an LTA-only exam  
**When** the medicalDeclaration is missing  
**Then** the system SHALL display the same error as TP exams  
**And** the submission SHALL be blocked

---

### Requirement: The system SHALL validate Combined Exam requirements
Both TP and LTA requirements for combined exams SHALL be validated.

#### Scenario: Combined exam requires both AMT and LTA sections
**Given** a nurse is submitting a combined TP+LTA exam  
**When** the AMT section is missing  
**Then** the system SHALL display error: "Abbreviated Mental Test is required for TP driving licence"  
**When** the ltaVocational section is missing  
**Then** the system SHALL display error: "LTA Vocational Licence Medical Details are required"  
**And** both errors SHALL be displayed if both sections are missing

#### Scenario: Combined exam requires both fitness determinations
**Given** a nurse is submitting a combined TP+LTA exam  
**When** assessment.fitToDrive is null  
**Then** the system SHALL display error: "Fitness to drive determination is required"  
**When** assessment.fitForVocational is null  
**Then** the system SHALL display error: "Fitness for vocational duty determination is required"  
**And** both determinations must be present for submission to succeed

---

### Requirement: The system SHALL validate Common Fields across all driver exam types
Common medical fields across all driver exam types SHALL be validated.

#### Scenario: Height must be valid number
**Given** a nurse is entering height  
**When** the nurse enters "abc" or negative number  
**Then** the system SHALL display error: "Height must be a positive number in cm"  
**And** the field SHALL be highlighted

#### Scenario: Weight must be valid number
**Given** a nurse is entering weight  
**When** the nurse enters invalid weight (e.g., 0, negative, or non-numeric)  
**Then** the system SHALL display error: "Weight must be a positive number in kg"

#### Scenario: Blood pressure must match format
**Given** a nurse is entering blood pressure  
**When** the nurse enters "120" (missing diastolic)  
**Then** the system SHALL display error: "Blood pressure must be in format systolic/diastolic (e.g., 120/80)"  
**When** the nurse enters "120/80"  
**Then** the system SHALL accept the value without error

#### Scenario: Pulse must be valid number
**Given** a nurse is entering pulse  
**When** the nurse enters non-numeric or invalid pulse value  
**Then** the system SHALL display error: "Pulse must be a positive number in bpm"  
**When** the nurse enters "72"  
**Then** the system SHALL accept the value

#### Scenario: Visual acuity required
**Given** a nurse is submitting any driver exam  
**When** the visualAcuity field is empty  
**Then** the system SHALL display error: "Visual acuity assessment is required"

#### Scenario: Hearing test required
**Given** a nurse is submitting any driver exam  
**When** the hearingTest field is empty  
**Then** the system SHALL display error: "Hearing test result is required"

---

### Requirement: The system SHALL validate NRIC/FIN for Driver Exams
Examinee NRIC/FIN using existing validation logic SHALL be validated.

#### Scenario: Valid NRIC accepted
**Given** a nurse is entering patient NRIC  
**When** the nurse enters "S1234567D" (valid format and checksum)  
**Then** the system SHALL accept the NRIC without error

#### Scenario: Invalid NRIC rejected
**Given** a nurse is entering patient NRIC  
**When** the nurse enters "S1234567X" (invalid checksum)  
**Then** the system SHALL display error: "Invalid NRIC/FIN format or checksum"

#### Scenario: FIN validation follows same rules
**Given** a nurse is entering patient FIN  
**When** the FIN has valid format and checksum  
**Then** the system SHALL accept it  
**When** the FIN has invalid format or checksum  
**Then** the system SHALL reject it with error

---

### Requirement: The system SHALL enforce Character Limits and Text Validation
Character limits and text input validation SHALL be enforced.

#### Scenario: Remarks field limited to 500 characters
**Given** a nurse is entering medical practitioner remarks  
**When** the nurse types 500 characters  
**Then** the system SHALL display "500/500" character counter  
**And** the system SHALL prevent typing additional characters  
**When** the nurse attempts to paste text exceeding 500 characters  
**Then** the system SHALL truncate the text to 500 characters  
**And** display a warning: "Text truncated to 500 characters"

#### Scenario: LTA restrictions field limited to 500 characters
**Given** a nurse is entering LTA restrictions  
**When** the text exceeds 500 characters  
**Then** the system SHALL enforce the same limit as remarks  
**And** display character counter

#### Scenario: Other conditions text field limited to 200 characters
**Given** a nurse is entering "Other" medical conditions  
**When** the text exceeds 200 characters  
**Then** the system SHALL prevent additional input  
**And** display "200/200" character counter

---

### Requirement: The system SHALL display Validation Errors clearly
Validation errors SHALL be displayed clearly and guide users to fix them.

#### Scenario: Inline validation for individual fields
**Given** a nurse is filling out a form  
**When** a field loses focus (onBlur)  
**And** the field has invalid data  
**Then** the system SHALL display an error message directly below the field  
**And** the field SHALL be highlighted with red border  
**And** an error icon SHALL appear next to the field

#### Scenario: Summary validation on submit attempt
**Given** a nurse clicks "Save Draft" or "Route for Approval"  
**When** multiple fields have validation errors  
**Then** the system shall:
1. Display a toast/banner: "Please fix validation errors before submitting"
2. Scroll to the first error field
3. Expand the accordion section containing the first error
4. Highlight all error fields
**And** the submission SHALL be blocked

#### Scenario: Backend validation errors displayed
**Given** frontend validation passed  
**But** backend validation fails (e.g., exam timing check)  
**When** the API returns 400 Bad Request with error message  
**Then** the frontend SHALL display the error message in a toast  
**And** the submission SHALL fail gracefully without data loss

#### Scenario: Clear error when field corrected
**Given** a field has a validation error displayed  
**When** the nurse corrects the field value  **And** the field loses focus  
**Then** the system SHALL remove the error message  
**And** the field border SHALL return to normal  
**And** the error icon SHALL disappear

---

### Requirement: The system SHALL validate fields at appropriate Validation Timing
Fields SHALL be validated at appropriate times to balance UX and data integrity.

#### Scenario: Real-time validation for critical fields
**Given** a nurse is entering NRIC  
**When** the nurse types each character  
**Then** the system SHALL validate format in real-time  
**And** display format hint (e.g., "Format: S1234567D")  
**When** the field is complete and loses focus  
**Then** the system SHALL validate checksum

#### Scenario: On-blur validation for most fields
**Given** a nurse is entering height, weight, blood pressure, etc.  
**When** the nurse is actively typing  
**Then** the system SHALL NOT display validation errors  
**When** the nurse moves to the next field (onBlur)  
**Then** the system SHALL validate and display errors if any

#### Scenario: On-change validation for checkboxes and radios
**Given** a nurse selects a radio button (e.g., "Fit to Drive: Yes")  
**When** the selection changes  
**Then** the system SHALL immediately clear any previous validation error for that field  
**And** update the form state

#### Scenario: Submission validation is comprehensive
**Given** a nurse clicks final Submit button  
**When** validation runs  
**Then** the system SHALL validate:
1. All required fields present
2. All field formats correct
3. All business rules (exam timing, type-specific requirements)
4. All character limits
5. All numeric ranges
**And** display ALL errors, not just the first one

---

### Requirement: The backend SHALL independently validate all driver exam submissions
The system backend SHALL independently validate all driver exam submissions to prevent data integrity issues.

#### Scenario: Backend validates exam type matches formData
**Given** a submission claims to be DRIVING_LICENCE_TP  
**When** the backend receives the submission  
**And** the formData lacks AMT section  
**Then** the backend SHALL return 400 Bad Request  
**And** error message: "AMT is required for TP driving licence examinations"

#### Scenario: Backend validates exam timing server-side
**Given** a submission is sent with examination date  
**When** the backend calculates exam timing based on patient DOB  
**And** the exam is not within 2 months of birthday  
**Then** the backend SHALL reject with 400 Bad Request  
**And** the validation SHALL use server time, not client time

#### Scenario: Backend validates data types
**Given** a submission has amt.score as a string "8" instead of number 8  
**When** the backend validates the submission  
**Then** the backend SHALL either:
1. Coerce the value to number (if safely possible), OR
2. Reject with 400 Bad Request: "AMT score must be a number"

#### Scenario: Backend prevents SQL injection and XSS
**Given** a malicious user enters `<script>alert('XSS')</script>` in remarks  
**When** the backend saves the submission  
**Then** the backend SHALL sanitize or escape the input  
**And** when retrieved, the script SHALL not execute  
**And** the text SHALL display as plain text

---

