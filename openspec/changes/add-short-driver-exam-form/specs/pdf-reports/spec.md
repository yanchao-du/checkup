# pdf-reports Spec Delta

## ADDED Requirements

### Requirement: The system SHALL generate PDF reports for Short Driver Exam submissions
PDF generation SHALL support all three short form driver exam types with simplified layouts.

#### Scenario: Generate PDF for TP short form submission
**Given** a submission with exam type "DRIVING_LICENCE_TP_SHORT" has been approved  
**When** the system generates the PDF report  
**Then** the PDF SHALL be successfully created  
**And** the PDF SHALL be a single-page document  
**And** the PDF SHALL include sections:
- Header with clinic name and exam type title "Short Form: Driving Licence (TP)"
- Patient Information table (NRIC, Name, Mobile, Purpose, Exam Date)
- Fitness Determination: "Fit to drive motor vehicle: Yes/No" (prominently displayed)
- Declaration section with checkbox indicator and date
- Footer with medical practitioner name and signature line

#### Scenario: Generate PDF for combined TP+LTA short form submission
**Given** a submission with exam type "DRIVING_VOCATIONAL_TP_LTA_SHORT" has been approved  
**And** the purpose is "AGE_65_ABOVE_TP_LTA" or "AGE_64_BELOW_LTA_ONLY"  
**When** the system generates the PDF report  
**Then** the PDF SHALL be successfully created  
**And** the PDF SHALL include two fitness determinations:
- "Physically and mentally fit to drive a public service vehicle: Yes/No"
- "Physically and mentally fit to hold a Bus Attendant Vocational Licence: Yes/No"  
**And** both determinations SHALL be clearly visible and separately labeled

#### Scenario: Generate PDF for LTA vocational short form submission
**Given** a submission with exam type "VOCATIONAL_LICENCE_LTA_SHORT" has been approved  
**When** the system generates the PDF report  
**Then** the PDF SHALL be successfully created  
**And** the PDF SHALL include only the vocational fitness determination  
**And** the PDF SHALL NOT include motor vehicle fitness section

---

### Requirement: Short form PDFs SHALL use simplified single-page layout
PDF reports for short forms SHALL prioritize readability and minimize page count.

#### Scenario: Short form PDF fits on single page
**Given** a short form submission is being converted to PDF  
**When** the PDF is generated  
**Then** the entire report SHALL fit on a single A4 page  
**And** the layout SHALL use adequate spacing for readability  
**And** the font sizes SHALL be appropriate (min 10pt for body text)

#### Scenario: Short form PDF emphasizes fitness determination
**Given** a short form submission is being converted to PDF  
**When** the fitness determination section is rendered  
**Then** the fitness question(s) and answer(s) SHALL use larger or bold font  
**And** the section SHALL be visually distinct (e.g., border, shading, or increased spacing)  
**And** Yes/No values SHALL be clearly indicated with checkbox symbols (☑ for selected, ☐ for unselected)

---

### Requirement: Short form PDF generation SHALL reuse existing infrastructure
PDF generation for short forms SHALL integrate with the existing pdfmake-based PDF service.

#### Scenario: PDF service routes short form requests correctly
**Given** the PDF service receives a request to generate a PDF  
**And** the submission exam type ends with "_SHORT"  
**When** the service determines which generator to use  
**Then** the system SHALL route to the short form PDF generator  
**And** the system SHALL NOT use long form PDF templates

#### Scenario: Short form PDF generator is implemented as separate module
**Given** the backend PDF generation codebase  
**Then** a file `backend/src/pdf/generators/short-driver-exam.generator.ts` SHALL exist  
**And** the file SHALL export a class or functions for each short form type:
- `generateTpShort(submission: MedicalSubmission): Buffer`
- `generateTpLtaShort(submission: MedicalSubmission): Buffer`
- `generateLtaShort(submission: MedicalSubmission): Buffer`  
**And** the main PDF service SHALL import and invoke these functions

---

### Requirement: Short form PDFs SHALL include standard header and footer
All short form PDFs SHALL maintain consistent branding and metadata.

#### Scenario: PDF header includes clinic information
**Given** a short form submission is being converted to PDF  
**When** the PDF header is rendered  
**Then** the header SHALL display the clinic name  
**And** the header SHALL display the clinic address (if available)  
**And** the header SHALL display the exam type title clearly (e.g., "Short Form: Driving Licence (TP)")

