# Patient Seed Data

This directory contains scripts for seeding patient data into the database.

## Files

- `seed-patients.ts` - Creates 1000 female patient records with medical test data
- `verify-patients.ts` - Verifies the seeded patient data

## Patient Seed Script

The `seed-patients.ts` script generates **1000 female patient records** with the following specifications:

### Patient Demographics
- **Names**: Female names from Indonesia, Myanmar, and Philippines
  - 150 unique base names
  - Extended with letter suffixes for remaining patients (e.g., "Ana Reyes A", "Ana Reyes B")
  - **Guaranteed unique**: Each of the 1000 patients has a completely unique name
  - No numeric digits in names - only letters
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
npm run seed:patients:verify
```

This will display:
- Total count of patients
- Sample patients with/without height and weight
- Statistics on test requirements and positive results

### Check Examination Dates

To verify the distribution of examination dates:

```bash
npm run seed:patients:check-dates
```

### Analyze Name Uniqueness

To verify that all patient names are unique:

```bash
npm run seed:patients:analyze-names
```

This will show:
- Number of base names (without suffix)
- Number of extended names (with numeric suffix)
- Confirmation that all 1000 names are unique

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

- **All FINs are validated and guaranteed to be unique**
- **All patient names are guaranteed to be unique** (no two FINs share the same name)
  - First 150 patients use base names from the original list
  - Remaining 850 patients use extended names with letter suffixes (e.g., "Ana Reyes A", "Ana Reyes B")
  - Names contain only letters and spaces - no numeric digits
- The script requires an existing clinic and nurse user (run main seed first)
- Patients are inserted in batches of 100 for optimal performance
- Examination dates are distributed around 6 months ago (±2 months variation)
- HIV test required for ~25% of patients
- TB (Chest X-ray) test required for ~10% of patients
- Test positive rates are randomized but approximate real-world percentages
