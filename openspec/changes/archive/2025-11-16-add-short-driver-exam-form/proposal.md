# Proposal: Add Short Driver Exam Form

## Context
After demonstrating the prototype to SPF and LTA, stakeholders provided feedback that the current long-form driver medical examination is too detailed for their typical use cases. They requested a simplified short form that collects minimal information and focuses on fitness determination only.

Currently, the system supports three comprehensive driver exam types:
- `DRIVING_LICENCE_TP` - Traffic Police Driving Licence (includes AMT, detailed medical history, full medical examination)
- `DRIVING_VOCATIONAL_TP_LTA` - Combined TP + LTA Vocational Licence (includes all TP sections plus LTA vocational details)
- `VOCATIONAL_LICENCE_LTA` - LTA Vocational Licence only (excludes AMT but includes detailed medical sections)

These long forms require:
- Complete medical declaration (6-month history)
- Comprehensive medical history
- Full general medical examination (height, weight, BP, vision, hearing)
- Abbreviated Mental Test (AMT) for TP exams
- LTA vocational medical details (color vision, peripheral vision, etc.)
- Detailed assessment with remarks

## Problem
Stakeholders need a streamlined option for routine driver medical assessments where:
- Administrative overhead should be minimal
- Only essential patient identification and contact information is needed
- Medical assessment can be simplified to a single fitness question based on exam purpose
- Clinics can process high volumes of routine assessments quickly

The existing long forms create unnecessary friction for simple fitness determinations that don't require detailed medical examination documentation.

## Proposed Solution
Introduce **three new short-form exam types** that parallel the existing long forms but collect minimal information:

### New Exam Types
1. **`DRIVING_LICENCE_TP_SHORT`** - Short Form: Driving Licence (TP)
2. **`DRIVING_VOCATIONAL_TP_LTA_SHORT`** - Short Form: Combined TP & LTA
3. **`VOCATIONAL_LICENCE_LTA_SHORT`** - Short Form: Vocational Licence (LTA)

### Short Form Structure

The short form follows the same multi-section accordion pattern as long forms, but with simplified content:

**Section 1: Patient Information (Accordion)**
- Patient NRIC/FIN (required)
- Patient Name (required)
- Mobile Number (required)
- Purpose of Exam (dropdown with 4 options):
  1. "Age 65 and above - Renew Traffic Police Driving Licence only"
  2. "Age 65 and above - Renew both Traffic Police & LTA Vocational Licence"
  3. "Age 64 and below - Renew LTA Vocational Licence only"
  4. "Renew only Bus Attendant's Vocational Licence (BAVL) regardless of age"
- Examination Date (required)
- "Continue to Overall Assessment" button

**Section 2: Overall Assessment (Accordion)**
Based on the selected Purpose of Exam, display appropriate fitness question(s):

- **Purpose 1** (Age 65+ TP only): "Is the patient physically and mentally fit to drive a motor vehicle?" (Yes/No)
- **Purpose 2** (Age 65+ TP & LTA): 
  - "Is the patient physically and mentally fit to drive a public service vehicle?" (Yes/No)
  - "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?" (Yes/No)
- **Purpose 3** (Age 64 below LTA): 
  - "Is the patient physically and mentally fit to drive a public service vehicle?" (Yes/No)
  - "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?" (Yes/No)
- **Purpose 4** (BAVL any age): "Is the patient physically and mentally fit to hold a Bus Attendant Vocational Licence?" (Yes/No)
- "Continue to Summary" button

**Section 3: Review and Submit (Summary Page)**
- Summary of all entered information (patient info + fitness determinations)
- Declaration checkbox (required)
- Standard text confirming the medical practitioner examined the patient
- "Edit" button (navigates back to accordion sections for modifications)
- "Save as Draft" button (saves without submitting)
- "Submit for Approval" button (submits to doctor for review)

### Key Differences from Long Forms
| Feature | Long Form | Short Form |
|---------|-----------|------------|
| Patient DOB | Required | Optional/Not collected |
| Email | Optional | Optional/Not collected |
| Height/Weight | Required | Not collected |
| Blood Pressure | Required | Not collected |
| Medical Declaration | 6 detailed questions | Not collected |
| Medical History | Full section | Not collected |
| AMT (TP exams) | Required | Not collected |
| LTA Vocational Details | Required (LTA exams) | Not collected |
| Assessment Remarks | Optional text field | Not collected |
| Fitness Questions | Context-dependent | Simple Yes/No per purpose |

### User Experience
1. Nurse selects short form exam type from dropdown (6 new options added)
2. **Patient Information section** opens in accordion - nurse fills NRIC, name, mobile, purpose, exam date
3. Click "Continue to Overall Assessment" - accordion advances to next section
4. **Overall Assessment section** - nurse answers purpose-specific fitness question(s)
5. Click "Continue to Summary" - advances to summary page
6. **Review and Submit page** - displays summary of all entered data with Edit button
7. Nurse checks declaration checkbox
8. Nurse clicks "Submit for Approval" (or "Save as Draft")
9. Form submission follows same approval workflow as long forms (nurse → doctor → submitted)
10. Entire process completes in under 2 minutes

### Backward Compatibility
- Existing long forms remain unchanged and available
- No data migration required
- PDF generation creates separate templates for short forms
- Validation rules adapted for minimal data requirements

## Scope
This change affects:
- **medical-exam-types**: Add 3 new exam type enum values
- **submission-forms**: Create new short form components for each exam type
- **submission-validation**: Add validation logic for short forms (relaxed requirements)
- **pdf-reports**: Create simplified PDF templates for short forms

## Non-Goals
- Modifying existing long form exam types
- Replacing long forms (both coexist)
- Adding retrospective short form option for existing submissions
- Creating conversion between long and short forms

## Success Criteria
- [ ] All 3 short form exam types available in exam type dropdown
- [ ] Short forms collect only required minimal fields
- [ ] Validation enforces only essential fields for short forms
- [ ] PDF generation produces clean, professional short form reports
- [ ] Approval workflow functions identically to long forms
- [ ] All existing long form functionality remains unaffected
- [ ] E2E tests cover short form submission, approval, and PDF generation

## Timeline
Estimated 3-5 days for implementation and testing.

## Questions & Clarifications Needed
1. Should short forms support draft functionality, or should they be submit-only?
2. Do short forms need patient DOB for age validation, or is NRIC sufficient?
3. Should the declaration text differ between short and long forms?
4. Are there any agency-specific requirements for short form PDFs (logos, formats)?
5. Should clinics have access to both long and short forms, or be restricted to one type?
