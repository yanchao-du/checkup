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

---

## MODIFIED Requirements

### Requirement: NewSubmission component delegation
The NewSubmission component SHALL delegate field rendering and validation to reusable child components, focusing on state management and submission logic.

**Previous behavior**: The NewSubmission component contained all form fields and validation logic inline, resulting in a large monolithic component (~717 lines).

**New behavior**: The component delegates rendering to child components and manages only form-level state and submission logic.

#### Scenario: Refactored component maintains core responsibilities
**Given** the refactored NewSubmission component  
**Then** it shall manage form-level state (examType, patientName, patientNric, etc.)  
**And** it shall handle draft saving and submission logic  
**And** it shall render Patient Information card (unchanged)  
**And** it shall render accordion-based Medical Examination Details  
**And** it shall delegate field rendering to reusable components  
**And** the component file shall be reduced to approximately 300-400 lines

---

### Requirement: Distributed form validation
Validation logic SHALL be distributed to individual field components while maintaining the same validation rules and user experience.

**Previous behavior**: Validation logic was centralized in the NewSubmission component with separate error state variables for each field.

**New behavior**: Each field component manages its own validation and error state.

#### Scenario: Validation behavior is preserved
**Given** a user is entering form data  
**When** validation is triggered (on blur, on submit)  
**Then** the validation rules shall be identical to the previous implementation  
**And** error messages shall be displayed in the same manner (red border, error text)  
**And** errors shall clear when the user starts editing  
**And** form submission shall be blocked if required fields are invalid

---

### Requirement: Accordion layout for medical exam details
Medical examination details SHALL be organized in an Accordion with collapsible sections for better organization.

**Previous behavior**: Medical examination details were displayed in a single Card component with all fields visible at once.

**New behavior**: Details are organized into collapsible accordion sections (Common Vitals, Exam-Specific Fields, Additional Remarks).

#### Scenario: Accordion replaces single card layout
**Given** a user has selected an exam type  
**When** the medical examination details section is rendered  
**Then** it shall use an Accordion component instead of a Card  
**And** the accordion shall have a descriptive title for each section  
**And** the visual design shall remain consistent with the existing card-based UI  
**And** all existing fields shall be present in the appropriate accordion section

---

## REMOVED Requirements

None. This refactoring maintains all existing functionality.

---

## Dependencies

### Internal Dependencies
- Existing shadcn/ui Accordion component
- Existing shadcn/ui form components (Input, Select, RadioGroup, Textarea, Label, Button)
- Existing validation rules from `lib/validationRules.ts`
- Existing ExamType definitions from services

### External Dependencies
None beyond existing project dependencies.

---

## Testing Requirements

### Cypress E2E Tests
- Existing submission E2E tests must pass with minimal modifications
- Test selectors may need updates if accordion changes DOM structure
- All exam type flows must be verified (create, edit, save draft, submit)

### Manual Testing
- Verify accordion expand/collapse behavior
- Verify all validation rules work identically to before
- Verify form submission for all exam types
- Verify draft saving and loading
- Test keyboard navigation and accessibility
- Test responsive layout

---

## Backward Compatibility

### API Compatibility
- No changes to backend API contract
- Form data structure remains unchanged
- Draft submissions continue to work with existing data format

### Data Compatibility
- No database schema changes
- Existing draft submissions render correctly in new UI
- All existing submission data displays properly

---

## Non-Functional Requirements

### Performance
- Component splitting shall not negatively impact page load time
- Form responsiveness shall remain the same or improve
- Bundle size increase shall be minimal (<5%)

### Maintainability
- Each field component shall be independently testable
- Adding new exam types shall require minimal changes to NewSubmission
- Adding new fields shall be accomplished by creating new field components
- Code duplication shall be reduced by at least 50%

### Accessibility
- All fields shall maintain proper labels and ARIA attributes
- Accordion shall support keyboard navigation
- Error messages shall be associated with their inputs
- Color contrast shall meet WCAG 2.1 AA standards

### Code Quality
- TypeScript strict mode shall pass with no errors
- ESLint shall pass with no warnings
- Component file sizes shall be under 200 lines each (except NewSubmission)
- Consistent naming conventions shall be followed

---

## Migration Notes

### Breaking Changes
None. This is a pure refactoring with no breaking changes to functionality or API.

### Deprecations
None.

### Rollback Plan
If issues are discovered post-deployment:
1. Revert to previous NewSubmission.tsx from version control
2. Remove new component directories
3. Verify all tests pass with reverted code
