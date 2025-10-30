# Tasks: Add Configurable Exam Form Schema System

## Phase 1: Schema Infrastructure (Backend)

### 1. Define schema format specification
- [ ] Create TypeScript interfaces for ExamSchema, FieldGroup, Field types
- [ ] Document schema JSON structure with examples
- [ ] Add JSON schema validation file (optional but recommended)
- **Validation**: Schema types compile without errors

### 2. Create exam schema directory and files
- [ ] Create `backend/exam-schemas/` directory
- [ ] Create `six-monthly-mdw.json` schema from existing form fields
- [ ] Create `work-permit.json` schema from existing form fields
- [ ] Create `aged-drivers.json` schema from existing form fields
- **Validation**: All JSON files parse successfully, contain required metadata

### 3. Implement ExamSchemaService (backend)
- [ ] Create `backend/src/exam-schemas/exam-schema.module.ts`
- [ ] Create `backend/src/exam-schemas/exam-schema.service.ts`
  - Load schemas from JSON files on startup
  - Validate schema structure
  - Provide `getSchema(examType)` and `getAllSchemas()` methods
  - Implement schema caching
- [ ] Add schema loading error handling and logging
- **Validation**: Service loads all 3 schemas at startup, `getSchema()` returns correct schema

### 4. Implement ExamSchemaController (backend)
- [ ] Create `backend/src/exam-schemas/exam-schema.controller.ts`
- [ ] Add `GET /v1/exam-schemas` endpoint (list all schemas - metadata only)
- [ ] Add `GET /v1/exam-schemas/:examType` endpoint (get full schema)
- [ ] Add proper error handling for 404 when schema not found
- **Validation**: Endpoints return correct responses, 404 for invalid exam types

### 5. Add schema-based field validation (backend)
- [ ] Create `backend/src/exam-schemas/validators/schema-field.validator.ts`
- [ ] Implement validation for each field type (text, number, date, select, etc.)
- [ ] Implement required field validation
- [ ] Implement range validation (min/max)
- [ ] Implement pattern/regex validation
- [ ] Add custom error messages from schema
- **Validation**: Unit tests pass for all field types and validation rules

### 6. Integrate schema validation in SubmissionsService
- [ ] Update `backend/src/submissions/submissions.service.ts`
- [ ] Add `validateFormDataAgainstSchema()` method
- [ ] Call schema validation before creating submission
- [ ] Call schema validation before updating submission
- [ ] Return structured validation errors (array of { field, message })
- **Validation**: E2E tests show validation errors for invalid submissions

## Phase 2: Frontend Schema Integration

### 7. Create schema type definitions (frontend)
- [ ] Create `frontend/src/schemas/exam-schema.types.ts`
- [ ] Define TypeScript interfaces matching backend schema structure
- [ ] Export Field type union and all field interfaces
- **Validation**: Types compile successfully, no TypeScript errors

### 8. Implement ExamSchemaService (frontend)
- [ ] Create `frontend/src/services/exam-schema.service.ts`
- [ ] Implement `getSchema(examType)` with HTTP fetch
- [ ] Add schema caching (Map-based)
- [ ] Add cache invalidation on app reload
- [ ] Add error handling for fetch failures
- **Validation**: Service successfully fetches and caches schemas from backend

### 9. Create DynamicFormField component
- [ ] Create `frontend/src/components/DynamicFormField.tsx`
- [ ] Implement rendering for text input fields
- [ ] Implement rendering for number input fields
- [ ] Implement rendering for date input fields
- [ ] Implement rendering for select/dropdown fields
- [ ] Implement rendering for radio button fields
- [ ] Implement rendering for checkbox fields
- [ ] Implement rendering for textarea fields
- [ ] Apply validation rules from schema (client-side)
- [ ] Display validation error messages
- **Validation**: Each field type renders correctly with proper styling

### 10. Create DynamicExamForm component
- [ ] Create `frontend/src/components/DynamicExamForm.tsx`
- [ ] Render field groups as Card sections
- [ ] Iterate through schema fields and render DynamicFormField for each
- [ ] Handle form data state management
- [ ] Pass validation errors to child fields
- [ ] Support field groups and layout
- **Validation**: Form renders all field groups and fields from schema

### 11. Add client-side schema validation
- [ ] Create `frontend/src/lib/schema-validators.ts`
- [ ] Implement required field validation
- [ ] Implement number range validation (min/max)
- [ ] Implement text length validation (minLength/maxLength)
- [ ] Implement pattern/regex validation
- [ ] Implement real-time validation on blur
- [ ] Clear errors on value change
- **Validation**: Validation errors appear and clear correctly

## Phase 3: Integration and Migration

### 12. Integrate DynamicExamForm into NewSubmission
- [ ] Update `frontend/src/components/NewSubmission.tsx`
- [ ] Add logic to fetch schema when exam type selected
- [ ] Replace hardcoded SIX_MONTHLY_MDW form with DynamicExamForm
- [ ] Keep hardcoded WORK_PERMIT and AGED_DRIVERS forms (temporary)
- [ ] Test both rendering approaches work side-by-side
- **Validation**: SIX_MONTHLY_MDW renders from schema, others use hardcoded forms

