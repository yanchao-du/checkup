# New Submission Form Reset Fix

## Issue Report
> "when i open a draft to edit, the title shows 'edit medical examination'. when i click 'New Submission' on the left panel, instead of opening a new draft, it stays on the same draft with the title changed to 'New medical examination'. pls fix"

## Problem Analysis

### Observed Behavior
1. User opens a draft for editing (e.g., `/draft/123`)
   - Title correctly shows "Edit Submission"
   - Form populated with draft data
2. User clicks "New Submission" from sidebar
   - URL changes to `/new-submission`
   - Title changes to "New Medical Examination"
   - **BUT: Form still shows old draft data** ❌

### Root Cause

**Component Reuse by React Router**:
- Both routes use the same component:
  - `/new-submission` → `<NewSubmission />`
  - `/draft/:id` → `<NewSubmission />`
  
- React Router **reuses** the component instance when navigating between these routes
- Component doesn't unmount/remount, so state persists

**Missing Reset Logic**:
The `useEffect` only handled the case when `id` exists (loading a draft):
```typescript
useEffect(() => {
  const loadSubmission = async () => {
    if (id) {
      // Load draft data
    }
    // ❌ No else clause to reset when id is undefined
  };
  loadSubmission();
}, [id, navigate]);
```

When navigating from `/draft/123` → `/new-submission`:
- `id` changes from `"123"` to `undefined`
- `useEffect` runs but does nothing (no `if` condition met)
- Old state remains in all form fields
- Title updates (due to conditional rendering) but form doesn't reset

## Solution

Added an `else` clause to reset all form fields when `id` is `undefined`:

```typescript
useEffect(() => {
  const loadSubmission = async () => {
    if (id) {
      // Load existing draft
      try {
        setIsLoading(true);
        const existing = await submissionsApi.getById(id);
        setExamType(existing.examType);
        setPatientName(existing.patientName);
        setPatientNric(existing.patientNric);
        setPatientDateOfBirth(existing.patientDateOfBirth);
        setExaminationDate(existing.examinationDate || '');
        setAssignedDoctorId(existing.assignedDoctorId || '');
        setFormData(existing.formData);
      } catch (error) {
        console.error('Failed to load submission:', error);
        toast.error('Failed to load submission');
        navigate('/drafts');
      } finally {
        setIsLoading(false);
      }
    } else {
      // ✅ Reset form when creating new submission
      setExamType('');
      setPatientName('');
      setPatientNric('');
      setPatientDateOfBirth('');
      setExaminationDate('');
      setAssignedDoctorId('');
      setFormData({});
    }
  };

  loadSubmission();
}, [id, navigate]);
```

## Files Modified

**File**: `frontend/src/components/NewSubmission.tsx`

**Changes**:
- Added `else` block to reset all form state when `id` is `undefined`
- Resets all fields to empty values:
  - `examType` → `''`
  - `patientName` → `''`
  - `patientNric` → `''`
  - `patientDateOfBirth` → `''`
  - `examinationDate` → `''`
  - `assignedDoctorId` → `''`
  - `formData` → `{}`

## Expected Behavior After Fix

### Scenario 1: Draft → New Submission
1. User opens draft `/draft/123`
   - Title: "Edit Submission"
   - Form: Populated with draft data
2. User clicks "New Submission"
   - URL changes to `/new-submission`
   - Title: "New Medical Examination"
   - **Form: All fields cleared** ✅

### Scenario 2: New Submission → Draft
1. User on `/new-submission`
   - Title: "New Medical Examination"
   - Form: Empty
2. User navigates to draft `/draft/456`
   - Title: "Edit Submission"
   - Form: Populated with draft 456 data ✅

### Scenario 3: Draft → Different Draft
1. User on `/draft/123`
   - Form shows draft 123 data
2. User navigates to `/draft/456`
   - Form shows draft 456 data ✅

## Why This Happens (React Router Behavior)

React Router optimizes rendering by reusing component instances when:
- The same component is used for multiple routes
- Only route parameters change

**Example**:
```tsx
<Route path="/new-submission" element={<NewSubmission />} />
<Route path="/draft/:id" element={<NewSubmission />} />
```

When navigating:
- `/draft/123` → `/draft/456`: Same component, `id` param changes
- `/draft/123` → `/new-submission`: Same component, `id` becomes undefined
- `/new-submission` → `/draft/123`: Same component, `id` gets value

The component **doesn't unmount**, it just receives new props/params.

## Alternative Solutions Considered

### Option 1: Use `key` prop (Not Recommended)
```tsx
<Route path="/new-submission" element={<NewSubmission key="new" />} />
<Route path="/draft/:id" element={<NewSubmission key="edit" />} />
```
- Forces unmount/remount
- Loses any in-progress work
- More expensive (full component recreation)

### Option 2: Separate Components (Overkill)
```tsx
<Route path="/new-submission" element={<CreateSubmission />} />
<Route path="/draft/:id" element={<EditSubmission />} />
```
- Code duplication
- Harder to maintain
- Both components are 99% identical

### ✅ Option 3: Reset in useEffect (Chosen)
- Minimal code change
- Preserves component reuse benefits
- Explicit control over state
- Easy to understand and maintain

## Testing Checklist

### Manual Testing:
- [ ] Navigate to "New Submission" - form is empty
- [ ] Fill out some fields (don't save)
- [ ] Navigate to "New Submission" again - form is empty (fresh start)
- [ ] Open an existing draft - form shows draft data
- [ ] Click "New Submission" - form clears
- [ ] Open draft A, then draft B - form shows B's data
- [ ] Fill new submission partially, open draft - shows draft data
- [ ] Open draft, click "New Submission" - form is empty

### Edge Cases:
- [ ] Navigate to `/new-submission` directly (URL bar)
- [ ] Navigate to `/draft/123` directly (URL bar)
- [ ] Use browser back/forward buttons
- [ ] Open draft with missing optional fields
- [ ] Navigate between drafts rapidly

## Impact Assessment

### Positive:
✅ Fixes confusing UX where old data persists  
✅ Form now behaves as expected  
✅ Consistent with user mental model  
✅ No breaking changes  
✅ Minimal code change  

### Risk:
⚠️ Very low - only affects form initialization logic  
⚠️ No API changes  
⚠️ No data migration needed  

## Related Components

This fix specifically affects:
- **NewSubmission.tsx** - The form component
- Routes that use it:
  - `/new-submission` - Create new submission
  - `/draft/:id` - Edit existing draft

Does NOT affect:
- Dashboard navigation
- Drafts list
- Submission viewing
- Approval workflows

## Status
✅ **Fixed**  
✅ **No compilation errors**  
✅ **Ready for testing**

The form now properly resets when navigating to "New Submission" from any draft!
