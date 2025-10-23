# Feature: Rejected Submissions List

## Overview
Doctors can now view a dedicated list of all submissions they have rejected, complete with rejection reasons and submission details.

## Changes Made

### Backend

#### 1. Approvals Service
**File**: `backend/src/approvals/approvals.service.ts`

**New Method**: `findRejectedSubmissions()`
```typescript
async findRejectedSubmissions(
  clinicId: string,
  doctorId: string,
  examType?: string,
  page: number = 1,
  limit: number = 50
)
```

**Features**:
- Filters submissions with `status = 'rejected'`
- Shows rejections where doctor was assigned OR approved (then rejected)
- Supports pagination (default 50 per page)
- Supports filtering by exam type
- Orders by creation date (most recent first)
- Includes creator and assigned doctor information

**Returns**:
- Paginated list of rejected submissions
- Includes pagination metadata (page, totalPages, totalItems, hasNext, hasPrevious)

#### 2. Approvals Controller
**File**: `backend/src/approvals/approvals.controller.ts`

**New Endpoint**: `GET /v1/approvals/rejected`
- Protected route (requires doctor role)
- Accepts query parameters: `examType`, `page`, `limit`
- Returns paginated list of rejected submissions

### Frontend

#### 1. Approvals API Service
**File**: `frontend/src/services/approvals.service.ts`

**New Method**: `getRejected()`
```typescript
getRejected: async (params?: ApprovalQueryParams): Promise<PaginatedResponse<MedicalSubmission>>
```

**Features**:
- Calls `GET /v1/approvals/rejected` endpoint
- Supports query parameters (examType, page, limit)
- Returns typed paginated response

#### 2. Rejected Submissions Component
**File**: `frontend/src/components/RejectedSubmissions.tsx` (NEW)

**Features**:
- Displays table of rejected submissions
- Shows: Patient name, NRIC, Exam type, Rejection reason, Submitted by, Date, Status
- View button to see full submission details
- Empty state when no rejections exist
- Loading state with spinner
- Error handling with toast notifications

**Table Columns**:
| Column | Data |
|--------|------|
| Patient Name | submission.patientName |
| NRIC/FIN | submission.patientNric |
| Exam Type | Formatted exam type (e.g., "Six-monthly Medical Exam for MDW") |
| Rejection Reason | submission.rejectedReason (truncated with tooltip) |
| Submitted By | submission.createdByName |
| Rejected Date | submission.createdDate (formatted) |
| Status | Badge showing "Rejected" in red |
| Actions | View button (links to ViewSubmission) |

#### 3. App Routes
**File**: `frontend/src/App.tsx`

**New Route**: `/rejected-submissions`
- Protected route (requires doctor or admin role)
- Renders RejectedSubmissions component

#### 4. Navigation
**File**: `frontend/src/components/DashboardLayout.tsx`

**New Nav Item**:
- Label: "Rejected Submissions"
- Icon: XCircle (red)
- Path: `/rejected-submissions`
- Roles: doctor, admin

## User Flow

### As a Doctor

1. **Reject a Submission**:
   - Navigate to Pending Approvals
   - Click on a submission
   - Click "Reject with Remarks" button
   - Enter rejection reason
   - Click "Reject Submission"
   - Submission is rejected and moved to rejected status

2. **View Rejected Submissions**:
   - Click "Rejected Submissions" in left navigation
   - See table of all rejected submissions
   - View rejection reasons
   - Click "View" to see full submission details

3. **Submission Details**:
   - Timeline shows "Rejected" event with reason
   - Full submission data is visible
   - Doctor action buttons are hidden (submission already processed)

## API Endpoints

### GET /v1/approvals/rejected
**Description**: Get paginated list of rejected submissions for current doctor

**Request**:
```
GET /v1/approvals/rejected?page=1&limit=50&examType=SIX_MONTHLY_MDW
```

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Items per page
- `examType` (optional) - Filter by exam type

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "abc-123",
      "examType": "SIX_MONTHLY_MDW",
      "patientName": "Jane Doe",
      "patientNric": "S1234567A",
      "patientDateOfBirth": "1990-01-15",
      "status": "rejected",
      "rejectedReason": "Incomplete medical history",
      "createdByName": "Nurse Amy",
      "createdDate": "2025-10-22T10:30:00Z",
      "assignedDoctorName": "Dr. Sarah Tan"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "totalItems": 5,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

**Authorization**:
- Requires JWT authentication
- User must have "doctor" role

## Database Query

The backend filters rejected submissions with:
```sql
SELECT * FROM medical_submissions
WHERE clinic_id = $clinicId
  AND status = 'rejected'
  AND (assigned_doctor_id = $doctorId OR approved_by_id = $doctorId)
ORDER BY created_date DESC
```

## UI/UX

### Empty State
```
[XCircle Icon]
No Rejected Submissions
You haven't rejected any submissions yet
```

### Table View
- Red badge for "Rejected" status
- Rejection reason shown with truncation and tooltip
- Clean, scannable table layout
- View action to see full details

### Navigation
- "Rejected Submissions" appears in sidebar
- XCircle icon for visual clarity
- Only visible to doctors and admins

## Testing Checklist

### As a Doctor
1. ✅ Log in as doctor (e.g., doctor@clinic.sg)
2. ✅ Navigate to Pending Approvals
3. ✅ Reject a submission with a reason
4. ✅ Navigate to "Rejected Submissions" from sidebar
5. ✅ Verify rejected submission appears in the list
6. ✅ Verify rejection reason is displayed
7. ✅ Click "View" to see full submission details
8. ✅ Verify timeline shows rejection event with reason

### Verify Filtering
1. ✅ Doctor should only see their own rejections
2. ✅ Rejections from other doctors should not appear
3. ✅ Admin should see all rejections in clinic (if role supports it)

### Edge Cases
1. ✅ Empty state when no rejections exist
2. ✅ Long rejection reasons are truncated with tooltip
3. ✅ Multiple rejections display correctly
4. ✅ Pagination works if more than 50 rejections

## Related Files

**Backend**:
- `backend/src/approvals/approvals.service.ts` - Business logic
- `backend/src/approvals/approvals.controller.ts` - API endpoint
- `backend/src/approvals/dto/approval.dto.ts` - DTOs (existing)

**Frontend**:
- `frontend/src/components/RejectedSubmissions.tsx` - New component
- `frontend/src/services/approvals.service.ts` - API service
- `frontend/src/App.tsx` - Route configuration
- `frontend/src/components/DashboardLayout.tsx` - Navigation

## Status
✅ **Completed** - Rejected submissions list is fully functional with backend API, frontend component, routing, and navigation

## Future Enhancements
- Add ability to filter by date range
- Export rejected submissions to CSV
- Show rejection statistics on dashboard
- Allow nurses to see their rejected submissions
- Add ability to resubmit rejected submissions
