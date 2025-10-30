# Refactor Submission Form with Accordion UI and Reusable Components

## Why
The current `NewSubmission.tsx` component has grown to 717 lines, making it difficult to maintain and extend. Each exam type requires duplicating validation logic, and the flat form structure makes it hard for users to navigate complex medical forms. This refactoring addresses maintainability, reusability, and user experience concerns by:

1. **Reducing cognitive load**: Accordion organization helps users focus on one section at a time
2. **Improving code maintainability**: Smaller, focused components are easier to test and modify
3. **Enabling reusability**: Field components can be used across different exam types and future forms
4. **Facilitating scalability**: Adding new exam types or fields becomes straightforward
5. **Maintaining quality**: Consistent validation and error handling across all fields

This is a pure refactoring effort with no changes to functionality, API contract, or data structure, minimizing risk while delivering significant long-term benefits.

## Overview
Refactor the `NewSubmission.tsx` component to use an accordion-based UI pattern with reusable, self-validating form field components. This change improves maintainability, reduces code duplication across exam types, and provides a better user experience.

## Problem Statement
The current `NewSubmission.tsx` component (717 lines) is becoming difficult to maintain due to:
1. **Large monolithic component**: All exam types and field logic in one file
2. **Code duplication**: Similar validation logic repeated for each field
3. **Poor scalability**: Adding new exam types or fields requires modifying a large file
4. **Inconsistent validation**: Validation rules scattered throughout the component
5. **Cluttered UI**: All form fields displayed at once without clear organization

## Proposed Solution
1. **Accordion-based UI**: Organize form into collapsible sections (Patient Info, Common Vitals, Exam-Specific Fields)
2. **Reusable form field components**: Extract common field types (height, weight, blood pressure, etc.) into standalone components with built-in validation
3. **Exam-type specific forms**: Create dedicated form components for each exam type (SixMonthlyMdwForm, WorkPermitForm, AgedDriversForm)
4. **Centralized validation**: Move all validation rules into dedicated field components

## Benefits
- **Maintainability**: Smaller, focused components easier to test and modify
- **Reusability**: Field components can be used across different exam types
- **Consistency**: Standardized validation and error handling
- **Scalability**: Easy to add new exam types or fields
- **User Experience**: Accordion improves form organization and reduces visual clutter
- **Developer Experience**: Clear separation of concerns, easier to reason about

## Scope
- Frontend refactoring only (no backend changes)
- Maintains existing API contract and data structure
- Preserves all current functionality (validation, draft saving, submission)
- Updates Cypress tests to work with new structure

## Out of Scope
- Changes to backend submission API
- New validation rules beyond refactoring existing ones
- Changes to database schema
- Changes to other form components outside NewSubmission

## Implementation Approach
See `tasks.md` and `design.md` for detailed implementation plan.

## Success Criteria
1. All existing E2E tests pass with minimal modifications
2. Form maintains same validation behavior
3. Component file size reduced by at least 50%
4. Each field component includes its own validation logic
5. Accordion provides clear visual organization

## What Changes

- Refactored `NewSubmission.tsx` to use an accordion-based UI for medical exam details, splitting the form into collapsible sections for Common Vitals, Exam-Specific Fields, and Additional Remarks.
- Created 11 reusable field components for all common and exam-specific fields, each with built-in validation and error handling.
- Created 3 exam-type specific form components (`SixMonthlyMdwFields`, `WorkPermitFields`, `AgedDriversFields`) to encapsulate logic for each exam type.
- Removed inline field and validation logic from `NewSubmission.tsx`, delegating all field rendering and validation to child components.
- Updated Cypress E2E tests to work with the new field structure (no selector changes required).
- Added documentation and usage examples for all new components.
- No changes to backend API, data structure, or database schema.
