# medical-exam-types Spec Delta

## ADDED Requirements

### Requirement: The system SHALL support Short Form Traffic Police Driving Licence Medical Examination
A simplified short-form version of the TP driving licence medical examination SHALL be available for routine assessments.

#### Scenario: Nurse creates TP short form exam
**Given** a nurse is logged into the CheckUp system  
**And** the nurse has access to create submissions  
**When** the nurse selects "Short Form: Driving Licence (TP)" as the exam type  
**Then** the system SHALL display the TP short form examination form  
**And** the form SHALL include sections for:
- Patient NRIC/FIN (required)
- Patient Name (required)
- Mobile Number (required)
- Purpose of Exam (dropdown with 4 options):
  1. "Age 65 and above - Renew Traffic Police Driving Licence only" (AGE_65_ABOVE_TP_ONLY)
  2. "Age 65 and above - Renew both Traffic Police & LTA Vocational Licence" (AGE_65_ABOVE_TP_LTA)
  3. "Age 64 and below - Renew LTA Vocational Licence only" (AGE_64_BELOW_LTA_ONLY)
  4. "Renew only Bus Attendant's Vocational Licence (BAVL) regardless of age" (BAVL_ANY_AGE)
- Examination Date (required)
- Fitness question(s) based on selected purpose (Yes/No required)
- Declaration checkbox (required)
**And** the form SHALL NOT display:
- Patient Date of Birth field
- Patient Email field
- Height, Weight, BMI fields
- Blood Pressure fields
- Medical Declaration by Examinee section
- Medical History section
- General Medical Examination details
- Abbreviated Mental Test (AMT)
- Assessment remarks field

#### Scenario: Doctor reviews completed TP short form exam
**Given** a doctor is reviewing a pending TP short form exam  
**When** the doctor views the submission summary  
**Then** the system SHALL display patient identification information  
**And** the system SHALL display the purpose of exam  
**And** the system SHALL display the fitness determination clearly (Yes or No)  
**And** the system SHALL display the declaration status  
**And** the summary SHALL be concise (single screen view)

#### Scenario: View submitted TP short form exam
**Given** a submission with exam type "DRIVING_LICENCE_TP_SHORT" has been submitted  
**When** a user views the submission details  
**Then** the system SHALL display all short form data in a read-only formatted view  
**And** the view SHALL emphasize patient info and fitness determination  
**And** the view SHALL NOT show sections for medical history, AMT, or detailed examination results

---

### Requirement: The system SHALL support Short Form Combined TP and LTA Medical Examination
A simplified short-form version of the combined TP and LTA medical examination SHALL be available.

#### Scenario: Nurse creates combined TP+LTA short form exam
**Given** a nurse is logged into the CheckUp system  
**When** the nurse selects "Short Form: Driving Licence & Vocational (TP & LTA)" as the exam type  
**Then** the system SHALL display the combined short form examination form  
**And** the form SHALL include patient identification fields (NRIC, Name, Mobile, Purpose, Date)  
**And** the form SHALL include fitness question: "Is the patient fit to drive a motor vehicle?" (Yes/No)  
**And** the form SHALL include fitness question: "Is the patient fit as a public service vehicle driver or bus attendant?" (Yes/No)  
**And** the form SHALL include declaration checkbox  
**And** the form SHALL NOT display medical history, AMT, or detailed examination sections

#### Scenario: Doctor approves combined short form exam
**Given** a doctor is reviewing a combined TP+LTA short form exam  
**And** both fitness questions are answered  
**And** the declaration is confirmed  
**When** the doctor approves the submission  
**Then** the system SHALL save both fitness determinations  
**And** the submission SHALL be marked as approved for final submission  
**And** the audit log SHALL record the approval with exam type

#### Scenario: View submitted combined short form exam
**Given** a submission with exam type "DRIVING_VOCATIONAL_TP_LTA_SHORT" has been submitted  
**When** a user views the submission details  
**Then** the system SHALL display both fitness determinations clearly  
**And** the view SHALL show "Fit to drive motor vehicle: Yes/No"  
**And** the view SHALL show "Fit for public service vehicle/bus attendant: Yes/No"

---

