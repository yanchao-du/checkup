# form-submission Specification

## Purpose
TBD - created by archiving change add-driver-medical-exams. Update Purpose after archive.
## Requirements
### Requirement: The system SHALL provide Abbreviated Mental Test (AMT) Component
An Abbreviated Mental Test component for TP driving licence examinations SHALL be provided.

#### Scenario: AMT displays 10 standard questions
**Given** a nurse is completing a TP driving licence exam  
**When** the nurse navigates to the Abbreviated Mental Test section  
**Then** the system SHALL display 10 questions as checkboxes:
1. Age
2. Time (to nearest hour)
3. Address for recall at end of test
4. Year
5. Name of place/building
6. Recognition of two persons (doctor, nurse)
7. Date of birth
8. Year of World War I
9. Name of current national leader
10. Count backwards from 20 to 1
**And** each question SHALL be checkable to indicate correct answer

#### Scenario: AMT score auto-calculates
**Given** a nurse is completing the AMT section  
**When** the nurse checks/unchecks any question  
**Then** the system SHALL immediately calculate and display the total score  
**And** the score SHALL be displayed as "Score: X/10"  
**And** 1 point SHALL be awarded for each checked question

#### Scenario: AMT warns on low score
**Given** a nurse has completed the AMT  
**And** the total score is less than 8  
**When** the score is displayed  
**Then** the system SHALL show a warning message: "Low AMT score may indicate cognitive impairment"  
**And** the warning SHALL be visually distinct (e.g., amber color)

#### Scenario: Helper button checks all AMT items
**Given** a nurse is completing the AMT section  
**When** the nurse clicks "All Passed" button  
**Then** the system SHALL check all 10 questions  
**And** the score SHALL display "Score: 10/10"

#### Scenario: AMT data persists correctly
**Given** a nurse has completed the AMT with score 8/10  
**When** the nurse saves the draft  
**And** later reopens the draft  
**Then** the system SHALL restore all 10 question states  
**And** the score SHALL display "Score: 8/10"

---

### Requirement: The system SHALL provide Medical Declaration Section Component
A medical declaration section for examinee's 6-month medical history SHALL be provided.

#### Scenario: Medical declaration displays standard checkboxes
**Given** a nurse is completing a driver medical exam  
**When** the nurse navigates to the Medical Declaration section  
**Then** the system SHALL display checkboxes for:
- Loss of consciousness/fainting
- Seizures or fits
- Sudden dizziness or blackouts
- Chest pain or discomfort
- Breathlessness during mild exertion
- Alcohol or substance abuse
- Psychiatric condition requiring treatment
- Other medical conditions (with text field)
**And** all checkboxes SHALL default to unchecked

#### Scenario: Other conditions field appears when selected
**Given** a nurse is completing the medical declaration  
**When** the nurse checks "Other medical conditions"  
**Then** the system SHALL display a text input field below the checkbox  
**And** the nurse SHALL be able to enter free text describing the condition

#### Scenario: Helper button clears all declarations
**Given** a nurse has checked several medical declaration items  
**When** the nurse clicks "Clear All" button  
**Then** the system SHALL uncheck all checkboxes  
**And** the system SHALL clear the "Other" text field

#### Scenario: Medical declaration data saves correctly
**Given** a nurse has selected "Loss of consciousness" and "Diabetes"  
**When** the nurse saves the draft  
**Then** the system SHALL store medicalDeclaration object with selected items as true  
**And** unselected items SHALL be false or omitted

---

### Requirement: The system SHALL provide Medical History Section Component
A medical history section for examinee's pre-existing conditions SHALL be provided.

#### Scenario: Medical history displays standard checkboxes
**Given** a nurse is completing a driver medical exam  
**When** the nurse navigates to the Medical History section  
**Then** the system SHALL display checkboxes for:
- Cardiovascular disease (heart attack, angina, hypertension)
- Neurological disorder (stroke, epilepsy, MS)
- Psychiatric condition (depression, anxiety, psychosis)
- Diabetes mellitus (Type 1 or 2)
- Vision problems (glaucoma, cataracts, retinopathy)
- Hearing problems (deafness, tinnitus)
- Musculoskeletal disorder (arthritis, amputation)
- Other conditions (with text field)
**And** all checkboxes SHALL default to unchecked

