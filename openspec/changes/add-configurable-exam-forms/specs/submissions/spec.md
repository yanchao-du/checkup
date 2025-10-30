# Submissions Capability - Spec Delta

## MODIFIED Requirements

### Requirement: Form Data Validation (MODIFIED to use schema-based validation)

The system SHALL validate submission formData against the exam type's schema definition before persisting.

**Previous**: Validation was implicit and scattered across frontend and backend without centralized rules.

**Changes**:
- Added schema-based validation for all form fields
- Backend validates formData structure matches schema requirements
- Validation rules come from exam schema files, not hardcoded logic

#### Scenario: Schema-based validation on create (MODIFIED)
- **GIVEN** user creates submission with exam type "SIX_MONTHLY_MDW"
- **WHEN** submission is sent to backend
- **THEN** backend loads schema for "SIX_MONTHLY_MDW"
- **AND** validates each field in formData against schema rules
- **AND** rejects submission if any field violates schema constraints
- **AND** returns field-level error messages from schema

#### Scenario: Schema-based validation on update (MODIFIED)
- **GIVEN** user updates existing submission
- **WHEN** submission is sent to backend
- **THEN** backend validates formData against current exam type schema
- **AND** applies same validation rules as create
- **AND** returns validation errors if any

### Requirement: FormData Structure (CLARIFIED)

The system SHALL store formData as flexible JSONB structure where field keys match schema field IDs.

**Previous**: formData was generic Record<string, any> with no structure validation.

**Changes**:
- formData keys MUST correspond to field IDs defined in exam schema
- Unknown fields not in schema are ignored (forward compatibility)
- Missing optional fields are allowed
- Missing required fields cause validation error

#### Scenario: FormData keys match schema (NEW)
- **GIVEN** schema defines fields with IDs ["height", "weight", "bloodPressure"]
- **WHEN** submission formData includes { height: 170, weight: 65 }
- **THEN** backend accepts submission (weight is optional)
- **WHEN** submission formData includes { height: 170, unknownField: "value" }
- **THEN** backend accepts submission but ignores unknownField

## ADDED Requirements

### Requirement: Exam Type Schema Reference

The system SHALL reference exam type schema for validation but NOT store schema version in submission record.

#### Scenario: Submission references exam type
- **GIVEN** user creates submission with examType "SIX_MONTHLY_MDW"
- **WHEN** submission is persisted
- **THEN** submission.examType is stored as "SIX_MONTHLY_MDW"
- **AND** formData is validated against current "SIX_MONTHLY_MDW" schema
- **AND** NO schema version is stored in submission record (v1 limitation)

#### Scenario: View old submission after schema change
- **GIVEN** submission created with old schema version
- **AND** schema has since been updated (new fields added)
- **WHEN** user views old submission
- **THEN** formData loads successfully
- **AND** new fields show as empty/not applicable
- **AND** user can edit and save with current schema

### Requirement: Schema Validation Error Response

The system SHALL return structured validation errors when submission fails schema validation.

#### Scenario: Field validation error response
- **GIVEN** submission has validation errors on multiple fields
- **WHEN** backend validates submission
- **THEN** response status is 400 Bad Request
- **AND** response body contains array of errors
- **AND** each error includes { field: "fieldId", message: "error description" }
- **AND** frontend can display errors next to respective form fields

#### Scenario: Multiple validation errors
- **GIVEN** submission has errors on "height" (too low) and "systolic" (too high)
- **WHEN** backend validates submission
- **THEN** response includes both errors in single response
- **AND** errors are: [{ field: "height", message: "..." }, { field: "systolic", message: "..." }]

## Cross-Capability References

This capability relates to:
- **Exam Forms**: Submission validation depends on exam type schemas
- **Audit Logging**: Track when validation rules were applied

## Migration Notes

### Backward Compatibility

**Existing submissions remain valid**:
- No data migration required
- Submissions created before schema system load and save correctly
- formData structure unchanged (still JSONB)

### Gradual Migration

**Phase 1**: Add schema validation alongside existing validation
- Keep existing validation code
- Add schema-based validation in parallel
- Log discrepancies

**Phase 2**: Switch to schema-only validation
- Remove hardcoded validation logic
- Use schema validation exclusively
- All exam types have schemas

**Phase 3**: Clean up legacy code
- Remove old validation utilities
- Update tests to use schema-driven validation

### Testing Requirements

- [ ] Unit tests for schema-based formData validation
- [ ] E2E tests for submission create/update with schema validation
- [ ] Test validation error responses match expected format
- [ ] Test backward compatibility with pre-schema submissions
- [ ] Test handling of unknown fields in formData
