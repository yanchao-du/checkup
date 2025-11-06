# Full Medical Examination for Foreign Worker (MOM)

## Overview
Full Medical Examination (FME) is a comprehensive health screening exam type for foreign workers under the Ministry of Manpower (MOM). Unlike MDW and FMW which are gender-specific, FME supports both male and female workers with gender-specific field visibility.

## Exam Type Details
- **Exam Type Code**: `FULL_MEDICAL_EXAM`
- **Display Name**: "Full Medical Examination for Foreign Worker (MOM)"
- **Category**: MOM (Ministry of Manpower)
- **Gender Support**: Both male and female
- **Clinic Selection**: Yes
- **Patient Lookup**: Yes (via NRIC/FIN API)

## Patient Information
- **NRIC/FIN**: Required, with API name and gender retrieval
- **Name**: Auto-retrieved and masked (like MDW/FMW)
- **Gender**: Auto-retrieved from API (stored in formData)
- **Examination Date**: Required

## Test Patient Data

### Seed Files
1. **`seed-patients.ts`**: 1000 female-only FMW patients (for MDW/FMW exams)
2. **`seed-fme-patients.ts`**: 500 FME patients
   - 250 male workers (M-prefix FINs)
   - 250 female workers (F-prefix FINs)
   - Gender stored in formData for API retrieval
   - Names from: India, Bangladesh, China, Malaysia, Indonesia, Thailand

### Running Seeds
```bash
# Seed MDW/FMW patients (1000 females)
cd backend && npm run seed:patients

# Seed FME patients (250 male + 250 female)
cd backend && npm run seed:patients:fme
```

### Patient ID Patterns
- MDW/FMW: `patient-0001` to `patient-1000`
- FME Male: `fme-male-0001` to `fme-male-0250`
- FME Female: `fme-female-0001` to `fme-female-0250`

### FIN Prefixes
- **M-prefix**: Male workers (e.g., `M8010001K`)
- **F-prefix**: Female workers (e.g., `F8010001X`)

## Medical History (11 Conditions)
Patient medical history checklist with the following conditions:
1. Cardiovascular disease (e.g., ischemic heart disease)
2. Metabolic disease (diabetes, hypertension)
3. Respiratory disease (e.g., tuberculosis, asthma)
4. Gastrointestinal disease (e.g., peptic ulcer disease)
5. Neurological disease (e.g., epilepsy, stroke)
6. Mental health condition (e.g., depression)
7. Other medical condition
8. Previous surgeries
9. Long-term medications
10. Smoking History (tobacco)
11. Other lifestyle risk factors or significant family history
12. Previous infections of concern (e.g., COVID-19)

## Medical Examination

### Chest X-ray
Radio button options:
- Normal
- No referral needed
- Cleared by NTBCC
- **Pregnancy Exempted** (female only)

### Syphilis
Radio button options:
- Normal
- Positive - Currently Infectious
- Positive - Treated Inactive

### Laboratory Tests
Checkboxes for positive/reactive/abnormal results:
- HIV
- **Pregnancy** (female only)
- Urine Albumin
- Urine Sugar
- Blood Pressure
- Malaria
- Colour Vision

### Other Abnormalities
Free text area for documenting any other abnormalities found during examination.

## Overall Assessment
**Question**: "Is this patient fit for work?"
- Yes
- No

## Components

### Frontend Components
```
frontend/src/components/
├── FullMedicalExamFields.tsx       # Form fields (Medical History + Examination)
├── FullMedicalExamSummary.tsx      # Summary view before submission
└── FullMedicalExamDetails.tsx      # View submitted exam details
```

### Component Features
- **Gender-Specific Display**: Pregnancy fields only show for female patients
- **Accordion Layout**: Medical History and Medical Examination in separate accordions
- **Form Validation**: Required field validation before summary
- **Summary Preview**: Comprehensive review before submission
- **Details View**: Accordion-based display of submitted exams

## Database Schema

### ExamType Enum
```prisma
enum ExamType {
  // ... other types
  FULL_MEDICAL_EXAM @map("Full Medical Examination for Foreign Worker (MOM)")
}
```

