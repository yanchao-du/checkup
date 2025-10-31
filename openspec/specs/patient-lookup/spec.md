# patient-lookup Specification

## Purpose
Provides API endpoints to retrieve patient information including demographics, vital history, and required medical tests from the most recent submission record. Supports both Six-Monthly MDW and FMW exam types.

## Requirements

### Requirement: Patient Lookup by NRIC
The system SHALL provide an API endpoint to retrieve patient information by NRIC/FIN number from historical submission records.

#### Scenario: Retrieve patient with test requirements
**Given** a patient "Ana Reyes" with NRIC "F4066517W" has a previous submission  
**And** the previous submission has `hivTestRequired: 'true'` in formData  
**And** the previous submission has `chestXrayRequired: 'true'` in formData  
**When** the API receives POST `/v1/patients/lookup` with body `{ "nric": "F4066517W" }`  
**Then** the response SHALL return HTTP 200  
**And** the response body SHALL include:
```json
{
  "nric": "F4066517W",
  "name": "Ana Reyes",
  "lastHeight": "165",
  "lastWeight": "58",
  "lastExamDate": "2025-04-15",
  "requiredTests": {
    "pregnancy": true,
    "syphilis": true,
    "hiv": true,
    "chestXray": true
  }
}
```

#### Scenario: Retrieve patient with partial test requirements
**Given** a patient has a previous submission  
**And** the previous submission has `hivTestRequired: 'true'` in formData  
**And** the previous submission does NOT have `chestXrayRequired` field  
**When** the API receives a lookup request  
**Then** the response `requiredTests.hiv` SHALL be `true`  
**And** the response `requiredTests.chestXray` SHALL be `false`  
**And** the response `requiredTests.pregnancy` SHALL be `true`  
**And** the response `requiredTests.syphilis` SHALL be `true`

#### Scenario: Retrieve patient with no test requirement flags
**Given** a patient has a previous submission  
**And** the previous submission formData does NOT contain `hivTestRequired` field  
**And** the previous submission formData does NOT contain `chestXrayRequired` field  
**When** the API receives a lookup request  
**Then** ALL test requirements SHALL default to `true` for backward compatibility

#### Scenario: Lookup non-existent patient
**Given** no submission exists for NRIC "F9999999Z"  
**When** the API receives POST `/v1/patients/lookup` with body `{ "nric": "F9999999Z" }`  
**Then** the response SHALL return HTTP 404  
**And** the response body SHALL indicate patient not found

---

### Requirement: Test Requirement Extraction from formData
The system SHALL extract individual test requirements from the `formData` JSON field of medical submissions to determine which tests are required for a patient.

#### Scenario: Extract HIV test requirement
**Given** a medical submission has formData with `{"hivTestRequired": "true"}`  
**When** the patient lookup service processes this submission  
**Then** the returned `requiredTests.hiv` SHALL be `true`

#### Scenario: Extract chest X-ray test requirement
**Given** a medical submission has formData with `{"chestXrayRequired": "true"}`  
**When** the patient lookup service processes this submission  
**Then** the returned `requiredTests.chestXray` SHALL be `true`

#### Scenario: Default missing test requirements
**Given** a medical submission has formData without `hivTestRequired` field  
**When** the patient lookup service processes this submission  
**Then** the returned `requiredTests.hiv` SHALL be `false`  
**And** the returned `requiredTests.pregnancy` SHALL be `true` (always required for MDW/FMW)  
**And** the returned `requiredTests.syphilis` SHALL be `true` (always required for MDW/FMW)

---

### Requirement: Random Test FIN API
The system SHALL provide an API endpoint to retrieve a random test patient FIN for testing purposes.

#### Scenario: Retrieve random test FIN
**Given** at least one patient record exists in the database  
**When** the API receives GET `/v1/patients/random-test-fin`  
**Then** the response SHALL return HTTP 200  
**And** the response body SHALL include a random patient's FIN and name  
**And** the response format SHALL be:
```json
{
  "fin": "F4066517W",
  "name": "Ana Reyes"
}
```

#### Scenario: No test patients available
**Given** no patient records exist in the database  
**When** the API receives GET `/v1/patients/random-test-fin`  
**Then** the response SHALL return HTTP 404  
**And** the response body SHALL indicate no test patients available
