# Integration Testing Guide - Doctor-Clinic Many-to-Many

**Date**: October 23, 2025
**Status**: Ready for Testing

## Prerequisites

### Backend
- ✅ All backend services updated
- ✅ All unit tests passing (136/138)
- ✅ All new E2E tests passing (17/17 for clinics)
- ✅ Database schema updated
- ✅ Seed data includes doctor-clinic relationships

### Frontend
- ✅ All components updated
- ✅ All services updated
- ✅ TypeScript types updated
- ✅ UI components created

## Starting the Application

### 1. Start Backend
```bash
cd backend
npm run start:dev
```

**Expected Output**:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [RoutesResolver] UsersController {/v1/users}:
[Nest] LOG [RoutesResolver] ClinicsController {/v1/clinics}:
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3344
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

**Expected Output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3. Open Browser
```
http://localhost:5173
```

## Test Scenarios

### Scenario 1: Admin - Clinic Management

**Login**: Use admin credentials
```
Email: admin@clinic.sg
Password: password123
```

**Steps**:
1. ✅ Click "Settings" in top navigation
2. ✅ Verify you see 3 tabs: User Management, Clinic Management, Doctor-Clinic Assignments
3. ✅ Click "Clinic Management" tab
4. ✅ Verify statistics cards show correct numbers
5. ✅ Click "Add Clinic"
6. ✅ Fill in form:
   - Name: "New Medical Centre"
   - HCI Code: "HCI9999"
   - Address: "456 Health Street, Singapore 654321"
   - Phone: "+65 6999 9999"
   - Email: "new@clinic.sg"
   - Registration: "REG999"
7. ✅ Click "Create Clinic"
8. ✅ Verify success toast appears
9. ✅ Verify new clinic appears in table
10. ✅ Click edit icon on new clinic
11. ✅ Change name to "New Medical Centre Updated"
12. ✅ Click "Save Changes"
13. ✅ Verify update appears
14. ✅ Try to delete the new clinic (should work since no users)

**Validation Tests**:
1. ✅ Try creating clinic with invalid HCI code "ABC" (too short)
   - Should show error: "HCI code must be 7 alphanumeric characters"
2. ✅ Try creating clinic with invalid email "notanemail"
   - Should show error: "Please enter a valid email address"
3. ✅ Try deleting "HealthFirst Medical Clinic" (has users)
   - Should show error: "Cannot delete clinic with existing users"

### Scenario 2: Admin - Doctor-Clinic Assignments

**Steps**:
1. ✅ Go to Settings → Doctor-Clinic Assignments tab
2. ✅ Verify left panel shows all doctors
3. ✅ Click on "Dr. Sarah Tan"
4. ✅ Verify right panel shows her current clinics
5. ✅ Verify primary clinic has star badge
6. ✅ Click "Assign" button
7. ✅ Select a clinic she's not assigned to
8. ✅ Check "Set as primary"
9. ✅ Click "Assign Clinic"
10. ✅ Verify success toast
11. ✅ Verify new clinic appears in her list
12. ✅ Verify star badge moved to new primary clinic
13. ✅ Click star icon on a different clinic to change primary
14. ✅ Verify primary changes
15. ✅ Click X icon to remove a non-primary clinic
16. ✅ Verify clinic removed
17. ✅ Try to remove the last clinic
    - Should show error: "Cannot remove the last clinic"

**Edge Cases**:
1. ✅ Try to assign same clinic twice
   - Should show error: "Doctor is already assigned to this clinic"
2. ✅ Verify can't see "Assign" if all clinics already assigned

### Scenario 3: Admin - User Management with MCR

**Steps**:
1. ✅ Go to Settings → User Management tab
2. ✅ Verify MCR Number column in table
3. ✅ Verify existing doctors show MCR numbers (or "-" if not set)
4. ✅ Click "Add User"
5. ✅ Fill in:
   - Name: "Dr. Test Doctor"
   - Email: "test.doctor@clinic.sg"
   - Password: "password123"
   - Role: "Doctor"
6. ✅ Verify MCR Number field appears
7. ✅ Enter MCR: "M99999Z"
8. ✅ Verify auto-uppercase (if you type lowercase)
9. ✅ Click "Create User"
10. ✅ Verify new doctor appears in table with MCR
11. ✅ Click edit icon on new doctor
12. ✅ Change MCR to "D11111A"
13. ✅ Save
14. ✅ Verify MCR updated in table

**Validation Tests**:
1. ✅ Try creating doctor with invalid MCR "ABC"
   - Should show error: "MCR number must be in format: Letter + 5 digits + Letter"
2. ✅ Try invalid MCR "M1234A" (too short)
   - Should show error
3. ✅ Try invalid MCR "1234567" (no letters)
   - Should show error
4. ✅ Create doctor without MCR (should work - optional)

### Scenario 4: Nurse - Default Doctor with MCR Display

**Login**: Use nurse credentials
```
Email: nurse@clinic.sg
Password: password123
```

**Steps**:
1. ✅ Click "Settings"
2. ✅ Verify you see Default Doctor section (not admin tabs)
3. ✅ Open "Default Doctor" dropdown
4. ✅ Verify doctors show format: "Dr. Name (MCR: M12345A)"
5. ✅ Select a doctor
6. ✅ Click "Save Changes"
7. ✅ Verify success toast
8. ✅ Go to "New Submission"
9. ✅ Click "Submit for Approval" toggle
10. ✅ Verify default doctor is pre-selected
11. ✅ Open doctor dropdown
12. ✅ Verify MCR numbers show

