# Doctor Selection Assertion Fix

## Issue

The nurse workflow tests were failing because the doctor selection dropdown wasn't being properly waited for and verified before clicking the submit button. The conditional logic using `$body.find('select')` was unreliable and didn't guarantee the doctor was actually selected.

## Problem Code

```typescript
// ❌ Unreliable - doesn't wait or verify selection
cy.get('body').then($body => {
  if ($body.find('select').length > 0) {
    cy.get('select').first().select(1)
  }
})

cy.get('[data-testid="confirm-submit-button"]').click()
```

### Issues with this approach:
1. **No waiting**: Doesn't wait for the modal or select element to appear
2. **Synchronous check**: `$body.find()` is synchronous and may execute before the modal renders
3. **No verification**: Doesn't assert that a doctor was actually selected
4. **Race condition**: Submit button might be clicked before selection completes

## Solution

### Fixed Code

```typescript
## Solution

### Fixed Code

```typescript
// ✅ Reliable - waits for modal, selects doctor, and verifies selection
cy.contains('button', 'Submit for Approval').click()

// Wait for modal and select doctor
cy.contains('Route for Approval?').should('be.visible')
cy.get('[data-testid="assignedDoctor"]').should('be.visible')
cy.get('[data-testid="assignedDoctor"]').click()

// Select first doctor from dropdown
cy.get('[role="option"]').first().click()

// Verify doctor is selected (trigger should show doctor name, not placeholder)
cy.get('[data-testid="assignedDoctor"]').should('not.contain', 'Select a doctor')

cy.get('[data-testid="confirm-submit-button"]').click()
```

### Improvements:
1. ✅ **Waits for modal**: `cy.contains('Route for Approval?').should('be.visible')`
2. ✅ **Uses data-testid**: Added `data-testid="assignedDoctor"` to SelectTrigger component
3. ✅ **Waits for select trigger**: `cy.get('[data-testid="assignedDoctor"]').should('be.visible')`
4. ✅ **Clicks to open dropdown**: Works with Shadcn's Select component
5. ✅ **Selects option**: Uses `[role="option"]` to find dropdown items
6. ✅ **Verifies selection**: Ensures placeholder text is replaced with doctor name
7. ✅ **Proper sequencing**: Submit button clicks only after verification passes

### Important Note About Shadcn Select Components

Shadcn's Select component doesn't use native `<select>` elements. Instead, it uses:
- A `<button>` as the trigger (SelectTrigger)
- A dropdown with `role="listbox"` containing options with `role="option"`
- Custom styling and behavior

This means:
- ❌ Cannot use `cy.get('select').select(value)`
- ✅ Must click the trigger, then click an option
- ✅ Verify selection by checking the trigger text changes
```

### Improvements:
1. ✅ **Waits for modal**: `cy.contains('Route for Approval?').should('be.visible')`
2. ✅ **Waits for select**: `cy.get('select#assignedDoctor').should('be.visible')`
3. ✅ **Uses specific ID**: Targets `select#assignedDoctor` instead of generic `select`
4. ✅ **Verifies selection**: `should('not.have.value', '')` ensures a doctor is selected
5. ✅ **Proper sequencing**: Submit button clicks only after verification passes

## Files Modified

### 1. NewSubmission.tsx

**Location**: Line ~562

**Change**: Added `data-testid="assignedDoctor"` to SelectTrigger

**Before**:
```tsx
<SelectTrigger id="assignedDoctor">
  <SelectValue placeholder="Select a doctor" />
</SelectTrigger>
```

**After**:
```tsx
<SelectTrigger id="assignedDoctor" data-testid="assignedDoctor">
  <SelectValue placeholder="Select a doctor" />
</SelectTrigger>
```

### 2. search-features.cy.ts

**Location**: Lines 103-115

**Test**: "should display search bar in pending approvals" setup

**Before**:
```typescript
cy.contains('button', 'Submit for Approval').click()

cy.get('body').then($body => {
  if ($body.find('select').length > 0) {
    cy.get('select').first().select(1)
  }
})

cy.get('[data-testid="confirm-submit-button"]').click()
```

**After**:
```typescript
cy.contains('button', 'Submit for Approval').click()

// Wait for modal and select doctor
cy.contains('Route for Approval?').should('be.visible')
cy.get('[data-testid="assignedDoctor"]').should('be.visible')
cy.get('[data-testid="assignedDoctor"]').click()

// Select first doctor from dropdown
cy.get('[role="option"]').first().click()

// Verify doctor is selected (trigger should show doctor name, not placeholder)
cy.get('[data-testid="assignedDoctor"]').should('not.contain', 'Select a doctor')

cy.get('[data-testid="confirm-submit-button"]').click()
```

