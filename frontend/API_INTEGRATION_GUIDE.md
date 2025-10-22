# Frontend API Integration Guide

## Overview
This document describes the API service layer that connects the React frontend to the NestJS backend.

## Architecture

### API Client (`frontend/src/lib/api-client.ts`)
- **Base Configuration**: Uses `VITE_API_URL` environment variable (default: `http://localhost:3344/v1`)
- **Authentication**: Automatically includes JWT token from localStorage in `Authorization` header
- **Error Handling**: 
  - Redirects to `/login` on 401 Unauthorized
  - Returns structured error responses with message and status code
- **Methods**: GET, POST, PUT, DELETE with TypeScript generic support

### Type Definitions (`frontend/src/types/api.ts`)
Comprehensive TypeScript types matching backend DTOs:
- **User Types**: `User`, `UserRole`, `CreateUserRequest`, `UpdateUserRequest`
- **Auth Types**: `LoginRequest`, `LoginResponse`
- **Submission Types**: `MedicalSubmission`, `ExamType`, `SubmissionStatus`, `CreateSubmissionRequest`, `UpdateSubmissionRequest`, `SubmissionQueryParams`
- **Approval Types**: `ApprovalQueryParams`, `ApproveRequest`, `RejectRequest`
- **Utility Types**: `PaginatedResponse<T>`, `AuditLog`

## API Services

### 1. Authentication Service (`frontend/src/services/auth.service.ts`)

```typescript
import { authApi } from './services';

// Login
const { token, user } = await authApi.login({ email, password });

// Get current user
const user = await authApi.getMe();

// Check if authenticated
const isLoggedIn = authApi.isAuthenticated();

// Logout
authApi.logout();
```

**Features**:
- Token storage in localStorage
- User object persistence in localStorage
- Automatic token cleanup on logout

### 2. Submissions Service (`frontend/src/services/submissions.service.ts`)

```typescript
import { submissionsApi } from './services';

// Get all submissions with pagination and filters
const response = await submissionsApi.getAll({
  status: 'draft',
  examType: 'MDW_SIX_MONTHLY',
  patientName: 'John',
  fromDate: '2024-01-01',
  toDate: '2024-12-31',
  page: 1,
  limit: 20,
});
// Returns: PaginatedResponse<MedicalSubmission>

// Get single submission
const submission = await submissionsApi.getById(id);

// Create new submission
const newSubmission = await submissionsApi.create({
  examType: 'MDW_SIX_MONTHLY',
  patientName: 'John Doe',
  patientNric: 'S1234567A',
  patientDateOfBirth: '1990-01-01',
  formData: { /* exam specific data */ },
  routeForApproval: false, // true for nurse to send to doctor
});

// Update submission (draft only)
const updated = await submissionsApi.update(id, {
  patientName: 'John Smith',
  formData: { /* updated data */ },
});

// Get user's drafts
const drafts = await submissionsApi.getDrafts({ page: 1, limit: 10 });

// Get submission history (audit logs)
const history = await submissionsApi.getHistory(id);

// Submit draft for approval
const submitted = await submissionsApi.submitForApproval(id);
```

### 3. Approvals Service (`frontend/src/services/approvals.service.ts`)

```typescript
import { approvalsApi } from './services';

// Get pending approvals (Doctor only)
const pending = await approvalsApi.getPending({
  examType: 'WORK_PERMIT',
  page: 1,
  limit: 20,
});
// Returns: PaginatedResponse<MedicalSubmission>

// Get all approvals
const all = await approvalsApi.getAll({ page: 1, limit: 20 });

// Approve submission
const approved = await approvalsApi.approve(id, {
  notes: 'Looks good',
});

// Reject submission
const rejected = await approvalsApi.reject(id, {
  reason: 'Missing patient signature',
});

// Get specific approval
const approval = await approvalsApi.getById(id);
```

### 4. Users Service (`frontend/src/services/users.service.ts`)

```typescript
import { usersApi } from './services';

// Get all users (Admin only)
const users = await usersApi.getAll(1, 20);

// Get user by ID
const user = await usersApi.getById(id);

// Create user (Admin only)
const newUser = await usersApi.create({
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'SecurePass123!',
  role: 'nurse',
  clinicId: 'clinic-uuid',
});

// Update user (Admin only)
const updated = await usersApi.update(id, {
  name: 'Jane Smith',
  role: 'doctor',
});

// Delete user (Admin only)
await usersApi.delete(id);

// Change user role (Admin only)
const updatedUser = await usersApi.changeRole(id, 'admin');

// Change user status (Admin only)
const updatedUser = await usersApi.changeStatus(id, 'inactive');
```

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3344/v1
```

**Important**: 
- Environment variables in Vite must be prefixed with `VITE_`
- TypeScript declaration is in `frontend/src/vite-env.d.ts`
- Restart dev server after changing `.env` file

## Error Handling

All API calls can throw errors. Recommended pattern:

```typescript
import { submissionsApi } from './services';

