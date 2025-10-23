# Dashboard "Reopen & Fix" Button Enhancement

## Issue
When clicking the "Reopen & Fix" button on rejected submissions in the nurse's dashboard alert card, it was navigating to the view submission page instead of directly opening the edit page.

## User Expectation
> "when click 'reopen and fix', it should show edit submission instead"

The user expected that clicking "Reopen & Fix" would:
1. Reopen the rejected submission (change status from 'rejected' to 'draft')
2. Navigate directly to the edit page (`/draft/{id}`)

## Previous Behavior
```typescript
{submission.status === 'rejected' && (
  <Link to={`/view-submission/${submission.id}`}>
    <Button size="sm" className="bg-red-600 hover:bg-red-700">
      Reopen & Fix
    </Button>
  </Link>
)}
```

**Problem**: Button was just a link to the view page, requiring additional clicks to actually edit.

## Updated Behavior
```typescript
{submission.status === 'rejected' && (
  <Button 
    size="sm" 
    className="bg-red-600 hover:bg-red-700"
    onClick={() => handleReopenAndFix(submission.id)}
    disabled={reopeningId === submission.id}
  >
    {reopeningId === submission.id ? 'Reopening...' : 'Reopen & Fix'}
  </Button>
)}
```

**Solution**: Button now calls a handler that:
1. Calls the reopen API
2. Shows success toast
3. Navigates directly to edit page

## Implementation Details

### File: `frontend/src/components/Dashboard.tsx`

#### 1. Added Imports
```typescript
import { Link, useNavigate } from 'react-router-dom';  // Added useNavigate
import { toast } from 'sonner';  // Added toast for notifications
```

#### 2. Added State and Hooks
```typescript
export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();  // ← Added
  const [submissions, setSubmissions] = useState<MedicalSubmission[]>([]);
  const [drafts, setDrafts] = useState<MedicalSubmission[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<MedicalSubmission[]>([]);
  const [rejectedSubmissions, setRejectedSubmissions] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reopeningId, setReopeningId] = useState<string | null>(null);  // ← Added
```

#### 3. Added Handler Function
```typescript
const handleReopenAndFix = async (submissionId: string) => {
  try {
    setReopeningId(submissionId);
    await submissionsApi.reopenSubmission(submissionId);
    toast.success('Submission reopened - redirecting to edit page...');
    
    // Navigate directly to edit page
    navigate(`/draft/${submissionId}`);
  } catch (error) {
    console.error('Failed to reopen submission:', error);
    toast.error('Failed to reopen submission');
    setReopeningId(null);
  }
};
```

#### 4. Updated Button in Alert Card
```typescript
<div className="flex gap-2">
  <Link to={`/view-submission/${submission.id}`}>
    <Button variant="outline" size="sm" className="text-slate-600">
      View
    </Button>
  </Link>
  {submission.status === 'rejected' && (
    <Button 
      size="sm" 
      className="bg-red-600 hover:bg-red-700"
      onClick={() => handleReopenAndFix(submission.id)}
      disabled={reopeningId === submission.id}
    >
      {reopeningId === submission.id ? 'Reopening...' : 'Reopen & Fix'}
    </Button>
  )}
</div>
```

## User Experience Flow

### Before (2 steps required):
1. Click "Reopen & Fix" → Goes to view submission page
2. Click "Reopen Submission" button on view page → Changes status
3. Click "Edit Draft" button → Goes to edit page

### After (1 click):
1. Click "Reopen & Fix" → Automatically:
   - Calls reopen API
   - Shows toast: "Submission reopened - redirecting to edit page..."
   - Navigates to edit page at `/draft/{id}`

## Features

### Loading State
- Button shows "Reopening..." text while API call is in progress
- Button is disabled during the reopening process
- Prevents double-clicks and duplicate API calls

### Error Handling
- Shows error toast if reopen fails: "Failed to reopen submission"
- Resets loading state on error
- User can retry by clicking again

### Success Flow
- Shows success toast with clear message
- Immediately navigates to edit page
- No delay or additional clicks required

## Consistency with RejectedSubmissions Component

This implementation matches the pattern used in `RejectedSubmissions.tsx`:

```typescript
// From RejectedSubmissions.tsx
const handleReopen = async (submissionId: string) => {
  try {
    setReopeningId(submissionId);
    await submissionsApi.reopenSubmission(submissionId);
    toast.success('Submission reopened - you can now edit it');
    
    // Refresh the list to show updated status
    const response = user?.role === 'doctor' 
      ? await approvalsApi.getRejected({ page: 1, limit: 100 })
      : await submissionsApi.getRejected({ page: 1, limit: 100 });
    setRejectedSubmissions(response.data);
    
    // Redirect to draft edit page after a brief delay
    setTimeout(() => navigate(`/draft/${submissionId}`), 1000);
  } catch (error) {
    console.error('Failed to reopen submission:', error);
    toast.error('Failed to reopen submission');
  } finally {
    setReopeningId(null);
  }
};
```

**Key Difference**: Dashboard implementation navigates immediately without delay, as the user has already seen the submission details in the alert card and just wants to edit it quickly.

## Benefits

### For Nurses
✅ **Faster workflow**: One click instead of three  
✅ **Direct to editing**: No intermediate steps  
✅ **Clear feedback**: Toast shows what's happening  
✅ **Better UX**: Button state shows loading progress  
✅ **Error recovery**: Clear error messages if something fails  

### For System
✅ **Consistent pattern**: Matches RejectedSubmissions component  
✅ **Proper error handling**: Graceful failure states  
✅ **Loading states**: Prevents race conditions  
✅ **Clean code**: Reusable handler pattern  

## Testing Checklist

- [ ] Click "Reopen & Fix" on a rejected submission
- [ ] Verify button shows "Reopening..." during API call
- [ ] Verify button is disabled during reopening
- [ ] Verify toast shows "Submission reopened - redirecting to edit page..."
- [ ] Verify navigation to `/draft/{id}` page
- [ ] Verify edit form loads with submission data
- [ ] Test with slow network - button should show loading state
- [ ] Test with API error - should show error toast and reset button
- [ ] Verify "View" button still works and goes to view page
- [ ] Verify only rejected submissions (status='rejected') show the button

## Related Files

- **Modified**: `frontend/src/components/Dashboard.tsx`
- **Updated**: `NURSE_DASHBOARD_REJECTED_VISIBILITY.md`
- **Pattern Source**: `frontend/src/components/RejectedSubmissions.tsx`

## API Endpoint Used

```typescript
// From frontend/src/services/index.ts
reopenSubmission: async (id: string) => {
  const response = await fetch(`${API_URL}/submissions/${id}/reopen`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
}
```

## Status
✅ **Implemented**  
✅ **No compilation errors**  
✅ **Documentation updated**  
⏳ **Pending user testing**