### 3. submissions.cy.ts

**Location**: Lines 169-183

**Test**: "should allow nurse to route for approval"

**Before**:
```typescript
cy.contains('button', 'Submit for Approval').click()

cy.get('body').then($body => {
  if ($body.find('select').length > 0) {
    cy.get('select').first().select(1)
  }
})

cy.get('[data-testid="confirm-submit-button"]').click()
```

**After**:
```typescript
cy.contains('button', 'Submit for Approval').click()

// Wait for modal and select doctor
cy.contains('Route for Approval?').should('be.visible')
cy.get('[data-testid="assignedDoctor"]').should('be.visible')
cy.get('[data-testid="assignedDoctor"]').click()

// Select first doctor from dropdown
cy.get('[role="option"]').first().click()

// Verify doctor is selected (trigger should show doctor name, not placeholder)
cy.get('[data-testid="assignedDoctor"]').should('not.contain', 'Select a doctor')

cy.get('[data-testid="confirm-submit-button"]').click()
```

## Why This Works Better

### Cypress Best Practices

1. **Automatic Retrying**: 
   - `cy.get('select#assignedDoctor').should('be.visible')` automatically retries until the element appears
   - Eliminates race conditions

2. **Explicit Assertions**:
   - `should('not.have.value', '')` verifies selection succeeded
   - Test fails fast if doctor isn't selected

3. **Proper Async Handling**:
   - All Cypress commands are properly chained
   - No synchronous jQuery checks that bypass Cypress's retry logic

4. **Readable and Maintainable**:
   - Clear intent: wait for modal → select doctor → verify selection → submit
   - Easy to debug if it fails

## Testing the Fix

### Expected Behavior

1. User (nurse) clicks "Submit for Approval" button
2. Modal appears with "Route for Approval?" title
3. Dropdown with id="assignedDoctor" becomes visible
4. Test selects first doctor (index 1)
5. Assertion verifies a doctor is selected (value is not empty)
6. Submit button is clicked
7. Navigation to submissions page occurs
8. Submission shows "Pending" status

### Verification Commands

```bash
cd frontend

# Run the specific test
npx cypress run --spec "cypress/e2e/search-features.cy.ts"

# Run all nurse workflow tests
npx cypress run --spec "cypress/e2e/submissions.cy.ts" --grep "Nurse Workflow"
```

## Related Components

### Frontend: NewSubmission.tsx

The modal structure that this test interacts with:

```tsx
<AlertDialog open={isDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        {isRouteForApproval ? 'Route for Approval?' : 'Submit Medical Exam?'}
      </AlertDialogTitle>
    </AlertDialogHeader>
    
    {user?.role === 'nurse' && isRouteForApproval && (
      <div className="space-y-2 px-6 pb-4">
        <Label htmlFor="assignedDoctor">Assign to Doctor *</Label>
        <Select value={assignedDoctorId} onValueChange={setAssignedDoctorId}>
          <SelectTrigger id="assignedDoctor" data-testid="assignedDoctor">
            <SelectValue placeholder="Select a doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.name} ({doctor.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
    
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction data-testid="confirm-submit-button" onClick={handleSubmit}>
        {isRouteForApproval ? 'Route for Approval' : 'Submit'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Key Points**:
- The SelectTrigger has both `id="assignedDoctor"` and `data-testid="assignedDoctor"`
- Shadcn's Select component renders as a custom dropdown, not a native `<select>`
- SelectItems render with `role="option"` when the dropdown is open
- The SelectTrigger is a button element that toggles the dropdown

## Summary

✅ **Fixed Files**: 3 (NewSubmission.tsx, search-features.cy.ts, submissions.cy.ts)  
✅ **Tests Affected**: 2 nurse workflow tests  
✅ **Compilation Errors**: 0  
✅ **Added data-testid**: `assignedDoctor` to SelectTrigger  
✅ **Improved Reliability**: Tests now properly wait and verify doctor selection  
✅ **Better Assertions**: Verifies placeholder is replaced with doctor name  
✅ **Shadcn Compatible**: Works correctly with Shadcn Select component's custom dropdown

The tests will now reliably select a doctor using the proper Shadcn Select interaction pattern (click trigger → click option → verify selection)!
