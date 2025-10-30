# Exam Form Configuration Capability - Spec Delta

## ADDED Requirements

### Requirement: Exam Schema Definition
The system SHALL support declarative exam form schemas defined in JSON files, containing field definitions, validation rules, and metadata.

#### Scenario: Load exam schema from file
- **GIVEN** an exam type "SIX_MONTHLY_MDW" exists
- **WHEN** the system starts up
- **THEN** it loads the schema from `exam-schemas/six-monthly-mdw.json`
- **AND** validates the schema structure is correct
- **AND** makes the schema available via API

#### Scenario: Schema contains required metadata
- **GIVEN** an exam schema file
- **WHEN** validating the schema
- **THEN** schema MUST contain examType field
- **AND** schema MUST contain name field
- **AND** schema MUST contain agency field
- **AND** schema MUST contain version field
- **AND** schema MUST contain at least one field group

#### Scenario: Invalid schema rejected
- **GIVEN** a schema file with missing required fields
- **WHEN** the system loads schemas at startup
- **THEN** system logs validation error
- **AND** system fails to start
- **AND** error message indicates which schema is invalid and why

### Requirement: Schema Field Types
The system SHALL support multiple field types mapped to existing shadcn/ui components for consistency.

**Supported field types and their UI components**:
- `text` → Input component (input.tsx)
- `textarea` → Textarea component (textarea.tsx)
- `number` → Input component with type="number" (input.tsx)
- `email` → Input component with type="email" (input.tsx)
- `tel` → Input component with type="tel" (input.tsx)
- `select` → Select component (select.tsx)
- `radio` → RadioGroup component (radio-group.tsx)
- `checkbox` → Checkbox component (checkbox.tsx)
- `date` → Calendar component (calendar.tsx) with Popover (popover.tsx)
- `switch` → Switch component (switch.tsx)

#### Scenario: Text field renders with Input component
- **GIVEN** a schema defines a text field with maxLength: 100
- **WHEN** form renders
- **THEN** frontend uses Input component from input.tsx
- **AND** Input has maxLength attribute set to 100
- **WHEN** user submits text value exceeding 100 characters
- **THEN** system rejects submission
- **AND** returns error "Field exceeds maximum length of 100 characters"

#### Scenario: Number field renders with Input component
- **GIVEN** a schema defines a number field with min: 50 and max: 250
- **WHEN** form renders
- **THEN** frontend uses Input component with type="number"
- **AND** Input has min and max attributes set
- **WHEN** user submits value 30
- **THEN** system rejects submission
- **AND** returns error message from schema or default "Value must be at least 50"
- **WHEN** user submits value 150
- **THEN** system accepts submission

#### Scenario: Select field renders with Select component
- **GIVEN** a schema defines select field with options ["Positive", "Negative"]
- **WHEN** form renders
- **THEN** frontend uses Select component from select.tsx
- **AND** Select contains SelectTrigger and SelectContent
- **AND** options render as SelectItem components
- **WHEN** user submits value "Positive"
- **THEN** system accepts submission
- **WHEN** user submits value "Invalid"
- **THEN** system rejects submission
- **AND** returns error "Invalid option selected"

#### Scenario: Radio field renders with RadioGroup component
- **GIVEN** a schema defines radio field with options ["Yes", "No"]
- **WHEN** form renders
- **THEN** frontend uses RadioGroup component from radio-group.tsx
- **AND** each option renders as RadioGroupItem

#### Scenario: Date field renders with Calendar component
- **GIVEN** a schema defines date field
- **WHEN** form renders
- **THEN** frontend uses Calendar component from calendar.tsx
- **AND** Calendar is wrapped in Popover from popover.tsx
- **WHEN** user submits invalid date format
- **THEN** system rejects submission
- **AND** returns error "Invalid date format"

#### Scenario: Checkbox field renders with Checkbox component
- **GIVEN** a schema defines checkbox field
- **WHEN** form renders
- **THEN** frontend uses Checkbox component from checkbox.tsx
- **AND** Checkbox is properly labeled

