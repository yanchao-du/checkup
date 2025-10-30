# Add Configurable Exam Form Schema System

## Why

CheckUp currently has exam type-specific form fields hardcoded in the frontend component (`NewSubmission.tsx`), with conditional rendering based on exam type (lines 486-600). This approach creates several challenges:

- **Maintenance burden**: Adding new exam types or modifying fields requires code changes in multiple files (frontend component, backend validation, database schema)
- **Scalability issues**: As CheckUp expands to support more government agencies (beyond MOM and SPF), the number of exam types will grow significantly
- **Lack of flexibility**: Field changes require developer intervention and deployment cycles
- **Inconsistent validation**: Validation rules are scattered across frontend (`validationRules.ts`) and backend, making it hard to maintain consistency
- **Poor discoverability**: Understanding what fields each exam type requires involves reading through conditional JSX blocks

By implementing a configurable form schema system, we can:

- **Centralize exam type definitions**: Single source of truth for form fields, validation rules, and metadata
- **Enable rapid expansion**: Add new exam types by creating JSON/YAML config files without code changes
- **Improve maintainability**: Field changes require only schema updates, not code modifications
- **Ensure consistency**: Validation rules defined once and applied uniformly across frontend and backend
- **Support future features**: Foundation for admin UI to manage exam types, form versioning, and agency-specific customizations

## What Changes

Introduce a **declarative exam form schema system** that:

1. **Defines exam type configurations in structured files** (JSON/YAML) containing:
   - Form field definitions (type, label, placeholder, validation rules)
   - Field-level validation (required, min/max, regex patterns, custom validators)
   - Field groups and layout hints
   - Agency and metadata information

2. **Implements a form rendering engine** that:
   - Dynamically generates form fields from schema definitions
   - Applies validation rules automatically
   - Supports common field types (text, number, date, select, radio, checkbox, textarea)
   - Handles conditional fields and dependencies

3. **Provides schema validation** to ensure:
   - Schema files are valid and complete
   - Breaking changes are detected during development
   - Runtime validation of form submissions against schemas

4. **Maintains backward compatibility** with existing exam types while migrating to new system

## Impact

### Affected Specs
- `exam-forms` - New capability for configurable medical exam form schemas
- `submissions` - Modified to support schema-driven form data validation

### Affected Code

**Backend**:
- `backend/src/exam-schemas/` - New module for schema management
  - `exam-schema.service.ts` - Load and validate schemas
  - `exam-schema.controller.ts` - API endpoints to fetch schemas
  - `exam-schemas/*.json` or `*.yaml` - Schema definition files
- `backend/src/submissions/` - Modified for schema-based validation
  - `submissions.service.ts` - Validate formData against schemas
  - `submission.dto.ts` - Schema-aware validation decorators
- `backend/src/common/validators/` - New schema validators
  - `schema-field.validator.ts` - Runtime field validation

**Frontend**:
- `frontend/src/schemas/` - Schema type definitions and loader
  - `exam-schema.types.ts` - TypeScript types for schemas
  - `exam-schema.service.ts` - Fetch and cache schemas
- `frontend/src/components/` - Form components
  - `DynamicFormField.tsx` - New component to render schema-driven fields
  - `DynamicExamForm.tsx` - New component to render entire exam form from schema
  - `NewSubmission.tsx` - Refactored to use `DynamicExamForm`
- `frontend/src/lib/validationRules.ts` - Enhanced with schema-driven validators

**Configuration**:
- `backend/exam-schemas/*.json` - Schema definitions for existing exam types:
  - `six-monthly-mdw.json`
  - `work-permit.json`
  - `aged-drivers.json`

**Documentation**:
- `docs/features/EXAM_SCHEMA_SYSTEM.md` - Guide for creating and managing exam schemas
- `docs/architecture/EXAM_FORM_SCHEMA.md` - Technical architecture documentation

### Breaking Changes

**NONE** - This is designed as a progressive enhancement:
- Existing exam types continue to work during migration
- Hardcoded forms can coexist with schema-driven forms during transition
- API remains backward compatible (formData is still a JSON object)
- Database schema unchanged (formData remains JSONB)

### Migration Strategy

**Phase 1: Infrastructure** (Week 1)
- Create schema format specification
- Build schema loader and validator
- Implement API endpoint for schema retrieval
- Define TypeScript types for schemas

**Phase 2: Backend Integration** (Week 2)
- Implement schema-based validation in submissions service
- Create schema files for existing exam types
- Add validation tests

**Phase 3: Frontend Migration** (Week 2-3)
- Build dynamic form rendering components
- Migrate one exam type to new system (proof of concept)
- Maintain hardcoded fallback for other types
- Add Cypress tests for dynamic forms

**Phase 4: Complete Migration** (Week 3-4)
- Migrate remaining exam types to schemas
- Remove hardcoded form code
- Update documentation
- Deploy to production

## Assumptions & Decisions

1. **Schema Format**: Use **JSON** for exam type schemas
   - **Rationale**: Better TypeScript support, easier validation, no YAML parser dependency
   - **Alternative considered**: YAML (more human-readable but adds dependency)

2. **Schema Storage**: Store schemas as **static files in backend repository**
   - **Rationale**: Version controlled, deployed with application, simple to manage
   - **Future**: Can migrate to database when admin UI for schema management is needed

3. **Field Types**: Support core HTML5 input types initially
   - Supported: `text`, `number`, `date`, `select`, `radio`, `checkbox`, `textarea`
   - **Future**: Custom components (file upload, signature, multi-select)

4. **Validation Strategy**: **Dual validation** (client + server)
   - Frontend: Immediate feedback using schema rules
   - Backend: Authoritative validation before database persistence
   - Same rules applied in both layers from shared schema

5. **Conditional Fields**: Support via `visibleWhen` property in field definition
   - Example: Show "pregnancy test" only when patient gender is female
   - **Phase 1**: Not implemented (all fields visible)
   - **Phase 2**: Add conditional rendering logic

6. **Schema Versioning**: Not implemented in v1
   - **Rationale**: Exam type schemas are relatively stable
   - **Future**: Add version field when forms need to evolve while supporting legacy submissions

7. **Performance**: Cache schemas in frontend after first load
   - Reduce API calls on repeated form renders
   - Invalidate cache on app version change

## Open Questions

1. **Q**: Should we support nested field groups (e.g., "Vital Signs" group containing height, weight, BP)?
   **A**: YES - Include `group` property in field definition. Frontend can render groups as separate cards/sections.

2. **Q**: How do we handle agency-specific validation rules (e.g., MOM requires certain fields that SPF doesn't)?
   **A**: Schema file is per exam type, which maps to specific agency. Each exam type defines its own required fields.

3. **Q**: Should we validate formData against schema when loading existing submissions?
   **A**: NO in v1 - Only validate on create/update. Existing submissions might predate schema changes. Add migration validation in future.

4. **Q**: How do we handle schema changes for exam types with existing submissions?
   **A**: Schemas are append-only in v1. Don't remove fields that exist in production submissions. Mark deprecated fields as optional.

5. **Q**: Should the schema define field order and layout?
   **A**: YES - Array order in schema determines render order. Future enhancement can add explicit `order` and `column` properties for grid layout.

6. **Q**: Do we need multi-language support for field labels?
   **A**: NOT in v1 - All labels in English. Future enhancement can use `label: { en: "...", zh: "..." }` structure.

7. **Q**: Should schemas be editable by admins via UI?
   **A**: NOT in v1 - File-based for simplicity. v2 can add admin UI that generates/updates schema files or stores in database.
