# Nurse Rejected Submissions Feature

## Overview
Nurses can now view a list of their own submissions that were rejected by doctors.

## Changes Made

### Backend Changes

#### 1. `backend/src/submissions/submissions.controller.ts`
- **Added** `GET /v1/submissions/rejected` endpoint
- Available to all authenticated users (nurses, doctors, admins)
- Calls `findRejectedSubmissions()` service method

#### 2. `backend/src/submissions/submissions.service.ts`
- **Added** `findRejectedSubmissions()` method
- Filters submissions by:
  - `status = 'rejected'`
  - `createdById = userId` (nurses see only their own)
  - `clinicId` (for data isolation)
- Returns paginated list with rejection details
- Includes relations: `createdBy`, `assignedDoctor`, `approvedBy` (rejector)

### Frontend Changes

#### 3. `frontend/src/services/submissions.service.ts`
- **Added** `getRejected()` method
- Calls `GET /submissions/rejected` endpoint
- Returns paginated list of rejected submissions

#### 4. `frontend/src/components/RejectedSubmissions.tsx`
- **Updated** to support both doctors and nurses
- **Role-based API calls**:
  - Doctors: Call `approvalsApi.getRejected()` (shows submissions they rejected)
  - Nurses: Call `submissionsApi.getRejected()` (shows their own rejected submissions)
- **Role-based descriptions**:
  - Doctors: "Review submissions you have rejected"
  - Nurses: "Review your submissions that were rejected"

#### 5. `frontend/src/components/Dashboard.tsx`
- **Added** rejected submissions fetch for nurses
- Nurses now see rejected submissions in their activity feed
- Doctors continue to use `approvalsApi.getRejected()`
- Nurses use `submissionsApi.getRejected()`

#### 6. `frontend/src/components/DashboardLayout.tsx`
- **Updated** navigation item roles
- "Rejected Submissions" link now visible to: `['doctor', 'nurse', 'admin']`

#### 7. `frontend/src/App.tsx`
- **Updated** route protection
- `/rejected-submissions` route now allows: `['doctor', 'nurse', 'admin']`

## How It Works

### For Nurses:
1. Nurse creates a submission and submits it for approval
2. Doctor rejects the submission with a reason
3. The submission status becomes `'rejected'`
4. The `approvedById` field is set to the doctor's ID (tracks who rejected it)
5. Nurse can now see this submission in:
   - **Rejected Submissions** page (sidebar navigation)
   - **Dashboard** recent activity feed (with red X icon and "Rejected" label)

### For Doctors:
- Unchanged behavior
- Continue to see submissions they rejected
- Can see rejection reason and patient details

## API Endpoints

### New Endpoint for Nurses
```
GET /v1/submissions/rejected
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 50)
  - examType: string (optional)

Response:
{
  data: MedicalSubmission[],
  pagination: {
    page: number,
    limit: number,
    totalPages: number,
    totalItems: number,
    hasNext: boolean,
    hasPrevious: boolean
  }
}
```

### Existing Endpoint for Doctors
```
GET /v1/approvals/rejected
(Same response structure)
```

## Database Schema
No database changes required. Uses existing fields:
- `status` - Set to 'rejected' when doctor rejects
- `approvedById` - Set to doctor's ID who rejected (reused field to track rejector)
- `rejectedReason` - Doctor's reason for rejection

## Testing Checklist
- [x] Backend endpoint created and working
- [x] Frontend service method added
- [x] Component updated for role-based routing
- [x] Navigation shows link for nurses
- [x] Route protection updated
- [x] Dashboard shows rejected submissions for nurses
- [ ] Manual testing: Nurse can see rejected submissions
- [ ] Manual testing: Rejected submissions show correct rejector name
- [ ] Manual testing: Activity feed shows rejected items with red icon

## Notes
- Nurses only see their OWN rejected submissions (filtered by `createdById`)
- Doctors see submissions THEY rejected (filtered by `approvedById` or `assignedDoctorId`)
- Both use the same `RejectedSubmissions` component with role-aware logic
- Rejection reason is displayed in the table
- Rejector's name is shown in the "Rejected By" column
