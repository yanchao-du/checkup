# Proposal: Collaborative Draft Workflow

## Overview

Enable bi-directional collaboration between doctors and nurses on medical examination forms through an "Assign To" workflow that allows multiple handoffs before final submission to agency.

## Problem Statement

Currently, the submission workflow is linear and one-directional:
- **Nurse workflow**: Create → Save as draft → Route for approval (one-way to doctor)
- **Doctor workflow**: Create → Submit directly to agency

### Limitations:
1. **No collaborative drafting**: Nurse must complete all their sections before routing to doctor
2. **No handback mechanism**: Doctor cannot route incomplete work back to nurse for additional input
3. **Productivity bottleneck**: Each role must work independently rather than iteratively
4. **Inflexible workflow**: Cannot split work based on expertise (e.g., nurse handles vitals, doctor handles medical assessment)

### Real-world use cases:
- Nurse collects patient vitals → assigns to doctor for medical assessment → assigns back to nurse to verify additional details → assigns back to doctor for final review and submission
- Doctor starts complex case → assigns to nurse to collect additional test results → assigns back to doctor for completion
- Multiple iterations needed for difficult cases without requiring final "approval"

## Proposed Solution

### New Workflow: "Collaborative Draft"

Add a parallel workflow alongside existing ones:

```
┌─────────────────────────────────────────────────────────────┐
│ EXISTING WORKFLOWS (Unchanged)                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Nurse: Draft → Route for Approval → Doctor Approves     │
│ 2. Doctor: Draft → Submit Directly to Agency                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NEW WORKFLOW: Collaborative Draft                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Nurse/Doctor                                                │
│       ↓                                                      │
│   Create Draft                                               │
│       ↓                                                      │
│  [Assign To Doctor/Nurse] ← ─ ─ ─ ─ ┐                      │
│       ↓                              │                       │
│  Status: in_progress                 │                       │
│  Assigned to: [recipient]            │ Unlimited            │
│       ↓                              │ iterations           │
│  Recipient edits                     │                       │
│       ↓                              │                       │
│  [Assign To X] or [Save & Keep] ─ ─ ┘                      │
│       ↓                                                      │
│  Doctor (only) can:                                          │
│  [Submit to Agency] (final)                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Features:

1. **New Status: `in_progress`**
   - Indicates collaborative work in progress
   - Distinct from `draft` (individual work) and `pending_approval` (approval workflow)

2. **Assignment Tracking**
   - `assignedToId`: Who should work on it next
   - `assignedToRole`: 'doctor' or 'nurse' (for quick filtering)
   - `assignedAt`: When was it assigned
   - `assignedById`: Who made the assignment

3. **Unlimited Handoffs**
   - No limit on number of assignments
   - Can go: Nurse → Doctor → Nurse → Doctor → ... → Doctor (submit)
   - Can start from either role

4. **Workflow Separation**
   - Collaborative drafts (`in_progress`) shown in separate "Assigned to Me" list
   - Regular drafts (`draft`) remain unchanged
   - Approval workflow (`pending_approval`) remains unchanged

5. **Final Submission**
   - Only doctor can submit `in_progress` → `submitted` (to agency)
   - Nurse cannot submit collaborative drafts directly
   - Nurse must assign to doctor for final submission

## Database Changes

### Schema Updates

```prisma
// Add to SubmissionStatus enum
enum SubmissionStatus {
  draft              // Individual work (existing)
  in_progress        // Collaborative work (NEW)
  pending_approval   // Approval workflow (existing)
  submitted          // Sent to agency (existing)
  rejected           // Rejected by doctor (existing)
}

// Add to MedicalSubmission model
model MedicalSubmission {
  // ... existing fields ...
  
  // NEW: Assignment tracking for collaborative workflow
  assignedToId     String?           @map("assigned_to_id")
  assignedToRole   UserRole?         @map("assigned_to_role")
  assignedAt       DateTime?         @map("assigned_at")
  assignedById     String?           @map("assigned_by_id")
  
  // NEW: Relations
  assignedTo       User?             @relation("AssignedTo", fields: [assignedToId], references: [id])
  assignedBy       User?             @relation("AssignedBy", fields: [assignedById], references: [id])
  
  // ... rest of existing fields ...
}