#### Scenario: Switch field renders with Switch component
- **GIVEN** a schema defines switch field for boolean values
- **WHEN** form renders
- **THEN** frontend uses Switch component from switch.tsx

#### Scenario: Textarea field renders with Textarea component
- **GIVEN** a schema defines textarea field with rows: 4
- **WHEN** form renders
- **THEN** frontend uses Textarea component from textarea.tsx
- **AND** textarea has rows attribute set to 4

#### Scenario: Required field validation
- **GIVEN** a schema defines field with required: true
- **WHEN** user submits form without value for required field
- **THEN** system rejects submission
- **AND** returns error "{fieldLabel} is required"

### Requirement: Schema API Endpoint
The system SHALL provide REST API endpoints to retrieve exam schemas.

#### Scenario: Fetch single exam schema
- **GIVEN** exam type "SIX_MONTHLY_MDW" schema exists
- **WHEN** client requests GET /v1/exam-schemas/SIX_MONTHLY_MDW
- **THEN** system returns 200 OK
- **AND** response contains full schema with all field groups and fields
- **AND** response Content-Type is application/json

#### Scenario: Fetch non-existent schema
- **GIVEN** exam type "INVALID_TYPE" does not exist
- **WHEN** client requests GET /v1/exam-schemas/INVALID_TYPE
- **THEN** system returns 404 Not Found
- **AND** error message states "Schema for exam type 'INVALID_TYPE' not found"

#### Scenario: List all available schemas
- **GIVEN** multiple exam schemas exist
- **WHEN** client requests GET /v1/exam-schemas
- **THEN** system returns 200 OK
- **AND** response contains array of schema metadata (examType, name, agency, version)
- **AND** response does NOT include full field definitions (metadata only)

### Requirement: Dynamic Form Rendering
The system SHALL render form fields dynamically based on schema definition.

#### Scenario: Render form from schema
- **GIVEN** user selects exam type "SIX_MONTHLY_MDW"
- **WHEN** form loads
- **THEN** frontend fetches schema from /v1/exam-schemas/SIX_MONTHLY_MDW
- **AND** frontend renders all field groups as separate sections
- **AND** frontend renders each field with correct input type
- **AND** field labels match schema labels
- **AND** field placeholders match schema placeholders
- **AND** fields appear in order defined in schema

#### Scenario: Field group rendering
- **GIVEN** schema has field group "Vital Signs" containing height, weight, blood pressure
- **WHEN** form renders
- **THEN** frontend displays "Vital Signs" as section heading
- **AND** all fields in group render under that heading
- **AND** fields within group appear in schema order

#### Scenario: Textarea field with rows
- **GIVEN** schema defines textarea field with rows: 4
- **WHEN** form renders
- **THEN** frontend renders textarea element
- **AND** textarea has 4 rows initially

#### Scenario: Select field with options
- **GIVEN** schema defines select field with options [{"value": "Positive", "label": "Positive"}, {"value": "Negative", "label": "Negative"}]
- **WHEN** form renders
- **THEN** frontend renders select dropdown
- **AND** dropdown contains exactly those options
- **AND** option labels display correctly

### Requirement: Client-Side Validation
The system SHALL validate form fields on the frontend using schema validation rules.

#### Scenario: Real-time validation on blur
- **GIVEN** schema defines height field with min: 50
- **WHEN** user enters 30 and moves to next field
- **THEN** frontend displays inline error message
- **AND** error message matches schema errorMessages.min or default message
- **AND** field is highlighted in red

#### Scenario: Clear validation error on fix
- **GIVEN** user has validation error on height field
- **WHEN** user corrects the value to valid number
- **THEN** error message disappears
- **AND** red highlight is removed

#### Scenario: Submit button disabled on validation errors
- **GIVEN** form has one or more validation errors
- **WHEN** user attempts to click submit
- **THEN** submit button remains disabled
- **AND** user cannot submit invalid form

