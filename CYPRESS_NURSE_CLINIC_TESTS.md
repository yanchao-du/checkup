# Nurse-Clinic Assignment Cypress E2E Tests

## Overview

Comprehensive end-to-end tests for the nurse-clinic assignment feature using Cypress.

## Test File

**Location**: `frontend/cypress/e2e/nurse-clinic-assignment.cy.ts`

**Test Suites**: 7
**Total Tests**: 30+

## Test Coverage

### 1. Admin Access Tests (15 tests)

#### Navigation & Display
- ✅ Should navigate to Nurse Assignments tab
- ✅ Should display statistics cards
- ✅ Should display nurses list
- ✅ Should select a nurse and display their clinics
- ✅ Should display clinic count next to nurse name

#### Nurse Creation & Assignment (14 tests)
- ✅ Should show newly created nurse in the list
- ✅ Should show nurse has 1 clinic (auto-assigned)
- ✅ Should open assign clinic dialog
- ✅ Should assign nurse to a second clinic
- ✅ Should prevent duplicate clinic assignment
- ✅ Should set a clinic as primary
- ✅ Should remove nurse from a clinic
- ✅ Should prevent removing the last clinic
- ✅ Should show empty state when nurse has no assigned clinics
- ✅ Should show multi-clinic count in statistics
- ✅ Should display primary clinic with star icon
- ✅ Should show clinic details (name, HCI, address)
- ✅ Should close assign dialog on cancel
- ✅ Should handle assign clinic with primary flag

### 2. Search & Filter Tests (1 test)
- ✅ Should search nurses by name or email

### 3. Responsive Design Tests (2 tests)
- ✅ Should display correctly on mobile viewport
- ✅ Should display correctly on tablet viewport

### 4. Loading States Tests (1 test)
- ✅ Should show loading indicator when fetching data

### 5. Non-Admin Access Tests (3 tests)
- ✅ Should not show Nurse Assignments tab for doctors
- ✅ Should not show Nurse Assignments tab for nurses
- ✅ Should return 403 when non-admin tries to access nurse-clinic endpoints

### 6. Error Handling Tests (2 tests)
- ✅ Should show error toast on network failure
- ✅ Should handle empty nurses list gracefully

## Test Data Strategy

### Test Fixtures
```typescript
testNurseEmail: `test-nurse-${Date.now()}@clinic.sg`
testClinicName: `Test Clinic ${Date.now()}`
```

### Seeded Data Used
- `admin@clinic.sg` - Admin user
- `doctor@clinic.sg` - Doctor user  
- `nurse@clinic.sg` - Nurse user
- Existing clinics from seed data

### Dynamic Test Data
- Creates new test nurse via User Management
- Creates new test clinic via Clinic Management
- Assigns/removes clinic relationships
- Updates primary clinic designation

## Custom Commands Used

```typescript
cy.clearAppData()          // Clear localStorage
cy.login(email, password)  // Login helper
```

## Test Scenarios

### 1. Basic Navigation Flow
```
Login as admin → Settings → Nurse Assignments tab → View nurses list
```

### 2. Assign Nurse to Clinic
```
Select nurse → Click Assign → Select clinic → Click Assign Clinic → Verify assignment
```

### 3. Set Primary Clinic
```
Select nurse → Find non-primary clinic → Click star icon → Verify primary updated
```

### 4. Remove Clinic Assignment
```
Select nurse → Find non-primary clinic → Click X → Confirm → Verify removal
```

### 5. Prevent Last Clinic Removal
```
Select nurse with 1 clinic → Click X → Verify error message → Clinic still exists
```

## Key Assertions

### UI Elements
- ✅ Tab navigation exists
- ✅ Statistics cards display correct data
- ✅ Nurses list is populated
- ✅ Clinic cards show details
- ✅ Primary badge displays correctly
- ✅ Action buttons are functional

### Business Logic
- ✅ Auto-assignment of primary clinic on nurse creation
- ✅ Cannot assign duplicate clinics
- ✅ Cannot remove last clinic
- ✅ Only one primary clinic per nurse
- ✅ Clinic count updates correctly

### API Integration
- ✅ Success responses handled
- ✅ Error responses display toast
- ✅ Authorization enforced (403 for non-admin)
- ✅ Data persistence verified

### Accessibility
- ✅ Dialog roles correct
- ✅ Buttons have descriptive text
- ✅ Forms are accessible
- ✅ Loading states indicated

## Running Tests

### Run All Nurse-Clinic Tests
```bash
cd frontend
npx cypress run --spec "cypress/e2e/nurse-clinic-assignment.cy.ts"
```

