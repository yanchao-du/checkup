# Implementation Tasks: Refactor Submission Form

## Phase 1: Create Reusable Field Components

### Task 1.1: Create HeightField component
- [ ] Create `frontend/src/components/submission-form/fields/HeightField.tsx`
- [ ] Implement controlled input with numeric validation (10-300 cm)
- [ ] Add auto-sanitization for non-numeric input
- [ ] Include built-in error state and message display
- [ ] Test component renders and validates correctly

### Task 1.2: Create WeightField component
- [ ] Create `frontend/src/components/submission-form/fields/WeightField.tsx`
- [ ] Implement controlled input with numeric validation (1-500 kg)
- [ ] Add auto-sanitization for non-numeric input
- [ ] Include built-in error state and message display
- [ ] Test component renders and validates correctly

### Task 1.3: Create BloodPressureField component
- [ ] Create `frontend/src/components/submission-form/fields/BloodPressureField.tsx`
- [ ] Implement compound field (systolic/diastolic)
- [ ] Add validation for systolic (50-250) and diastolic (30-150)
- [ ] Include individual error states and messages
- [ ] Maintain side-by-side layout with labels
- [ ] Test component renders and validates correctly

### Task 1.4: Create PregnancyTestField component
- [ ] Create `frontend/src/components/submission-form/fields/PregnancyTestField.tsx`
- [ ] Implement checkbox with "Positive" label
- [ ] Add visual indicator (orange text) when positive
- [ ] Return 'Positive' or 'Negative' string value
- [ ] Test component renders and changes correctly

### Task 1.5: Create ChestXrayField component
- [ ] Create `frontend/src/components/submission-form/fields/ChestXrayField.tsx`
- [ ] Implement text input with placeholder
- [ ] No custom validation (free text)
- [ ] Test component renders correctly

### Task 1.6: Create HivTestField and TbTestField components
- [ ] Create `frontend/src/components/submission-form/fields/HivTestField.tsx`
- [ ] Create `frontend/src/components/submission-form/fields/TbTestField.tsx`
- [ ] Implement Select dropdown with Positive/Negative options
- [ ] Test components render and select correctly

### Task 1.7: Create VisualAcuityField component
- [ ] Create `frontend/src/components/submission-form/fields/VisualAcuityField.tsx`
- [ ] Implement text input with placeholder "6/6"
- [ ] Test component renders correctly

### Task 1.8: Create HearingTestField component
- [ ] Create `frontend/src/components/submission-form/fields/HearingTestField.tsx`
- [ ] Implement text input with placeholder "Normal / Impaired"
- [ ] Test component renders correctly

### Task 1.9: Create DiabetesField component
- [ ] Create `frontend/src/components/submission-form/fields/DiabetesField.tsx`
- [ ] Implement RadioGroup with Yes/No options
- [ ] Maintain existing layout
- [ ] Test component renders and selects correctly

### Task 1.10: Create RemarksField component
- [ ] Create `frontend/src/components/submission-form/fields/RemarksField.tsx`
- [ ] Implement Textarea with 4 rows
- [ ] Add appropriate placeholder text
- [ ] Test component renders correctly

## Phase 2: Create Exam-Specific Form Components

### Task 2.1: Create SixMonthlyMdwFields component
- [ ] Create `frontend/src/components/submission-form/exam-forms/SixMonthlyMdwFields.tsx`
- [ ] Import and render PregnancyTestField
- [ ] Import and render ChestXrayField
- [ ] Wire up formData and onChange props
- [ ] Test component renders all fields correctly

### Task 2.2: Create WorkPermitFields component
- [ ] Create `frontend/src/components/submission-form/exam-forms/WorkPermitFields.tsx`
- [ ] Import and render HivTestField
- [ ] Import and render TbTestField
- [ ] Wire up formData and onChange props
- [ ] Test component renders all fields correctly

### Task 2.3: Create AgedDriversFields component
- [ ] Create `frontend/src/components/submission-form/exam-forms/AgedDriversFields.tsx`
- [ ] Import and render VisualAcuityField
- [ ] Import and render HearingTestField
- [ ] Import and render DiabetesField
- [ ] Wire up formData and onChange props
- [ ] Test component renders all fields correctly

## Phase 3: Refactor NewSubmission Component