### Requirement: Server-Side Schema Validation
The system SHALL validate submission formData against exam schema on the backend before persisting.

#### Scenario: Backend validates required fields
- **GIVEN** schema defines "height" as required: true
- **WHEN** submission arrives without height value
- **THEN** backend returns 400 Bad Request
- **AND** error response includes field-level errors
- **AND** error for height states "Height is required"

#### Scenario: Backend validates field types
- **GIVEN** schema defines "weight" as number field
- **WHEN** submission includes weight: "abc"
- **THEN** backend returns 400 Bad Request
- **AND** error states "Weight must be a valid number"

#### Scenario: Backend validates ranges
- **GIVEN** schema defines systolic with max: 250
- **WHEN** submission includes systolic: 300
- **THEN** backend returns 400 Bad Request
- **AND** error states "Systolic must not exceed 250"

#### Scenario: Backend accepts valid submission
- **GIVEN** all form fields pass schema validation
- **WHEN** submission is created or updated
- **THEN** backend accepts submission
- **AND** stores formData as JSONB in database
- **AND** returns 201 Created or 200 OK

### Requirement: Schema Caching
The system SHALL cache exam schemas in frontend to minimize API calls.

#### Scenario: First schema load
- **GIVEN** user opens new submission form
- **WHEN** selecting exam type "SIX_MONTHLY_MDW" for first time
- **THEN** frontend fetches schema from backend API
- **AND** stores schema in local cache (Map or similar)

#### Scenario: Subsequent schema load
- **GIVEN** schema for "SIX_MONTHLY_MDW" is in cache
- **WHEN** user creates another submission of same type
- **THEN** frontend loads schema from cache
- **AND** does NOT make API call to backend

#### Scenario: Cache invalidation on app reload
- **GIVEN** schemas are cached
- **WHEN** user refreshes page or app restarts
- **THEN** cache is cleared
- **AND** schemas are refetched on next use

### Requirement: Backward Compatibility
The system SHALL maintain backward compatibility with existing hardcoded exam forms during migration period.

#### Scenario: Hardcoded forms still work
- **GIVEN** exam type "WORK_PERMIT" does not have schema file yet
- **WHEN** user selects "WORK_PERMIT" exam type
- **THEN** frontend falls back to hardcoded form rendering
- **AND** all existing functionality works unchanged

#### Scenario: Schema-driven forms coexist with hardcoded forms
- **GIVEN** "SIX_MONTHLY_MDW" has schema file
- **AND** "WORK_PERMIT" uses hardcoded form
- **WHEN** users create both exam types
- **THEN** both rendering approaches work correctly
- **AND** submissions save successfully
- **AND** formData structure remains compatible

#### Scenario: Existing submissions readable
- **GIVEN** submissions created before schema system
- **WHEN** user views or edits old submission
- **THEN** formData loads correctly
- **AND** form displays existing values
- **AND** user can save changes

### Requirement: Error Handling
The system SHALL handle schema loading and validation errors gracefully.

#### Scenario: Schema fetch fails
- **GIVEN** backend is unreachable
- **WHEN** frontend attempts to fetch schema
- **THEN** frontend displays error message "Unable to load form. Please try again."
- **AND** user cannot proceed with submission
- **AND** error is logged for debugging

#### Scenario: Malformed schema
- **GIVEN** schema file has invalid JSON syntax
- **WHEN** backend attempts to load schemas at startup
- **THEN** backend logs error with file name and parse error
- **AND** backend fails to start (prevents deployment of broken config)

#### Scenario: Schema validation error details
- **GIVEN** submission fails schema validation
- **WHEN** backend returns validation errors
- **THEN** response includes field-level error details
- **AND** response format is { field: "fieldId", message: "error message" }
- **AND** frontend displays errors next to respective fields

### Requirement: Field Groups and Layout
The system SHALL organize fields into logical groups as defined in schema.

