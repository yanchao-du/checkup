# submission-review Specification

## Purpose
TBD - created by archiving change add-driver-medical-exams. Update Purpose after archive.
## Requirements
### Requirement: The system SHALL display TP Driving Licence Summary
A comprehensive summary for TP driving licence exam submissions before final submission SHALL be displayed.

#### Scenario: Summary displays patient information
**Given** a nurse has completed a TP driving licence exam  
**When** the nurse clicks "Review & Submit"  
**Then** the system SHALL display a summary section "Patient Information" with:
- Full name
- NRIC/FIN
- Date of birth
- Examination date
**And** all values SHALL be read-only

#### Scenario: Summary displays general medical examination results
**Given** the summary is displayed for a TP exam  
**Then** the system SHALL show a "General Medical Examination" section with:
- Height: [value] cm
- Weight: [value] kg
- BMI: [calculated value]
- Blood Pressure: [value] mmHg
- Pulse: [value] bpm
- Visual Acuity: [value]
- Hearing Test: [value]
**And** the BMI SHALL display the calculated value, not user input

#### Scenario: Summary displays medical declaration (condensed)
**Given** the summary is displayed for a TP exam  
**And** the patient declared "Loss of consciousness" and "Diabetes"  
**Then** the system SHALL show a "Medical Declaration" section  
**And** the section SHALL list ONLY the checked items:
- ✓ Loss of consciousness/fainting
- ✓ Diabetes
**And** unchecked items SHALL NOT be displayed  
**And** if no items are checked, the section SHALL display "No conditions declared"

#### Scenario: Summary displays medical history (condensed)
**Given** the summary is displayed for a TP exam  
**And** the patient has "Cardiovascular disease" in medical history  
**Then** the system SHALL show a "Medical History" section  
**And** the section SHALL list ONLY the checked items:
- ✓ Cardiovascular disease
**And** unchecked items SHALL NOT be displayed  
**And** if no items are checked, the section SHALL display "No pre-existing conditions"

#### Scenario: Summary displays AMT score prominently
**Given** the summary is displayed for a TP exam  
**And** the AMT score is 8/10  
**Then** the system SHALL show an "Abbreviated Mental Test" section  
**And** the score SHALL be prominently displayed: "Score: 8/10"  
**And** the section SHALL show which questions were answered correctly  
**And** if score < 8, the warning message SHALL also appear

#### Scenario: Summary displays assessment and decision
**Given** the summary is displayed for a TP exam  
**And** the doctor determined "Fit to Drive: Yes"  
**Then** the system SHALL show a "Medical Practitioner Assessment" section with:
- Fit to Drive: Yes (or No)
- Requires Specialist Review: [Yes/No]
- Specialist Type: [value] (if applicable)
- Remarks: [text]
**And** "Fit to Drive: Yes" SHALL be displayed in green/success color  
**And** "Fit to Drive: No" SHALL be displayed in red/warning color

#### Scenario: Summary has declaration checkbox
**Given** the summary is fully displayed  
**Then** the system SHALL show a checkbox with text:  
"I confirm that all information provided is accurate and complete. I understand that this submission cannot be amended after submission."  
**And** the Submit button SHALL be disabled until checkbox is checked  
**And** when checkbox is checked, Submit button SHALL become enabled

---

### Requirement: The system SHALL display Combined TP+LTA Exam Summary
A comprehensive summary for combined TP and LTA exam submissions SHALL be displayed.

#### Scenario: Combined summary includes all TP sections
**Given** a nurse has completed a combined TP+LTA exam  
**When** the nurse clicks "Review & Submit"  
**Then** the summary SHALL include all TP sections:
- Patient Information
- General Medical Examination
- Medical Declaration
- Medical History
- Abbreviated Mental Test
**And** these SHALL display identically to TP-only exams

#### Scenario: Combined summary includes LTA vocational section
**Given** the summary is displayed for a combined TP+LTA exam  
**Then** the system SHALL additionally show an "LTA Vocational Licence Medical Details" section with:
- Color Vision: [Pass/Fail]
- Peripheral Vision: [Pass/Fail]
- Night Vision: [Pass/Fail]
- Cardiac Condition: [text or "None"]
- Respiratory Condition: [text or "None"]
- Renal Condition: [text or "None"]
- Endocrine Condition: [text or "None"]
- Fit for Vocational Duty: [Yes/No]
- Restrictions: [text or "None"]

#### Scenario: Combined summary shows both fitness determinations
**Given** the summary is displayed for a combined TP+LTA exam  
**Then** the "Medical Practitioner Assessment" section SHALL show:
- **Fit to Drive:** Yes/No
- **Fit for Vocational Duty:** Yes/No
- Requires Specialist Review: Yes/No
- Remarks: [text]
**And** both fitness determinations SHALL be visually distinct and clear

---

### Requirement: The system SHALL display LTA Vocational Licence Only Summary without AMT
A summary for LTA-only vocational licence exam submissions without AMT section SHALL be displayed.

