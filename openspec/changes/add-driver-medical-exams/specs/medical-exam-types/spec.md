# Medical Exam Types - Spec Delta

## ADDED Requirements

### Requirement: The system SHALL support Traffic Police Driving Licence Medical Examination
Medical examinations for Traffic Police (TP) driving licence applications SHALL be supported.

#### Scenario: Nurse creates TP driving licence exam
**Given** a nurse is logged into the CheckUp system  
**And** the nurse has access to create submissions  
**When** the nurse selects "Driving Licence Medical Examination Report (TP)" as the exam type  
**Then** the system SHALL display the TP driving licence medical examination form  
**And** the form SHALL include sections for:
- Healthcare institution and medical practitioner information
- Examinee details (name, NRIC/FIN, date of birth, contact information)
- Medical declaration by examinee (6-month history)
- Medical history of examinee
- General medical examination (vitals, vision, hearing)
- Abbreviated Mental Test (AMT) with 10 questions
- Medical practitioner assessment and fitness determination

#### Scenario: Doctor reviews completed TP exam
**Given** a doctor is reviewing a pending TP driving licence exam  
**When** the doctor views the submission summary  
**Then** the system SHALL display all entered information in organized sections  
**And** the AMT score SHALL be prominently displayed (e.g., "8/10")  
**And** the fitness to drive determination SHALL be clearly indicated  

#### Scenario: View submitted TP driving licence exam
**Given** a submission with exam type "DRIVING_LICENCE_TP" has been submitted  
**When** a user views the submission details  
**Then** the system SHALL display all exam data in a read-only formatted view  
**And** the view SHALL include AMT results, medical declarations, and assessment  

---

### Requirement: The system SHALL support Combined TP Driving Licence and LTA Vocational Licence Medical Examination
Medical examinations for both Traffic Police driving licence and Land Transport Authority vocational licence applications SHALL be supported.

#### Scenario: Nurse creates combined TP+LTA exam
**Given** a nurse is logged into the CheckUp system  
**When** the nurse selects "Driving Licence and Vocational Licence (TP & LTA)" as the exam type  
**Then** the system SHALL display the combined medical examination form  
**And** the form SHALL include all TP driving licence sections  
**And** the form SHALL additionally include LTA vocational licence medical details section  
**And** the assessment section SHALL include both "fit to drive" and "fit for vocational duty" determinations

#### Scenario: Doctor approves combined exam
**Given** a doctor is reviewing a combined TP+LTA exam  
**And** all required sections are completed  
**When** the doctor approves the submission  
**Then** the system SHALL save the exam with both TP and LTA assessment results  
**And** the submission SHALL be marked as approved for final submission

#### Scenario: View submitted combined exam
**Given** a submission with exam type "DRIVING_VOCATIONAL_TP_LTA" has been submitted  
**When** a user views the submission details  
**Then** the system SHALL display all TP sections (including AMT)  
**And** the system SHALL display all LTA vocational licence medical details  
**And** both fitness determinations SHALL be clearly shown

---

### Requirement: The system SHALL support LTA Vocational Licence Only Medical Examination
Medical examinations for Land Transport Authority vocational licence applications only SHALL be supported.

#### Scenario: Nurse creates LTA vocational licence exam
**Given** a nurse is logged into the CheckUp system  
**When** the nurse selects "Vocational Licence Medical Examination (LTA)" as the exam type  
**Then** the system SHALL display the LTA vocational licence medical examination form  
**And** the form SHALL include sections for:
- Healthcare institution and medical practitioner information
- Examinee details
- Medical declaration by examinee
- Medical history of examinee
- General medical examination
- LTA vocational licence medical details (color vision, peripheral vision, etc.)
- Medical practitioner assessment for vocational fitness
**And** the form SHALL NOT include the Abbreviated Mental Test (AMT)

#### Scenario: Summary excludes AMT for LTA-only exam
**Given** a nurse has completed an LTA vocational licence exam  
**When** the nurse views the submission summary  
**Then** the system SHALL display all exam sections except AMT  
**And** the assessment SHALL only show "fit for vocational duty" determination

#### Scenario: View submitted LTA vocational exam
**Given** a submission with exam type "VOCATIONAL_LICENCE_LTA" has been submitted  
**When** a user views the submission details  
**Then** the system SHALL display all LTA exam data without AMT section  
**And** the view SHALL include LTA vocational medical details and fitness determination

---

### Requirement: Database schema SHALL support Driver Exam Types
The database schema SHALL support the three new driver medical examination types.

#### Scenario: Database stores new exam type values
**Given** the database migration has been applied  
**When** a submission is created with exam type "DRIVING_LICENCE_TP"  
**Then** the database SHALL accept and store the exam type  
**And** queries filtering by exam type SHALL work correctly

#### Scenario: Enum values have human-readable labels
**Given** the ExamType enum in the Prisma schema  
**When** the system retrieves exam type options  
**Then** the system SHALL provide labels:
- "Driving Licence Medical Examination Report (TP)" for DRIVING_LICENCE_TP
- "Driving Licence and Vocational Licence (TP & LTA)" for DRIVING_VOCATIONAL_TP_LTA
- "Vocational Licence Medical Examination (LTA)" for VOCATIONAL_LICENCE_LTA

#### Scenario: Form data stored in JSONB column
**Given** a driver exam submission with complex form data  
**When** the submission is saved to the database  
**Then** the formData column SHALL store all exam-specific fields as JSON  
**And** the data structure SHALL support nested objects (e.g., medicalDeclaration, amt, ltaVocational)

---

### Requirement: The system SHALL provide Exam Type Selection UI
The system SHALL provide clear exam type selection for driver medical examinations.

#### Scenario: Dropdown includes driver exam types
**Given** a nurse is creating a new submission  
**When** the nurse views the exam type dropdown  
**Then** the dropdown SHALL include all 10 exam types:
- Six-monthly Medical Exam for Migrant Domestic Worker (MOM)
- Six-monthly Medical Exam for Female Migrant Worker (MOM)
- Full Medical Exam for Work Permit (MOM)
- Medical Exam for Aged Drivers (SPF)
- Medical Examination for Permanent Residency (ICA)
- Medical Examination for Student Pass (ICA)
- Medical Examination for Long Term Visit Pass (ICA)
- **Driving Licence Medical Examination Report (TP)** ← NEW
- **Driving Licence and Vocational Licence (TP & LTA)** ← NEW
- **Vocational Licence Medical Examination (LTA)** ← NEW

#### Scenario: Form loads based on exam type selection
**Given** a nurse has not yet selected an exam type  
**When** the nurse selects "Driving Licence Medical Examination Report (TP)"  
**Then** the system SHALL render the TP driving licence form component  
**And** all form sections SHALL be visible and functional

#### Scenario: Switching exam types clears form data
**Given** a nurse has entered data for a TP driving licence exam  
**When** the nurse changes the exam type to "Vocational Licence Medical Examination (LTA)"  
**Then** the system SHALL warn about unsaved changes  
**And** if the nurse confirms, the system SHALL clear all form data  
**And** the system SHALL render the LTA vocational licence form

---

## MODIFIED Requirements

None. This is a new capability addition that does not modify existing exam type behavior.

---

## REMOVED Requirements

None. All existing exam types remain fully functional.
