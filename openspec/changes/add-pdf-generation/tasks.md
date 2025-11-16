# Implementation Tasks: Add PDF Generation

## Phase 1: Backend Setup
- [ ] Install pdfmake: `npm install pdfmake`
- [ ] Install TypeScript types: `npm install --save-dev @types/pdfmake`
- [ ] Create PDF module structure (`backend/src/pdf/`)
- [ ] Create `pdf.module.ts` with PdfService and PdfController
- [ ] Register PdfModule in AppModule imports

## Phase 2: Backend - PDF Service Base
- [ ] Create `pdf.service.ts` with pdfmake imports
- [ ] Import pdfmake fonts: `import * as pdfFonts from 'pdfmake/build/vfs_fonts'`
- [ ] Create `generateSubmissionPdf(submission)` method
- [ ] Implement base document definition structure
- [ ] Add timeout handling (5 seconds max)
- [ ] Add error logging for generation failures
- [ ] Test PDF service generates valid PDF buffers

## Phase 3: Backend - Base Document Structure
- [ ] Create helper method `buildDocumentDefinition(submission)`
- [ ] Create helper method `buildHeader(submission)` - clinic name, submission ID
- [ ] Create helper method `buildPatientInfo(submission)` - patient details table
- [ ] Create helper method `buildRemarks(submission)` - conditional remarks section
- [ ] Create helper method `buildDeclaration(submission)` - conditional declaration
- [ ] Create `getStyles()` method with all PDF styles
- [ ] Test base structure renders correctly with sample data

## Phase 4: Backend - PDF Controller
- [ ] Create `pdf.controller.ts` with `@UseGuards(JwtAuthGuard)`
- [ ] Implement `GET /:id/pdf` endpoint
- [ ] Integrate with SubmissionsService to fetch submission
- [ ] Reuse existing authorization logic from SubmissionsService.findOne()
- [ ] Call PdfService to generate PDF
- [ ] Set response headers (Content-Type, Content-Disposition)
- [ ] Stream PDF buffer to client
- [ ] Handle errors (404, 403, 500)
- [ ] Test endpoint returns valid PDF

## Phase 5: Backend - Exam Type Specific Document Definitions
- [ ] Create `buildMdwContent(submission)` - pregnancy test, chest X-ray (mirror SixMonthlyMdwDetails.tsx)
- [ ] Create `buildFmwContent(submission)` - pregnancy, syphilis, HIV, X-ray (mirror SixMonthlyFmwDetails.tsx)
- [ ] Create `buildFullMedicalExamContent(submission)` - medical history, examination (mirror FullMedicalExamDetails.tsx)
- [ ] Create `buildIcaExamContent(submission)` - HIV, X-ray for PR/Student/LTVP (mirror IcaExamDetails.tsx)
- [ ] Create `buildDriverTpContent(submission)` - visual acuity, hearing, fitness (mirror DrivingLicenceTpDetails.tsx)
- [ ] Create `buildDriverTpLtaContent(submission)` - TP + LTA sections (mirror DrivingVocationalTpLtaDetails.tsx)
- [ ] Create `buildDriverLtaContent(submission)` - LTA vocational only (mirror VocationalLicenceLtaDetails.tsx)
- [ ] Add body measurements helper (conditional - exclude ICA, FMW, driver exams)
- [ ] Test each exam type produces correct PDF content matching ViewSubmission display

## Phase 6: Backend - Authorization Tests
- [ ] Write unit test: Admin can download any clinic submission PDF
- [ ] Write unit test: Doctor can download their approved submission PDF
- [ ] Write unit test: Nurse can download their created submission PDF
- [ ] Write unit test: Assigned doctor can download submission PDF
- [ ] Write unit test: User from same clinic can download PDF
- [ ] Write unit test: User from different clinic cannot download PDF
- [ ] Write E2E test: GET /v1/submissions/:id/pdf with doctor token
- [ ] Write E2E test: GET /v1/submissions/:id/pdf returns 403 for unauthorized user
- [ ] Write E2E test: GET /v1/submissions/:id/pdf returns 404 for non-existent submission

## Phase 7: Frontend - API Client
- [ ] Add `downloadPdf(id)` method to `submissions.service.ts`
- [ ] Implement fetch with Authorization header
- [ ] Handle response blob
- [ ] Add error handling for 403, 404, 500
- [ ] Test API client with mock server

