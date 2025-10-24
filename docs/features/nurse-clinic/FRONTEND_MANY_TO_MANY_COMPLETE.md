# Frontend Update - Doctor-Clinic Many-to-Many Relationships

**Date**: October 23, 2025
**Update**: Complete frontend implementation for many-to-many doctor-clinic relationships

## Summary of Changes

The frontend has been fully updated to support the many-to-many relationship between doctors and clinics, including:

1. ✅ Updated TypeScript types and interfaces
2. ✅ Created new Clinics API service
3. ✅ Extended Users API service with doctor-clinic methods
4. ✅ Created Clinic Management UI component
5. ✅ Created Doctor-Clinic Assignment UI component
6. ✅ Updated User Management to include MCR numbers
7. ✅ Updated Settings page with admin tabs
8. ✅ Updated all doctor dropdowns to show MCR numbers

---

## Files Created

### 1. `/frontend/src/services/clinics.service.ts`

Complete API service for clinic management:

**Methods**:
- `getAll(page, limit)` - Get all clinics with pagination
- `getById(id)` - Get clinic details including assigned doctors
- `getDoctors(clinicId)` - Get all doctors at a specific clinic
- `create(data)` - Create a new clinic (Admin only)
- `update(id, data)` - Update clinic details (Admin only)
- `delete(id)` - Delete clinic (Admin only)

**Features**:
- Full TypeScript support
- Pagination for clinic lists
- Includes doctor relationships
- Error handling

### 2. `/frontend/src/components/ClinicManagement.tsx`

Admin UI for managing clinics:

**Features**:
- Create, edit, and delete clinics
- HCI code validation (7 alphanumeric characters)
- Email validation
- Statistics dashboard (total clinics, with HCI code, complete profiles)
- Responsive table with all clinic information
- Prevention of deleting clinics with existing users
- Form validation and error handling

**Fields**:
- Clinic Name* (required)
- HCI Code (7 alphanumeric characters)
- Registration Number
- Address
- Phone Number
- Email Address

### 3. `/frontend/src/components/DoctorClinicAssignment.tsx`

Admin UI for managing doctor-clinic assignments:

**Features**:
- Two-panel interface (doctors list + clinic assignments)
- Assign doctor to multiple clinics
- Set primary clinic designation
- Remove doctor from clinic (with validation)
- Visual indicators for primary clinic (star badge)
- Statistics dashboard (total doctors, clinics, multi-clinic doctors)
- Prevention of removing last clinic
- Real-time updates after changes

**Workflow**:
1. Select a doctor from the left panel
2. View their current clinic assignments on the right
3. Add new clinic assignments with optional primary designation
4. Set/change primary clinic with one click
5. Remove clinic assignments (except last one)

---

## Files Modified

### 1. `/frontend/src/types/api.ts`

**Added Types**:
```typescript
// Clinic Types
interface Clinic {
  id: string;
  name: string;
  hciCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DoctorClinic {
  doctorId: string;
  clinicId: string;
  isPrimary: boolean;
  clinic?: Clinic;
  doctor?: ClinicUser;
}

// Updated ClinicUser
interface ClinicUser {
  // ... existing fields
  mcrNumber?: string;  // NEW: MCR number for doctors
  clinics?: DoctorClinic[];  // NEW: Many-to-many relationships
  primaryClinic?: Clinic;  // NEW: Primary clinic
}

// Request Types
interface CreateClinicRequest { ... }
interface UpdateClinicRequest { ... }
interface AssignDoctorToClinicRequest { ... }
interface SetPrimaryClinicRequest { ... }

// Updated User Request Types
interface CreateUserRequest {
  // ... existing fields
  mcrNumber?: string;  // NEW: For doctors
}

interface UpdateUserRequest {
  // ... existing fields
  mcrNumber?: string;  // NEW: For doctors
}
```

### 2. `/frontend/src/services/users.service.ts`