#### Scenario: LTA summary excludes AMT
**Given** a nurse has completed an LTA-only vocational exam  
**When** the nurse clicks "Review & Submit"  
**Then** the summary SHALL include sections:
- Patient Information
- General Medical Examination
- Medical Declaration
- Medical History
- LTA Vocational Licence Medical Details
- Medical Practitioner Assessment
**And** the Abbreviated Mental Test section SHALL NOT appear

#### Scenario: LTA summary assessment shows vocational fitness only
**Given** the summary is displayed for an LTA-only exam  
**Then** the "Medical Practitioner Assessment" section SHALL show:
- **Fit for Vocational Duty:** Yes/No (not "Fit to Drive")
- Requires Specialist Review: Yes/No
- Remarks: [text]
**And** there SHALL be no mention of driving fitness

---

### Requirement: The system SHALL provide read-only View of Submitted Driver Exam Details
Read-only detailed views of submitted driver medical examinations SHALL be provided.

#### Scenario: View TP driving licence submission
**Given** a TP driving licence exam has been submitted  
**When** a user opens the submission from the submissions list  
**Then** the system SHALL display all exam details in a formatted read-only view  
**And** the view SHALL include:
- Submission status badge (e.g., "Submitted")
- Submitted date and time
- Submitted by (doctor name)
- All patient information
- All medical examination data
- Medical declaration items (show all, with checked items highlighted)
- Medical history items (show all, with checked items highlighted)
- AMT questions and score
- Assessment and remarks
**And** no fields SHALL be editable

#### Scenario: View includes submission timeline
**Given** a TP exam submission is being viewed  
**And** the submission went through approval workflow  
**Then** the view SHALL include a timeline section showing:
- Created by [nurse name] on [date/time]
- Routed for approval on [date/time]
- Approved by [doctor name] on [date/time]
- Submitted on [date/time]
**And** if rejected, the timeline SHALL show rejection with reason

#### Scenario: View combined exam shows all sections
**Given** a combined TP+LTA exam submission is being viewed  
**Then** the view SHALL display all TP sections  
**And** the view SHALL display the LTA Vocational section  
**And** both fitness determinations SHALL be clearly shown  
**And** the view SHALL maintain logical section ordering

#### Scenario: View LTA-only exam excludes AMT
**Given** an LTA-only vocational exam submission is being viewed  
**Then** the view SHALL display all sections except AMT  
**And** the assessment SHALL show only vocational fitness determination

#### Scenario: Printable format for views
**Given** a driver exam submission is being viewed  
**When** the user initiates a print action (browser print)  
**Then** the system SHALL render a print-friendly version  
**And** the print version SHALL remove navigation elements  
**And** the print version SHALL use appropriate page breaks between sections  
**And** all data SHALL remain clearly readable

---

### Requirement: The system SHALL allow Summary Navigation between form and summary views
Navigation between form and summary views SHALL be allowed.

#### Scenario: Navigate from form to summary
**Given** a nurse has completed all required sections of a driver exam  
**When** the nurse clicks "Review & Submit" button  
**Then** the system SHALL validate all required fields  
**And** if validation passes, the system SHALL display the summary view  
**And** the form view SHALL be hidden

#### Scenario: Navigate back from summary to form
**Given** a nurse is viewing the summary  
**When** the nurse clicks "Back to Form" or "Edit" button  
**Then** the system SHALL hide the summary view  
**And** the system SHALL display the form view  
**And** all previously entered data SHALL remain intact  
**And** the declaration checkbox state SHALL be reset

#### Scenario: Validation errors prevent summary display
**Given** a nurse clicks "Review & Submit"  
**And** required fields are missing (e.g., AMT not completed)  
**Then** the system SHALL NOT display the summary  
**And** the system SHALL display validation error messages  
**And** the system SHALL scroll to the first error  
**And** the relevant accordion section SHALL expand to show the error

---

### Requirement: The system SHALL ensure Summary Data Accuracy
Summary displays SHALL exactly match entered form data.

#### Scenario: Summary reflects latest form changes
**Given** a nurse has viewed the summary  **And** navigated back to the form  
**And** changed the AMT score from 8/10 to 9/10  
**When** the nurse clicks "Review & Submit" again  
**Then** the summary SHALL display "Score: 9/10"  
**And** the summary SHALL reflect the updated AMT questions

#### Scenario: Calculated fields display correctly
**Given** a nurse entered Height: 170 cm, Weight: 70 kg  
**And** the system calculated BMI: 24.2  
**When** the summary is displayed  
**Then** the summary SHALL show "BMI: 24.2"  
**And** the BMI SHALL match the calculation, not any user input

#### Scenario: Empty optional fields display as "None" or "-"
**Given** the summary is displayed  
**And** the "Specialist Type" field was left empty  
**Then** the summary SHALL display "Specialist Type: None" or "Specialist Type: -"  
**And** empty fields SHALL not display as blank spaces

---

