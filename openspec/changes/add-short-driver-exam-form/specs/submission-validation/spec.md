# submission-validation Spec Delta

## ADDED Requirements

### Requirement: The system SHALL validate Short Driver Exam submissions with minimal field requirements
Short form driver exam validation SHALL enforce only essential fields, relaxing requirements compared to long forms.

#### Scenario: Backend validates short form with minimal patient data
**Given** a nurse submits a short form driver exam  
**And** the submission includes NRIC, name, mobile number, purpose, and exam date  
**And** the submission includes fitness determination(s)  
**And** the submission includes declaration confirmation  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the submission SHALL be accepted  
**And** the submission SHALL NOT require Date of Birth  
**And** the submission SHALL NOT require Email  
**And** the submission SHALL NOT require Height or Weight

#### Scenario: Backend rejects short form missing NRIC
**Given** a nurse submits a short form driver exam  
**And** the NRIC field is empty or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the response SHALL return 400 Bad Request  
**And** the error message SHALL be "Patient NRIC is required"

#### Scenario: Backend rejects short form missing mobile number
**Given** a nurse submits a short form driver exam  
**And** the mobile number field is empty or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Mobile number is required"

#### Scenario: Backend validates mobile number format
**Given** a nurse submits a short form driver exam  
**And** the mobile number is not in valid Singapore format  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL indicate "Invalid mobile number format. Expected +65 followed by 8 digits"

#### Scenario: Backend validates purpose of exam is valid value
**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is not one of the 4 valid values (AGE_65_ABOVE_TP_ONLY, AGE_65_ABOVE_TP_LTA, AGE_64_BELOW_LTA_ONLY, BAVL_ANY_AGE)  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Invalid purpose of exam"

---

### Requirement: The system SHALL validate fitness determinations for Short Driver Exams
Fitness question responses SHALL be validated based on the selected purpose of exam.

#### Scenario: Purpose 1 (Age 65+ TP only) requires motor vehicle fitness determination
**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is "AGE_65_ABOVE_TP_ONLY"  
**And** the assessment.fitToDriveMotorVehicle field is undefined or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Fitness to drive motor vehicle determination is required"

#### Scenario: Purpose 2 (Age 65+ TP & LTA) requires both vocational fitness determinations
**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is "AGE_65_ABOVE_TP_LTA"  
**And** the assessment.fitToDrivePublicService field is provided  
**And** the assessment.fitBusAttendant field is undefined or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Bus attendant vocational licence fitness determination is required"

**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is "AGE_65_ABOVE_TP_LTA"  
**And** the assessment.fitBusAttendant field is provided  
**And** the assessment.fitToDrivePublicService field is undefined or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Public service vehicle fitness determination is required"

#### Scenario: Purpose 3 (Age 64 below LTA only) requires both vocational fitness determinations
**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is "AGE_64_BELOW_LTA_ONLY"  
**And** the assessment.fitToDrivePublicService field is provided  
**And** the assessment.fitBusAttendant field is provided  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the validation SHALL NOT require assessment.fitToDriveMotorVehicle

**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is "AGE_64_BELOW_LTA_ONLY"  
**And** the assessment.fitToDrivePublicService field is undefined or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Public service vehicle fitness determination is required"

**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is "AGE_64_BELOW_LTA_ONLY"  
**And** the assessment.fitBusAttendant field is undefined or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Bus attendant vocational licence fitness determination is required"

#### Scenario: Purpose 4 (BAVL any age) requires bus attendant fitness determination only
**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is "BAVL_ANY_AGE"  
**And** the assessment.fitBusAttendant field is undefined or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Bus attendant vocational licence fitness determination is required"

**Given** a nurse submits a short form driver exam  
**And** the purposeOfExam is "BAVL_ANY_AGE"  
**And** the assessment.fitBusAttendant field is provided  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the validation SHALL NOT require assessment.fitToDrivePublicService or assessment.fitToDriveMotorVehicle

#### Scenario: Fitness determination accepts boolean values
**Given** a nurse submits a short form driver exam  
**And** the fitness determination field(s) contain boolean true or false  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** both true (fit) and false (unfit) SHALL be valid values

---

### Requirement: The system SHALL validate declaration confirmation for Short Driver Exams
Declaration checkbox confirmation SHALL be mandatory for all short form submissions.

