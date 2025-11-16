# submission-forms Spec Delta

## ADDED Requirements

### Requirement: Short form components SHALL render minimal patient information fields
Short form driver exam components SHALL display only essential patient identification and contact fields.

#### Scenario: Short form renders patient identification fields
**Given** a user has selected a short form driver exam type  
**When** the short form component is rendered  
**Then** the form SHALL display NRIC/FIN input field with validation  
**And** the form SHALL display Patient Name text field  
**And** the form SHALL display Mobile Number field with +65 format validation  
**And** the form SHALL display Purpose of Exam dropdown (values match exam type)  
**And** the form SHALL display Examination Date date picker  
**And** the form SHALL NOT display Date of Birth field  
**And** the form SHALL NOT display Email field  
**And** the form SHALL NOT display Height, Weight, or BMI fields

#### Scenario: Mobile number validation enforces Singapore format
**Given** a user is entering a mobile number in a short form  
**When** the user enters a value that doesn't match +65 followed by 8 digits  
**Then** the system SHALL display error "Please enter a valid Singapore mobile number (+65 XXXXXXXX)"  
**And** the form submission SHALL be blocked until valid

#### Scenario: Purpose of exam dropdown contains 4 standard options
**Given** a user has selected any short form driver exam type  
**When** the Purpose of Exam dropdown is rendered  
**Then** the dropdown SHALL contain exactly 4 options:
- "Age 65 and above - Renew Traffic Police Driving Licence only" (AGE_65_ABOVE_TP_ONLY)
- "Age 65 and above - Renew both Traffic Police & LTA Vocational Licence" (AGE_65_ABOVE_TP_LTA)
- "Age 64 and below - Renew LTA Vocational Licence only" (AGE_64_BELOW_LTA_ONLY)
- "Renew only Bus Attendant's Vocational Licence (BAVL) regardless of age" (BAVL_ANY_AGE)  
**And** the dropdown SHALL be required  
**And** no default option SHALL be pre-selected

---

### Requirement: Short form components SHALL render purpose-specific fitness questions
Fitness determination questions SHALL vary based on the selected Purpose of Exam.

#### Scenario: Purpose 1 (Age 65+ TP only) renders motor vehicle fitness question
**Given** a user has selected a short form driver exam type  
**And** the user selects Purpose "Age 65 and above - Renew Traffic Police Driving Licence only"  
**When** the fitness determination section is rendered  
**Then** the form SHALL display the question "Is the patient physically and mentally fit to drive a motor vehicle?"  
**And** the form SHALL display Yes/No radio buttons  
**And** the form SHALL mark the question as required with red asterisk  
**And** the form SHALL NOT display other fitness questions

#### Scenario: Purpose 2 (Age 65+ TP & LTA) renders two vocational fitness questions
**Given** a user has selected a short form driver exam type  
**And** the user selects Purpose "Age 65 and above - Renew both Traffic Police & LTA Vocational Licence"  
**When** the fitness determination section is rendered  
**Then** the form SHALL display "Is the patient physically and mentally fit to drive a public service vehicle?" with Yes/No options  
**And** the form SHALL display "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?" with Yes/No options  
**And** both questions SHALL be marked as required  
**And** both questions SHALL be independently answerable (one can be Yes, other No)

#### Scenario: Purpose 3 (Age 64 below LTA only) renders two vocational fitness questions
**Given** a user has selected a short form driver exam type  
**And** the user selects Purpose "Age 64 and below - Renew LTA Vocational Licence only"  
**When** the fitness determination section is rendered  
**Then** the form SHALL display "Is the patient physically and mentally fit to drive a public service vehicle?" with Yes/No options  
**And** the form SHALL display "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?" with Yes/No options  
**And** both questions SHALL be marked as required  
**And** both questions SHALL be independently answerable (one can be Yes, other No)

