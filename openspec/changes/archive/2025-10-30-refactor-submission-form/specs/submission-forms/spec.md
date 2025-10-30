# Capability: Submission Forms

## Overview
Form components for creating and editing medical examination submissions with support for multiple exam types, field validation, and user-friendly organization.

---

## ADDED Requirements

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
