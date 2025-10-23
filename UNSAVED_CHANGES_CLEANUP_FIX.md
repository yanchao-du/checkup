# Unsaved Changes Cleanup Fix

## Issue
When navigating from Dashboard → Drafts (or any other route), users were being prompted with an "Unsaved Changes" dialog even though they hadn't made any changes. This was particularly noticeable for nurses after logging in.

## Root Cause
The `hasUnsavedChanges` state is managed globally in the `UnsavedChangesContext`. When a user:

1. Visited the NewSubmission form and the component set `hasUnsavedChanges = true`
2. Navigated away (to Dashboard, Submissions, etc.)
3. The `hasUnsavedChanges` flag remained `true` in the context
4. Tried to navigate to another route (like Drafts)
5. The context blocked navigation with the "Unsaved Changes" dialog

The problem was that the NewSubmission component never cleaned up its state when unmounting.

## Solution
Added a cleanup `useEffect` hook that resets `hasUnsavedChanges` to `false` when the NewSubmission component unmounts.

### Code Change (NewSubmission.tsx)

```typescript
// Reset unsaved changes when component unmounts
useEffect(() => {
  return () => {
    setHasUnsavedChanges(false);
  };
}, [setHasUnsavedChanges]);
```

This ensures that:
- When the user navigates away from the NewSubmission form, the unsaved changes flag is cleared
- Other routes won't be blocked by stale "unsaved changes" state
- The flag will be set again if the user returns to NewSubmission and makes changes

## Testing
### Manual Test Steps
1. Login as a nurse
2. Navigate to "New Submission"
3. Enter some data in the form (triggering unsaved changes)
4. Navigate to Dashboard (should show unsaved changes dialog)
5. Click "Leave" to proceed to Dashboard
6. Navigate to Drafts
7. ✅ Should NOT show "Unsaved Changes" dialog anymore

### Without This Fix
Step 6 would show the dialog because the flag was never cleared.

### With This Fix
Step 6 navigates directly to Drafts without showing the dialog.

## Impact
- **Positive**: Improved user experience, no more false "unsaved changes" prompts
- **No Breaking Changes**: The cleanup only happens on unmount, actual unsaved changes detection still works correctly
- **Scope**: Affects all users (nurses, doctors) using the NewSubmission form

## Files Modified
- `frontend/src/components/NewSubmission.tsx` - Added cleanup useEffect

## Related Issues
- Default Doctor Feature implementation may have highlighted this issue by auto-loading data into the form
- Any form that uses UnsavedChangesContext should implement similar cleanup

## Date
23 October 2025