**Added Methods**:
```typescript
// Doctor-Clinic Relationship Management
getDoctorClinics(doctorId: string): Promise<Clinic[]>
assignDoctorToClinic(doctorId: string, data: AssignDoctorToClinicRequest): Promise<DoctorClinic>
removeDoctorFromClinic(doctorId: string, clinicId: string): Promise<{ message: string }>
setPrimaryClinic(doctorId: string, clinicId: string): Promise<{ message: string }>
```

**Updated Doctor Interface**:
```typescript
interface Doctor {
  id: string;
  name: string;
  email: string;
  mcrNumber?: string;  // NEW
}
```

### 3. `/frontend/src/services/index.ts`

**Added Export**:
```typescript
export { clinicsApi } from './clinics.service';
```

### 4. `/frontend/src/components/UserManagement.tsx`

**Changes**:
- Added `mcrNumber` field to form state
- Added MCR number input field (shown only for doctors)
- Added MCR number validation (format: `[A-Z]\d{5}[A-Z]`)
- Added MCR number column to user table
- Auto-uppercase MCR input
- 7-character max length
- Validation on save

**MCR Number Validation**:
- Format: Letter + 5 digits + Letter (e.g., M12345A)
- Case-insensitive input (auto-converted to uppercase)
- Optional field
- Validated on form submission

### 5. `/frontend/src/components/Settings.tsx`

**For Admin Users**:
- Added tabbed interface with 3 tabs:
  1. **User Management** - Create/edit/delete users
  2. **Clinic Management** - Create/edit/delete clinics
  3. **Doctor-Clinic Assignments** - Manage relationships

- Icons for each tab (Users, Building2, UserCog)
- Tab state management
- Conditional rendering based on user role

**For Nurse Users**:
- Default doctor settings (unchanged)
- Doctor dropdown now shows MCR numbers

### 6. Doctor Dropdowns (Multiple Components)

**Updated Components**:
- `/frontend/src/components/SetDefaultDoctorDialog.tsx`
- `/frontend/src/components/Settings.tsx` (nurse section)
- `/frontend/src/components/NewSubmission.tsx`

**Change**:
```typescript
// Before
<SelectItem>{doctor.name} ({doctor.email})</SelectItem>

// After
<SelectItem>
  {doctor.name}
  {doctor.mcrNumber && ` (MCR: ${doctor.mcrNumber})`}
</SelectItem>
```

**Display Format**:
- If MCR number exists: "Dr. Sarah Tan (MCR: M12345A)"
- If no MCR number: "Dr. Sarah Tan"

---

## User Interface Updates

### Admin Dashboard (Settings Page)

#### Tab 1: User Management
- Table columns: Name, Email, Role, **MCR Number**, Status, Last Login, Actions
- MCR number displayed in monospace font for doctors
- Shows "-" for non-doctors
- Create/Edit form includes MCR number field (conditional on role)

#### Tab 2: Clinic Management
- Statistics cards:
  - Total Clinics
  - Clinics with HCI Code
  - Complete Profiles
- Table columns: Name, HCI Code, Registration #, Contact, Address, Actions
- Create/Edit form with all clinic fields
- HCI code validation (7 alphanumeric)
- Delete protection for clinics with users

#### Tab 3: Doctor-Clinic Assignments
- Split panel interface
- Left panel: Doctor list with MCR numbers and clinic count
- Right panel: Selected doctor's clinic assignments
- Primary clinic indicator (star badge)
- Add/Remove clinic assignments
- Set primary clinic functionality

### Doctor Selection Improvements

All doctor dropdowns now show:
- Doctor name first
- MCR number in parentheses (if available)
- Cleaner, more professional appearance
- Better identification of doctors

---

## Validation Rules

### MCR Number (Medical Council Registration)
- **Format**: `[A-Z]\d{5}[A-Z]`
- **Example**: M12345A, D67890B
- **Requirements**:
  - Exactly 7 characters
  - First character: Uppercase letter
  - Next 5 characters: Digits
  - Last character: Uppercase letter
- **UI**:
  - Auto-uppercase on input
  - Max length: 7 characters
  - Optional field
  - Only shown for doctors

