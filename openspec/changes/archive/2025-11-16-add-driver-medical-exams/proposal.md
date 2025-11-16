# Add Driver Medical Exam Types

## Context
The CheckUp system currently supports 7 exam types (MOM and ICA exams) but lacks support for driver medical examinations required by Singapore's Traffic Police (TP) and Land Transport Authority (LTA). Based on the Medical Examination Report Guide, there are three specific driver exam types that need to be added:

1. **Driving Licence MER (TP)** - Traffic Police driving licence medical examination
2. **Driving Licence and Vocational Licence (TP & LTA)** - Combined TP driving licence and LTA vocational licence medical examination
3. **Vocational Licence (LTA)** - LTA vocational licence only medical examination

## Problem Statement
Medical practitioners need to submit Medical Examination Reports (MERs) for driver fitness assessments, but the CheckUp system does not currently support these exam types. The manual process is time-consuming (approximately 10 minutes per submission) and requires:

- Healthcare Institution (HCI) and Medical Practitioner (MedP) information
- Examinee details (NRIC/FIN, DOB, contact information)
- Medical declaration by examinee (past 6 months occurrences)
- Medical history of examinee
- General medical examination details (height, weight, BP, pulse, vision, hearing)
- Abbreviated Mental Test (AMT) for TP driving licence applications
- LTA Vocational Licence specific medical examination details (when applicable)
- Medical practitioner's assessment and endorsement

## Goals
1. **Add three new exam types** to the CheckUp system for driver medical examinations
2. **Maximize component reuse** from existing exam forms (visual acuity, hearing, diabetes, blood pressure, etc.)
3. **Minimize user input and clicks** for doctors and nurses through:
   - Smart defaults and pre-filled fields
   - Logical field grouping and progressive disclosure
   - Single-page form layout where possible
   - Bulk actions for common scenarios
4. **Implement complete workflow** including:
   - Form creation and editing (nurses)
   - Approval workflow (doctors)
   - Summary view before submission
   - View submitted records with complete audit trail

## Scope

### In Scope
- Database schema updates for three new ExamType enum values
- Backend API support for new exam types
- Frontend form components reusing existing UI patterns
- Form fields specific to driver medical exams:
  - Abbreviated Mental Test (AMT) for TP exams
  - LTA Vocational Licence medical details for VL exams
  - Medical history questionnaire
  - Medical declaration by examinee
- Summary and review screens before submission
- View submission functionality for completed driver exams
- Integration with existing approval workflow
- Validation rules specific to driver medical requirements

### Out of Scope
- Specialist report upload/attachment functionality (future enhancement)
- Direct integration with TP/LTA systems for submission
- CorpPass/SingPass authentication (assume existing auth works)
- Automated email notifications to examinee
- Amendment/cancellation of submitted MERs (handled via manual email process per guide)
- Whitelisting MedP SingPass accounts (handled externally)

## Success Criteria
1. Doctors and nurses can create all three types of driver medical exams
2. Forms reuse at least 70% of existing components (visual acuity, hearing, diabetes, BP, etc.)
3. Average completion time is under 8 minutes (20% improvement from current 10 minutes)
4. Summary screen displays all entered information for review before submission
5. View submission shows complete exam details with proper formatting
6. All validations enforce MER requirements (e.g., exam within 2 months before birthday)
7. Approval workflow functions identically to existing exam types

## Non-Goals
- Building a completely new form architecture (reuse existing patterns)
- PDF generation or printing of MERs
- Integration with external specialist systems
- Multi-language support beyond English
- Mobile-specific optimizations (responsive design sufficient)

## Dependencies
- Existing form components in `frontend/src/components/submission-form/`
- Existing exam type architecture and validation
- Current approval workflow system
- Prisma schema and migration system

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Field requirements may differ from guide | High | Validate against official MER guide document, confirm with stakeholders |
| AMT test implementation may be complex | Medium | Start with simple text-based implementation, enhance later if needed |
| Form becomes too long affecting UX | Medium | Use accordion sections, progressive disclosure, smart defaults |
| Validation rules conflict with existing types | Low | Isolate driver exam validation in separate functions |
| Component reuse causes unintended side effects | Low | Add exam-type-specific rendering logic where needed |

## Related Work
- Existing exam types: `SIX_MONTHLY_MDW`, `SIX_MONTHLY_FMW`, `WORK_PERMIT`, `AGED_DRIVERS`, `PR_MEDICAL`, `STUDENT_PASS_MEDICAL`, `LTVP_MEDICAL`
- Form components: `AgedDriversFields`, `WorkPermitFields`, `IcaExamFields`
- Summary components: `SixMonthlyMdwSummary`, `IcaExamSummary`
- Validation utilities: `validateNRIC`, `validateNricOrFin`
- Approval workflow: `PendingApprovals`, `RejectedSubmissions`

## Open Questions
1. Should AMT be a structured form with score calculation or free text?
2. Do we need to capture specialist referral information within the form?
3. Should we differentiate between TP-only vs TP+LTA in the UI beyond exam type selection?
4. Are there specific age restrictions or birthday proximity validations needed?
5. Should medical history fields be checkboxes or text fields?

## Timeline Estimate
- Design and spec finalization: 2 days
- Database schema and backend: 2 days
- Frontend form components: 3 days
- Summary and view components: 2 days
- Testing and validation: 2 days
- **Total: ~11 days**