### Task 3.1: Implement accordion structure
- [ ] Import Accordion, AccordionContent, AccordionItem, AccordionTrigger from ui
- [ ] Replace existing Medical Examination Details Card with Accordion
- [ ] Create "Common Vitals" accordion item
- [ ] Create dynamic exam-specific accordion item (conditional rendering)
- [ ] Create "Additional Remarks" accordion item
- [ ] Set accordion type to "multiple" with all sections default open

### Task 3.2: Replace common vitals fields
- [ ] Import HeightField, WeightField, BloodPressureField
- [ ] Replace inline height input with HeightField component
- [ ] Replace inline weight input with WeightField component
- [ ] Replace inline blood pressure inputs with BloodPressureField component
- [ ] Update state management to work with new components
- [ ] Remove old height, weight, systolic, diastolic error state variables
- [ ] Test common vitals section renders and validates

### Task 3.3: Replace exam-specific fields
- [ ] Import SixMonthlyMdwFields, WorkPermitFields, AgedDriversFields
- [ ] Replace SIX_MONTHLY_MDW inline fields with SixMonthlyMdwFields component
- [ ] Replace WORK_PERMIT inline fields with WorkPermitFields component
- [ ] Replace AGED_DRIVERS inline fields with AgedDriversFields component
- [ ] Ensure conditional rendering based on examType still works
- [ ] Test each exam type renders correct fields

### Task 3.4: Replace remarks field
- [ ] Import RemarksField component
- [ ] Replace inline Textarea with RemarksField component
- [ ] Wire up formData.remarks and onChange
- [ ] Test remarks field renders and updates correctly

### Task 3.5: Clean up unused code
- [ ] Remove inline field JSX code
- [ ] Remove unused error state variables (heightError, weightError, etc.)
- [ ] Remove inline validation logic (now in field components)
- [ ] Verify no dead code remains
- [ ] Verify component is under 400 lines

## Phase 4: Update Tests

### Task 4.1: Review Cypress tests
- [ ] Identify affected E2E tests (submissions.e2e-spec.ts, auth.e2e-spec.ts)
- [ ] Check if any test selectors need updating
- [ ] Document required test changes

### Task 4.2: Update test selectors (if needed)
- [ ] Update Cypress selectors for accordion-wrapped fields
- [ ] Ensure data-testid attributes preserved on key inputs
- [ ] Update custom commands if needed

### Task 4.3: Run E2E tests
- [ ] Run `npm run dev` in frontend
- [ ] Run full Cypress test suite
- [ ] Verify all submission-related tests pass
- [ ] Fix any broken tests

### Task 4.4: Manual testing
- [ ] Test creating new submission for each exam type
- [ ] Test editing existing draft
- [ ] Test validation on all fields (trigger errors, clear errors)
- [ ] Test saving draft with accordion-based form
- [ ] Test submitting form for each exam type
- [ ] Test accordion expand/collapse behavior
- [ ] Test with keyboard navigation
- [ ] Test responsive layout on mobile viewport

## Phase 5: Documentation and Cleanup

### Task 5.1: Update component documentation
- [ ] Add JSDoc comments to field components
- [ ] Add README.md in submission-form/ directory
- [ ] Document component props and usage

### Task 5.2: Code review checklist
- [ ] Verify TypeScript has no errors
- [ ] Verify ESLint has no warnings
- [ ] Check for console.log statements and remove
- [ ] Ensure consistent code style
- [ ] Verify all imports are used

### Task 5.3: Final validation
- [ ] Run frontend build: `npm run build`
- [ ] Verify no build errors
- [ ] Check bundle size hasn't significantly increased
- [ ] Confirm all functionality works in production build

## Validation Criteria

### Functionality
- ✓ All exam types render correctly
- ✓ All fields validate as before
- ✓ Draft saving works correctly
- ✓ Form submission works correctly
- ✓ Error states display properly
- ✓ Accordion expands/collapses smoothly

### Code Quality
- ✓ NewSubmission.tsx reduced to ~300 lines
- ✓ No TypeScript errors
- ✓ No ESLint warnings
- ✓ Consistent code style
- ✓ Proper component organization

### Testing
- ✓ All existing E2E tests pass
- ✓ Manual testing confirms all functionality
- ✓ No regressions in user workflows

### User Experience
- ✓ Form is easier to navigate
- ✓ Validation behavior is unchanged
- ✓ Visual design is consistent
- ✓ Accessibility maintained
