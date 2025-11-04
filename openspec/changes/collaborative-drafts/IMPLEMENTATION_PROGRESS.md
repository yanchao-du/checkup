# Collaborative Draft Workflow - Implementation Progress

**Feature Branch**: `collaborative-drafts`  
**Start Date**: 2025-11-04  
**Status**: 🟡 In Progress (Backend Complete, Frontend In Progress)

---

## Overview

Implementing bi-directional doctor-nurse collaboration workflow for medical examination forms. This allows unlimited handoffs between doctors and nurses before final submission to agency.

**Key Requirement**: Existing workflows (draft → route for approval, doctor direct submit) must remain unchanged. This is an additional optional workflow.

---

## ✅ Phase 1: Database & Backend (COMPLETED)

### Database Schema Updates

**File**: `backend/prisma/schema.prisma`

**Changes**:
- ✅ Added `in_progress` to `SubmissionStatus` enum
- ✅ Added collaborative draft fields to `MedicalSubmission` model:
  ```prisma
  assignedToId     String?           @map("assigned_to_id")
  assignedToRole   UserRole?         @map("assigned_to_role")
  assignedAt       DateTime?         @map("assigned_at")
  assignedById     String?           @map("assigned_by_id")
  ```
- ✅ Added `assigned`, `reassigned`, `claimed` to `EventType` enum
- ✅ Added relations to `User` model:
  ```prisma
  assignedToSubmissions MedicalSubmission[] @relation("AssignedTo")
  assignmentsCreated    MedicalSubmission[] @relation("AssignedBy")
  ```

**Migration**:
- ✅ Created: `20251104123547_add_collaborative_draft_workflow/migration.sql`
- ✅ Applied to database successfully
- ✅ Prisma Client regenerated

---

### Backend API Implementation

**Files Modified**:
- `backend/src/submissions/dto/submission.dto.ts`
- `backend/src/submissions/submissions.service.ts`
- `backend/src/submissions/submissions.controller.ts`

#### New DTOs

**AssignSubmissionDto**:
```typescript
{
  assignToId: string;  // User ID to assign to
  note?: string;       // Optional note about assignment
}
```

**Updated CreateSubmissionDto**:
- ✅ Added `assignTo?: string` field

**Updated UpdateSubmissionDto**:
- ✅ Added `assignTo?: string` field

#### New Service Methods

**SubmissionsService**:

1. ✅ `assignSubmission(id, userId, userRole, dto)`
   - Assigns draft or in_progress submission to doctor/nurse
   - Access control: creator, current assignee, or admin
   - Creates audit log with `assigned` or `reassigned` event
   - Updates status to `in_progress`

2. ✅ `getAssignedSubmissions(userId, userRole, clinicId)`
   - Returns all `in_progress` submissions assigned to current user
   - Ordered by `assignedAt` descending
   - Includes assignment metadata

3. ✅ `claimSubmission(id, userId, userRole)`
   - Marks that user has started working on assigned submission
   - Creates audit log with `claimed` event
   - Validation: must be in_progress and assigned to user

4. ✅ `submitCollaborativeDraft(id, userId, userRole)`
   - Converts `in_progress` → `submitted`
   - Access control: doctors only (and admins)
   - Runs validation before submission
   - Creates audit log with `submitted` event

#### Updated Service Methods

1. ✅ `create()` - Enhanced to support `assignTo` parameter
   - If `assignTo` is provided, creates with `in_progress` status
   - Sets all assignment fields
   - Creates `assigned` audit log entry

2. ✅ `update()` - Enhanced to support `assignTo` parameter
   - If `assignTo` is provided, reassigns submission
   - Updates assignment fields and status to `in_progress`
   - Access control updated to allow assigned users to edit
   - Creates `reassigned` audit log entry

3. ✅ `formatSubmission()` - Added collaborative fields
   - Returns: `assignedToId`, `assignedToName`, `assignedToRole`
   - Returns: `assignedAt`, `assignedById`, `assignedByName`, `assignedByRole`
   - Returns: `createdByRole` for display

