# pdf-reports Specification

## Purpose
Provides secure server-side PDF generation and download functionality for medical examination submissions. PDFs are generated exclusively on the backend to prevent forgery and include all submission details in a professional medical report format. Only authorized users with submission access can download PDFs.

## ADDED Requirements

### Requirement: Server-side PDF generation for submissions
The system SHALL generate PDF reports of medical examination submissions on the backend using HTML-to-PDF conversion to ensure document integrity and prevent client-side tampering.

#### Scenario: Backend generates PDF from submission data
**Given** a medical submission exists with ID "sub-123"  
**And** the submission status is "submitted"  
**When** a PDF generation request is made  
**Then** the system SHALL render an HTML template with the submission data  
**And** the system SHALL convert the HTML to PDF using a headless browser  
**And** the system SHALL return a PDF buffer  
**And** the PDF SHALL NOT be generated on the client side

#### Scenario: PDF includes complete submission details
**Given** a medical submission with all fields populated  
**When** PDF is generated  
**Then** the PDF SHALL include patient information (NRIC, name, DOB, gender)  
**And** the PDF SHALL include exam details (type, date, vitals, test results)  
**And** the PDF SHALL include exam-specific fields based on exam type  
**And** the PDF SHALL include medical remarks if present  
**And** the PDF SHALL include clinic information (name, HCI code, phone)  
**And** the PDF SHALL include doctor information (name, MCR number)  
**And** the PDF SHALL include submission metadata (ID, created date, submitted date)

#### Scenario: PDF formatting is professional and printable
**Given** a PDF is generated  
**When** the PDF is opened  
**Then** the PDF SHALL use A4 page size (210mm x 297mm)  
**And** the PDF SHALL have appropriate margins for printing  
**And** the PDF SHALL use black and white color scheme  
**And** the PDF SHALL have clear section headers  
**And** the PDF SHALL handle multi-page content with proper page breaks  
**And** the PDF SHALL use a readable font size (minimum 10pt)

---

### Requirement: Secure PDF download API endpoint
The system SHALL provide an authenticated API endpoint for downloading submission PDFs with authorization checks matching existing submission access rules.

#### Scenario: Authorized user downloads PDF
**Given** a user is authenticated with a valid JWT  
**And** the user has access to submission "sub-123" (creator, approver, assigned doctor, or same clinic)  
**And** the submission status is "submitted"  
**When** the user requests `GET /v1/submissions/sub-123/pdf`  
**Then** the system SHALL verify the user's authorization  
**And** the system SHALL generate the PDF  
**And** the system SHALL return HTTP 200 with content-type "application/pdf"  
**And** the system SHALL include header `Content-Disposition: attachment; filename="sub-123.pdf"`  
**And** the browser SHALL download the PDF file

#### Scenario: Unauthorized user cannot download PDF
**Given** a user is authenticated with a valid JWT  
**And** the user does NOT have access to submission "sub-456"  
**When** the user requests `GET /v1/submissions/sub-456/pdf`  
**Then** the system SHALL return HTTP 403 Forbidden  
**And** the system SHALL NOT generate the PDF  
**And** the response body SHALL contain an error message

#### Scenario: Unauthenticated request is rejected
**Given** a user is NOT authenticated  
**When** the user requests `GET /v1/submissions/sub-123/pdf` without a JWT  
**Then** the system SHALL return HTTP 401 Unauthorized  
**And** the system SHALL NOT generate the PDF

#### Scenario: PDF download for non-existent submission
**Given** a user is authenticated  
**When** the user requests `GET /v1/submissions/invalid-id/pdf`  
**And** the submission does not exist  
**Then** the system SHALL return HTTP 404 Not Found  
**And** the system SHALL NOT attempt to generate a PDF

---

### Requirement: Frontend PDF download button
The system SHALL display a "Download PDF" button on submission detail pages for authorized users when the submission status is submitted or approved.

#### Scenario: Download button visible for submitted submission
**Given** a user is viewing a submission detail page  
**And** the submission status is "submitted"  
**And** the user has access to the submission  
**When** the page renders  
**Then** a "Download PDF" button SHALL be displayed  
**And** the button SHALL be enabled  
**And** the button SHALL be positioned in the header area near the status badge

