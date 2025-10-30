# Patient Name Lookup - Test Data

This document lists the test NRIC/FIN numbers available in the mock API for testing the patient name lookup feature.

## Feature Overview

For **Six-Monthly Medical Exam (SIX_MONTHLY_MDW)** and **Full Medical Exam (WORK_PERMIT)**, the patient name is automatically retrieved from the mock API when a valid NRIC/FIN is entered. The name field becomes read-only when populated from the API.

For **Aged Drivers Medical Exam (AGED_DRIVERS)**, the name field remains manually editable.

## Test NRIC/FIN Numbers

### Singapore Citizens/PRs (S-prefix)

| NRIC | Patient Name |
|------|-------------|
| S1234567D | John Smith |
| S2345678H | Mary Johnson |
| S3456789A | David Chen |
| S4567890C | Sarah Tan |
| S5678901D | Michael Lee |
| S6789012D | Jennifer Wong |
| S7890123C | Robert Kumar |
| S8901234A | Patricia Lim |
| S9012345I | James Ng |
| S0123456J | Linda Ong |

### Foreign Workers (G-prefix)

| FIN | Patient Name |
|-----|-------------|
| G1234567X | Maria Santos |
| G2345678N | Ahmed Hassan |
| G3456789T | Fatima Rahman |
| G4567890W | Rajesh Kumar |
| G5678901X | Sunita Devi |
### Foreign Workers (F prefix)
| FIN | Patient Name |
|-----|-------------|
| F6789012N | Mohammad Ali |
| F7890123M | Priya Sharma |
| F8901234K | Kumar Patel |
| F9012345U | Lakshmi Nair |
| F0123456X | Siti Aminah |

## Testing Instructions

1. Create a new medical examination
2. Select exam type: **Six-monthly Medical Exam** or **Full Medical Exam**
3. In the Patient Information section, enter one of the test NRIC/FIN numbers above
4. Wait ~500ms (debounce delay)
5. The patient name should automatically populate
6. The name field will be read-only with a message indicating it was retrieved from the system
7. If you enter an NRIC/FIN not in the list, you can manually enter the patient name

## Implementation Details

- **Mock API Location**: `/frontend/src/services/patients.service.ts`
- **API Delay**: 300ms (simulates real API call)
- **Debounce Delay**: 500ms (prevents excessive API calls while typing)
- **Auto-fetch Conditions**:
  - Exam type is SIX_MONTHLY_MDW or WORK_PERMIT
  - NRIC/FIN is at least 9 characters
  - No NRIC validation errors
  - Not editing an existing draft (only for new submissions)