#### New API Endpoints

**SubmissionsController**:

1. ✅ `POST /submissions/:id/assign`
   - Body: `AssignSubmissionDto`
   - Assigns submission to doctor/nurse
   - Returns updated submission

2. ✅ `GET /submissions/assigned-to-me`
   - No parameters
   - Returns array of submissions assigned to current user
   - Filters by `in_progress` status and `assignedToId`

3. ✅ `POST /submissions/:id/claim`
   - No body
   - Claims assigned submission
   - Returns success message

4. ✅ `POST /submissions/:id/submit-collaborative`
   - No body
   - Submits collaborative draft to agency
   - Returns submitted submission

#### Business Logic & Access Control

**Assignment Rules**:
- ✅ Can only assign `draft` or `in_progress` submissions
- ✅ Cannot assign `pending_approval`, `submitted`, or `rejected`
- ✅ Can only assign to doctors or nurses
- ✅ Creator, current assignee, or admin can assign
- ✅ Unlimited reassignments allowed

**Edit Access for `in_progress`**:
- ✅ Assigned user can edit
- ✅ Admin can edit
- ✅ Others cannot edit (including creator if not assigned to them)

**Submit Access**:
- ✅ Only doctor can submit `in_progress` → `submitted`
- ✅ Nurse must assign to doctor for final submission

#### Audit Trail

All assignment operations logged:
- ✅ `assigned` - Initial assignment (draft → in_progress)
- ✅ `reassigned` - Reassignment (in_progress → in_progress with different assignee)
- ✅ `claimed` - User started working on assigned submission
- ✅ Includes: assignedToId, assignedToName, assignedToRole, note

---

### Backend Testing

**Build Status**:
- ✅ TypeScript compilation: **PASSED**
- ✅ No lint errors
- ✅ Prisma Client generated successfully

**Unit Tests**:
- ⏳ TODO: Add tests for assignment service methods
- ⏳ TODO: Add tests for access control rules
- ⏳ TODO: Add tests for status transitions

---

## 🟡 Phase 2: Frontend Types (COMPLETED)

**File**: `frontend/src/types/api.ts`

**Changes**:
- ✅ Added `in_progress` to `SubmissionStatus` type
- ✅ Added collaborative fields to `MedicalSubmission` interface:
  ```typescript
  assignedToId?: string;
  assignedToName?: string;
  assignedToRole?: UserRole;
  assignedAt?: string;
  assignedById?: string;
  assignedByName?: string;
  assignedByRole?: UserRole;
  createdByRole?: UserRole;
  ```
- ✅ Added `assignTo?: string` to `CreateSubmissionRequest`
- ✅ Added `assignTo?: string` to `UpdateSubmissionRequest`
- ✅ Added `AssignSubmissionRequest` interface:
  ```typescript
  {
    assignToId: string;
    note?: string;
  }
  ```

---

## � Phase 3: Frontend UI (IN PROGRESS)

### 3.1 Status Constants & Utilities ✅ COMPLETED

**Files Updated**:
- ✅ `frontend/src/lib/badge-utils.ts`
- ✅ Added `in_progress` to `SubmissionStatus` type
- ✅ Updated `getSubmissionStatusBadgeVariant()` to return "info" (blue) for `in_progress`
- ✅ Updated `getSubmissionStatusLabel()` to return "In Progress" for `in_progress`

**Status Badge Design**:
- `draft` - Gray "Draft" ✅
- `in_progress` - Blue "In Progress" ✅ NEW
- `pending_approval` - Yellow "Pending Approval" ✅
- `submitted` - Green "Submitted" ✅
- `rejected` - Red "Rejected" ✅

---

### 3.2 Assignment Dialog Component ✅ COMPLETED

**File Created**: `frontend/src/components/AssignmentDialog.tsx`

