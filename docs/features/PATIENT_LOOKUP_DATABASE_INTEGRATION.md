# Patient Lookup Integration - Database Implementation

## Overview

Successfully migrated the patient lookup feature from mock data to real database integration. The system now retrieves patient information from the 1000 seeded female migrant worker records stored in the PostgreSQL database.

## Changes Made

### Backend

#### 1. New Patients Module (`/backend/src/patients/`)

Created a complete NestJS module for patient data management:

- **`patients.controller.ts`**: REST API endpoints for patient lookup
- **`patients.service.ts`**: Business logic for querying patient data
- **`patients.module.ts`**: Module definition and dependency injection

**API Endpoints:**

1. `GET /v1/patients/lookup?nric={nric}`
   - Retrieves patient information by NRIC/FIN from the most recent submission
   - Returns: name, last height, last weight, last exam date
   - Requires: JWT authentication

2. `GET /v1/patients/random-test-fin`
   - Returns a random test FIN from the seeded patient data
   - Used to display test FINs to users in the UI
   - Requires: JWT authentication

#### 2. App Module Update

- Added `PatientsModule` to `app.module.ts` imports
- Routes are now available at `/v1/patients/*`

### Frontend

#### 1. Updated Patient Service (`/frontend/src/services/patients.service.ts`)

- **Removed**: Mock patient data (previously 20 hardcoded patients)
- **Added**: Real API calls to backend endpoints using axios
- **Features**:
  - `getByNric()`: Fetches patient info from database
  - `getRandomTestFin()`: Gets a random test FIN for display

#### 2. Updated NewSubmission Component (`/frontend/src/components/NewSubmission.tsx`)

- **Added**: State for `testFin` to store and display random test FINs
- **Added**: useEffect hook to fetch random test FIN when exam type changes
- **Updated**: NRIC/FIN label to display test FIN inline: `NRIC / FIN * (test FIN: F2076055U)`
- **Behavior**: Test FIN only displays for exam types that support lookup (MDW, FMW, Work Permit)

### Documentation

#### 1. Updated PATIENT_NAME_LOOKUP.md

- Replaced mock data documentation with database integration details
- Added API endpoint documentation
- Updated testing instructions to use displayed test FINs
- Added information about seeded test data

#### 2. Created Test Script

- `backend/scripts/test-patient-api.js`: Node.js script to test the API endpoints
- Demonstrates login flow and patient lookup functionality

## Testing

### Backend API Test Results

```
✅ Login successful
✅ Random test FIN: { fin: 'F2076055U', name: 'Hla Myint' }
✅ Patient information:
{
  "nric": "F2076055U",
  "name": "Hla Myint",
  "lastHeight": "157",
  "lastWeight": "71",
  "lastExamDate": "2025-10-30"
}
✅ All tests passed!
```

### How to Test

1. **Start the backend** (if not already running):
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Create a new submission**:
   - Navigate to create new submission
   - Select "Six-monthly Medical Exam for Female Migrant Worker (MOM)"
   - Note the blue test FIN displayed next to "NRIC / FIN *"
   - Enter that test FIN
   - Patient name should auto-populate within ~500ms
   - Height and weight (if available) should also be shown

4. **Test with API script**:
   ```bash
   cd backend
   node scripts/test-patient-api.js
   ```

## Database

The system uses the existing `medical_submissions` table to store and retrieve patient data. The seeded data includes:

- **1000 patients** with IDs starting with 'patient-'
- **Exam type**: SIX_MONTHLY_FMW
- **600 patients** with height and weight
- **400 patients** without height/weight
- **All patients** have test results (Pregnancy, Syphilis, HIV, TB)

To reseed the data:
```bash
cd backend
npm run seed:patients
```

## Key Features

### 1. Random Test FIN Display
- Shows a different test FIN each time user creates a new submission
- Only appears for exam types that support patient lookup
- Displayed in blue text next to the NRIC/FIN label
- Format: `NRIC / FIN * (test FIN: F2076055U)`

### 2. Patient Data Retrieval
- Automatically fetches patient info when valid NRIC/FIN is entered
- Debounced to prevent excessive API calls (500ms delay)
- Caches lookups to avoid duplicate requests
- Shows loading state while fetching

### 3. Previous Medical Data
- For MDW exams, displays last recorded height and weight
- Shows last exam date
- Can auto-populate current height field with last recorded value

## Files Modified

### Created
- `/backend/src/patients/patients.controller.ts`
- `/backend/src/patients/patients.service.ts`
- `/backend/src/patients/patients.module.ts`
- `/backend/scripts/test-patient-api.js`
- `/backend/prisma/seed-patients.ts` (previously created)
- `/backend/prisma/verify-patients.ts` (previously created)
- `/backend/prisma/PATIENT_SEED_README.md` (previously created)

### Modified
- `/backend/src/app.module.ts`
- `/frontend/src/services/patients.service.ts`
- `/frontend/src/components/NewSubmission.tsx`
- `/docs/features/PATIENT_NAME_LOOKUP.md`
- `/backend/package.json` (added `seed:patients` script)

## Future Enhancements

Potential improvements for consideration:

1. **Caching**: Add Redis caching for frequently looked up patients
2. **Pagination**: For admin views showing all test patients
3. **Search**: Allow searching patients by name or partial FIN
4. **Analytics**: Track which test FINs are used most frequently
5. **Admin UI**: Interface to manage test patient data
6. **More Patients**: Seed additional patient types (male workers, different exam types)