#### Scenario: Purpose 4 (BAVL any age) renders bus attendant fitness question
**Given** a user has selected a short form driver exam type  
**And** the user selects Purpose "Renew only Bus Attendant's Vocational Licence (BAVL) regardless of age"  
**When** the fitness determination section is rendered  
**Then** the form SHALL display only "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?"  
**And** the form SHALL display Yes/No radio buttons  
**And** the form SHALL mark the question as required with red asterisk  
**And** the form SHALL NOT display public service vehicle fitness question

---

### Requirement: Short form SHALL display declaration on summary page
All short forms SHALL require a declaration confirmation on the "Review and Submit" summary page before submission.

#### Scenario: Declaration displays on summary page with all data
**Given** a user has completed "Patient Information" and "Overall Assessment" sections  
**When** the user navigates to "Review and Submit" section  
**Then** the summary page SHALL display all entered data in organized format  
**And** the summary SHALL display patient information (NRIC, name, mobile, purpose, date)  
**And** the summary SHALL display fitness determination(s) with Yes/No values  
**And** the page SHALL display declaration checkbox at bottom  
**And** the page SHALL display declaration text:
"I certify that I have personally examined the patient and confirm the fitness determination(s) above are accurate to the best of my professional judgment."  
**And** the page SHALL display "Edit" button to return to accordion sections  
**And** the page SHALL display "Save as Draft" and "Submit for Approval" buttons

#### Scenario: Declaration validation prevents submission
**Given** a user is on the "Review and Submit" summary page  
**And** the user has not checked the declaration checkbox  
**When** the user attempts to click "Submit for Approval"  
**Then** the system SHALL display error "Please confirm the declaration"  
**And** the error SHALL highlight the declaration checkbox  
**And** the submission SHALL not proceed to approval workflow

#### Scenario: Edit button returns to accordion for modifications
**Given** a user is on the "Review and Submit" summary page  
**When** the user clicks "Edit" button next to "Patient Information"  
**Then** the system SHALL navigate back to "Patient Information" accordion section  
**And** the accordion SHALL expand "Patient Information" section  
**And** all previously entered data SHALL remain populated  
**And** after making changes and clicking "Continue to Overall Assessment", the user can navigate back to summary

---

### Requirement: Short form components SHALL use accordion-based multi-section layout
Short forms SHALL follow the same accordion navigation pattern as long forms with 3 sections.

#### Scenario: Short form renders with accordion sections
**Given** a user has selected a short form exam type  
**When** the form is rendered  
**Then** the form SHALL display 3 accordion sections:
- "Patient Information"
- "Overall Assessment"
- "Review and Submit"  
**And** the "Patient Information" section SHALL be open by default  
**And** other sections SHALL be collapsed initially  
**And** the form SHALL support clicking accordion headers to expand/collapse sections

#### Scenario: Section navigation follows multi-step pattern
**Given** a user is completing a short form  
**And** the user has filled the "Patient Information" section  
**When** the user clicks "Continue to Overall Assessment"  
**Then** the system SHALL validate patient information fields  
**And** the system SHALL collapse "Patient Information" section  
**And** the system SHALL expand "Overall Assessment" section  
**And** the accordion SHALL scroll to show the active section

#### Scenario: Summary page displays all entered data with edit capability
**Given** a user has completed "Patient Information" and "Overall Assessment" sections  
**When** the user clicks "Continue to Summary"  
**Then** the system SHALL navigate to "Review and Submit" section  
**And** the summary SHALL display all entered data in read-only format  
**And** the summary SHALL include an "Edit" button for each section  
**And** clicking "Edit" SHALL return to the corresponding accordion section  
**And** the declaration checkbox SHALL be displayed on the summary page

#### Scenario: Form submission validates progressively per section
**Given** a user attempts to navigate from one section to another  
**When** the user clicks "Continue" button  
**Then** the system SHALL validate only the current section's fields  
**And** the system SHALL display validation errors for current section only  
**And** the system SHALL prevent navigation if current section has errors  
**And** the system SHALL scroll to the first error field in current section

---

### Requirement: Short form components SHALL be organized in dedicated files
Short form components SHALL follow the established component organization pattern with clear naming.