### HCI Code (Healthcare Institution Code)
- **Format**: `[A-Z0-9]{7}`
- **Example**: HCI0001, ABC1234
- **Requirements**:
  - Exactly 7 alphanumeric characters
  - Uppercase letters and numbers only
- **UI**:
  - Auto-uppercase on input
  - Max length: 7 characters
  - Optional field
  - Unique per clinic

---

## API Integration

### Clinics API
```typescript
// Get all clinics
GET /v1/clinics?page=1&limit=20
Response: PaginatedResponse<Clinic>

// Get clinic by ID (with doctors)
GET /v1/clinics/:id
Response: Clinic & { doctors: ClinicUser[] }

// Get doctors at clinic
GET /v1/clinics/:id/doctors
Response: ClinicUser[]

// Create clinic (Admin only)
POST /v1/clinics
Body: CreateClinicRequest
Response: Clinic

// Update clinic (Admin only)
PUT /v1/clinics/:id
Body: UpdateClinicRequest
Response: Clinic

// Delete clinic (Admin only)
DELETE /v1/clinics/:id
Response: void
```

### Doctor-Clinic Relationships
```typescript
// Get doctor's clinics
GET /v1/users/:doctorId/clinics
Response: Clinic[]

// Assign doctor to clinic
POST /v1/users/:doctorId/clinics
Body: { clinicId: string, isPrimary?: boolean }
Response: DoctorClinic

// Remove doctor from clinic
DELETE /v1/users/:doctorId/clinics/:clinicId
Response: { message: string }

// Set primary clinic
PUT /v1/users/:doctorId/clinics/:clinicId/primary
Body: {}
Response: { message: string }
```

---

## User Workflows

### Admin: Managing Clinics

1. **Navigate**: Settings → Clinic Management tab
2. **Create Clinic**:
   - Click "Add Clinic"
   - Fill in clinic details (name required)
   - Add HCI code (7 characters, validated)
   - Add address, phone, email
   - Click "Create Clinic"
3. **Edit Clinic**:
   - Click edit icon on clinic row
   - Update details
   - Click "Save Changes"
4. **Delete Clinic**:
   - Click delete icon
   - Confirm deletion
   - Note: Cannot delete if clinic has users

### Admin: Managing Doctor-Clinic Assignments

1. **Navigate**: Settings → Doctor-Clinic Assignments tab
2. **View Doctor's Clinics**:
   - Click on a doctor in the left panel
   - View their clinic assignments in right panel
   - Primary clinic shows star badge
3. **Assign Doctor to Clinic**:
   - Select doctor from left panel
   - Click "Assign" button
   - Select clinic from dropdown
   - Check "Set as primary" if desired
   - Click "Assign Clinic"
4. **Set Primary Clinic**:
   - Select doctor
   - Click star icon on desired clinic
5. **Remove Clinic Assignment**:
   - Select doctor
   - Click X icon on clinic to remove
   - Note: Cannot remove last clinic

### Admin: Adding Doctor with MCR

1. **Navigate**: Settings → User Management tab
2. **Click**: "Add User"
3. **Fill Form**:
   - Name, Email, Password
   - Select Role: "Doctor"
   - MCR number field appears
   - Enter MCR (e.g., M12345A)
4. **Save**: MCR auto-validated

### Nurse: Default Doctor with MCR Display

1. **Navigate**: Settings
2. **View**: Default Doctor dropdown
3. **See**: "Dr. Sarah Tan (MCR: M12345A)"
4. **Select**: Doctor with MCR number visible

---

## Error Handling

### Clinic Management
- ✅ Duplicate HCI code detection
- ✅ Invalid HCI format validation
- ✅ Prevention of deleting clinics with users
- ✅ Required field validation
- ✅ Email format validation

### Doctor-Clinic Assignments
- ✅ Cannot remove doctor's last clinic
- ✅ Cannot assign duplicate relationships
- ✅ Validation of doctor and clinic existence
- ✅ Primary clinic conflicts handled automatically

