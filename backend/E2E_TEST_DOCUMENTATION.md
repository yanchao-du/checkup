# E2E Test Documentation

## Overview
This document describes the End-to-End (E2E) test suite for the CheckUp Medical Portal backend API. The tests verify all API endpoints work correctly with proper authentication, authorization, and data validation.

## Test Framework
- **Test Runner**: Jest
- **HTTP Client**: Supertest
- **Test Files**: Located in `backend/test/`
- **Configuration**: `backend/test/jest-e2e.json`

## Running Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:e2e -- --watch

# Run specific test file
npm run test:e2e -- auth.e2e-spec.ts
```

## Test Coverage

### Authentication Tests (`auth.e2e-spec.ts`)
**15 test cases covering:**
- ✅ Login with valid credentials (Doctor, Nurse, Admin)
- ✅ Login with invalid credentials
- ✅ Login with missing credentials (validation error)
- ✅ Access to `/auth/me` endpoint with valid token
- ✅ Access to `/auth/me` without authentication
- ✅ Logout functionality
- ✅ Token validation

**Key Test Scenarios:**
```typescript
// Login success
POST /v1/auth/login
{ email: "doctor@clinic.sg", password: "password" }
→ Returns JWT token and user details

// Get current user
GET /v1/auth/me
Authorization: Bearer <token>
→ Returns current user information

// Logout
POST /v1/auth/logout
Authorization: Bearer <token>
→ Invalidates the session
```

### Submissions Tests (`submissions.e2e-spec.ts`)
**20+ test cases covering:**
- ✅ GET submissions with role-based filtering (Doctor, Nurse, Admin)
- ✅ GET submissions with status filter
- ✅ GET submissions with exam type filter
- ✅ GET submissions with pagination
- ✅ POST create submission as Doctor (direct submit)
- ✅ POST create submission as Nurse (route for approval)
- ✅ POST validation for missing required fields
- ✅ GET submission by ID
- ✅ GET submission without authentication
- ✅ PUT update submission

**Key Test Scenarios:**
```typescript
// Create submission (Doctor - direct submit)
POST /v1/submissions
{
  examType: "SIX_MONTHLY_MDW",
  patientName: "John Doe",
  patientNric: "S1234567A",
  patientDateOfBirth: "1990-01-01",
  formData: { /* exam-specific data */ }
}
→ Status: "submitted" (auto-approved)

// Create submission (Nurse - route for approval)
POST /v1/submissions
{ ...same as above, routeForApproval: true }
→ Status: "pending_approval"

// Get submissions with filters
GET /v1/submissions?status=submitted&examType=WORK_PERMIT&page=1&limit=20
→ Returns paginated submissions

// Update submission
PUT /v1/submissions/:id
{ patientName: "Updated Name" }
→ Returns updated submission
```

### Approvals Tests (`approvals.e2e-spec.ts`)
**15 test cases covering:**
- ✅ GET pending approvals (Doctors only)
- ✅ GET approvals with role-based access control
- ✅ GET approvals without authentication
- ✅ GET approvals with exam type filter
- ✅ GET approvals with pagination
- ✅ POST approve submission with notes
- ✅ POST approve submission without notes
- ✅ POST approve with role validation (nurses forbidden)
- ✅ POST approve without authentication
- ✅ POST approve non-existent submission (404)
- ✅ POST approve already approved submission (403)
- ✅ POST reject submission with reason
- ✅ POST reject without reason (validation error)
- ✅ POST reject with role validation
- ✅ POST reject already submitted submission

**Key Test Scenarios:**
```typescript
// Get pending approvals (Doctors only)
GET /v1/approvals?examType=WORK_PERMIT&page=1&limit=5
Authorization: Bearer <doctor-token>
→ Returns pending submissions for the clinic

// Approve submission
POST /v1/approvals/:id/approve
{ notes: "Reviewed and approved" }
Authorization: Bearer <doctor-token>
→ Status changes: pending_approval → submitted