#### Scenario: Component file structure supports short forms
**Given** the submission form codebase  
**Then** short form components SHALL be located in `components/submission-form/exam-forms/`  
**And** component files SHALL be named:
- `DrivingLicenceTpShortFields.tsx`
- `DrivingVocationalTpLtaShortFields.tsx`
- `VocationalLicenceLtaShortFields.tsx`  
**And** each component SHALL render accordion sections using Accordion UI components  
**And** each component SHALL handle section navigation with "Continue" buttons  
**And** each component SHALL include summary page rendering logic  
**And** the main NewSubmission component SHALL import and route to these components

#### Scenario: Short form integrates with existing NewSubmission workflow
**Given** the NewSubmission component manages form state  
**When** a short form exam type is selected  
**Then** the component SHALL render the appropriate short form component  
**And** the component SHALL use the same `currentSection` state management as long forms  
**And** the component SHALL support "Save as Draft" functionality  
**And** the component SHALL support "Submit for Approval" functionality  
**And** the component SHALL maintain form data in the same formData structure  
**And** the component SHALL support navigation blocking for unsaved changes

---

### Requirement: Submission details view SHALL display short form data appropriately
The submission details/review page SHALL render short form submissions with simplified layout showing only collected data.

#### Scenario: View submission details for short form
**Given** a short form submission exists (draft, pending approval, or submitted)  
**When** a user views the submission details page  
**Then** the page SHALL display exam type clearly (e.g., "Short Form: Driving Licence (TP)")  
**And** the page SHALL display patient information section with NRIC, name, mobile, purpose, date  
**And** the page SHALL display overall assessment section with fitness determination(s)  
**And** the page SHALL display declaration status  
**And** the page SHALL NOT display sections for height/weight, blood pressure, medical history, AMT, or LTA vocational details  
**And** the layout SHALL be compact and focused on collected minimal data

#### Scenario: Doctor reviews short form in approval queue
**Given** a short form submission is in "pending_approval" status  
**And** a doctor opens the submission for review  
**When** the doctor views the submission details  
**Then** the page SHALL clearly show it is a short form exam  
**And** all entered data SHALL be clearly visible (patient info + fitness determinations)  
**And** the doctor SHALL see "Approve" and "Reject" buttons  
**And** the approval interface SHALL function identically to long form approvals

---

### Requirement: Short form validation SHALL enforce minimal required fields only
Client-side validation SHALL be relaxed for short forms compared to long forms.

#### Scenario: Short form allows submission without height/weight
**Given** a user is completing a short form  
**When** the user attempts to submit without entering height or weight  
**Then** the system SHALL allow submission to proceed  
**And** the system SHALL NOT display validation errors for missing height/weight  
**And** the backend SHALL accept the submission

#### Scenario: Short form allows submission without medical history
**Given** a user is completing a short form  
**When** the user attempts to submit without filling medical declaration or history sections  
**Then** the system SHALL allow submission to proceed  
**And** the system SHALL NOT require any medical history fields

#### Scenario: Short form blocks submission if fitness determination missing
**Given** a user has filled all patient info fields  
**And** the user has not answered the fitness question(s)  
**When** the user attempts to submit  
**Then** the system SHALL block submission  
**And** the system SHALL display error "Please answer the fitness question" near the unanswered field  
**And** the error SHALL remain until user selects Yes or No

---

## MODIFIED Requirements

### Requirement: Exam type selector SHALL include short form options
The exam type dropdown in NewSubmission component SHALL be expanded to include short form types.

#### Scenario: Exam type dropdown lists short forms separately
**Given** a nurse is on the new submission page  
**When** the exam type dropdown is opened  
**Then** the dropdown SHALL include original 10 exam types  
**And** the dropdown SHALL additionally include:
- "Short Form: Driving Licence (TP)"
- "Short Form: Driving Licence & Vocational (TP & LTA)"
- "Short Form: Vocational Licence (LTA)"  
**And** short form options SHALL be visually grouped or separated (e.g., divider or heading)

---

## REMOVED Requirements

None - existing form components and validation remain unchanged for long forms.