### Run in Interactive Mode
```bash
cd frontend
npx cypress open
# Then select nurse-clinic-assignment.cy.ts
```

### Run Specific Test Suite
```bash
npx cypress run --spec "cypress/e2e/nurse-clinic-assignment.cy.ts" --grep "Admin Access"
```

### Run with Video Recording
```bash
npx cypress run --spec "cypress/e2e/nurse-clinic-assignment.cy.ts" --video
```

## Test Configuration

### Timeouts
```typescript
cy.wait(300)   // Dialog animation
cy.wait(500)   // Component render
cy.wait(1000)  // API response
```

### Viewports Tested
- Desktop: 1280x720 (default)
- Mobile: iPhone X (375x812)
- Tablet: iPad 2 (768x1024)

## Data Cleanup

Tests create temporary data that persists in the database:
- Test nurses: `test-nurse-{timestamp}@clinic.sg`
- Test clinics: `Test Clinic {timestamp}`

**Note**: Consider manual cleanup or database reset between test runs.

## Best Practices

### 1. Wait Strategies
```typescript
// Wait for dialogs to be fully interactive
cy.get('[role="dialog"]').should('be.visible')
cy.wait(300)

// Wait for API responses
cy.contains('button', 'Assign Clinic').click()
cy.wait(1000)
```

### 2. Element Selection
```typescript
// Prefer data-testid
cy.get('[data-testid="clinic-card"]')

// Fallback to text content
cy.contains('button', 'Assign')

// Use specific selectors
cy.get('select[id="clinic"]')
```

### 3. Assertions
```typescript
// Visibility
cy.contains('Primary clinic updated').should('be.visible')

// Count
cy.get('[data-testid="clinic-card"]').should('have.length', 2)

// Text content
cy.contains('2 clinics').should('be.visible')
```

### 4. Error Handling
```typescript
// Optional elements
cy.get('body').then($body => {
  if ($body.find('[data-testid="search"]').length > 0) {
    cy.get('[data-testid="search"]').type('nurse')
  }
})
```

## Known Issues & Solutions

### Issue 1: Dialog Animation Timing
**Problem**: Clicking buttons before dialog is fully rendered
**Solution**: Add `cy.wait(300)` after dialog appears

### Issue 2: Network Request Timing
**Problem**: Tests fail if API is slow
**Solution**: Increase wait time or use `cy.intercept()` with aliases

### Issue 3: Test Data Conflicts
**Problem**: Re-running tests with same email/name
**Solution**: Use timestamps in test data names

### Issue 4: State Persistence
**Problem**: Previous test state affects current test
**Solution**: Always use `cy.clearAppData()` in beforeEach

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          start: npm run dev
          wait-on: 'http://localhost:5173'
          spec: cypress/e2e/nurse-clinic-assignment.cy.ts
```

## Test Maintainability

### Update Checklist
When UI changes:
- [ ] Update selectors if data-testid changed
- [ ] Update text content assertions
- [ ] Update wait times if needed
- [ ] Update viewport tests if responsive design changed

When API changes:
- [ ] Update request/response assertions
- [ ] Update error handling tests
- [ ] Update authorization tests

When business rules change:
- [ ] Update validation tests
- [ ] Update error message assertions
- [ ] Add new test cases

## Debugging Tips

### 1. Screenshot on Failure
Cypress automatically takes screenshots on test failure:
```
frontend/cypress/screenshots/nurse-clinic-assignment.cy.ts/
```

### 2. Video Recording
Enable video in `cypress.config.ts`:
```typescript
video: true
```

### 3. Interactive Debugging
```typescript
cy.pause()  // Pause execution
cy.debug()  // Open debugger
```

### 4. Console Logs
```typescript
cy.log('Assigning nurse to clinic')
cy.get('[data-testid="clinic-card"]').then($cards => {
  console.log('Clinic count:', $cards.length)
})
```

## Performance Metrics

### Expected Test Duration
- Single test: 2-5 seconds
- Full suite: 2-3 minutes
- With video: 3-4 minutes

### Optimization Tips
1. Minimize `cy.wait()` usage
2. Use `cy.intercept()` for predictable API responses
3. Group related tests in describe blocks
4. Reuse login state where possible

## Success Criteria

Tests pass when:
- ✅ All assertions pass
- ✅ No console errors
- ✅ Screenshots show expected UI state
- ✅ Video playback shows correct flow
- ✅ Test duration within acceptable range

## Future Enhancements

- [ ] Add visual regression tests
- [ ] Add performance monitoring
- [ ] Add accessibility audit tests
- [ ] Add test for bulk operations
- [ ] Add test for concurrent user actions
- [ ] Add test for data export/import