#### Scenario: Helper button marks all as normal
**Given** a nurse is completing the medical history  
**When** the nurse clicks "All Normal" button  
**Then** the system SHALL uncheck all checkboxes  
**And** the system SHALL clear the "Other" text field  
**And** this SHALL indicate no pre-existing medical conditions

#### Scenario: Multiple conditions can be selected
**Given** a nurse is completing the medical history  
**When** the nurse checks "Cardiovascular disease", "Diabetes", and "Vision problems"  
**Then** all three checkboxes SHALL remain checked  
**And** the data SHALL save with all three conditions marked as true

---

### Requirement: The system SHALL provide LTA Vocational Licence Medical Details Component
LTA-specific medical assessment fields for vocational licence examinations SHALL be provided.

#### Scenario: LTA vocational section displays required fields
**Given** a nurse is completing an LTA vocational exam (TP+LTA or LTA-only)  
**When** the nurse navigates to the LTA Vocational Licence Medical Details section  
**Then** the system SHALL display fields for:
- Color vision (dropdown: Pass/Fail)
- Peripheral vision (dropdown: Pass/Fail)  
- Night vision (dropdown: Pass/Fail)
- Cardiac condition assessment (text area)
- Respiratory condition assessment (text area)
- Renal condition assessment (text area)
- Endocrine condition assessment (text area)
- Fit for vocational duty (radio: Yes/No)
- Restrictions or limitations (text area, 500 char limit)

#### Scenario: Vision fields use Pass/Fail dropdowns
**Given** a nurse is completing the LTA vocational section  
**When** the nurse clicks the Color Vision dropdown  
**Then** the system SHALL display two options: "Pass" and "Fail"  
**And** the same SHALL apply for Peripheral Vision and Night Vision

#### Scenario: Condition assessment fields are optional
**Given** a nurse is completing the LTA vocational section  
**When** the nurse leaves Cardiac condition assessment blank  
**And** completes other required fields  
**Then** the form SHALL allow saving without validation errors

#### Scenario: Restrictions field has character limit
**Given** a nurse is entering restrictions in the LTA vocational section  
**When** the nurse types text into the Restrictions field  
**Then** the system SHALL display a character counter (e.g., "450/500")  
**And** the system SHALL prevent typing beyond 500 characters

---

### Requirement: The system SHALL provide Assessment Section Component
Medical practitioner assessment fields for fitness determination SHALL be provided.

#### Scenario: TP exam shows "Fit to Drive" determination
**Given** a nurse/doctor is completing a TP-only driving licence exam  
**When** the user navigates to the Assessment section  
**Then** the system SHALL display a radio button group: "Fit to Drive" with options Yes/No  
**And** the system SHALL NOT display "Fit for Vocational Duty"

#### Scenario: LTA exam shows "Fit for Vocational Duty" determination
**Given** a nurse/doctor is completing an LTA-only vocational exam  
**When** the user navigates to the Assessment section  
**Then** the system SHALL display a radio button group: "Fit for Vocational Duty" with options Yes/No  
**And** the system SHALL NOT display "Fit to Drive"

#### Scenario: Combined exam shows both fitness determinations
**Given** a nurse/doctor is completing a combined TP+LTA exam  
**When** the user navigates to the Assessment section  
**Then** the system SHALL display "Fit to Drive" radio group (Yes/No)  
**And** the system SHALL display "Fit for Vocational Duty" radio group (Yes/No)  
**And** both SHALL be independently selectable

#### Scenario: Specialist review required field
**Given** a user is completing the Assessment section  
**When** the user selects "Requires Specialist Review: Yes"  
**Then** the system SHALL display a text field "Specialist Type"  
**And** the field SHALL be required if specialist review is Yes

#### Scenario: Remarks field with character limit
**Given** a user is entering medical practitioner remarks  
**When** the user types in the Remarks field  
**Then** the system SHALL display a character counter (e.g., "125/500")  
**And** the system SHALL prevent typing beyond 500 characters  
**And** the Remarks field SHALL be required for all driver exams

---

### Requirement: The system SHALL provide Common Medical Fields Component
Reusable common medical examination fields across all driver exam types SHALL be provided.