### 13. Migrate WORK_PERMIT to schema-driven form
- [ ] Verify `work-permit.json` schema is complete
- [ ] Update NewSubmission.tsx to use DynamicExamForm for WORK_PERMIT
- [ ] Remove hardcoded WORK_PERMIT conditional block
- [ ] Test form rendering and submission
- **Validation**: WORK_PERMIT form works identically to before migration

### 14. Migrate AGED_DRIVERS to schema-driven form
- [ ] Verify `aged-drivers.json` schema is complete
- [ ] Update NewSubmission.tsx to use DynamicExamForm for AGED_DRIVERS
- [ ] Remove hardcoded AGED_DRIVERS conditional block
- [ ] Test form rendering and submission
- **Validation**: AGED_DRIVERS form works identically to before migration

### 15. Clean up legacy code
- [ ] Remove all hardcoded exam-type-specific conditional blocks from NewSubmission.tsx
- [ ] Remove unused validation code from `frontend/src/lib/validationRules.ts`
- [ ] Update imports and dependencies
- [ ] Run linter and fix any issues
- **Validation**: No hardcoded exam forms remain, app builds successfully

## Phase 4: Testing and Documentation

### 16. Add backend unit tests
- [ ] Unit tests for ExamSchemaService (load, validate, cache)
- [ ] Unit tests for schema field validators
- [ ] Unit tests for each field type validation
- [ ] Unit tests for error message generation
- **Validation**: All backend tests pass, coverage > 80%

### 17. Add backend E2E tests
- [ ] E2E test for GET /v1/exam-schemas endpoint
- [ ] E2E test for GET /v1/exam-schemas/:examType endpoint
- [ ] E2E test for submission validation with valid formData
- [ ] E2E test for submission validation with invalid formData
- [ ] E2E test for validation error response structure
- **Validation**: All E2E tests pass

### 18. Add frontend component tests
- [ ] Unit tests for DynamicFormField (each field type)
- [ ] Unit tests for DynamicExamForm
- [ ] Unit tests for ExamSchemaService (caching)
- [ ] Unit tests for schema validators
- **Validation**: All frontend tests pass

### 19. Add Cypress E2E tests
- [ ] Cypress test: Load SIX_MONTHLY_MDW form and verify fields render
- [ ] Cypress test: Fill out form and submit successfully
- [ ] Cypress test: Trigger validation errors and verify error messages
- [ ] Cypress test: Load WORK_PERMIT form from schema
- [ ] Cypress test: Load AGED_DRIVERS form from schema
- [ ] Cypress test: Edit existing submission with schema-driven form
- **Validation**: All Cypress tests pass

### 20. Write documentation
- [ ] Create `docs/features/EXAM_SCHEMA_SYSTEM.md`
  - How to create new exam type schemas
  - Schema format reference
  - Field type documentation
  - Validation rules reference
- [ ] Create `docs/architecture/EXAM_FORM_SCHEMA.md`
  - Architecture overview
  - Component interaction diagram
  - API endpoints documentation
  - Migration strategy
- [ ] Update main README.md with schema system overview
- **Validation**: Documentation is clear and includes examples

### 21. Update environment setup
- [ ] Add schema files to .gitignore exceptions (ensure they're committed)
- [ ] Update backend startup logs to show loaded schemas
- [ ] Add schema validation to CI/CD pipeline
- [ ] Document schema file naming conventions
- **Validation**: New developers can add exam types following docs

## Dependencies

- **Tasks 1-2** must complete before task 3 (need schemas to load)
- **Task 5** depends on task 3 (needs schema service)
- **Task 6** depends on task 5 (uses validators)
- **Tasks 7-8** can run in parallel with backend tasks
- **Task 9** depends on task 7 (needs types)
- **Task 10** depends on task 9 (uses DynamicFormField)
- **Task 12** depends on tasks 8, 10 (needs service and form component)
- **Tasks 13-14** depend on task 12 (progressive migration)
- **Task 15** depends on tasks 13-14 (cleanup after migration)
- **Tasks 16-19** can start once respective code is implemented
- **Task 20** can be written incrementally throughout implementation

## Parallelizable Work

- **Backend schema service** (tasks 3-6) and **Frontend components** (tasks 7-11) can be developed in parallel
- **Unit tests** (tasks 16, 18) can be written alongside implementation
- **Documentation** (task 20) can be drafted during development

## Success Criteria

- ✅ All 3 existing exam types work with schema-driven forms
- ✅ No hardcoded exam-specific form rendering remains
- ✅ Backend validates all submissions against schemas
- ✅ Frontend renders forms dynamically from schemas
- ✅ Validation errors display correctly on frontend
- ✅ All tests pass (unit, E2E, Cypress)
- ✅ Documentation complete and accurate
- ✅ Can add new exam type by creating schema file only (no code changes)