### Requirement: The system SHALL support Short Form LTA Vocational Licence Medical Examination
A simplified short-form version of the LTA vocational licence medical examination SHALL be available.

#### Scenario: Nurse creates LTA vocational short form exam
**Given** a nurse is logged into the CheckUp system  
**When** the nurse selects "Short Form: Vocational Licence (LTA)" as the exam type  
**Then** the system SHALL display the LTA vocational short form examination form  
**And** the form SHALL include patient identification fields  
**And** the form SHALL include fitness question: "Is the patient fit as a public service vehicle driver or bus attendant?" (Yes/No)  
**And** the form SHALL include declaration checkbox  
**And** the form SHALL NOT display fitness question for motor vehicle driving  
**And** the form SHALL NOT display AMT (as LTA-only exams never require AMT)

#### Scenario: Summary shows single fitness determination for LTA-only short form
**Given** a nurse has completed an LTA vocational short form exam  
**When** the nurse views the submission summary  
**Then** the system SHALL display only the vocational fitness determination  
**And** the system SHALL NOT display motor vehicle fitness question

#### Scenario: View submitted LTA vocational short form exam
**Given** a submission with exam type "VOCATIONAL_LICENCE_LTA_SHORT" has been submitted  
**When** a user views the submission details  
**Then** the system SHALL display the vocational fitness determination  
**And** the view SHALL NOT show motor vehicle fitness determination  
**And** the view SHALL NOT show AMT results

---

### Requirement: Database schema SHALL support Short Driver Exam Types
The database schema SHALL support three new short-form driver medical examination types.

#### Scenario: Database stores short form exam type values
**Given** the database migration has been applied  
**When** a submission is created with exam type "DRIVING_LICENCE_TP_SHORT"  
**Then** the database SHALL accept and store the exam type  
**And** queries filtering by exam type SHALL work correctly  
**And** the exam type SHALL be distinguishable from "DRIVING_LICENCE_TP"

#### Scenario: Enum values have clear short form labels
**Given** the ExamType enum in the Prisma schema  
**When** the system retrieves exam type options  
**Then** the system SHALL provide labels:
- "Short Form: Driving Licence (TP)" for DRIVING_LICENCE_TP_SHORT
- "Short Form: Driving Licence & Vocational (TP & LTA)" for DRIVING_VOCATIONAL_TP_LTA_SHORT
- "Short Form: Vocational Licence (LTA)" for VOCATIONAL_LICENCE_LTA_SHORT

#### Scenario: Short form data stored in JSONB column
**Given** a short form driver exam submission  
**When** the submission is saved to the database  
**Then** the formData column SHALL store the minimal short form fields as JSON  
**And** the data structure SHALL include: patientInfo, assessment, declaration objects  
**And** the formData SHALL be significantly smaller than long form submissions (~200 bytes vs ~2KB)

---

### Requirement: The system SHALL provide clear Exam Type Selection for Short Forms
The exam type dropdown SHALL distinguish short forms from long forms clearly.

#### Scenario: Dropdown includes short form driver exam types
**Given** a nurse is creating a new submission  
**When** the nurse views the exam type dropdown  
**Then** the dropdown SHALL include 13 exam types total (10 existing + 3 new)  
**And** the short form options SHALL be clearly labeled with "Short Form:" prefix  
**And** the dropdown SHALL group or separate short forms from long forms for clarity

#### Scenario: Form loads short form component based on exam type selection
**Given** a nurse has not yet selected an exam type  
**When** the nurse selects "Short Form: Driving Licence (TP)"  
**Then** the system SHALL render the TP short form component  
**And** the form SHALL display only minimal fields (no accordion sections)  
**And** the form layout SHALL be single-page (no multi-step navigation)

#### Scenario: Switching from long form to short form clears form data
**Given** a nurse has entered data for a long form TP driving licence exam  
**When** the nurse changes the exam type to "Short Form: Driving Licence (TP)"  
**Then** the system SHALL warn about unsaved changes  
**And** if the nurse confirms, the system SHALL clear all form data  
**And** the system SHALL render the short form with empty fields

---

## MODIFIED Requirements

None - existing requirements for long form driver exams remain unchanged.

## REMOVED Requirements

None - short forms are additive; no existing functionality is removed.