#### Scenario: Common fields display standard vitals
**Given** a nurse is completing any driver medical exam  
**When** the nurse navigates to the General Medical Examination section  
**Then** the system SHALL display input fields for:
- Height (cm)
- Weight (kg)
- BMI (auto-calculated, read-only)
- Blood Pressure (mmHg, format: 120/80)
- Pulse (bpm)

#### Scenario: BMI auto-calculates from height and weight
**Given** a nurse enters Height: 170 cm  
**And** Weight: 70 kg  
**When** both values are entered  
**Then** the system SHALL calculate BMI as weight / (height/100)²  
**And** display BMI as 24.2 (1 decimal place)  
**And** the BMI field SHALL be read-only

#### Scenario: Blood pressure validates format
**Given** a nurse is entering blood pressure  
**When** the nurse enters "120/80"  
**Then** the system SHALL accept the value  
**When** the nurse enters "120" (missing diastolic)  
**Then** the system SHALL display a validation error: "Format must be systolic/diastolic (e.g., 120/80)"

#### Scenario: Common fields include vision and hearing
**Given** a nurse is completing the General Medical Examination section  
**Then** the system SHALL also display:
- Visual Acuity (reused from AgedDriversFields component)
- Hearing Test (reused from AgedDriversFields component)
**And** these components SHALL function identically to existing implementations

---

### Requirement: The system SHALL organize driver exam forms with Form Field Grouping using Accordions
Driver exam forms SHALL be organized into logical accordion sections for easier navigation.

#### Scenario: TP driving licence form has 5 accordion sections
**Given** a nurse is viewing a TP driving licence exam form  
**Then** the system SHALL display accordion sections:
1. General Medical Examination
2. Medical Declaration by Examinee
3. Medical History of Examinee
4. Abbreviated Mental Test
5. Medical Practitioner Assessment
**And** only one section SHALL be expanded at a time by default

#### Scenario: Combined exam form has 6 accordion sections
**Given** a nurse is viewing a combined TP+LTA exam form  
**Then** the system SHALL display accordion sections:
1. General Medical Examination
2. Medical Declaration by Examinee
3. Medical History of Examinee
4. Abbreviated Mental Test
5. LTA Vocational Licence Medical Details
6. Medical Practitioner Assessment

#### Scenario: LTA-only form has 5 sections without AMT
**Given** a nurse is viewing an LTA vocational exam form  
**Then** the system SHALL display accordion sections:
1. General Medical Examination
2. Medical Declaration by Examinee
3. Medical History of Examinee
4. LTA Vocational Licence Medical Details
5. Medical Practitioner Assessment
**And** the Abbreviated Mental Test section SHALL NOT be present

#### Scenario: Auto-expand next section on completion
**Given** a nurse is completing the General Medical Examination section  
**And** all required fields are filled  
**When** the nurse moves to the next field  
**Then** the system SHALL auto-expand the Medical Declaration section  
**And** the system SHALL collapse the General Medical Examination section

---

### Requirement: The system SHALL persist Form Data without data loss
Driver exam form data SHALL be persisted to drafts without data loss.

#### Scenario: Auto-save preserves all driver exam fields
**Given** a nurse is completing a TP driving licence exam  
**And** the nurse has entered data in multiple sections  
**When** the auto-save triggers (every 30 seconds)  
**Then** the system SHALL save all form data to the database  
**And** the formData JSONB column SHALL contain:
- medicalDeclaration object with all checkbox states
- medicalHistory object with all checkbox states
- amt object with all 10 question states and score
- assessment object with fitness determination and remarks
- All common medical fields (height, weight, BP, etc.)

#### Scenario: Draft reload restores exact state
**Given** a nurse has saved a draft with partial data  
**When** the nurse reopens the draft  
**Then** the system SHALL restore all form sections to exact previous state  
**And** all checkbox states SHALL match the saved state  
**And** the AMT score SHALL display correctly  
**And** all text fields SHALL contain the saved text

#### Scenario: Switching exam types preserves patient info
**Given** a nurse has entered patient name and NRIC  
**When** the nurse changes exam type from TP to LTA  
**And** confirms the change  
**Then** the system SHALL clear formData  
**But** the system SHALL preserve patient name and NRIC  
**And** examination date SHALL be preserved

---