**Features Implemented**:
- ✅ Modal dialog for assigning submissions
- ✅ Role selector (Doctor/Nurse) with automatic default to opposite of current user
- ✅ Dropdown to select specific doctor or nurse from clinic
- ✅ Optional note/message textarea (visible in timeline)
- ✅ "Cancel" and "Assign" buttons with proper states
- ✅ Loading states during API calls (user list load, assignment)
- ✅ Error handling with alert messages
- ✅ Assignment summary preview
- ✅ Shows MCR numbers for doctors in dropdown

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  submission: MedicalSubmission;
  currentUserRole: UserRole;
  onAssigned: (submission: MedicalSubmission) => void;
}
```

**API Integration**:
- ✅ Uses `usersApi.getDoctors()` and `usersApi.getNurses()` to get assignable users
- ✅ Calls `submissionsApi.assignSubmission(id, { assignToId, note })`

---

### 3.3 Submissions Service Enhancement ✅ COMPLETED

**File Updated**: `frontend/src/services/submissions.service.ts`

**New Methods Added**:
- ✅ `getAssignedToMe()` - GET `/submissions/assigned-to-me`
- ✅ `assignSubmission(id, data)` - POST `/submissions/:id/assign`
- ✅ `claimSubmission(id)` - POST `/submissions/:id/claim`
- ✅ `submitCollaborativeDraft(id)` - POST `/submissions/:id/submit-collaborative`

---

### 3.3 "Assigned to Me" View 🔄 IN PROGRESS

**File to Update**: `frontend/src/pages/Submissions.tsx` or similar

**Requirements**:
- New tab: "Assigned to Me" alongside "All", "Drafts", "Pending Approval"
- Shows only `in_progress` submissions where `assignedToId === currentUserId`
- Display columns:
  - Patient Name
  - Exam Type
  - Assigned By (name + role)
  - Assigned At (relative time)
  - Actions (Open, Claim)
- "Claim" button to mark as started working

**API Integration**:
- GET `/submissions/assigned-to-me`
- POST `/submissions/:id/claim`

---

### 3.4 Form Editor Actions 🔲 TODO

**File to Update**: `frontend/src/components/NewSubmission.tsx`

**Requirements**:
- Context-aware action buttons based on status and user role

**For Draft Submissions**:
- ✅ Existing: "Save as Draft"
- ✅ NEW: "Assign to Doctor" (for nurses)
- ✅ NEW: "Assign to Nurse" (for doctors)
- ✅ Existing: "Route for Approval" (for nurses - existing workflow)
- ✅ Existing: "Submit to Agency" (for doctors - existing workflow)

**For In Progress Submissions** (when user is assigned):
- ✅ NEW: "Save as Draft" (keep status as in_progress)
- ✅ NEW: "Assign to Doctor" (reassign)
- ✅ NEW: "Assign to Nurse" (reassign)
- ➕ NEW: "Submit to Agency" (doctors only - uses submitCollaborativeDraft)

**Implementation**:
- ✅ Add state for showing AssignmentDialog
- ✅ Add handlers for assignment actions
- ✅ Update button visibility logic
- ✅ Call appropriate API endpoints
- ✅ Track submission status (draft/in_progress)
- ✅ Import and integrate AssignmentDialog component
- ✅ Navigate to "Assigned to Me" after assignment

**Changes Made**:
- ✅ Added `showAssignmentDialog` and `currentSubmission` state
- ✅ Added `submissionStatus` state to track current status
- ✅ Added `handleAssign()` - saves draft, reloads submission, opens dialog
- ✅ Added `handleAssignmentComplete()` - closes dialog and navigates to /assigned-to-me
- ✅ Updated `loadSubmission()` to set `currentSubmission` and `submissionStatus`
- ✅ Added "Assign to Doctor/Nurse" button visible for draft and in_progress
- ✅ Added AssignmentDialog component at bottom of form
- ✅ Imported UserPlus icon from lucide-react

---

### 3.5 Status Badges & UI Indicators 🔲 TODO

**Files to Update**:
- Submission list components
- Submission detail view
- Anywhere status is displayed

**Requirements**:
- Add "In Progress" badge (blue color)
- Show "Assigned to: [Name] ([Role])" for in_progress submissions
- Show "Assigned by: [Name]" for context
- Show assignment timestamp

**Example Display**:
```
┌─────────────────────────────────────────┐
│ John Doe - Work Permit Exam             │
│ Status: [In Progress 🔵]                │
│ Assigned to: Dr. Smith (doctor)         │
│ Assigned by: Nurse Lee                  │
│ Assigned 2 hours ago                    │
└─────────────────────────────────────────┘
```

---

### 3.6 Timeline/Activity Log 🔲 TODO

**File to Update**: Wherever submission history/audit trail is displayed

**Requirements**:
- Display assignment events in timeline
- Event types:
  - "Assigned to [Name] ([Role])" - initial assignment
  - "Reassigned to [Name] ([Role])" - reassignment
  - "Claimed by [Name]" - user started working
  - "Submitted to Agency by [Name]" - final submission

**Example Timeline**:
```
○ Submitted to MOM
  by Dr. Smith • 2 hours ago

