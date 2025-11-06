# Spec Delta: submission-forms

**Change ID:** add-favorite-exam-types  
**Spec:** submission-forms  
**Type:** Feature Addition

---

## ADDED Requirements

### Requirement: User favorite exam types preference
Users SHALL be able to mark frequently used exam types as favorites for quick access.

#### Scenario: User marks exam type as favorite
**Given** a nurse is on the new submission page  
**When** the exam type dropdown is opened  
**Then** each exam type option shall display a star icon on the right side  
**When** the user clicks the star icon for "SIX_MONTHLY_MDW"  
**Then** the star icon shall change to filled/highlighted state  
**And** the exam type shall be added to the user's favorites list  
**And** a toast notification "Added to favorites" shall be displayed  
**And** the favorites preference shall be persisted to the backend

#### Scenario: User removes exam type from favorites
**Given** a user has "SIX_MONTHLY_MDW" marked as favorite  
**When** the exam type dropdown is opened  
**And** the user clicks the filled star icon for "SIX_MONTHLY_MDW"  
**Then** the star icon shall change to unfilled/unhighlighted state  
**And** the exam type shall be removed from the user's favorites list  
**And** a toast notification "Removed from favorites" shall be displayed  
**And** the favorites preference shall be updated in the backend

#### Scenario: Favorites are limited to 3 exam types
**Given** a user already has 3 exam types marked as favorites  
**When** the user attempts to mark a 4th exam type as favorite  
**Then** the system shall display a tooltip "Maximum 3 favorites allowed"  
**And** the star icon shall not become filled  
**And** the user must unfavorite an existing exam type before adding a new one

---

### Requirement: Favorite exam types displayed at top of dropdown
Favorite exam types SHALL appear in a dedicated section at the top of the exam type dropdown for quick access.

#### Scenario: Dropdown shows favorites section when favorites exist
**Given** a user has marked "SIX_MONTHLY_MDW" and "FULL_MEDICAL_EXAM" as favorites  
**When** the exam type dropdown is opened  
**Then** a "Favorites" section shall appear at the top of the dropdown  
**And** "SIX_MONTHLY_MDW" shall be listed in the Favorites section  
**And** "Full Medical Examination for Foreign Worker" shall be listed in the Favorites section  
**And** a visual separator (divider line) shall separate Favorites from other sections  
**And** the regular MOM/TP_LTA/ICA grouped sections shall appear below the separator  
**And** favorite exam types shall still appear in their original grouped sections with filled star icons

#### Scenario: Dropdown shows no favorites section when user has no favorites
**Given** a user has not marked any exam types as favorites  
**When** the exam type dropdown is opened  
**Then** the "Favorites" section shall NOT be displayed  
**And** the dropdown shall show only the regular MOM/TP_LTA/ICA grouped sections  
**And** all star icons shall be unfilled

#### Scenario: Selecting favorite exam type from favorites section
**Given** a user has "SIX_MONTHLY_MDW" marked as favorite  
**When** the user opens the exam type dropdown  
**And** clicks "Six-monthly Medical Exam (6ME) for Migrant Domestic Worker" from the Favorites section  
**Then** the exam type shall be set to "SIX_MONTHLY_MDW"  
**And** the MDW exam form shall be displayed  
**And** the dropdown shall close

---

### Requirement: Favorite exam types persist across sessions
User favorite exam types SHALL be stored in the user profile and persist across browser sessions and devices.

#### Scenario: Favorites persist after page refresh
**Given** a user has marked "SIX_MONTHLY_MDW" as favorite  
**When** the user refreshes the page  
**Then** "SIX_MONTHLY_MDW" shall still be marked as favorite  
**And** the star icon shall remain filled in the dropdown  
**And** the Favorites section shall still display "SIX_MONTHLY_MDW"

#### Scenario: Favorites available on different device
**Given** a user has marked "FULL_MEDICAL_EXAM" as favorite on Device A  
**When** the user logs in from Device B  
**And** opens the exam type dropdown  
**Then** "FULL_MEDICAL_EXAM" shall be marked as favorite on Device B  
**And** the Favorites section shall display "Full Medical Examination for Foreign Worker"

---

### Requirement: Favorite exam types API integration
The system SHALL provide API endpoints to persist and retrieve user favorite exam types preferences.

#### Scenario: Backend stores favorite exam types in user profile
**Given** a user updates their favorite exam types to ["SIX_MONTHLY_MDW", "FULL_MEDICAL_EXAM"]  
**When** the frontend calls `PATCH /v1/users/me/preferences` with favoriteExamTypes  
**Then** the backend shall validate the exam types are valid ExamType enum values  
**And** the backend shall validate the array contains at most 3 items  
**And** the backend shall update the user's favoriteExamTypes field  
**And** the backend shall return 200 OK with updated user data

#### Scenario: Backend returns favorite exam types in user profile
**Given** a user has favoriteExamTypes = ["SIX_MONTHLY_MDW", "PR_MEDICAL"]  
**When** the frontend calls `GET /v1/users/me`  
**Then** the response shall include favoriteExamTypes field  
**And** favoriteExamTypes shall contain ["SIX_MONTHLY_MDW", "PR_MEDICAL"]

#### Scenario: Backend validates favorite exam types array
**Given** a user attempts to update favorite exam types  
**When** the request contains more than 3 exam types  
**Then** the backend shall return 400 Bad Request  
**And** the error message shall indicate "Maximum 3 favorite exam types allowed"  
**When** the request contains an invalid exam type value  
**Then** the backend shall return 400 Bad Request  
**And** the error message shall indicate "Invalid exam type"