#### Scenario: Backend rejects short form without declaration confirmation
**Given** a nurse submits a short form driver exam  
**And** the declaration.confirmed field is false or undefined  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Declaration confirmation is required"

#### Scenario: Backend accepts short form with declaration confirmed
**Given** a nurse submits a short form driver exam  
**And** the declaration.confirmed field is true  
**When** the backend validates the submission  
**Then** the declaration validation SHALL pass

---

### Requirement: The system SHALL NOT enforce long form validation rules for Short Driver Exams
Validation rules specific to long forms SHALL NOT apply to short forms.

#### Scenario: Short form submission succeeds without height/weight
**Given** a nurse submits a short form driver exam  
**And** the formData does not include height or weight fields  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the submission SHALL NOT be rejected for missing height/weight

#### Scenario: Short form submission succeeds without blood pressure
**Given** a nurse submits a short form driver exam  
**And** the formData does not include blood pressure fields  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the submission SHALL NOT be rejected for missing blood pressure

#### Scenario: Short form submission succeeds without medical declaration section
**Given** a nurse submits a short form driver exam  
**And** the formData does not include medicalDeclaration object  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the submission SHALL NOT require medical history questions

#### Scenario: Short form submission succeeds without AMT for TP exam
**Given** a nurse submits "DRIVING_LICENCE_TP_SHORT" exam  
**And** the formData does not include amt object  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the submission SHALL NOT require AMT score

#### Scenario: Short form submission succeeds without LTA vocational details
**Given** a nurse submits "DRIVING_VOCATIONAL_TP_LTA_SHORT" or "VOCATIONAL_LICENCE_LTA_SHORT" exam  
**And** the formData does not include ltaVocational object  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the submission SHALL NOT require detailed vocational medical fields (color vision, peripheral vision, etc.)

---

### Requirement: The backend SHALL use separate validation logic for Short Driver Exams
Short form validation SHALL be implemented in a dedicated module distinct from long form validation.

#### Scenario: Validation routing detects short form exam type
**Given** the backend receives a submission  
**And** the examType ends with "_SHORT"  
**When** the validation service processes the submission  
**Then** the system SHALL route to short form validation logic  
**And** the system SHALL NOT apply long form validation rules

#### Scenario: Short form validation helper function exists
**Given** the backend validation module  
**When** code imports validation helpers  
**Then** a function `isShortDriverExam(examType: string): boolean` SHALL exist  
**And** a function `validateShortDriverExam(dto: CreateSubmissionDto): void` SHALL exist  
**And** the `isDriverExam` function SHALL return true for short form exam types

---

### Requirement: The system SHALL validate NRIC/FIN format for Short Driver Exams
NRIC/FIN validation SHALL apply equally to short and long forms.

#### Scenario: Short form validates NRIC format
**Given** a nurse submits a short form driver exam  
**And** the NRIC is provided but in invalid format  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL indicate invalid NRIC format

#### Scenario: Short form accepts valid NRIC formats
**Given** a nurse submits a short form driver exam  
**And** the NRIC matches valid Singapore NRIC/FIN pattern (e.g., S1234567D)  
**When** the backend validates the submission  
**Then** the NRIC validation SHALL pass

---

### Requirement: The system SHALL validate Examination Date for Short Driver Exams
Examination date SHALL be validated as a required field in short forms.

#### Scenario: Backend rejects short form with missing examination date
**Given** a nurse submits a short form driver exam  
**And** the examinationDate field is undefined or null  
**When** the backend validates the submission  
**Then** the validation SHALL fail  
**And** the error message SHALL be "Examination date is required"

#### Scenario: Backend accepts valid examination date
**Given** a nurse submits a short form driver exam  
**And** the examinationDate is a valid date string (ISO format)  
**When** the backend validates the submission  
**Then** the date validation SHALL pass

#### Scenario: Short form does NOT enforce 2-month birthday window
**Given** a nurse submits a short form driver exam  
**And** the examination date is outside the 2-month window before patient birthday  
**When** the backend validates the submission  
**Then** the validation SHALL pass  
**And** the system SHALL NOT enforce exam timing validation (as DOB is not required in short forms)

---

## MODIFIED Requirements

None - existing long form validation requirements remain unchanged.

## REMOVED Requirements

None - short form validation is additive; no existing validation is removed.