// Add to User model
model User {
  // ... existing relations ...
  
  // NEW: Collaborative draft assignments
  assignedToSubmissions    MedicalSubmission[] @relation("AssignedTo")
  assignmentsCreated       MedicalSubmission[] @relation("AssignedBy")
}

// Add to EventType enum
enum EventType {
  created
  updated
  submitted
  approved
  rejected
  deleted
  assigned         // NEW: When form is assigned to someone
  reassigned       // NEW: When form is reassigned
  claimed          // NEW: When assigned person starts working on it
}
```

### Migration Strategy

1. **Database migration**: Add new fields with `NULL` defaults
2. **Existing data**: Not affected (all fields are optional)
3. **Backward compatibility**: Existing workflows continue unchanged

## API Changes

### New Endpoints

```typescript
// POST /v1/submissions/:id/assign
// Assign a draft or in_progress submission to doctor/nurse
assignSubmission(id: string, assignToUserId: string): Promise<Submission>

// POST /v1/submissions/:id/claim
// Mark that you've started working on an assigned submission
claimSubmission(id: string): Promise<Submission>

// POST /v1/submissions/:id/submit-collaborative
// Doctor submits a collaborative draft to agency
submitCollaborativeDraft(id: string): Promise<Submission>

// GET /v1/submissions/assigned-to-me
// Get submissions assigned to current user
getAssignedSubmissions(): Promise<Submission[]>
```

### Updated Endpoints

```typescript
// POST /v1/submissions (create)
// Add optional `assignTo` field
{
  examType: string;
  patientName: string;
  // ... other fields ...
  assignTo?: string;  // NEW: User ID to assign to (triggers in_progress)
}