○ Reassigned to Dr. Smith
  by Nurse Lee • 4 hours ago
  Note: "Added lab results as requested"

○ Assigned to Nurse Lee
  by Dr. Smith • 1 day ago
  Note: "Please collect lab results"

○ Assigned to Dr. Smith
  by Nurse Lee • 1 day ago
  Note: "Vitals completed, need medical assessment"

○ Draft Created
  by Nurse Lee • 1 day ago
```

---

## 🔲 Phase 4: Testing

### Backend Unit Tests

**File**: `backend/src/submissions/submissions.service.spec.ts`

**Test Cases Needed**:
- [ ] `assignSubmission()` - valid assignment
- [ ] `assignSubmission()` - access denied for non-creator/non-assignee
- [ ] `assignSubmission()` - cannot assign submitted submissions
- [ ] `assignSubmission()` - can only assign to doctor/nurse
- [ ] `getAssignedSubmissions()` - returns only user's assignments
- [ ] `claimSubmission()` - valid claim
- [ ] `claimSubmission()` - cannot claim if not assigned to user
- [ ] `submitCollaborativeDraft()` - doctor can submit
- [ ] `submitCollaborativeDraft()` - nurse cannot submit
- [ ] `create()` with assignTo - creates in_progress
- [ ] `update()` with assignTo - reassigns
- [ ] `update()` - assigned user can edit in_progress
- [ ] `update()` - non-assigned user cannot edit in_progress

### Frontend E2E Tests

**Test Scenarios**:
- [ ] Nurse creates draft → assigns to doctor → doctor edits → submits
- [ ] Doctor creates draft → assigns to nurse → nurse edits → assigns back → doctor submits
- [ ] Multiple reassignments (nurse → doctor → nurse → doctor → submit)
- [ ] Claim submission from "Assigned to Me"
- [ ] Assignment dialog shows correct users
- [ ] Status badges display correctly
- [ ] Timeline shows assignment events

---

## 🔲 Phase 5: Documentation

**Files to Update/Create**:
- [ ] Update `docs/architecture/ACCESS_CONTROL.md` - Add in_progress status rules
- [ ] Create `docs/features/COLLABORATIVE_DRAFTS.md` - Feature documentation
- [ ] Update `README.md` - Mention new workflow
- [ ] Update API documentation (if exists)

---

## Git Commits

**Branch**: `collaborative-drafts`

**Commits**:
1. ✅ `feat: Add collaborative draft workflow backend` (commit: 0357735)
   - Database schema updates
   - Backend API implementation
   - Frontend type definitions
   - Proposal document

2. ✅ `feat: Add collaborative draft frontend components` (commit: 3258bca)
   - Badge utilities for in_progress status
   - AssignmentDialog component
   - Submissions service collaborative methods
   - Implementation progress documentation

3. ✅ `feat(collab): add AssignedToMe view with navigation` (commit: 0fbdc04)
   - AssignedToMe component with claim functionality
   - Route configuration in App.tsx
   - Navigation menu item in DashboardLayout
   - Updated implementation progress

**Next Commits** (planned):
4. 🟡 `feat(collab): add assignment actions to form editor` - Currently in progress
5. 🔲 `feat: Add status indicators and timeline updates` - UI enhancements
6. 🔲 `test: Add collaborative draft tests` - Backend and E2E tests
7. 🔲 `docs: Document collaborative draft workflow` - Documentation updates

---

## API Endpoints Summary

### New Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/submissions/assigned-to-me` | Get submissions assigned to me | Required |
| POST | `/submissions/:id/assign` | Assign submission to doctor/nurse | Required |
| POST | `/submissions/:id/claim` | Claim assigned submission | Required |
| POST | `/submissions/:id/submit-collaborative` | Submit collaborative draft | Required (Doctor) |

