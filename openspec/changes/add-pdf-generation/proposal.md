# Change Proposal: Add PDF Generation

## Metadata
- **Change ID**: add-pdf-generation
- **Status**: Draft
- **Created**: 2025-11-14
- **Author**: AI Assistant
- **Type**: Feature Addition

## Overview
Add secure server-side PDF generation and download functionality for medical examination submissions. PDFs are generated exclusively on the backend to prevent forgery and tampering. Only authorized users (doctors, nurses, admins with proper access) can download PDFs.

## Problem Statement
Currently, the system lacks the ability to generate and download official PDF reports of medical examination submissions. Users need:
1. A way to generate official PDF reports for approved medical examinations
2. Assurance that PDFs cannot be forged or tampered with (server-side generation only)
3. Access control to ensure only authorized users can download PDFs
4. Clear UI affordance (download button) on submission detail pages

## Proposed Solution
Implement a complete PDF generation system with the following components:

### Backend
1. **PDF Generation Service**: Server-side PDF generation using **pdfmake** (lightweight, fast, no system dependencies)
2. **Secure API Endpoint**: `GET /submissions/:id/pdf` with JWT authentication and authorization
3. **Authorization**: Verify user has access to the submission (creator, approver, assigned doctor, same clinic, or admin)
4. **PDF Document Definition**: Declarative document structure with tables, sections, and styling

### Frontend
1. **Download Button**: Add "Download PDF" button to ViewSubmission page
2. **Authorization Check**: Only show button if submission is approved/submitted
3. **Loading State**: Show loading indicator during PDF generation
4. **Error Handling**: User-friendly error messages if generation fails

## Requirements Summary
- Server-side PDF generation only (no client-side generation)
- JWT-based authorization matching existing submission access rules
- PDF includes all submission details visible in ViewSubmission page
- Support for all exam types (MDW, FMW, Work Permit, Driver exams, ICA exams, Full Medical)
- Professional formatting with clinic letterhead information
- Download as attachment with meaningful filename (e.g., `SUB-20251114-001.pdf`)

## Affected Capabilities
- **New**: `pdf-reports` - PDF generation and download for medical submissions

## Dependencies
- **pdfmake**: Lightweight PDF generation library (~2MB, no system dependencies)
- Existing authentication and authorization infrastructure
- Existing submission access control logic

## Technology Choice: pdfmake

**Selected**: pdfmake over Puppeteer

**Rationale**:
- ✅ **Zero deployment complexity**: No Docker changes, no Chromium, works with existing Alpine image
- ✅ **Lightweight**: ~2MB package vs ~280MB Chromium
- ✅ **Fast**: 100-500ms generation vs 2-5 seconds
- ✅ **Low memory**: ~10-20MB per PDF vs ~50-100MB
- ✅ **Cost efficient**: Can use t3.small (~$15/mo) vs t3.large (~$65/mo)
- ✅ **Production stable**: No browser processes to manage
- ❌ **Trade-off**: More development time (~50hrs vs ~25hrs) - acceptable for operational benefits

## Security Considerations
1. **No Client-Side Generation**: PDF must be generated on server to prevent tampering
2. **Authorization**: Enforce same access rules as `GET /submissions/:id`
3. **Input Validation**: Validate submission ID format and existence
4. **Rate Limiting**: Consider adding rate limits to prevent abuse (future enhancement)

## Testing Strategy
1. Unit tests for PDF generation service
2. E2E tests for PDF download endpoint with different roles
3. Authorization tests (unauthorized users cannot download)
4. Integration tests for all exam types
5. Manual testing of PDF output quality and content

## Rollout Plan
1. Implement backend PDF generation service and endpoint
2. Add frontend download button with authorization checks
3. Test with all exam types
4. Deploy to staging for review
5. Deploy to production after approval

## Success Criteria
- ✅ Users can download PDF reports from submission details page
- ✅ PDFs contain all relevant submission information
- ✅ Only authorized users can download PDFs
- ✅ PDF generation happens server-side (client cannot forge PDFs)
- ✅ All exam types supported
- ✅ Professional formatting suitable for official records

## Out of Scope
- Digital signatures (future enhancement)
- Watermarks or security stamps (future enhancement)
- Batch PDF generation (future enhancement)
- Email PDF directly to patient (future enhancement)
- PDF customization or templates per clinic (future enhancement)
