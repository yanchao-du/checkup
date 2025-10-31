# Patient Seed Data

This directory contains scripts for seeding patient data into the database.

## Files

- `seed-patients.ts` - Creates 1000 female patient records with medical test data
- `verify-patients.ts` - Verifies the seeded patient data

## Patient Seed Script

The `seed-patients.ts` script generates **1000 female patient records** with the following specifications:

### Patient Demographics
- **Names**: Female names from Indonesia, Myanmar, and Philippines
- **Identification**: Each patient has a unique, valid FIN (Foreign Identification Number)
  - Format: F followed by 7 digits and a checksum letter (e.g., F2527750M)
  - All FINs are validated using Singapore's official checksum algorithm
- **Age Range**: 21-45 years old
- **Exam Type**: SIX_MONTHLY_FMW (Six-monthly Medical Exam for Female Migrant Workers)

### Medical Data

#### Physical Measurements
- **600 patients** have recorded height and weight:
  - Height: 145-175 cm
  - Weight: 40-75 kg
- **400 patients** do not have height/weight data

#### Medical Tests

Each patient has 4 types of tests with the following rules:

1. **Pregnancy Test** (Always Required)
   - Field: `pregnancyTestPositive`
   - ~5% positive rate

2. **Syphilis Test** (Always Required)
   - Field: `syphilisTestPositive`
   - ~3% positive rate

3. **HIV Test** (Randomly Required)
   - Field: `hivTestRequired` and `hivTestPositive`
   - ~25% of patients have this test required
   - ~2% positive rate among those tested

4. **Chest X-ray for TB** (Randomly Required)
   - Field: `chestXrayRequired` and `chestXrayPositive`
   - ~10% of patients have this test required
   - ~4% positive rate among those tested

### Database Storage

All patient data is stored in the `medical_submissions` table with:
- Status: `submitted`
- Exam Type: `SIX_MONTHLY_FMW`
- Valid FIN as `patientNric`
- Date of birth as `patientDob`
- Examination dates: ~6 months ago with ±2 months variation (range: 4-8 months ago)
- Test results in `formData` JSON field

## Usage

### Seed 1000 Patients

```bash
npm run seed:patients
```

This will:
1. Generate 1000 unique female patient records
2. Assign valid FINs (Foreign Identification Numbers)
3. Create medical test data according to specifications
4. Insert records into the database in batches of 100

### Verify Seeded Data

To check the seeded data:

```bash
npx ts-node prisma/verify-patients.ts
```

This will display:
- Total count of patients
- Sample patients with/without height and weight
- Statistics on test requirements and positive results

### View in Prisma Studio

```bash
npm run studio
```

Then navigate to the `medical_submissions` table and filter by:
- `examType = SIX_MONTHLY_FMW`
- `id STARTS WITH patient-`

## Example Patient Record

```json
{
  "id": "patient-0001",
  "examType": "SIX_MONTHLY_FMW",
  "patientName": "Rina Susanti",
  "patientNric": "F2527750M",
  "patientDob": "1992-08-25",
  "examinationDate": "2025-03-15",
  "status": "submitted",
  "formData": {
    "height": 168,
    "weight": 45,
    "pregnancyTestPositive": "false",
    "syphilisTestPositive": "false",
    "hivTestRequired": "true",
    "hivTestPositive": "false",
    "chestXrayRequired": "true",
    "chestXrayPositive": "false",
    "hasAdditionalRemarks": "false"
  }
}
```

## Notes

- All FINs are validated and guaranteed to be unique
- The script requires an existing clinic and nurse user (run main seed first)
- Patients are inserted in batches of 100 for optimal performance
- All patients have examination date set to 2025-10-30
- Test positive rates are randomized but approximate real-world percentages