## Phase 8: Frontend - Download Button Component
- [ ] Add Download PDF button to ViewSubmission header section
- [ ] Position button next to status badge
- [ ] Add icon (Download or FileText from lucide-react)
- [ ] Implement loading state with spinner
- [ ] Add click handler to call API client
- [ ] Trigger browser download from blob response
- [ ] Show loading indicator during generation
- [ ] Handle errors with toast notifications
- [ ] Test button appears for submitted/approved submissions only

## Phase 9: Frontend - Authorization Logic
- [ ] Conditionally render button based on submission status
- [ ] Hide button for draft submissions
- [ ] Hide button for pending_approval submissions
- [ ] Show button for submitted submissions
- [ ] Show button for approved submissions (if status exists)
- [ ] Ensure button respects user authorization (frontend check)
- [ ] Test button visibility with different statuses

## Phase 10: Integration Testing
- [ ] Test PDF download flow end-to-end as doctor
- [ ] Test PDF download flow end-to-end as nurse
- [ ] Test PDF download flow end-to-end as admin
- [ ] Test all exam types generate correct PDFs
- [ ] Test PDF content matches submission details page
- [ ] Test patient name masking in PDFs
- [ ] Test declaration section appears for submitted exams
- [ ] Test multi-page PDFs render correctly
- [ ] Test error handling (unauthorized, not found, generation failure)

## Phase 11: Performance and Reliability
- [ ] Test concurrent PDF generation (10+ simultaneous requests)
- [ ] Verify browser instance remains stable across requests
- [ ] Monitor memory usage during PDF generation
- [ ] Test timeout handling (if generation takes >30 seconds)
- [ ] Verify no memory leaks after multiple generations
- [ ] Add logging for PDF generation times

## Phase 12: Documentation and Deployment
- [ ] Update API documentation (openapi.yaml) with new endpoint
- [ ] Add PDF generation section to README
- [ ] Document pdfmake setup in README (npm install only)
- [ ] Test in Docker environment (no Dockerfile changes needed!)
- [ ] Verify Docker image size unchanged (~150MB)
- [ ] Deploy to staging for review
- [ ] Manual testing of PDF output quality
- [ ] Deploy to production after approval

## Phase 13: Manual QA Checklist
- [ ] Download PDF for Six-Monthly MDW exam - verify matches ViewSubmission
- [ ] Download PDF for Six-Monthly FMW exam - verify matches ViewSubmission
- [ ] Download PDF for Full Medical Exam (MOM) - verify matches ViewSubmission
- [ ] Download PDF for PR Medical (ICA) - verify matches ViewSubmission
- [ ] Download PDF for Student Pass Medical (ICA) - verify matches ViewSubmission
- [ ] Download PDF for LTVP Medical (ICA) - verify matches ViewSubmission
- [ ] Download PDF for Driving Licence TP - verify matches ViewSubmission
- [ ] Download PDF for Driving Vocational TP+LTA - verify matches ViewSubmission
- [ ] Download PDF for Vocational Licence LTA - verify matches ViewSubmission
- [ ] Verify PDF formatting is professional and printable
- [ ] Verify PDF includes clinic information and declaration (where applicable)
- [ ] Verify PDF filename matches submission ID
- [ ] Verify unauthorized users cannot download PDFs
- [ ] Verify loading state appears during generation
- [ ] Verify error messages display correctly

## Dependencies and Blockers
- None - all required infrastructure exists (JWT auth, submission access control)
- Puppeteer installation may require system packages in Docker (chromium dependencies)

## Estimated Effort (with pdfmake - 7 active exam types)
- Backend implementation: 35-40 hours (7 exam types, mirror ViewSubmission layouts)
- Frontend implementation: 2-3 hours
- Testing and QA: 5-7 hours (test all 7 exam types + 3 driver sub-types)
- Documentation and deployment: 1 hour (minimal deployment changes)
- **Total**: ~43-51 hours

## Estimated Effort (with AI assistance - recommended)
- Backend implementation with AI: 24-28 hours (AI helps generate pdfmake document structures from ViewSubmission components)
- Frontend implementation: 2-3 hours
- Testing and QA: 4-5 hours
- Documentation and deployment: 1 hour
- **Total with AI**: ~31-37 hours

## Notes
- pdfmake is lightweight (~2MB) - no deployment complexity
- PDF generation is fast (~100-500ms) and low memory (~10-20MB per PDF)
- No Docker changes needed - works with existing Alpine base image
- Can use smaller EC2 instance (t3.small vs t3.large) = ~$50/month savings
- AI assistance significantly helps with generating pdfmake document definitions
- Consider adding rate limiting in future to prevent abuse
- Digital signatures and watermarks can be added in future enhancements