#### Scenario: PDF footer includes practitioner information
**Given** a short form submission is being converted to PDF  
**When** the PDF footer is rendered  
**Then** the footer SHALL display the medical practitioner's name  
**And** the footer SHALL display the examination date  
**And** the footer SHALL include a signature line  
**And** the footer SHALL include page number (should be "Page 1 of 1")

---

### Requirement: Short form PDFs SHALL omit sections not applicable to minimal forms
PDF layout SHALL exclude all sections that are not part of the short form data collection.

#### Scenario: Short form PDF excludes medical history sections
**Given** a short form submission is being converted to PDF  
**When** the PDF is generated  
**Then** the PDF SHALL NOT include "Medical Declaration by Examinee" section  
**And** the PDF SHALL NOT include "Medical History of Examinee" section  
**And** the PDF SHALL NOT include "General Medical Examination" section with vitals  
**And** the PDF SHALL NOT include "Abbreviated Mental Test" section  
**And** the PDF SHALL NOT include "Assessment Remarks" section

#### Scenario: Short form PDF excludes height/weight/BMI table
**Given** a short form submission is being converted to PDF  
**When** the patient information section is rendered  
**Then** the PDF SHALL NOT display height, weight, or BMI fields  
**And** the PDF SHALL NOT display blood pressure values

---

### Requirement: PDF generation SHALL handle short form data structure correctly
The PDF generator SHALL correctly extract data from the simplified short form JSON structure.

#### Scenario: PDF generator extracts fitness determination from assessment object
**Given** a short form submission with formData:
```json
{
  "assessment": {
    "fitToDrivePublicService": true,
    "fitBusAttendant": false
  }
}
```  
**When** the PDF is generated  
**Then** the PDF SHALL correctly display "Physically and mentally fit to drive a public service vehicle: Yes"  
**And** the PDF SHALL correctly display "Physically and mentally fit to hold a Bus Attendant Vocational Licence: No"

#### Scenario: PDF generator extracts patient info from patientInfo object
**Given** a short form submission with formData:
```json
{
  "patientInfo": {
    "nric": "S1234567D",
    "name": "John Doe",
    "mobileNumber": "+6591234567",
    "purposeOfExam": "AGE_65_ABOVE_TP_LTA",
    "examinationDate": "2024-01-15"
  }
}
```  
**When** the PDF is generated  
**Then** the PDF SHALL display all patient information fields correctly  
**And** the purpose SHALL be displayed in human-readable format (e.g., "Age 65 and above - Renew both Traffic Police & LTA Vocational Licence" instead of "AGE_65_ABOVE_TP_LTA")

#### Scenario: PDF generator extracts declaration status
**Given** a short form submission with formData:
```json
{
  "declaration": {
    "confirmed": true,
    "declarationText": "I certify..."
  }
}
```  
**When** the PDF is generated  
**Then** the PDF SHALL display a checked box symbol (☑) next to the declaration text  
**And** the PDF SHALL include the full declaration text

---

### Requirement: PDF generation SHALL succeed for all short form exam types
PDF generation SHALL not fail or produce errors for any valid short form submission.

#### Scenario: PDF generation succeeds for DRIVING_LICENCE_TP_SHORT
**Given** a valid submission with exam type "DRIVING_LICENCE_TP_SHORT"  
**When** the PDF service generates the report  
**Then** the operation SHALL complete without errors  
**And** the returned Buffer SHALL contain valid PDF data

#### Scenario: PDF generation succeeds for DRIVING_VOCATIONAL_TP_LTA_SHORT
**Given** a valid submission with exam type "DRIVING_VOCATIONAL_TP_LTA_SHORT"  
**When** the PDF service generates the report  
**Then** the operation SHALL complete without errors  
**And** the returned Buffer SHALL contain valid PDF data

#### Scenario: PDF generation succeeds for VOCATIONAL_LICENCE_LTA_SHORT
**Given** a valid submission with exam type "VOCATIONAL_LICENCE_LTA_SHORT"  
**When** the PDF service generates the report  
**Then** the operation SHALL complete without errors  
**And** the returned Buffer SHALL contain valid PDF data

---

## MODIFIED Requirements

None - existing long form PDF generation requirements remain unchanged.

## REMOVED Requirements

None - short form PDF generation is additive; no existing PDF functionality is removed.