#### Scenario: Multiple field groups render as sections
- **GIVEN** schema defines 3 field groups: "Vital Signs", "MDW-Specific Tests", "Additional Information"
- **WHEN** form renders
- **THEN** frontend displays 3 distinct sections/cards
- **AND** each section has group label as heading
- **AND** fields within each group appear together

#### Scenario: Group order follows schema
- **GIVEN** schema defines groups in specific order
- **WHEN** form renders
- **THEN** groups appear in exact order from schema
- **AND** user sees logical flow of form sections

### Requirement: Extensibility for New Exam Types
The system SHALL allow adding new exam types by creating schema files without code changes.

#### Scenario: Add new exam type via schema file
- **GIVEN** new exam type "FOOD_HANDLER" is needed
- **WHEN** developer creates `exam-schemas/food-handler.json`
- **AND** adds ExamType enum value "FOOD_HANDLER" to database schema
- **AND** deploys application
- **THEN** new exam type appears in exam type dropdown
- **AND** form renders correctly from schema
- **AND** validation works as defined
- **AND** NO changes to React components were needed

#### Scenario: Update existing exam type schema
- **GIVEN** "SIX_MONTHLY_MDW" schema needs new field "bloodSugar"
- **WHEN** developer adds field to schema file
- **AND** redeploys application
- **THEN** new field appears in form
- **AND** validation rules apply
- **AND** NO React component code changes needed

## Cross-Capability References

This capability relates to:
- **Submissions**: Form data structure and validation
- **User Management**: Role-based form access
- **Audit Logging**: Schema version tracking for submissions

## Migration Notes

### Phase 1: Infrastructure (No Breaking Changes)
- Add exam-schemas directory structure
- Implement schema loader and validator services
- Add API endpoint for schema retrieval
- Create TypeScript types for schemas
- Add schema caching logic

### Phase 2: Create Schemas for Existing Exam Types
Create schema files:
- `exam-schemas/six-monthly-mdw.json`
- `exam-schemas/work-permit.json`
- `exam-schemas/aged-drivers.json`

Map existing hardcoded fields from `NewSubmission.tsx` lines 486-600 to schema format.

### Phase 3: Build Dynamic Form Components
- `DynamicFormField.tsx` - Render individual fields
- `DynamicExamForm.tsx` - Render entire form from schema
- Schema-based validation utilities

### Phase 4: Migrate Frontend Progressively
- Refactor `NewSubmission.tsx` to use `DynamicExamForm`
- Keep hardcoded fallback during transition
- Test each exam type thoroughly

### Phase 5: Remove Hardcoded Forms
- Delete conditional rendering blocks from `NewSubmission.tsx`
- Remove unused validation code from `validationRules.ts`
- Clean up legacy code

### Database Schema Changes

**NONE** - formData remains JSONB column. Schema system is orthogonal to database structure.

### Testing Strategy

**Unit Tests**:
- Schema validation logic
- Field-level validators (min, max, pattern, required)
- Schema loading and caching

**Integration Tests**:
- API endpoint returns correct schemas
- Submission validation against schemas
- Error handling for invalid schemas

**E2E Tests** (Cypress):
- Load form for each exam type
- Fill out form fields
- Trigger validation errors
- Submit valid form
- Verify schema-driven forms work identically to hardcoded forms

## Performance Considerations

1. **Schema Loading**: Schemas loaded at backend startup (one-time cost)
2. **Frontend Caching**: Schemas cached after first fetch per exam type
3. **Validation**: Client-side validation prevents unnecessary API calls
4. **Bundle Size**: Schema files served via API (not bundled in frontend)

## Security Considerations

1. **Schema Integrity**: Schemas are static files in version control (not user-editable)
2. **Validation**: Backend validates all submissions regardless of frontend validation
3. **Injection Prevention**: Schema values are not executed as code
4. **Access Control**: Existing role-based access applies (no new permissions needed)
