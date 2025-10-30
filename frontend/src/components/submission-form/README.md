# Submission Form Components

This directory contains reusable form field components and exam-specific form components for the medical examination submission feature.

## Directory Structure

```
submission-form/
├── fields/              # Reusable form field components
│   ├── HeightField.tsx
│   ├── WeightField.tsx
│   ├── BloodPressureField.tsx
│   ├── PregnancyTestField.tsx
│   ├── ChestXrayField.tsx
│   ├── HivTestField.tsx
│   ├── TbTestField.tsx
│   ├── VisualAcuityField.tsx
│   ├── HearingTestField.tsx
│   ├── DiabetesField.tsx
│   └── RemarksField.tsx
└── exam-forms/          # Exam-type specific form components
    ├── SixMonthlyMdwFields.tsx
    ├── WorkPermitFields.tsx
    └── AgedDriversFields.tsx
```

## Field Components

Each field component is self-contained with:
- Built-in validation logic
- Error state management
- Consistent styling and layout
- Proper accessibility attributes

### Common Props Pattern

```typescript
interface FieldProps {
  value: string;
  onChange: (value: string) => void;
}
```

### Numeric Fields (Height, Weight, Blood Pressure)

Numeric fields automatically:
- Sanitize input (remove non-numeric characters)
- Validate on blur
- Display validation errors
- Clear errors when user starts editing

**Example: HeightField**
```tsx
<HeightField
  value={formData.height || ''}
  onChange={(value) => handleFormDataChange('height', value)}
/>
```

Validation: 10-300 cm, 2-3 digits

### BloodPressureField

Special compound field with two inputs:
```tsx
<BloodPressureField
  systolic={formData.systolic || ''}
  diastolic={formData.diastolic || ''}
  onSystolicChange={(value) => handleFormDataChange('systolic', value)}
  onDiastolicChange={(value) => handleFormDataChange('diastolic', value)}
/>
```

- Systolic: 50-250 mmHg
- Diastolic: 30-150 mmHg

### Selection Fields (HIV, TB Tests)

Use shadcn/ui Select component:
```tsx
<HivTestField
  value={formData.hivTest || ''}
  onChange={(value) => handleFormDataChange('hivTest', value)}
/>
```

Options: Negative | Positive

### PregnancyTestField

Checkbox-based field with visual indicator:
- Returns 'Positive' or 'Negative' string value
- Orange text and bold font when positive

### DiabetesField

RadioGroup-based field:
```tsx
<DiabetesField
  value={formData.diabetes || ''}
  onChange={(value) => handleFormDataChange('diabetes', value)}
/>
```

Options: Yes | No

## Exam-Specific Form Components

These components compose multiple field components for each exam type.

### SixMonthlyMdwFields

Fields for Six-Monthly Medical Exam for Migrant Domestic Workers:
- Pregnancy Test
- Chest X-Ray Result

### WorkPermitFields

Fields for Full Medical Exam for Work Permit:
- HIV Test Result
- TB Test Result

### AgedDriversFields

Fields for Medical Exam for Aged Drivers:
- Visual Acuity
- Hearing Test
- Diabetes

### Common Props

```typescript
interface ExamFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
}
```

### Usage Example

```tsx
{examType === 'SIX_MONTHLY_MDW' && (
  <SixMonthlyMdwFields
    formData={formData}
    onChange={handleFormDataChange}
  />
)}
```

## Integration with NewSubmission

The `NewSubmission` component uses these components within an accordion structure:

```tsx
<Accordion type="multiple" defaultValue={['vitals', 'exam-specific', 'remarks']}>
  <AccordionItem value="vitals">
    <AccordionTrigger>Common Vitals</AccordionTrigger>
    <AccordionContent>
      <HeightField ... />
      <WeightField ... />
      <BloodPressureField ... />
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="exam-specific">
    <AccordionTrigger>Exam Specific Fields</AccordionTrigger>
    <AccordionContent>
      {examType === 'SIX_MONTHLY_MDW' && <SixMonthlyMdwFields ... />}
      {examType === 'WORK_PERMIT' && <WorkPermitFields ... />}
      {examType === 'AGED_DRIVERS' && <AgedDriversFields ... />}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="remarks">
    <AccordionTrigger>Additional Remarks</AccordionTrigger>
    <AccordionContent>
      <RemarksField ... />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

## Validation Rules

All validation logic is imported from `lib/validationRules.ts`:
- `validateHeight(value)` - 10-300 cm, 2-3 digits
- `validateWeight(value)` - 1-500 kg, 1-3 digits
- `validateSystolic(value)` - 50-250 mmHg, 2-3 digits
- `validateDiastolic(value)` - 30-150 mmHg, 2-3 digits

## Testing

Field components maintain the same `name` attributes as before, so existing Cypress tests work without modification:

```typescript
cy.get('input[name="height"]').type('170')
cy.get('input[name="weight"]').type('70')
cy.get('input[name="systolic"]').type('120')
cy.get('input[name="diastolic"]').type('80')
```

## Benefits

1. **Reusability**: Field components can be used in other forms
2. **Maintainability**: Each component is focused and easy to test
3. **Consistency**: Validation and error handling is standardized
4. **Scalability**: Easy to add new exam types or fields
5. **User Experience**: Accordion provides better organization

## Adding New Exam Types

To add a new exam type:

1. Create field components for any new fields (if needed)
2. Create an exam-specific form component in `exam-forms/`
3. Import and use it in `NewSubmission.tsx`
4. Add the exam type to the conditional rendering

Example:
```tsx
{examType === 'NEW_EXAM_TYPE' && (
  <NewExamTypeFields
    formData={formData}
    onChange={handleFormDataChange}
  />
)}
```

## Adding New Fields

To add a new common field:

1. Create a new field component in `fields/`
2. Import it in `NewSubmission.tsx`
3. Add it to the appropriate accordion section

Example:
```tsx
// fields/TemperatureField.tsx
export function TemperatureField({ value, onChange }: FieldProps) {
  // Implementation
}

// In NewSubmission.tsx
<AccordionItem value="vitals">
  <AccordionContent>
    <HeightField ... />
    <WeightField ... />
    <TemperatureField ... />
  </AccordionContent>
</AccordionItem>
```
