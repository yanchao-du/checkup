# Toast Notifications & Badge Color Guide

**Date:** October 24, 2025
**Feature:** Enhanced visual feedback with color-coded messages and status badges

## Overview

The application now uses consistent color schemes across toast notifications and status badges to provide better visual cues to users.

---

## Part 1: Toast Notifications

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

---

## Part 2: Status Badges

### Submission Status Badges

Status badges now use consistent, color-coded designs to quickly communicate submission state:

#### 🟢 Submitted (Green)
**Visual:** Light green background with dark green text
**CSS:** `bg-green-50 text-green-700 border-green-200`
**Meaning:** Successfully submitted to agency
**Example:** Medical exam completed and sent

#### 🟡 Pending Approval (Yellow)
**Visual:** Light yellow background with dark yellow/orange text
**CSS:** `bg-yellow-50 text-yellow-700 border-yellow-200`
**Meaning:** Awaiting doctor approval
**Example:** Nurse submitted, waiting for doctor review

#### 🔴 Rejected (Red)
**Visual:** Light red background with dark red text
**CSS:** `bg-red-50 text-red-700 border-red-200`
**Meaning:** Rejected by doctor, needs revision
**Example:** Doctor found issues, returned to nurse

#### ⚪ Draft (Gray)
**Visual:** Light gray background with dark gray text
**CSS:** `bg-slate-100 text-slate-700 border-slate-300`
**Meaning:** Saved but not submitted
**Example:** Work in progress

### User Status Badges

#### 🟢 Active (Green)
**Visual:** Light green background with dark green text
**CSS:** `bg-green-50 text-green-700 border-green-200`
**Meaning:** User account is active
**Example:** Can log in and perform actions

#### ⚪ Inactive (Gray)
**Visual:** Light gray background with dark gray text  
**CSS:** `bg-slate-100 text-slate-700 border-slate-300`
**Meaning:** User account is disabled
**Example:** Cannot log in

### Special Status Badges

#### 🟣 Reopened (Purple)
**Visual:** Light purple background with dark purple text
**CSS:** `bg-purple-50 text-purple-700 border-purple-200`
**Meaning:** Previously rejected, now reopened for editing
**Example:** Doctor rejected → Nurse reopened to fix

---

## Badge Utility Functions

### Usage

```typescript
import { 
  getSubmissionStatusBadgeClass, 
  getSubmissionStatusLabel,
  getUserStatusBadgeClass,
  getUserStatusLabel 
} from '../lib/badge-utils';

// For submission status
<Badge 
  variant="outline"
  className={getSubmissionStatusBadgeClass(submission.status)}
>
  {getSubmissionStatusLabel(submission.status)}
</Badge>

// For user status
<Badge 
  variant="outline"
  className={getUserStatusBadgeClass(user.status)}
>
  {getUserStatusLabel(user.status)}
</Badge>
```

### Available Functions

1. **`getSubmissionStatusBadgeClass(status)`**
   - Input: `'draft' | 'pending_approval' | 'submitted' | 'rejected'`
   - Output: Tailwind CSS classes string
   - Purpose: Get consistent styling for submission badges

2. **`getSubmissionStatusLabel(status)`**
   - Input: `'draft' | 'pending_approval' | 'submitted' | 'rejected'`
   - Output: Human-readable label
   - Purpose: Convert status to display text (e.g., `'pending_approval'` → `'Pending Approval'`)

3. **`getUserStatusBadgeClass(status)`**
   - Input: `'active' | 'inactive'`
   - Output: Tailwind CSS classes string
   - Purpose: Get consistent styling for user status badges

4. **`getUserStatusLabel(status)`**
   - Input: `'active' | 'inactive'`
   - Output: Human-readable label
   - Purpose: Capitalize status for display

---

## Components Updated with Badge Styling

### Submission Status
1. **SubmissionsList.tsx** - Submission table status column
2. **ViewSubmission.tsx** - Page header status badge
3. **Dashboard.tsx** - Timeline and submission cards
4. **RejectedSubmissions.tsx** - Custom purple/red badges

### User Status
5. **UserManagement.tsx** - User table status column

---

## Color Scheme Benefits

### Consistency
- Same status = same color across the entire app
- Users learn the color system once

### Accessibility
- Color + text provides dual information channels
- High contrast ratios for readability
- Works well for colorblind users (text labels included)

### Professional Design
- Modern, clean appearance
- Matches industry standards (GitHub, Jira, etc.)
- Soft pastel backgrounds reduce visual fatigue

### Quick Recognition
| Color | Meaning | User Action |
|-------|---------|-------------|
| 🟢 Green | Success/Complete | ✅ Nothing needed |
| 🟡 Yellow | Waiting/Warning | ⏳ Action pending |
| 🔴 Red | Error/Rejected | ⚠️ Fix required |
| ⚪ Gray | Inactive/Draft | 💤 No urgency |
| 🟣 Purple | Reopened | ♻️ Continue work |

---

## Testing Visual Feedback

### Status Badge Testing
1. **Submission Statuses:**
   - Create draft → See gray "Draft" badge
   - Route for approval → See yellow "Pending Approval"
   - Approve submission → See green "Submitted"
   - Reject submission → See red "Rejected"
   - Reopen rejected → See purple "Reopened" in rejected list

2. **User Statuses:**
   - Active user → See green "Active"
   - Inactive user → See gray "Inactive"

### Visual Consistency Check
- [ ] All "Submitted" badges are green across pages
- [ ] All "Pending Approval" badges are yellow
- [ ] All "Rejected" badges are red
- [ ] All "Draft" badges are gray
- [ ] Status labels are properly capitalized
- [ ] Badge colors match toast notification colors

---

## Design Rationale

### Why These Colors?

**Green (Success/Active):**
- Universal "go" signal
- Positive, completion indicator
- Matches success toast color

**Yellow (Pending/Warning):**
- "Caution" or "wait" signal  
- Draws attention without alarm
- Matches warning toast color

**Red (Rejected/Error):**
- Universal "stop" signal
- Clear problem indicator
- Matches error toast color

**Gray (Draft/Inactive):**
- Neutral, low-priority
- Indicates no immediate action
- Subtle, non-distracting

**Purple (Reopened):**
- Special state indicator
- Different from standard flow
- Shows "in-between" status

---

## Future Enhancements

Consider adding:
- **Animated badges:** Subtle pulse for "Pending Approval"
- **Icon badges:** Small icons next to text (✓, ⏳, ✗)
- **Hover tooltips:** Extra info on hover
- **Badge groups:** Multiple statuses in one badge
- **Priority badges:** High/Medium/Low priority indicators

---
