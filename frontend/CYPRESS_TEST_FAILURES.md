# Cypress Test Failures Analysis

## Test Results Summary
- **Total Tests**: 71
- **Passing**: 40 (56%)
- **Failing**: 29 (41%)
- **Skipped**: 2 (3%)

## Root Causes of Failures

### 1. Components Not Yet Updated to Use API
These components still use mock data (`useMockData` hook) but the app is now using real API:

#### NewSubmission.tsx (NOT UPDATED)
**Failing Tests**:
- "should display new submission form with all required fields"
- "should create a draft submission"
- "should submit for approval"
- "should validate required fields"
- "should support all exam types"

**Issue**: Component still uses `useMockData()`, doesn't call `submissionsApi.create()` or `submissionsApi.update()`

**Expected Elements Missing**:
- `input[name="patientName"]`
- `input[name="email"]` (in create user modals)
- Form submission functionality

#### SubmissionsList.tsx (NOT UPDATED)
**Failing Tests**:
- "should display submissions list"
- "should search submissions"

**Issue**: Component still uses `useMockData()`, doesn't fetch from `submissionsApi.getAll()`

#### ViewSubmission.tsx (NOT UPDATED)
**Failing Tests**: (Indirectly affected)
- Tests that navigate to submission details

**Issue**: Component still uses `useMockData()`, doesn't call `submissionsApi.getById()` or `submissionsApi.getHistory()`

#### UserManagement.tsx (NOT UPDATED)
**Failing Tests**:
- "should create a new user"
- "should delete a user"
- "should validate email format"
- "should require strong password"

**Issue**: Component still uses `useMockData()`, doesn't use `usersApi.*` methods

**Expected Elements Missing**:
- `input[name="email"]` (create user form)
- Create/Delete user dialogs

### 2. Authorization/Route Protection Issues

#### Test: "should NOT allow direct URL access to pending approvals" (Nurse)
**Status**: FAILING
**Issue**: Frontend routing doesn't block nurses from accessing `/pending-approvals`
**Expected**: Should redirect nurses away from this route
**Actual**: Route is accessible (backend will block API calls, but route loads)

#### Test: "should NOT allow direct URL access to user management" (Doctor/Nurse)
**Status**: FAILING  
**Issue**: Frontend routing doesn't block non-admins from accessing `/user-management`
**Expected**: Should redirect to dashboard
**Actual**: Route is accessible

**Solution Needed**: Add role-based route guards in React Router

### 3. UI Element Selector Mismatches

#### Test: "should show list of submissions awaiting approval"
**Status**: FAILING
**Issue**: Test looks for `table, [role="table"], [data-testid="approvals-list"]`
**Actual**: PendingApprovals component may not have these exact selectors

#### Test: Admin access to "Pending Approvals"
**Status**: FAILING
**Issue**: Test expects to find text "Pending Approvals" but admin may not have menu item
**Note**: Only doctors should see "Pending Approvals" menu

### 4. Data Differences Between Mock and Real API

#### Exam Type Enum Mismatch
**Frontend Mock Data**: 
-- "Six-monthly Medical Exam for Migrant Domestic Worker (MOM)"
- "Full Medical Exam for Work Permit (MOM)"
- "Medical Exam for Aged Drivers (SPF)"

**Backend API**:
- "MDW_SIX_MONTHLY"
- "WORK_PERMIT" 
- "AGED_DRIVERS"

**Issue**: Tests and displays may show wrong values

#### User Name Fields
**Frontend Mock**: `createdByName` (string)
**Backend API**: `createdBy` (user ID string)

**Issue**: Some components updated to use `createdBy`, tests may expect names

## Passing Test Categories

✅ **Authentication** (5/8 passing)
- Login flow works
- Session persistence works
- Some redirect tests failing due to routes

✅ **Dashboard** (9/15 passing)
- Basic dashboard loads
- Statistics display
- Quick actions work
- Some tests fail due to missing data