#### Scenario: Download button hidden for draft submissions
**Given** a user is viewing a submission detail page  
**And** the submission status is "draft"  
**When** the page renders  
**Then** the "Download PDF" button SHALL NOT be displayed

#### Scenario: Download button hidden for pending approval submissions
**Given** a user is viewing a submission detail page  
**And** the submission status is "pending_approval"  
**When** the page renders  
**Then** the "Download PDF" button SHALL NOT be displayed

#### Scenario: User initiates PDF download
**Given** a user is viewing a submitted submission  
**And** the "Download PDF" button is visible  
**When** the user clicks the "Download PDF" button  
**Then** the button SHALL show a loading indicator  
**And** the system SHALL make a GET request to `/v1/submissions/:id/pdf`  
**And** when the PDF is received, the browser SHALL download the file  
**And** the button SHALL return to normal state

#### Scenario: PDF download error handling
**Given** a user clicks "Download PDF"  
**When** the API request fails with 403 Forbidden  
**Then** the system SHALL display toast message "You don't have permission to download this PDF"  
**And** the button SHALL return to normal state

**When** the API request fails with 500 Internal Server Error  
**Then** the system SHALL display toast message "PDF generation failed. Please contact support."  
**And** the button SHALL return to normal state

**When** the API request fails with network error  
**Then** the system SHALL display toast message "Failed to download PDF. Please try again."  
**And** the button SHALL return to normal state

---

### Requirement: Exam-type specific PDF content
The system SHALL render PDF content with exam-specific fields and conditional sections based on the submission's exam type, mirroring the display logic of the submission details page.

#### Scenario: Six-Monthly MDW PDF includes specific fields
**Given** a submission has exam type "SIX_MONTHLY_MDW"  
**When** PDF is generated  
**Then** the PDF SHALL include test results section with pregnancy test and chest X-ray  
**And** the PDF SHALL NOT include body measurements section  
**And** the PDF SHALL include MOM declaration text

#### Scenario: Work Permit PDF includes specific fields
**Given** a submission has exam type "WORK_PERMIT"  
**When** PDF is generated  
**Then** the PDF SHALL include test results section with HIV test and TB test  
**And** the PDF SHALL include body measurements section  
**And** the PDF SHALL include MOM declaration text

#### Scenario: ICA exam PDF includes specific fields
**Given** a submission has exam type from ICA exam types (PR_MEDICAL, STUDENT_PASS_MEDICAL, LTVP_MEDICAL)  
**When** PDF is generated  
**Then** the PDF SHALL include passport number field  
**And** the PDF SHALL include FIN field  
**And** the PDF SHALL include test results section with HIV test and chest X-ray  
**And** the PDF SHALL NOT include body measurements section  
**And** the PDF SHALL include ICA declaration text

#### Scenario: Driver exam PDF includes specific fields
**Given** a submission has exam type from driver exam types (DRIVING_LICENCE_TP, DRIVING_VOCATIONAL_TP_LTA, VOCATIONAL_LICENCE_LTA)  
**When** PDF is generated  
**Then** the PDF SHALL include age at examination  
**And** the PDF SHALL include visual acuity fields  
**And** the PDF SHALL include hearing test field  
**And** the PDF SHALL include physical fitness assessment  
**And** the PDF SHALL include fitness determination

#### Scenario: Full Medical Exam PDF includes accordion sections
**Given** a submission has exam type "FULL_MEDICAL_EXAM"  
**When** PDF is generated  
**Then** the PDF SHALL include medical history section with all questionnaire items  
**And** the PDF SHALL include physical examination section  
**And** the PDF SHALL include overall assessment  
**And** the PDF SHALL include MOM declaration text

---

### Requirement: PDF authorization follows submission access rules
The system SHALL enforce the same authorization rules for PDF download as for viewing submission details, ensuring consistent access control.

#### Scenario: Admin can download any clinic submission PDF
**Given** a user with role "admin" is authenticated  
**And** the user's clinic ID is "clinic-1"  
**And** a submission exists with clinic ID "clinic-1"  
**When** the admin requests PDF download  
**Then** the system SHALL authorize the request  
**And** the system SHALL generate and return the PDF

