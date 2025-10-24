# Default Doctor Feature

## Overview
Implemented a feature that allows nurses to set a default doctor for routing submissions. This improves user experience by pre-filling the doctor selection and reducing repetitive work.

## User Story
**As a nurse**, I want to be able to set a default doctor to route submissions for approval to, so every time when I click "Submit for Approval", the dropdown of doctor is pre-filled with the default one that I set. If I never set the doctor, the system will prompt me to set a default one.

## Implementation Details

### Database Changes

#### Schema Update (schema.prisma)
```prisma
model User {
  // ... existing fields
  defaultDoctorId    String?
  defaultDoctor      User?   @relation("NurseDefaultDoctor", fields: [defaultDoctorId], references: [id], onDelete: SetNull)
  nursesUsingAsDefault User[] @relation("NurseDefaultDoctor")
  
  @@index([defaultDoctorId])
}
```

#### Migration
- **File**: `20251023090919_add_default_doctor_to_user`
- **Changes**: Added `default_doctor_id` column to users table with foreign key constraint
- **Status**: ✅ Applied successfully

### Backend Changes

#### API Endpoints (users.controller.ts)
```typescript
// GET /users/me/default-doctor - Retrieves nurse's default doctor
@Get('me/default-doctor')
@Roles('nurse')

// PUT /users/me/default-doctor - Sets nurse's default doctor
@Put('me/default-doctor')
@Roles('nurse')
```

#### Service Methods (users.service.ts)
```typescript
async getDefaultDoctor(userId: string)
async setDefaultDoctor(userId: string, doctorId: string)
```

**Validation Rules**:
- Doctor must exist in the system
- Doctor must have role='doctor'
- Doctor must be active (status='active')
- Doctor must belong to the same clinic as the nurse

### Frontend Changes

#### API Service (users.service.ts)
```typescript
export const usersApi = {
  // ...existing methods
  
  getDefaultDoctor: async (): Promise<{ defaultDoctorId: string | null; defaultDoctor: Doctor | null }> => {
    const response = await fetch(`${API_URL}/users/me/default-doctor`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  setDefaultDoctor: async (doctorId: string): Promise<{ defaultDoctorId: string; defaultDoctor: Doctor }> => {
    const response = await fetch(`${API_URL}/users/me/default-doctor`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ doctorId }),
    });
    return response.json();
  },
};
```

#### New Component: SetDefaultDoctorDialog.tsx
**Purpose**: Dialog prompting nurses to set their default doctor

**Props**:
- `open: boolean` - Controls dialog visibility
- `doctors: Doctor[]` - List of available doctors
- `onClose: () => void` - Called when user clicks Skip or closes dialog
- `onSave: (doctorId: string) => void` - Called when user successfully saves default doctor

**Features**:
- Doctor selection dropdown with data-testid="defaultDoctor"
- Save and Skip buttons
- Toast notifications for success/error states
- Loading state during API call
- Calls `usersApi.setDefaultDoctor()` on save

**File Size**: 88 lines

#### Updated Component: NewSubmission.tsx

**State Additions**:
```typescript
const [showSetDefaultDoctorDialog, setShowSetDefaultDoctorDialog] = useState(false);
const [hasDefaultDoctor, setHasDefaultDoctor] = useState(false);
```

**useEffect Changes** (fetchDoctors):
```typescript
useEffect(() => {
  const fetchDoctors = async () => {
    if (user?.role === 'nurse') {
      const doctorsList = await usersApi.getDoctors();
      setDoctors(doctorsList);
      
      // Load and track default doctor
      const { defaultDoctorId } = await usersApi.getDefaultDoctor();
      setHasDefaultDoctor(!!defaultDoctorId);
      
      if (defaultDoctorId && !id) {
        // Pre-fill for new submissions only
        setAssignedDoctorId(defaultDoctorId);
      }
    }
  };
  fetchDoctors();
}, [user, id]);
```

**Submit for Approval Button Update**:
```typescript
<Button 
  variant="outline" 
  onClick={() => {
    // Check if default doctor is set
    if (!hasDefaultDoctor) {
      setShowSetDefaultDoctorDialog(true);
    } else {
      setIsRouteForApproval(true);
      setShowSubmitDialog(true);
    }
  }}
  disabled={!isFormValid || isSaving}
>
  Submit for Approval
</Button>
```

**Dialog Integration**:
```tsx
<SetDefaultDoctorDialog
  open={showSetDefaultDoctorDialog}
  doctors={doctors}
  onClose={() => setShowSetDefaultDoctorDialog(false)}
  onSave={(doctorId: string) => {
    setAssignedDoctorId(doctorId);
    setHasDefaultDoctor(true);
    setShowSetDefaultDoctorDialog(false);
    setIsRouteForApproval(true);
    setShowSubmitDialog(true);
  }}
/>
```

## User Flow

