# Toast Notifications Color Guide

**Date:** October 24, 2025
**Feature:** Enhanced toast notifications with color-coded message types

## Overview

Toast notifications now use different colors to provide better visual cues to users about the type of message being displayed.

## Toast Types and Colors

### ✅ Success (Green)
**Usage:** Successful operations and confirmations

**Color:** Green background with white text

**Examples:**
```typescript
toast.success('User updated successfully');
toast.success('Draft saved successfully');
toast.success('Medical exam approved and submitted successfully');
toast.success('Primary clinic updated');
```

**When to use:**
- Data successfully saved/updated/deleted
- Operations completed successfully
- Confirmations of user actions

### ❌ Error (Red)
**Usage:** System errors and failures

**Color:** Red background with white text

**Examples:**
```typescript
toast.error('Failed to load users');
toast.error('Failed to save clinic');
toast.error('Failed to approve submission');
```

**When to use:**
- API/Network errors
- System failures
- Operations that failed unexpectedly
- Permission errors

### ⚠️ Warning (Yellow/Orange)
**Usage:** Validation errors and user input issues

**Color:** Yellow/Orange background with dark text

**Examples:**
```typescript
toast.warning('Please fill in all fields');
toast.warning('Please enter a valid email address');
toast.warning('MCR number must be in format: Letter + 5 digits + Letter (e.g., M12345A)');
toast.warning('Please select a doctor');
```

**When to use:**
- Form validation failures
- Required field messages
- Format validation errors
- User input corrections needed

### ℹ️ Info (Blue)
**Usage:** Informational messages and status updates

**Color:** Blue background with white text

**Examples:**
```typescript
toast.info('Submission reopened - redirecting to edit page...');
toast.info('Loading your data...');
```

**When to use:**
- Status updates
- Informational messages
- Navigation notifications
- Process updates

## Configuration

### Toaster Setup
```typescript
<Toaster 
  position="top-right"     // Toast appears in top-right corner
  expand={false}           // Compact view
  richColors               // Enable color variants
  closeButton             // Show close button on all toasts
/>
```

### Benefits of richColors
- **Better UX:** Users can quickly identify message importance
- **Accessibility:** Color + text provides dual information channels
- **Visual Hierarchy:** Different colors create clear distinction between message types
- **Professional Look:** Modern toast system matches industry standards

## Migration from Old System

### Before
All validation errors used `toast.error()`:
```typescript
if (!formData.name) {
  toast.error('Please fill in all fields');  // ❌ Red color for validation
}
```

### After
Validation uses `toast.warning()`:
```typescript
if (!formData.name) {
  toast.warning('Please fill in all fields');  // ⚠️ Yellow color for validation
}
```

## Files Updated

### Configuration
1. **frontend/src/App.tsx**
   - Added `richColors` prop to Toaster
   - Added `closeButton` prop
   - Set `position="top-right"`
   - Set `expand={false}`

### Components with Warning Toasts
2. **frontend/src/components/UserManagement.tsx**
   - `toast.warning('Please fill in all fields')`
   - `toast.warning('Please enter a valid email address')`
   - `toast.warning('Password is required for new users')`
   - `toast.warning('MCR number must be in format...')`

3. **frontend/src/components/ClinicManagement.tsx**
   - `toast.warning('Clinic name is required')`
   - `toast.warning('HCI code must be 7 alphanumeric characters...')`
   - `toast.warning('Please enter a valid email address')`

4. **frontend/src/components/DoctorClinicAssignment.tsx**
   - `toast.warning('Please select a clinic')`

5. **frontend/src/components/NewSubmission.tsx**
   - `toast.warning('Please select a doctor to route this submission to')`

6. **frontend/src/components/SetDefaultDoctorDialog.tsx**
   - `toast.warning('Please select a doctor')`

7. **frontend/src/components/Settings.tsx**
   - `toast.warning('Please select a doctor')`

8. **frontend/src/components/ViewSubmission.tsx**
   - `toast.warning('Please provide a reason for rejection')`

### Components with Info Toasts
9. **frontend/src/components/Dashboard.tsx**
   - `toast.info('Submission reopened - redirecting to edit page...')`

## Best Practices

### ✅ DO
- Use `warning` for all form validation and user input errors
- Use `error` for system failures and API errors
- Use `success` for successful operations
- Use `info` for informational status updates
- Keep messages concise and actionable

### ❌ DON'T
- Don't use `error` for validation messages
- Don't use `success` for warnings
- Don't make messages too long
- Don't use toasts for every minor action

## Testing

### Visual Testing Checklist
- [ ] Success toasts show green background
- [ ] Error toasts show red background
- [ ] Warning toasts show yellow/orange background
- [ ] Info toasts show blue background
- [ ] Close button appears on all toasts
- [ ] Toasts appear in top-right corner
- [ ] Multiple toasts stack properly

### Functional Testing
1. **Test Validation (Warning):**
   - Try to save a user without filling required fields
   - Should see yellow/orange warning toast

2. **Test Success:**
   - Successfully save a user
   - Should see green success toast

3. **Test Error:**
   - Trigger a network error (e.g., stop backend)
   - Should see red error toast

4. **Test Info:**
   - Reopen a rejected submission
   - Should see blue info toast about redirection

## Future Enhancements

Consider adding:
- **Loading toasts:** `toast.loading('Saving...')` with spinner
- **Promise toasts:** Auto-update from loading → success/error
- **Action toasts:** Toasts with undo buttons
- **Rich content:** Toasts with icons or custom components

## Related Documentation
- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [UI Design System](./UI_DESIGN_SYSTEM.md)
- [User Experience Guidelines](./QUICK_REFERENCE.md)