#### Scenario: Doctor can download their approved submission PDF
**Given** a user with role "doctor" is authenticated  
**And** a submission exists that was approved by this doctor  
**When** the doctor requests PDF download  
**Then** the system SHALL authorize the request  
**And** the system SHALL generate and return the PDF

#### Scenario: Nurse can download their created submission PDF
**Given** a user with role "nurse" is authenticated  
**And** a submission exists that was created by this nurse  
**When** the nurse requests PDF download  
**Then** the system SHALL authorize the request  
**And** the system SHALL generate and return the PDF

#### Scenario: Assigned doctor can download submission PDF
**Given** a user with role "doctor" is authenticated  
**And** a submission exists with assignedDoctorId matching this doctor  
**When** the doctor requests PDF download  
**Then** the system SHALL authorize the request  
**And** the system SHALL generate and return the PDF

#### Scenario: User from same clinic can download submission PDF
**Given** a user is authenticated with clinic ID "clinic-1"  
**And** a submission exists with clinic ID "clinic-1"  
**And** the user is not the creator or approver  
**When** the user requests PDF download  
**Then** the system SHALL authorize the request  
**And** the system SHALL generate and return the PDF

#### Scenario: User from different clinic cannot download PDF
**Given** a user is authenticated with clinic ID "clinic-2"  
**And** a submission exists with clinic ID "clinic-1"  
**And** the user is not the creator, approver, or assigned doctor  
**When** the user requests PDF download  
**Then** the system SHALL return HTTP 403 Forbidden  
**And** the system SHALL NOT generate the PDF

---

### Requirement: PDF generation performance and reliability
The system SHALL generate PDFs within a reasonable time frame with proper error handling and resource management.

#### Scenario: PDF generation completes within timeout
**Given** a PDF generation request is made  
**When** the system generates the PDF  
**Then** the generation SHALL complete within 30 seconds  
**And** if generation exceeds 30 seconds, the system SHALL return HTTP 500 with timeout error

#### Scenario: PDF generation handles concurrent requests
**Given** multiple users request PDFs simultaneously  
**When** the system processes these requests  
**Then** the system SHALL handle concurrent requests without degradation  
**And** each request SHALL receive a correctly generated PDF  
**And** the system SHALL NOT crash or hang

#### Scenario: PDF generation cleans up resources
**Given** a PDF generation request completes  
**When** the PDF is returned to the client  
**Then** the system SHALL close any opened browser pages  
**And** the system SHALL release memory resources  
**And** the system SHALL NOT leak memory over multiple requests

---

### Requirement: PDF filename and metadata
The system SHALL provide PDFs with meaningful filenames and proper content headers for browser download handling.

#### Scenario: PDF filename matches submission ID
**Given** a submission has ID "SUB-20251114-001"  
**When** a user downloads the PDF  
**Then** the response header SHALL include `Content-Disposition: attachment; filename="SUB-20251114-001.pdf"`  
**And** the browser SHALL save the file as "SUB-20251114-001.pdf"

#### Scenario: PDF content type is correct
**Given** a PDF download request  
**When** the PDF is returned  
**Then** the response header SHALL include `Content-Type: application/pdf`  
**And** the browser SHALL recognize the response as a PDF file

---

### Requirement: Patient name masking in PDFs
The system SHALL apply the same patient name masking logic in PDFs as in the submission detail view based on exam type and status.

#### Scenario: Patient name masked in draft MOM exam PDF
**Given** a submission has exam type "SIX_MONTHLY_MDW"  
**And** the submission status is "draft"  
**And** the patient name is "Maria Santos"  
**When** PDF is generated  
**Then** the patient name in the PDF SHALL be masked as "Maria S****"

#### Scenario: Patient name visible in submitted MOM exam PDF
**Given** a submission has exam type "SIX_MONTHLY_MDW"  
**And** the submission status is "submitted"  
**And** the patient name is "Maria Santos"  
**When** PDF is generated  
**Then** the patient name in the PDF SHALL display as "Maria Santos" (full name)

#### Scenario: Patient name always visible for non-MOM exams
**Given** a submission has exam type "AGED_DRIVERS"  
**And** the submission status is "draft"  
**And** the patient name is "John Tan"  
**When** PDF is generated  
**Then** the patient name in the PDF SHALL display as "John Tan" (full name)
