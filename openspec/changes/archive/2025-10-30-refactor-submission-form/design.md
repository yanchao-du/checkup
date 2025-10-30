# Design: Accordion-Based Submission Form Refactoring

## Architecture Overview

### Component Hierarchy
```
NewSubmission (main container)
├── PatientInfoCard (existing Card, no changes)
└── MedicalExamDetailsAccordion
    ├── AccordionItem: Common Vitals
    │   ├── HeightField
    │   ├── WeightField
    │   └── BloodPressureField
    ├── AccordionItem: Exam-Specific Fields (conditional)
    │   ├── SixMonthlyMdwFields
    │   │   ├── PregnancyTestField
    │   │   └── ChestXrayField
    │   ├── WorkPermitFields
    │   │   ├── HivTestField
    │   │   └── TbTestField
    │   └── AgedDriversFields
    │       ├── VisualAcuityField
    │       ├── HearingTestField
    │       └── DiabetesField
    └── AccordionItem: Additional Remarks
        └── RemarksField
```

## Component Design

### 1. Reusable Form Field Components

#### Base Pattern
Each field component follows this pattern:
```typescript
interface FieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  onError?: (error: string | null) => void;
}
```

#### Field Components to Create

**`HeightField.tsx`**
- Input type: numeric (2-3 digits)
- Validation: 10-300 cm
- Auto-sanitizes non-numeric input
- Shows error message on blur

**`WeightField.tsx`**
- Input type: numeric (1-3 digits)
- Validation: 1-500 kg
- Auto-sanitizes non-numeric input
- Shows error message on blur

**`BloodPressureField.tsx`**
- Compound field (systolic/diastolic)
- Validation: systolic 50-250, diastolic 30-150
- Returns object: `{ systolic: string, diastolic: string }`
- Individual error states for each

**`PregnancyTestField.tsx`**
- Type: checkbox with visual indicator
- Displays "Positive" in orange when checked
- Returns: 'Positive' | 'Negative'

**`ChestXrayField.tsx`**
- Type: text input
- Placeholder: "Normal / Abnormal findings"
- No custom validation (free text)

**`HivTestField.tsx` / `TbTestField.tsx`**
- Type: Select dropdown
- Options: Negative | Positive
- Required field validation

**`VisualAcuityField.tsx`**
- Type: text input
- Placeholder: "6/6"
- No strict validation (clinical notation varies)

**`HearingTestField.tsx`**
- Type: text input
- Placeholder: "Normal / Impaired"
- No strict validation

**`DiabetesField.tsx`**
- Type: RadioGroup
- Options: Yes | No
- Visual layout maintained

**`RemarksField.tsx`**
- Type: Textarea
- Placeholder: "Enter any additional medical findings or notes"
- Rows: 4

### 2. Exam-Specific Form Components

**`SixMonthlyMdwFields.tsx`**
```typescript
interface Props {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
}
```
Renders:
- PregnancyTestField
- ChestXrayField

**`WorkPermitFields.tsx`**
Renders:
- HivTestField
- TbTestField

**`AgedDriversFields.tsx`**
Renders:
- VisualAcuityField
- HearingTestField
- DiabetesField

### 3. Accordion Structure

**Default State**: All sections expanded for optimal UX
- Allows users to see entire form at once
- Maintains current workflow
- Accordion can be collapsed for focusing on specific sections

**Sections**:
1. **Common Vitals** (always visible when exam type selected)
   - Height, Weight, Blood Pressure
2. **Exam-Specific Fields** (conditional based on exam type)
   - Dynamic title based on exam type
3. **Additional Remarks** (always visible)
   - Free-text remarks field

## Data Flow

### State Management
- Parent component (`NewSubmission`) maintains all state
- Field components are controlled components
- Validation errors managed at parent level or field level (hybrid approach)

### Validation Strategy
1. **Real-time sanitization**: Remove invalid characters on change
2. **On-blur validation**: Validate and show errors when field loses focus
3. **On-clear behavior**: Clear error when user starts editing
4. **Submit validation**: Final check before submission (existing logic)

### Form Data Structure (unchanged)
```typescript
formData: {
  height?: string;
  weight?: string;
  systolic?: string;
  diastolic?: string;
  // Exam-specific fields
  pregnancyTest?: 'Positive' | 'Negative';
  chestXray?: string;
  hivTest?: 'Positive' | 'Negative';
  tbTest?: 'Positive' | 'Negative';
  visualAcuity?: string;
  hearingTest?: string;
  diabetes?: 'Yes' | 'No';
  remarks?: string;
}
```

## File Structure

```
frontend/src/components/
├── NewSubmission.tsx (refactored, ~300 lines)
├── submission-form/
│   ├── fields/
│   │   ├── HeightField.tsx
│   │   ├── WeightField.tsx
│   │   ├── BloodPressureField.tsx
│   │   ├── PregnancyTestField.tsx
│   │   ├── ChestXrayField.tsx
│   │   ├── HivTestField.tsx
│   │   ├── TbTestField.tsx
│   │   ├── VisualAcuityField.tsx
│   │   ├── HearingTestField.tsx
│   │   ├── DiabetesField.tsx
│   │   └── RemarksField.tsx
│   └── exam-forms/
│       ├── SixMonthlyMdwFields.tsx
│       ├── WorkPermitFields.tsx
│       └── AgedDriversFields.tsx
```

## UI/UX Considerations

### Accordion Behavior
- Use shadcn/ui `Accordion` component
- Type: `multiple` (allows multiple sections open)
- Default: all sections open
- Smooth transitions

### Visual Design
- Maintain existing Card-based layout
- Accordion items have subtle borders
- Error states remain consistent (red border, error text)
- Preserve existing spacing and layout patterns

### Accessibility
- All fields maintain proper labels
- Error messages associated with inputs (aria)
- Keyboard navigation supported by Accordion
- Screen reader friendly

## Migration Strategy

### Phase 1: Create Field Components
1. Extract validation logic from `validationRules.ts` into components
2. Create individual field components with self-contained validation
3. Test each component in isolation

### Phase 2: Create Exam-Specific Forms
1. Build composite forms for each exam type
2. Use field components from Phase 1
3. Ensure data flow works correctly

### Phase 3: Refactor NewSubmission
1. Implement accordion structure
2. Replace inline fields with new components
3. Remove old field code
4. Maintain all existing hooks and logic for draft/submit

### Phase 4: Update Tests
1. Update Cypress selectors if needed
2. Verify all E2E tests pass
3. Add tests for accordion interaction if needed

## Testing Strategy

### Unit Testing (Future)
- Each field component can be unit tested independently
- Test validation logic
- Test onChange behavior

### E2E Testing (Existing)
- Minimal changes to existing Cypress tests
- May need to update selectors if data-testid changes
- Test accordion open/close if needed
- Verify form submission still works

## Backward Compatibility
- No API changes
- No data structure changes
- No breaking changes to existing flows
- Draft submissions continue to work
- All validation rules preserved

## Performance Considerations
- Component splitting reduces bundle for code splitting (if implemented)
- Lazy loading exam-specific forms (future optimization)
- No significant performance impact expected
- Accordion reduces DOM complexity when sections collapsed

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing tests | Update test selectors incrementally, verify each step |
| Validation behavior changes | Compare validation logic line-by-line during migration |
| State management complexity | Keep state in parent, use controlled components |
| User confusion with new UI | Default all sections to open, maintain visual consistency |

## Future Enhancements
- Form-level validation hook
- Reusable field components for other forms
- Dynamic form generation from schema
- Field-level loading states
- Auto-save on field blur