// Reject submission
POST /v1/approvals/:id/reject
{ reason: "Incomplete medical history" }
Authorization: Bearer <doctor-token>
→ Status changes: pending_approval → rejected
```

### Application Tests (`app.e2e-spec.ts`)
**Basic health check:**
- ✅ GET / returns "Hello World!"

## Test Data
The E2E tests use the following demo accounts (seeded in the database):

| Email | Password | Role | Clinic ID |
|-------|----------|------|-----------|
| doctor@clinic.sg | password | Doctor | 550e8400-e29b-41d4-a716-446655440000 |
| nurse@clinic.sg | password | Nurse | 550e8400-e29b-41d4-a716-446655440000 |
| admin@clinic.sg | password | Admin | 550e8400-e29b-41d4-a716-446655440000 |

## Validation & Error Handling

### Input Validation
All DTOs use `class-validator` decorators to ensure:
- Required fields are present
- Email format is valid
- Date strings are ISO 8601 format
- Integers are properly typed (pagination params)

**Validation Errors Return:**
- Status Code: `400 Bad Request`
- Body: Array of validation errors with field names and constraints

### Authentication Errors
- Status Code: `401 Unauthorized`
- Triggered when JWT token is missing or invalid

### Authorization Errors
- Status Code: `403 Forbidden`
- Triggered when user lacks required role for an endpoint
- Examples:
  - Nurse trying to approve submissions
  - Doctor trying to approve already submitted items

### Not Found Errors
- Status Code: `404 Not Found`
- Triggered when resource doesn't exist
- Examples:
  - Invalid submission ID
  - Deleted or non-existent user

## Key Features Tested

### 1. Role-Based Access Control (RBAC)
- Doctors can: Create submissions (auto-approved), approve/reject pending submissions
- Nurses can: Create submissions (pending approval), view own submissions
- Admins can: View all submissions for their clinic

### 2. Data Isolation
- Users can only access data from their own clinic
- Users can only see submissions they created or approved (except admins)

### 3. Workflow Validation
- Submissions can't be approved twice
- Rejected submissions can't be approved
- Pending submissions must include rejection reason

### 4. Pagination
- Default: page=1, limit=20
- Parameters are properly converted from query strings to integers
- Pagination metadata includes: page, limit, totalPages, totalItems, hasNext, hasPrevious

### 5. Filtering
- By status: draft, pending_approval, submitted, rejected
- By exam type: SIX_MONTHLY_MDW, WORK_PERMIT, AGED_DRIVERS
- By date range: fromDate, toDate
- By patient details: patientName (partial match), patientNric (exact match)

## Best Practices Implemented

1. **Test Isolation**: Each test creates its own data to avoid conflicts
2. **BeforeAll Setup**: Authentication tokens obtained once per suite
3. **AfterAll Cleanup**: App properly closed after all tests
4. **Descriptive Names**: Test names clearly state what they verify
5. **HTTP Status Checks**: Always verify correct status codes
6. **Response Body Validation**: Check returned data structure and content
7. **Error Case Coverage**: Test both success and failure scenarios
8. **Role-Based Testing**: Verify permissions for all user roles

## Troubleshooting

### Tests Failing Due to Database State
```bash
# Reset the database and reseed
cd backend
npx prisma migrate reset --force
npm run seed
npm run test:e2e
```

### Port Already in Use
```bash
# Backend should be stopped when running E2E tests
# Tests start their own instance of the app
lsof -ti:3344 | xargs kill -9
npm run test:e2e
```

### Validation Pipe Not Working
Ensure `main.ts` has:
```typescript
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

## Test Results
```
Test Suites: 4 passed, 4 total
Tests:       48 passed, 48 total
Snapshots:   0 total
Time:        ~1.7s
```

## Future Enhancements
- [ ] Add tests for draft submissions module
- [ ] Add tests for user management endpoints
- [ ] Add tests for dashboard statistics
- [ ] Add tests for audit log queries
- [ ] Add performance tests for large datasets
- [ ] Add tests for concurrent approval requests
- [ ] Add integration tests with actual PostgreSQL database
- [ ] Add contract tests using Pact or similar