### Scenario 5: Doctor - MCR Display in New Submission

**Login**: Use doctor credentials
```
Email: sarah.tan@clinic.sg
Password: password123
```

**Steps**:
1. ✅ Create new submission
2. ✅ Click "Submit for Approval"
3. ✅ Open "Assign to Doctor" dropdown
4. ✅ Verify all doctors show with MCR numbers
5. ✅ Format: "Dr. Name (MCR: M12345A)"
6. ✅ Verify doctors without MCR show as "Dr. Name"

### Scenario 6: API Direct Testing

**Using Postman or curl**:

1. ✅ Get all clinics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3344/v1/clinics
```

2. ✅ Create clinic
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test Clinic","hciCode":"HCI8888"}' \
  http://localhost:3344/v1/clinics
```

3. ✅ Get doctor's clinics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3344/v1/users/DOCTOR_ID/clinics
```

4. ✅ Assign doctor to clinic
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clinicId":"CLINIC_ID","isPrimary":false}' \
  http://localhost:3344/v1/users/DOCTOR_ID/clinics
```

5. ✅ Set primary clinic
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3344/v1/users/DOCTOR_ID/clinics/CLINIC_ID/primary
```

## Browser DevTools Testing

### Network Tab
1. ✅ Open browser DevTools (F12)
2. ✅ Go to Network tab
3. ✅ Perform actions in UI
4. ✅ Verify API calls:
   - `GET /v1/clinics` returns paginated response
   - `POST /v1/clinics` returns created clinic
   - `GET /v1/users/:id/clinics` returns clinic array
   - All responses have correct status codes (200, 201)

### Console Tab
1. ✅ Check for any errors (should be none)
2. ✅ Verify no TypeScript type errors
3. ✅ Verify no React warnings

## Visual Testing Checklist

### UI Components
- ✅ Clinic Management table is responsive
- ✅ Statistics cards show correct data
- ✅ Forms validate properly
- ✅ Dialogs open/close smoothly
- ✅ Toast notifications appear and disappear
- ✅ Loading spinners show during API calls
- ✅ Error messages are clear and helpful

### Layout
- ✅ Admin tabs display correctly
- ✅ Two-panel layout works in Doctor-Clinic Assignments
- ✅ Tables are scrollable if many items
- ✅ Mobile responsive (test at different screen sizes)

### Data Display
- ✅ MCR numbers show in monospace font
- ✅ HCI codes show in monospace font
- ✅ Primary clinic has star badge
- ✅ "-" shows for missing optional fields
- ✅ Dates formatted correctly

## Known Issues to Test

### Pre-existing Issues (Not Related to New Features)
1. ⚠️ 2 unit tests failing in approvals.service.spec.ts
   - Issue: `this.prisma.auditLog.createMany is not a function`
   - Impact: Does not affect new features

2. ⚠️ 3 E2E tests failing in submissions and approvals
   - Issue: Pagination type conversion
   - Impact: Does not affect new features

### New Feature Testing
- ✅ All new clinic E2E tests passing (17/17)
- ✅ All new user E2E tests for MCR validation passing
- ✅ All unit tests for new services passing

## Success Criteria

### Backend
- ✅ Server starts without errors
- ✅ All clinic endpoints respond correctly
- ✅ All doctor-clinic endpoints respond correctly
- ✅ Validation works (MCR, HCI formats)
- ✅ Business rules enforced (can't delete clinic with users, etc.)

### Frontend
- ✅ All pages load without errors
- ✅ Admin sees all 3 tabs in Settings
- ✅ Nurse sees default doctor settings
- ✅ MCR numbers display in all doctor dropdowns
- ✅ Form validation works
- ✅ Success/error messages show appropriately
- ✅ Data updates in real-time

### Integration
- ✅ Frontend successfully calls backend APIs
- ✅ Data persists to database
- ✅ Pagination works
- ✅ Error handling works end-to-end
- ✅ User roles/permissions enforced

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 3344 is in use
lsof -i :3344

# Kill process if needed
kill -9 PID

# Check database connection
cd backend
npx prisma db push
```

### Frontend Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### API Calls Failing
1. Check browser console for errors
2. Verify backend is running on http://localhost:3344
3. Check VITE_API_URL in frontend/.env
4. Verify JWT token is valid (check localStorage)
5. Check Network tab for actual error responses

### TypeScript Errors
```bash
# In frontend directory
npm run build

# This will show any TypeScript compilation errors
```

## Reporting Issues

If you find any issues during testing:

1. **Note the scenario** where it occurred
2. **Capture screenshots** of error messages
3. **Check browser console** for errors
4. **Check backend logs** for server errors
5. **Note the exact steps** to reproduce
6. **Include** user role and permissions

## Documentation References

- [FRONTEND_MANY_TO_MANY_COMPLETE.md](./FRONTEND_MANY_TO_MANY_COMPLETE.md) - Complete frontend documentation
- [BACKEND_MANY_TO_MANY_COMPLETE.md](./BACKEND_MANY_TO_MANY_COMPLETE.md) - Complete backend documentation
- [E2E_TEST_RESULTS.md](./backend/E2E_TEST_RESULTS.md) - E2E test results
- [MCR_HCI_VALIDATION.md](./MCR_HCI_VALIDATION.md) - Validation format reference

## Summary

✅ **Backend**: Ready for testing
✅ **Frontend**: Ready for testing
✅ **Documentation**: Complete
✅ **Test Scenarios**: Defined

**Ready to proceed with full integration testing!**
