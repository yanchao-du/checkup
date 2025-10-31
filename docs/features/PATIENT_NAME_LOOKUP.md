# Patient Name Lookup - Real Database Integration

This document describes the patient name lookup feature that automatically retrieves patient information from the database.

## Feature Overview

For **Six-Monthly Medical Exam for Migrant Domestic Workers (SIX_MONTHLY_MDW)**, **Six-Monthly Medical Exam for Female Migrant Workers (SIX_MONTHLY_FMW)**, and **Full Medical Exam (WORK_PERMIT)**, the patient name and previous medical data are automatically retrieved from the database when a valid NRIC/FIN is entered. The name field becomes read-only when populated from the API.

For **Medical Exam for Aged Drivers (AGED_DRIVERS)**, the name field remains manually editable.

## Test Data

The system now uses **real patient data** from the database. 1000 female migrant worker patients have been seeded into the database for testing purposes.

### Using Test FINs

When creating a new submission for exam types that support patient lookup (MDW, FMW, or Work Permit), a random test FIN is displayed next to the "NRIC / FIN" label in blue text:

```
NRIC / FIN * (test FIN: F2527750M)
```

You can use this displayed FIN to quickly test the patient lookup feature. Each time you create a new submission or change the exam type, a different random test FIN is shown.

### Testing Instructions

1. Create a new medical examination
2. Select exam type: **Six-monthly Medical Exam for MDW**, **Six-monthly Medical Exam for FMW**, or **Full Medical Exam**
3. Note the test FIN displayed in blue next to the NRIC/FIN label
4. Enter the displayed test FIN (or any other FIN from the seeded data)
5. Wait ~500ms (debounce delay)
6. The patient name should automatically populate
7. For MDW exams, previous height and weight data (if available) will also be shown
8. The name field will be read-only when retrieved from the system

## Seeded Test Data

The database contains 1000 female patients with:
- **Names**: From Indonesia, Myanmar, and Philippines
- **FINs**: All start with 'F' prefix (Foreign workers)
- **600 patients** have height and weight data
- **400 patients** do not have height/weight data
- All patients have medical test data (Pregnancy, Syphilis, HIV, TB)

To seed the test data, run:
```bash
cd backend
npm run seed:patients
```

## API Endpoints

### GET /patients/lookup
Retrieves patient information by NRIC/FIN from the most recent medical submission.

**Query Parameters:**
- `nric`: The NRIC or FIN to lookup

**Response:**
```json
{
  "nric": "F2527750M",
  "name": "Rina Susanti",
  "lastHeight": "168",
  "lastWeight": "45",
  "lastExamDate": "2025-10-30"
}
```

### GET /patients/random-test-fin
Returns a random test FIN from the seeded patient data.

**Response:**
```json
{
  "fin": "F2527750M",
  "name": "Rina Susanti"
}
```

## Implementation Details

- **Backend API Location**: `/backend/src/patients/`
- **Frontend Service**: `/frontend/src/services/patients.service.ts`
- **Debounce Delay**: 500ms (prevents excessive API calls while typing)
- **Auto-fetch Conditions**:
  - Exam type is SIX_MONTHLY_MDW, SIX_MONTHLY_FMW, or WORK_PERMIT
  - NRIC/FIN is at least 9 characters
  - No NRIC validation errors
  - Not editing an existing draft (only for new submissions)
- **Data Source**: PostgreSQL database via Prisma ORM
- **Caching**: Previous lookups are cached to avoid duplicate API calls