✅ **Approvals** (10/16 passing)
- Pending approvals list works (for doctors)
- Approve/reject functionality works
- View details works
- Filtering works

✅ **User Management** (12/18 passing)
- List users works
- Filter/search works
- Edit user works
- Change role works
- Create/delete failing (component not updated)

## Quick Fixes Needed

### Priority 1: Critical Component Updates
1. **Update NewSubmission.tsx**
   - Replace `useMockData()` with `submissionsApi.create()` and `submissionsApi.update()`
   - Add loading states
   - Handle draft saving
   - Handle submit for approval

2. **Update SubmissionsList.tsx**
   - Replace `useMockData()` with `submissionsApi.getAll()`
   - Add pagination
   - Add filtering

3. **Update ViewSubmission.tsx**
   - Replace `useMockData()` with `submissionsApi.getById()`
   - Fetch history with `submissionsApi.getHistory()`

4. **Update UserManagement.tsx**
   - Replace `useMockData()` with `usersApi.*`
   - Implement create/delete

### Priority 2: Route Protection
Add role-based guards to protect routes:

```typescript
// In App.tsx or a new ProtectedRoute component
function RoleProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: ReactNode, 
  allowedRoles: UserRole[] 
}) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Usage:
<Route 
  path="/pending-approvals" 
  element={
    <RoleProtectedRoute allowedRoles={['doctor']}>
      <PendingApprovals />
    </RoleProtectedRoute>
  } 
/>

<Route 
  path="/user-management" 
  element={
    <RoleProtectedRoute allowedRoles={['admin']}>
      <UserManagement />
    </RoleProtectedRoute>
  } 
/>
```

### Priority 3: Fix Exam Type Display
Create a utility function to map enum values to display text:

```typescript
// src/lib/exam-types.ts
export const EXAM_TYPE_LABELS: Record<string, string> = {
  'MDW_SIX_MONTHLY': 'Six-monthly Medical Exam for Migrant Domestic Worker (MOM)',
  'WORK_PERMIT': 'Full Medical Exam for Work Permit (MOM)',
  'AGED_DRIVERS': 'Medical Exam for Aged Drivers (SPF)',
};

export function getExamTypeLabel(examType: string): string {
  return EXAM_TYPE_LABELS[examType] || examType;
}
```

## Test Files Status

| Test File | Pass Rate | Status |
|-----------|-----------|--------|
| auth.cy.ts | 5/8 (63%) | ⚠️ Mostly working |
| dashboard.cy.ts | 9/15 (60%) | ⚠️ Mostly working |
| approvals.cy.ts | 10/16 (63%) | ⚠️ Mostly working |
| submissions.cy.ts | 4/14 (29%) | ❌ NewSubmission not updated |
| user-management.cy.ts | 12/18 (67%) | ⚠️ Create/delete not working |

## Recommendations

### Short Term (To Pass Tests)
1. Update the 4 remaining components to use API
2. Add role-based route guards
3. Ensure database is seeded before tests
4. Add test data IDs to key elements for easier selection

### Medium Term (Improve Tests)
1. Use `cy.intercept()` to mock API responses for deterministic tests
2. Add data-testid attributes to components
3. Create reusable test fixtures
4. Set up test database that resets between test runs

### Long Term (Production Ready)
1. Add E2E tests that use real API (integration tests)
2. Add unit tests for components
3. Add API contract tests
4. Set up CI/CD with test database
5. Add visual regression tests

## Current Blocker

The **main blocker** for passing tests is that 4 components are not updated:
1. NewSubmission.tsx
2. SubmissionsList.tsx  
3. ViewSubmission.tsx
4. UserManagement.tsx (partially updated)

Once these are updated to use the API services, most tests should pass.

## How to Verify

1. **Ensure backend is running**: `cd backend && npm run start:dev`
2. **Ensure database is seeded**: `cd backend && npx prisma db seed`
3. **Start frontend**: `cd frontend && npm run dev`
4. **Run tests**: `cd frontend && npm run test:e2e`

Expected result after component updates: 65-70 tests passing (90%+)