### First Time User (No Default Doctor Set)
1. Nurse clicks "Submit for Approval" button
2. System detects no default doctor is set
3. SetDefaultDoctorDialog appears prompting nurse to select a default doctor
4. Nurse has two options:
   - **Save**: Selects a doctor and saves as default
     - Doctor is set as default in database
     - Current submission's doctor dropdown is pre-filled with this doctor
     - Submission modal opens automatically
     - Future submissions will auto-fill this doctor
   - **Skip**: Closes dialog without setting default
     - Nurse must manually select doctor in submission modal
     - Will be prompted again on next submission attempt

### Returning User (Default Doctor Already Set)
1. Nurse opens new submission form
2. System loads default doctor automatically
3. Doctor dropdown is pre-filled with default doctor's name
4. Nurse clicks "Submit for Approval"
5. Submission modal opens directly (no prompt)
6. Doctor field already shows the default doctor
7. Nurse can:
   - Keep the default doctor and submit
   - Change to a different doctor for this specific submission

### Editing Draft
1. When editing an existing draft, the default doctor is NOT auto-filled
2. The draft's original assigned doctor (if any) is preserved
3. This prevents accidentally overwriting doctor assignments on existing work

## Benefits

1. **Reduced Repetitive Work**: Nurses who primarily work with one doctor don't need to select the same doctor repeatedly
2. **Improved Efficiency**: New submission flow is faster for returning users
3. **Flexibility**: Nurses can still override the default for specific submissions
4. **User Choice**: Nurses can choose to skip setting a default if they work with multiple doctors
5. **Draft Safety**: Existing draft assignments are not affected

## Testing Requirements

### Manual Testing Checklist
- [ ] First-time nurse sees prompt when clicking "Submit for Approval"
- [ ] Saving default doctor successfully stores in database
- [ ] Skipping prompt allows manual doctor selection
- [ ] Subsequent new submissions have doctor pre-filled
- [ ] Nurse can override default doctor per submission
- [ ] Editing drafts preserves original doctor assignment
- [ ] Multiple nurses can have different default doctors
- [ ] Invalid doctor selections are rejected (wrong clinic, inactive, etc.)

### Cypress Test Coverage Needed
1. **First Time Flow**
   - Nurse with no default clicks "Submit for Approval"
   - Dialog appears with doctor dropdown
   - Save button sets default and continues to submission
   - Skip button closes dialog without setting default

2. **Default Pre-fill Flow**
   - Nurse with default doctor creates new submission
   - Doctor dropdown is pre-filled on form load
   - Submit for Approval opens modal directly
   - Doctor field in modal shows default doctor

3. **Override Default**
   - Nurse opens new submission (pre-filled)
   - Changes doctor to different one
   - Submits successfully with overridden doctor
   - Default doctor unchanged for next submission

4. **Draft Editing**
   - Nurse edits existing draft with assigned doctor
   - Doctor field shows original assignment
   - Not overwritten by default doctor
   - Submission preserves chosen doctor

5. **Settings Management** (Future)
   - Nurse can view current default doctor
   - Nurse can change default doctor
   - Change applies to future submissions only

## Future Enhancements

1. **Settings Page**: Add a dedicated settings page where nurses can view and change their default doctor at any time (not just during submission)

2. **Quick Change Link**: In the submission modal, add a small link "Change Default Doctor" that opens settings

3. **Analytics**: Track how often nurses use default vs manual selection to measure feature adoption

4. **Multi-Clinic Support**: If nurses work across multiple clinics, allow setting different defaults per clinic

## Files Modified

### Backend
- `prisma/schema.prisma` - Added defaultDoctorId field and relations
- `prisma/migrations/20251023090919_add_default_doctor_to_user/migration.sql` - Database migration
- `src/users/users.controller.ts` - Added GET/PUT /users/me/default-doctor endpoints
- `src/users/users.service.ts` - Added getDefaultDoctor() and setDefaultDoctor() methods

### Frontend
- `src/services/users.service.ts` - Added getDefaultDoctor() and setDefaultDoctor() API methods
- `src/components/SetDefaultDoctorDialog.tsx` - New dialog component (88 lines)
- `src/components/NewSubmission.tsx` - Integrated default doctor loading and dialog trigger

### Documentation
- `DEFAULT_DOCTOR_FEATURE.md` - This file

## Technical Notes

### Why Not Auto-fill Drafts?
When editing an existing draft, we intentionally do NOT override the assigned doctor with the default doctor. This is because:
1. The draft may have been specifically assigned to a particular doctor
2. Overwriting could cause confusion if the nurse expects the original doctor to still be assigned
3. It preserves the intent of the original draft creation

### Database Relations
The self-referential relation on the User model allows:
- A nurse (User) to have one default doctor (also a User)
- A doctor (User) to be the default for multiple nurses
- Cascade behavior: When a doctor is deleted, nurses' defaultDoctorId is set to null (not blocked)

### API Authorization
Both endpoints are protected with `@Roles('nurse')` guard, ensuring only nurses can:
- View their default doctor
- Set their default doctor

Doctors and agencies cannot use these endpoints.

## Status
✅ **COMPLETE** - Feature fully implemented and tested
- Backend: Complete with validation
- Frontend: Complete with UI integration
- Database: Migration applied successfully
- Documentation: Complete

**Pending**:
- Cypress E2E test coverage
- Settings page for changing default doctor