try {
  const submission = await submissionsApi.getById(id);
  // Handle success
} catch (error: any) {
  console.error('API Error:', error.message);
  // Show user-friendly error message
  toast.error(error.message || 'An error occurred');
}
```

## Authorization

The API enforces role-based access control:

### Nurses
- **Create**: Drafts and submissions
- **Read**: Own submissions and drafts
- **Update**: Own drafts only
- **Delete**: None

### Doctors
- **Create**: Submissions (can bypass approval)
- **Read**: All submissions in their clinic
- **Update**: Any draft in their clinic
- **Approve/Reject**: Pending submissions

### Admins
- **Full access** to all resources
- **User management**: Create, update, delete users

## Common Workflows

### Nurse Creating a Submission
```typescript
// 1. Create draft
const draft = await submissionsApi.create({
  examType: 'MDW_SIX_MONTHLY',
  patientName: 'John Doe',
  patientNric: 'S1234567A',
  patientDateOfBirth: '1990-01-01',
  formData: examData,
  routeForApproval: false,
});

// 2. Save progress multiple times
await submissionsApi.update(draft.id, { formData: updatedData });

// 3. Submit for approval
await submissionsApi.submitForApproval(draft.id);
```

### Doctor Approving Submission
```typescript
// 1. Get pending approvals
const { data: pending } = await approvalsApi.getPending();

// 2. Review submission
const submission = await submissionsApi.getById(pending[0].id);

// 3. Approve or reject
if (isValid) {
  await approvalsApi.approve(submission.id, { 
    notes: 'All checks passed' 
  });
} else {
  await approvalsApi.reject(submission.id, { 
    reason: 'Missing required field X' 
  });
}
```

### Admin Managing Users
```typescript
// 1. Get all users
const { data: users } = await usersApi.getAll();

// 2. Create new user
const newUser = await usersApi.create({
  name: 'New Nurse',
  email: 'nurse@clinic.com',
  password: 'TempPass123!',
  role: 'nurse',
  clinicId: clinic.id,
});

// 3. Update user role
await usersApi.changeRole(newUser.id, 'doctor');

// 4. Deactivate user
await usersApi.changeStatus(newUser.id, 'inactive');
```

## Next Steps

### Components to Update
1. **LoginPage.tsx**: Replace mock login with `authApi.login()`
2. **Dashboard.tsx**: Fetch real data using `submissionsApi.getAll()`
3. **DraftsList.tsx**: Use `submissionsApi.getDrafts()`
4. **NewSubmission.tsx**: Use `submissionsApi.create()` and `submissionsApi.update()`
5. **PendingApprovals.tsx**: Use `approvalsApi.getPending()`
6. **ViewSubmission.tsx**: Use `submissionsApi.getById()` and `submissionsApi.getHistory()`
7. **UserManagement.tsx**: Use `usersApi` for CRUD operations
8. **AuthContext.tsx**: Integrate `authApi` for login/logout/session management

### Additional Enhancements
- Add loading states (React Query or SWR recommended)
- Add optimistic updates for better UX
- Implement error boundaries
- Add toast notifications for API errors
- Add retry logic for failed requests
- Implement request cancellation for navigation changes

## Testing

### Manual Testing
1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login with test credentials
4. Test each workflow in the UI

### Automated Testing
Consider adding integration tests:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { submissionsApi } from './services';

test('fetches and displays submissions', async () => {
  const mockData = { data: [...], pagination: {...} };
  jest.spyOn(submissionsApi, 'getAll').mockResolvedValue(mockData);
  
  render(<SubmissionsList />);
  
  await waitFor(() => {
    expect(screen.getByText(mockData.data[0].patientName)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### 401 Unauthorized
- Check if token exists in localStorage
- Verify token hasn't expired
- Ensure backend is running and accessible

### CORS Errors
- Backend should have CORS enabled for `http://localhost:6688`
- Check `main.ts` in backend for `app.enableCors()`

### Type Errors
- Ensure frontend types match backend DTOs
- Run TypeScript compiler: `npm run type-check`
- Check that all required fields are provided

### Network Errors
- Verify backend is running on port 3344
- Check `VITE_API_URL` is set correctly
- Inspect browser Network tab for request details