### Updated Endpoints

| Method | Endpoint | New Parameter | Description |
|--------|----------|---------------|-------------|
| POST | `/submissions` | `assignTo` | Create and assign immediately |
| PUT | `/submissions/:id` | `assignTo` | Update and reassign |

---

## Workflow Examples

### Example 1: Nurse → Doctor → Submit

```
1. Nurse creates new submission
   └─> Fills patient vitals
   └─> Clicks "Assign to Doctor" → Selects Dr. Smith
   └─> Status: in_progress, Assigned to: Dr. Smith

2. Dr. Smith sees in "Assigned to Me" tab
   └─> Opens submission
   └─> Completes medical assessment
   └─> Clicks "Submit to Agency"
   └─> Status: submitted
```

### Example 2: Doctor → Nurse → Doctor → Submit

```
1. Dr. Smith creates draft
   └─> Fills medical history
   └─> Clicks "Assign to Nurse" → Selects Nurse Lee
   └─> Status: in_progress, Assigned to: Nurse Lee
   
2. Nurse Lee sees in "Assigned to Me" tab
   └─> Opens submission
   └─> Adds vital signs and lab results
   └─> Clicks "Assign to Doctor" → Selects Dr. Smith
   └─> Status: in_progress, Assigned to: Dr. Smith
   
3. Dr. Smith sees reassignment
   └─> Opens submission
   └─> Reviews all data
   └─> Clicks "Submit to Agency"
   └─> Status: submitted
```

### Example 3: Traditional Workflow (Unchanged)

```
Nurse workflow:
1. Creates draft → Fills form → Clicks "Route for Approval"
   └─> Status: pending_approval
2. Doctor approves or rejects
   └─> Status: submitted or rejected

Doctor workflow:
1. Creates draft → Fills form → Clicks "Submit to Agency"
   └─> Status: submitted (auto-approved)
```

---

## Next Steps

**Immediate**:
1. ✅ Document progress (this file)
2. 🔄 Implement frontend UI components (In Progress)
   - ✅ Badge utilities
   - ✅ AssignmentDialog component
   - ✅ Submissions service methods
   - 🔄 Assigned to Me view (Next)
   - 🔲 Form editor actions
   - 🔲 Status indicators
   - 🔲 Timeline updates
3. 🔲 Add comprehensive tests
4. 🔲 Update documentation
5. 🔲 User acceptance testing
6. 🔲 Merge to main branch

**Future Enhancements** (out of scope for v1):
- Email/in-app notifications when assigned
- Batch assign multiple submissions
- Assignment expiry/reminders
- Full commenting system (currently just notes)
- Assignment analytics/metrics

---

**Last Updated**: 2025-11-04 13:45  
**Status**: Backend complete ✅ | Frontend UI in progress 🔄 (3/6 components done)
