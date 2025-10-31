# Design: Dynamic Test Requirements

## Architecture Overview
The system will determine required tests based on patient history stored in the database, then propagate these requirements through the API layer to the frontend for conditional rendering. This applies to both Six-Monthly MDW and Six-Monthly FMW exam types.

## Data Flow
```
1. User enters NRIC → Frontend calls POST /patients/lookup with { nric: "XXX" }
2. Backend queries MedicalSubmission table for most recent record
3. Backend extracts test requirements from formData JSON field
4. Backend returns PatientInfo with requiredTests array
5. Frontend stores required tests in component state
6. Frontend conditionally renders test fields based on requirements (MDW/FMW forms)
7. On submit, frontend only collects data for required tests
```

## Data Model Changes

### Backend: PatientInfo Interface
```typescript
export interface PatientInfo {
  nric: string;
  name: string;
  lastHeight?: string;
  lastWeight?: string;
  lastExamDate?: string;
  requiredTests?: {
    pregnancy: boolean;  // Always true for MDW/FMW
    syphilis: boolean;   // Always true for MDW/FMW
    hiv: boolean;        // From formData.hivTestRequired
    chestXray: boolean;  // From formData.chestXrayRequired
  };
}
```

### Frontend: Component State
```typescript
const [requiredTests, setRequiredTests] = useState<{
  pregnancy: boolean;
  syphilis: boolean;
  hiv: boolean;
  chestXray: boolean;
}>({
  pregnancy: true,
  syphilis: true,
  hiv: true,
  chestXray: true,
});
```

## Implementation Strategy

### Phase 1: Backend API (Low Risk)
1. Update `PatientInfo` interface to include `requiredTests`
2. Modify `lookupByNric` to extract test requirements from `formData`
3. Add unit tests for test requirement extraction logic

### Phase 2: Frontend State Management (Medium Risk)
1. Update frontend `PatientInfo` interface to match backend
2. Add `requiredTests` state to `NewSubmission` component
3. Populate state when patient lookup returns data
4. Pass required tests to exam form components

### Phase 3: Conditional Rendering (High Risk)
1. Update `SixMonthlyMdwFields` to accept `requiredTests` prop
2. Update `SixMonthlyFmwFields` to accept `requiredTests` prop
3. Conditionally render test checkboxes based on requirements in both components
4. Update `SixMonthlyMdwSummary` to filter tests
5. Update `SixMonthlyFmwSummary` to filter tests
6. Update `ViewSubmission` to filter displayed tests for both exam types

### Phase 4: Testing & Validation
1. Add backend unit tests for requirement extraction
2. Add frontend component tests for conditional rendering
3. Add E2E tests for full workflow
4. Manual testing with seeded patient data

## Backward Compatibility
- If `formData` doesn't contain `hivTestRequired` or `chestXrayRequired`, assume test is required
- If patient has no previous submissions, show all tests (default behavior)
- Existing submissions with all tests in formData will continue to work

## Edge Cases
1. **New patient (no history)**: Show all tests, save requirements with submission
2. **Partial data in formData**: Default missing test requirements to true
3. **Different exam types**: Only apply dynamic requirements to MDW and FMW exams (not WORK_PERMIT or AGED_DRIVERS)
4. **Editing existing submission**: Use requirements from the submission being edited, not patient history

## Performance Considerations
- No additional database queries (already fetching submission in lookup)
- Minimal JSON parsing overhead (extracting 2 boolean fields)
- Frontend state updates are isolated to form components
- No impact on submission listing or search queries

## Testing Strategy
- **Unit Tests**: Test requirement extraction from various formData structures
- **Integration Tests**: Test API response includes requiredTests
- **Component Tests**: Test conditional rendering of test fields
- **E2E Tests**: Test full workflow from patient lookup to submission
- **Manual Testing**: Use seeded patients with varying requirements