### MCR Number Validation
- ✅ Format validation (letter+5digits+letter)
- ✅ Client-side validation before submission
- ✅ Server-side validation enforced
- ✅ Clear error messages

---

## Testing Checklist

### Clinic Management
- [ ] Create clinic with all fields
- [ ] Create clinic with only name (minimum)
- [ ] Edit clinic details
- [ ] Delete empty clinic
- [ ] Try to delete clinic with users (should fail)
- [ ] Validate HCI code format (should reject invalid)
- [ ] Validate email format

### Doctor-Clinic Assignments
- [ ] Assign doctor to single clinic
- [ ] Assign doctor to multiple clinics
- [ ] Set primary clinic
- [ ] Change primary clinic
- [ ] Remove non-primary clinic
- [ ] Try to remove last clinic (should fail)
- [ ] Try to assign duplicate (should fail)

### MCR Numbers
- [ ] Create doctor with MCR number
- [ ] Create doctor without MCR number
- [ ] Edit doctor to add MCR number
- [ ] Test MCR validation (reject invalid formats)
- [ ] View MCR in user table
- [ ] View MCR in doctor dropdowns

### UI/UX
- [ ] Admin sees 3 tabs in Settings
- [ ] Nurse sees only default doctor settings
- [ ] Doctor sees no settings
- [ ] Tab navigation works smoothly
- [ ] All forms validate properly
- [ ] Error messages are clear
- [ ] Success toasts appear
- [ ] Loading states work

---

## Breaking Changes

### None for End Users
- All changes are backward compatible
- Existing data continues to work
- New fields are optional
- Old workflows unchanged

### For Developers
- New TypeScript types must be imported
- ClinicUser interface has new optional fields
- Doctor interface has new optional mcrNumber
- New API endpoints available

---

## Migration Notes

### Existing Data
1. **Doctors**: Already have primary clinic via `clinicId`
   - Backend migration created DoctorClinic records
   - MCR numbers are NULL (optional)
   - Admin can add MCR numbers via UI

2. **Clinics**: May not have HCI codes
   - HCI codes are NULL (optional)
   - Admin can add HCI codes via UI

### Recommended Actions
1. Admin should update existing doctors with MCR numbers
2. Admin should update clinics with HCI codes
3. Admin can assign doctors to additional clinics
4. Admin can set appropriate primary clinics

---

## Future Enhancements

### Potential Additions
1. Bulk import of clinics from CSV
2. Bulk assign doctors to clinics
3. Clinic statistics (submissions per clinic)
4. Doctor statistics (submissions per doctor)
5. MCR number verification with external API
6. HCI code verification with MOH registry
7. Clinic operating hours
8. Doctor schedules per clinic
9. Automated primary clinic selection based on most submissions
10. Clinic deactivation (soft delete)

---

## Documentation

### Related Files
- [BACKEND_MANY_TO_MANY_COMPLETE.md](../BACKEND_MANY_TO_MANY_COMPLETE.md) - Backend API documentation
- [BACKEND_TESTS_COMPLETE.md](../backend/BACKEND_TESTS_COMPLETE.md) - Backend test documentation
- [E2E_TEST_RESULTS.md](../backend/E2E_TEST_RESULTS.md) - E2E test results
- [MCR_HCI_VALIDATION.md](../MCR_HCI_VALIDATION.md) - Validation rules reference

### API Integration Guide
See `frontend/API_INTEGRATION_GUIDE.md` for detailed API usage examples.

---

## Summary

**Frontend implementation is COMPLETE!** ✅

All components, services, and UI elements have been updated to support:
- ✅ Many-to-many doctor-clinic relationships
- ✅ MCR number display and validation
- ✅ HCI code display and validation
- ✅ Complete clinic management UI
- ✅ Complete doctor-clinic assignment UI
- ✅ Updated user management with MCR fields
- ✅ Enhanced doctor selection with MCR display
- ✅ Admin dashboard with tabbed interface

The frontend is now fully integrated with the backend API and ready for testing!
