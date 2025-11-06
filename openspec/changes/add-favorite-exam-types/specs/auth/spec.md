# Spec Delta: auth

**Change ID:** add-favorite-exam-types  
**Spec:** auth  
**Type:** Feature Addition

---

## MODIFIED Requirements

### Requirement: User profile data model
The User entity SHALL store user preferences including favorite exam types.

#### Scenario: User profile includes favorite exam types field
**Given** the User model in the database  
**When** the schema is inspected  
**Then** the User table shall include a `favoriteExamTypes` field  
**And** the field shall be of type JSON (array of strings)  
**And** the field shall be nullable (defaults to null or empty array)  
**And** the field shall store an array of valid ExamType enum values