// PATCH /v1/submissions/:id (update)
// Add optional `assignTo` field
{
  formData: object;
  // ... other fields ...
  assignTo?: string;  // NEW: Reassign to another user
}
```

## Business Rules

### Assignment Rules

| Current Status | Action | Current User Role | Assigned User Role | New Status | Allowed? |
|----------------|--------|-------------------|-------------------|------------|----------|
| `draft` | Assign | Doctor/Nurse | Doctor/Nurse | `in_progress` | ✅ Yes |
| `in_progress` | Reassign | Doctor/Nurse | Doctor/Nurse | `in_progress` | ✅ Yes (if assigned to them) |
| `in_progress` | Save | Doctor/Nurse | N/A | `in_progress` | ✅ Yes (if assigned to them) |
| `in_progress` | Submit to Agency | Doctor | N/A | `submitted` | ✅ Yes |
| `in_progress` | Submit to Agency | Nurse | N/A | `in_progress` | ❌ No (must assign to doctor) |
| `pending_approval` | Assign | Any | Any | N/A | ❌ No (different workflow) |
| `submitted` | Assign | Any | Any | N/A | ❌ No (immutable) |

### Access Control

| Status | Action | Doctor | Nurse | Admin |
|--------|--------|--------|-------|-------|
| `draft` (own) | Assign to Doctor | ✅ | ✅ | ✅ |
| `draft` (own) | Assign to Nurse | ✅ | ✅ | ✅ |
| `in_progress` (assigned to me) | Edit | ✅ | ✅ | ✅ |
| `in_progress` (assigned to me) | Reassign | ✅ | ✅ | ✅ |
| `in_progress` (assigned to me) | Submit to Agency | ✅ | ❌ | ✅ |
| `in_progress` (not assigned to me) | View | ✅ | ✅ | ✅ |
| `in_progress` (not assigned to me) | Edit | ❌ | ❌ | ✅ |

## Frontend Changes

### New UI Components

1. **"Assigned to Me" Section**
   - Separate tab/section in Submissions view
   - Shows all `in_progress` submissions assigned to current user
   - Distinct from "Drafts" and "Pending Approval"

2. **Assignment Action Buttons**
   
   **In Form Editor (NewSubmission.tsx):**
   - "Save as Draft" (existing - creates `draft`)
   - **"Assign to Doctor"** (NEW - creates/updates `in_progress`)
   - **"Assign to Nurse"** (NEW - creates/updates `in_progress`)
   - "Submit to Agency" (existing for doctor, NEW for `in_progress`)
   
   **In Submissions List:**
   - Show "Assigned to: [Name]" for `in_progress` status
   - Show "Assigned by: [Name]" for context

3. **Assignment Dialog**
   ```tsx
   ┌─────────────────────────────────────┐
   │ Assign to Doctor/Nurse              │
   ├─────────────────────────────────────┤
   │                                     │
   │ Select recipient:                   │
   │ ┌─────────────────────────────────┐ │
   │ │ [Dropdown: List of doctors/    │ │
   │ │  nurses in clinic]             │ │
   │ └─────────────────────────────────┘ │
   │                                     │
   │ Add note (optional):                │
   │ ┌─────────────────────────────────┐ │
   │ │                                 │ │
   │ │                                 │ │
   │ └─────────────────────────────────┘ │
   │                                     │
   │         [Cancel]  [Assign]          │
   └─────────────────────────────────────┘
   ```

4. **Status Badge Updates**
   - `draft`: "Draft" (gray) - existing
   - `in_progress`: "In Progress" (blue) - NEW
   - `pending_approval`: "Pending Approval" (yellow) - existing
   - `submitted`: "Submitted" (green) - existing
   - `rejected`: "Rejected" (red) - existing

### Updated Views

**Submissions Page Tabs:**
```
┌────────────────────────────────────────────────────────┐
│ [All] [Drafts] [Assigned to Me] [Pending Approval]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Assigned to Me (3)                                     │
│ ┌────────────────────────────────────────────────────┐│
│ │ Patient Name    | Type    | Assigned By | Date    ││
│ │ John Doe        | MDW     | Dr. Smith   | 2 hrs   ││
│ │ Jane Smith      | WP      | Nurse Lee   | 1 day   ││
│ └────────────────────────────────────────────────────┘│
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Form Editor Actions (context-aware):**
```
┌────────────────────────────────────────────────────────┐
│ NEW SUBMISSION                                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [Patient Info Form...]                                 │
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ Actions:                                           ││
│ │                                                    ││
│ │ For Doctor:                                        ││
│ │ • [Save as Draft] - Work on it later (draft)      ││
│ │ • [Assign to Nurse] - Send to nurse (in_progress) ││
│ │ • [Submit to Agency] - Final submission            ││
│ │                                                    ││
│ │ For Nurse:                                         ││
│ │ • [Save as Draft] - Work on it later (draft)      ││
│ │ • [Assign to Doctor] - Send to doctor (in_progress)││
│ │ • [Route for Approval] - Traditional approval flow ││
│ └────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

## Workflow Examples

### Example 1: Nurse → Doctor → Nurse → Doctor

```
1. Nurse creates new submission
   Status: Not saved yet
   
2. Nurse fills vitals, assigns to Dr. Smith
   Status: in_progress
   Assigned to: Dr. Smith
   Assigned by: Nurse Lee
   
3. Dr. Smith receives notification
   Sees in "Assigned to Me" section
   
4. Dr. Smith reviews, needs lab results
   Edits form, assigns back to Nurse Lee
   Status: in_progress
   Assigned to: Nurse Lee
   Assigned by: Dr. Smith
   
5. Nurse Lee receives notification
   Adds lab results, assigns back to Dr. Smith
   Status: in_progress
   Assigned to: Dr. Smith
   Assigned by: Nurse Lee
   
6. Dr. Smith completes assessment
   Clicks "Submit to Agency"
   Status: submitted
   Approved by: Dr. Smith
```

### Example 2: Doctor starts, needs nurse input

```
1. Dr. Smith starts complex case
   Fills medical assessment section
   
2. Dr. Smith needs nurse to collect additional vitals
   Assigns to Nurse Lee with note: "Please measure BP 3 times"
   Status: in_progress
   Assigned to: Nurse Lee
   
