# Settings Page for Default Doctor Management

## Overview
Added a dedicated Settings page for nurses to view and change their default doctor preference at any time.

## User Story
**As a nurse**, I want to be able to view and change my default doctor from a settings page, so I don't have to go through the submission flow every time I want to update my preference.

## Implementation

### Frontend Changes

#### 1. Settings Page Component (Settings.tsx)
**Created**: `frontend/src/components/Settings.tsx` (175 lines)

**Features**:
- Displays current default doctor
- Dropdown to select a new default doctor
- "Save Changes" button (only enabled when selection changes)
- "Clear Default" button (removes default doctor setting)
- Loading states and error handling
- Role restriction (only nurses can access)
- Toast notifications for success/error

**Key Functionality**:
```typescript
- loadData(): Fetches doctors list and current default doctor
- handleSave(): Saves the selected doctor as default
- handleClear(): Removes the default doctor setting (sets to null)
```

**UI Elements**:
- Card layout with title and description
- Doctor dropdown with email display
- Current default indicator
- Informational note when no default is set
- Disabled states during API calls

#### 2. Navigation Menu Update (DashboardLayout.tsx)
**Added**: Settings menu item for nurses only

```typescript
{ path: '/settings', label: 'Settings', icon: Settings, roles: ['nurse'] }
```

**Icon**: Settings gear icon from lucide-react

**Position**: Between "Rejected Submissions" and "User Management" in the sidebar

**Visibility**: Only visible to users with role='nurse'

#### 3. Routing (App.tsx)
**Added**: Protected route for Settings page

```typescript
<Route 
  path="/settings" 
  element={
    <RoleProtectedRoute allowedRoles={['nurse']}>
      <Settings />
    </RoleProtectedRoute>
  } 
/>
```

**Protection**: Only accessible to nurses, redirects others to dashboard

### Backend Changes
**No changes needed** - The existing API endpoints already support:
- Getting default doctor: `GET /users/me/default-doctor`
- Setting default doctor: `PUT /users/me/default-doctor` with `{ defaultDoctorId: string }`
- Clearing default doctor: `PUT /users/me/default-doctor` with `{ defaultDoctorId: "" }`

The backend validation already allows empty string to clear the default.

## User Flow

### Accessing Settings
1. Nurse logs in
2. Clicks "Settings" in the left sidebar
3. Settings page loads with current default doctor (if set)

### Setting Default Doctor
1. Select a doctor from the dropdown
2. "Save Changes" button becomes enabled
3. Click "Save Changes"
4. Success toast appears
5. Current default indicator updates

### Changing Default Doctor
1. Select a different doctor from the dropdown
2. See current default vs new selection
3. Click "Save Changes"
4. Success toast confirms change

### Clearing Default Doctor
1. Click "Clear Default" button
2. Confirmation (implicit through immediate action)
3. Default doctor is removed
4. Dropdown resets to empty
5. Informational note appears explaining behavior

### Error Handling
- Loading state while fetching data
- Error toast if API call fails
- Button disabled during save operation
- Graceful fallback if doctor list is empty

## UI/UX Improvements

### Visual Feedback
- Current default doctor name shown below dropdown
- Save button only enabled when changes are made
- Loading spinner during data fetch and save operations
- Clear success/error messages via toast notifications

### User Guidance
- Informational note when no default is set
- Explains that prompt will appear on first submission
- Clear labeling of current vs new selection
- Descriptive card description

### Accessibility
- Proper form labels
- data-testid attributes for testing
- Disabled states clearly indicated
- Keyboard navigation support (via Shadcn components)

## Benefits

1. **Convenience**: Change default doctor anytime without creating a submission
2. **Visibility**: See current setting at a glance
3. **Control**: Easy to update or remove default
4. **Discoverability**: Clear menu item in navigation
5. **Consistency**: Matches admin "User Management" pattern
6. **Role-specific**: Only shown to nurses who need it

## Testing Checklist

### Manual Testing
- [ ] Settings menu item appears for nurses only
- [ ] Settings menu item does NOT appear for doctors or admins
- [ ] Clicking Settings loads the page
- [ ] Current default doctor is displayed correctly
- [ ] Doctor dropdown shows all active doctors
- [ ] Save button is disabled when no changes
- [ ] Save button is enabled when selection changes
- [ ] Saving updates the default successfully
- [ ] Success toast appears on save
- [ ] Clear Default button removes the default
- [ ] Error handling works for API failures
- [ ] Loading states display correctly
- [ ] Non-nurses cannot access /settings route directly

### Cypress E2E Tests (Future)
1. **Navigation Test**
   - Nurse sees Settings in menu
   - Doctor does not see Settings in menu
   - Click Settings navigates to /settings

2. **Load Default Doctor**
   - Settings page loads
   - Current default doctor is displayed
   - Dropdown is pre-filled with current default

3. **Update Default Doctor**
   - Select a different doctor
   - Save button becomes enabled
   - Click Save
   - Success message appears
   - Current default updates

4. **Clear Default Doctor**
   - Click Clear Default
   - Dropdown resets
   - Informational note appears
   - Save on new submission shows prompt

5. **Error Handling**
   - Simulate API error
   - Error toast appears
   - UI remains functional

## Files Modified/Created

### Created
- `frontend/src/components/Settings.tsx` - Settings page component

### Modified
- `frontend/src/components/DashboardLayout.tsx` - Added Settings menu item
- `frontend/src/App.tsx` - Added Settings route

## Related Features
- DEFAULT_DOCTOR_FEATURE.md - Main feature documentation
- SetDefaultDoctorDialog.tsx - First-time setup dialog
- NewSubmission.tsx - Auto-fills default doctor

## Future Enhancements

1. **Confirmation Dialog**: Add confirmation before clearing default
2. **Change History**: Track when default was last changed
3. **Multiple Defaults**: Support different defaults per exam type
4. **Quick Settings**: Add settings link in user profile dropdown
5. **Settings Categories**: Expand to include other nurse preferences
   - Notification preferences
   - Display preferences
   - Default exam type

## Date
23 October 2025