### FormData Structure
```json
{
  "gender": "M" | "F",
  "medicalHistory_cardiovascular": "yes" | "",
  "medicalHistory_metabolic": "yes" | "",
  // ... other medical history fields
  "chestXray": "normal" | "no-referral" | "cleared-ntbcc" | "pregnancy-exempted",
  "syphilis": "normal" | "positive-infectious" | "positive-treated",
  "test_hiv": "yes" | "",
  "test_pregnancy": "yes" | "",
  // ... other test fields
  "otherAbnormalities": "string",
  "fitForWork": "yes" | "no"
}
```

## Integration Points

### NewSubmission.tsx
- Exam type selection dropdown
- Test FIN generation (pulls from FME patient pool)
- Name/gender API retrieval
- Accordion rendering for Medical History and Examination
- Summary page with declaration
- Form validation

### ViewSubmission.tsx
- Details view for submitted FME exams
- Accordion display of medical history and examination results
- Overall assessment display

### ExamTypeFilter.tsx
- Filter option for FME submissions

## API Integration

### Patient Lookup
Same pattern as MDW/FMW/WORK_PERMIT:
- Enter NRIC/FIN → API retrieves name and gender
- Name is masked during data entry
- Full name visible after submission
- Gender determines field visibility

### Test FIN API
- `getRandomTestFin()` filters by exam type
- Returns FME-specific FINs from the FME patient pool
- Includes gender information

## Workflow

### Creating New Submission
1. Select "Full Medical Examination for Foreign Worker" from exam type dropdown
2. Select clinic
3. Enter NRIC/FIN → Name and gender auto-retrieved
4. Enter examination date
5. Complete Medical History checklist
6. Complete Medical Examination:
   - Chest X-ray result
   - Syphilis result
   - Laboratory test results (with gender-specific fields)
   - Document other abnormalities
7. Answer fit-for-work assessment
8. Review summary
9. Accept declaration
10. Submit (Doctor) or Route for Approval (Nurse)

### Viewing Submission
- Medical History section shows checked conditions
- Medical Examination section shows:
  - Chest X-ray result badge
  - Syphilis result badge
  - Abnormal test results (highlighted)
  - Other abnormalities text
- Overall Result shows fit-for-work decision

## Testing Checklist

- [ ] Exam type appears in dropdown
- [ ] Clinic selection works
- [ ] Test FIN button displays FME FINs
- [ ] NRIC/FIN lookup retrieves name and gender
- [ ] Name masking works during entry
- [ ] Medical history checkboxes work
- [ ] Chest X-ray radio buttons work
- [ ] Syphilis radio buttons work
- [ ] Pregnancy exempted option shows only for females
- [ ] Laboratory test checkboxes work
- [ ] Pregnancy test shows only for females
- [ ] Other abnormalities text area works
- [ ] Fit-for-work question works
- [ ] Summary displays all sections correctly
- [ ] Declaration checkbox required
- [ ] Submission works (Doctor/Nurse)
- [ ] Details view displays correctly
- [ ] Filter by FME works in submissions list
- [ ] Gender-specific fields hidden for males

## Migration
Database migration `20251106000322_add_full_medical_exam_type` adds the FULL_MEDICAL_EXAM enum value.

## Related Files
- Backend Schema: `backend/prisma/schema.prisma`
- Migration: `backend/prisma/migrations/20251106000322_add_full_medical_exam_type/`
- Seed Files: `backend/prisma/seed-fme-patients.ts`
- Frontend Types: `frontend/src/types/api.ts`, `frontend/src/services/api.ts`
- Form Components: `frontend/src/components/FullMedicalExam*.tsx`
- Integration: `frontend/src/components/NewSubmission.tsx`, `ViewSubmission.tsx`

## Notes
- FME uses the same declaration format as MDW/FMW (MOM declaration)
- No required tests section (unlike MDW which has height/weight requirements)
- All tests are optional checkboxes (marked only if abnormal)
- Gender information is critical for field visibility and must be retrieved from API