3. Nurse Lee collects data
   Updates form, assigns back to Dr. Smith
   Status: in_progress
   Assigned to: Dr. Smith
   
4. Dr. Smith reviews
   Clicks "Submit to Agency"
   Status: submitted
```

### Example 3: Keep working yourself (no assignment)

```
1. Nurse starts draft
   Saves as draft
   Status: draft
   
2. Later, nurse continues working
   Still draft
   Status: draft
   
3. Nurse completes all sections
   Routes for approval (traditional workflow)
   Status: pending_approval
```

## Timeline/Activity Log

### New Events in Timeline

```
Timeline for Submission #12345
─────────────────────────────────────────────────────────
○ Submitted to MOM
  by Dr. Smith • 2 hours ago

○ Assigned to Dr. Smith                           <- NEW
  by Nurse Lee • 4 hours ago
  Note: "Added lab results as requested"

○ Assigned to Nurse Lee                           <- NEW
  by Dr. Smith • 1 day ago
  Note: "Please collect lab results"

○ Assigned to Dr. Smith                           <- NEW
  by Nurse Lee • 1 day ago
  Note: "Vitals completed, need medical assessment"

○ Draft Created
  by Nurse Lee • 1 day ago
─────────────────────────────────────────────────────────
```

## Benefits

1. **Flexibility**: Doctor and nurse can collaborate iteratively
2. **Efficiency**: Split work based on expertise without waiting for "final" versions
3. **Clarity**: Clear ownership (assignedTo) at any point in time
4. **Audit Trail**: Complete history of handoffs and collaboration
5. **No Breaking Changes**: Existing workflows (draft, pending_approval) unchanged
6. **Progressive Enhancement**: Users can opt-in to collaborative workflow when needed

## Migration & Rollout

### Phase 1: Database & Backend
- [ ] Create migration for new fields
- [ ] Update Prisma schema
- [ ] Implement assignment endpoints
- [ ] Add business logic and validation
- [ ] Update existing endpoints to handle `in_progress` status
- [ ] Add unit tests

### Phase 2: Frontend Core
- [ ] Update status type definitions
- [ ] Create "Assigned to Me" view
- [ ] Add assignment dialog component
- [ ] Update status badges
- [ ] Implement assignment actions in form editor

### Phase 3: Polish & Testing
- [ ] Add notifications for assignments
- [ ] Update timeline to show assignment events
- [ ] E2E testing for collaborative workflows
- [ ] User acceptance testing
- [ ] Documentation updates

### Phase 4: Production
- [ ] Feature flag for gradual rollout
- [ ] Monitor usage and feedback
- [ ] Iterate based on user feedback

## Open Questions

1. **Notifications**: Should we send email/in-app notifications when assigned?
   - Recommendation: Yes, in-app notifications initially, email as enhancement

2. **Default assignments**: Should nurse have a default doctor for assignments?
   - Recommendation: Yes, reuse existing `defaultDoctorId` field

3. **Batch operations**: Assign multiple submissions at once?
   - Recommendation: Not in v1, can add later if needed

4. **Assignment expiry**: Should assignments expire after X days?
   - Recommendation: Not in v1, show age in UI instead

5. **Comments/Notes**: Full commenting system vs simple notes?
   - Recommendation: Simple notes on assignment, full comments as future enhancement

## Success Metrics

1. **Adoption**: % of submissions using collaborative workflow
2. **Efficiency**: Average time from creation to submission (collaborative vs traditional)
3. **Handoffs**: Average number of assignments per submission
4. **User Satisfaction**: Feedback from doctors and nurses
5. **Error Reduction**: Fewer rejections due to better collaboration

## Related Documentation

- Current workflow: `/docs/architecture/ACCESS_CONTROL.md`
- Approval workflow: `/docs/features/DOCTOR_EDIT_PENDING_APPROVAL.md`
- Database schema: `/backend/prisma/schema.prisma`
- Submissions API: `/backend/src/submissions/`

---

**Proposal Status**: Draft  
**Created**: 2025-11-04  
**Author**: System  
**Target Release**: TBD
