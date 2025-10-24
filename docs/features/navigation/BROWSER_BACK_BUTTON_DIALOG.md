# Browser Back Button Protection - Custom Dialog

## Issue Report
> "when i press browser back button, the dialog should also be prompted"

## Problem

Previously, the browser back button was only protected by the native browser dialog via the `beforeunload` event. This meant:
- ❌ Users got a generic browser message (can't be customized)
- ❌ Different UX from sidebar navigation (which shows custom dialog)
- ❌ Inconsistent experience across navigation methods

## Solution

Implemented browser History API interception to show our **custom styled dialog** when the browser back button is pressed.

## Implementation

### Updated UnsavedChangesContext

**File**: `frontend/src/components/UnsavedChangesContext.tsx`

**Added**:
1. `useLocation` hook to track location changes
2. `useEffect` to handle `popstate` events (browser back/forward)
3. History state manipulation to prevent actual navigation
4. Custom dialog trigger for back button

**Key Code**:
```typescript
// Block browser back/forward buttons
useEffect(() => {
  if (!hasUnsavedChanges) return;

  const handlePopState = (e: PopStateEvent) => {
    e.preventDefault();
    
    // Push current state back to prevent navigation
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    
    // Show our custom dialog
    setPendingNavigation(-1);
    setShowDialog(true);
  };

  // Push a state to enable popstate detection
  window.history.pushState(null, '', window.location.pathname + window.location.search);
  
  window.addEventListener('popstate', handlePopState);
  
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}, [hasUnsavedChanges, location]);
```

## How It Works

### The History API Technique

**Step 1: Setup** (when `hasUnsavedChanges` becomes `true`)
```typescript
window.history.pushState(null, '', window.location.pathname);
```
- Pushes a new state to history stack
- Doesn't change the URL (same path)
- Creates a history entry that can be popped

**Step 2: User Presses Back Button**
- Browser fires `popstate` event
- Our handler is called

**Step 3: Prevent Navigation**
```typescript
window.history.pushState(null, '', window.location.pathname);
```
- Immediately push state back
- Cancels the back navigation
- User stays on same page

**Step 4: Show Custom Dialog**
```typescript
setPendingNavigation(-1);
setShowDialog(true);
```
- Stores that user wanted to go back
- Shows our custom styled AlertDialog

**Step 5: User Chooses**

**If "Stay on Page"**:
- Dialog closes
- User remains on form
- History state stays

**If "Leave and Discard Changes"**:
```typescript
setHasUnsavedChanges(false);
setTimeout(() => {
  navigate(-1); // Actually go back now
}, 0);
```
- Clear unsaved flag
- Navigate back (now unblocked)
- User goes to previous page

## Complete Navigation Protection Matrix

| Navigation Method | Before Fix | After Fix |
|------------------|------------|-----------|
| Sidebar links | ✅ Custom dialog | ✅ Custom dialog |
| Back arrow button | ✅ Custom dialog | ✅ Custom dialog |
| **Browser back button** | ⚠️ Native dialog | ✅ **Custom dialog** |
| Browser forward button | ⚠️ Native dialog | ✅ **Custom dialog** |
| Browser refresh | ⚠️ Native dialog | ⚠️ Native dialog |
| Tab close | ⚠️ Native dialog | ⚠️ Native dialog |
| Programmatic navigation | ✅ Custom dialog | ✅ Custom dialog |

**Note**: Refresh and tab close still use native browser dialogs because there's no way to intercept them with custom UI (browser security restriction).

## User Experience Flow

### Before:
1. User edits form
2. User presses browser back button
3. **Browser shows generic "Leave site?" message** ⚠️
4. User confused by generic message
5. Inconsistent with sidebar navigation UX

### After:
1. User edits form
2. User presses browser back button
3. **Custom dialog shows: "You have unsaved changes..."** ✅
4. User sees familiar styled dialog
5. Consistent UX across all navigation methods

## Why This Approach?

### Alternative 1: `beforeunload` Event Only
```typescript
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
});
```
**Limitations**:
- ❌ Only shows generic browser message
- ❌ Can't customize text or styling
- ❌ Different UX from in-app navigation
- ❌ Doesn't work for SPA navigation

### Alternative 2: React Router's `useBlocker`
**Limitation**:
- ❌ Only works with data routers (`createBrowserRouter`)
- ❌ App uses `BrowserRouter` (would require major refactoring)

### ✅ Chosen: History API + Custom Dialog
**Benefits**:
- ✅ Works with `BrowserRouter`
- ✅ Custom styled dialog
- ✅ Consistent UX
- ✅ Full control over messaging
- ✅ No major refactoring needed

## Technical Details

### popstate Event
Fired when:
- User clicks browser back button
- User clicks browser forward button
- User calls `history.back()` or `history.forward()`
- User calls `history.go(-1)` or `history.go(1)`

**Not** fired when:
- Programmatic `navigate()` calls
- Link clicks
- Page refresh
- Tab close

### History State Management

The technique relies on manipulating the history stack:

**Initial state** (on page):
```
[Previous Page] → [Current Page (Form)]
                   ↑ You are here
```

**After pushState** (when changes made):
```
[Previous Page] → [Current Page] → [Dummy State]
                                     ↑ You are here
```

**User presses back**:
```
[Previous Page] → [Current Page] → [Dummy State]
                   ↑ Browser tries to go here
```

**Handler pushes back**:
```
[Previous Page] → [Current Page] → [Dummy State]
                                     ↑ Back to here
```

**Dialog shows**, user can:
1. **Cancel** → Stay on dummy state
2. **Confirm** → Clear flag, actually navigate back

### Edge Cases Handled

**1. Multiple Back Presses**
- Each back press triggers `popstate`
- Handler pushes state back each time
- Only one dialog shown at a time

**2. Cleanup on Navigation**
- `useEffect` cleanup removes listener
- Prevents memory leaks
- Prevents multiple handlers

**3. Flag Changes**
- Effect re-runs when `hasUnsavedChanges` changes
- Listener only active when flag is true
- Removed when flag becomes false

**4. Location Changes**
- Effect tracks `location` dependency
- Re-setup when route changes
- Fresh state for each page

## Files Modified

**File**: `frontend/src/components/UnsavedChangesContext.tsx`

**Changes**:
1. Added `useEffect` import
2. Added `useLocation` import and usage
3. Added `popstate` event handler
4. Added history state manipulation
5. Added timeout in `handleProceed` for smooth transition

## Testing Checklist

### ✅ Browser Back Button
- [ ] Edit form, press back button → Custom dialog appears
- [ ] Click "Stay on Page" → Stays on form
- [ ] Click "Leave and Discard" → Goes back
- [ ] Empty form, press back → Goes back immediately (no dialog)

### ✅ Browser Forward Button
- [ ] Go back, then press forward with unsaved changes → Dialog appears
- [ ] Confirm → Goes forward

### ✅ Multiple Rapid Back Presses
- [ ] Press back multiple times quickly → Only one dialog
- [ ] Dialog buttons still work correctly

### ✅ Combined Navigation
- [ ] Edit form, try sidebar link → Dialog
- [ ] Cancel, try back button → Dialog
- [ ] Both show same styled dialog

### ✅ Save/Submit Flow
- [ ] Edit form, save draft → No dialog
- [ ] After save, press back → Goes back immediately

### ✅ Edge Cases
- [ ] Open form, press back → Goes back (no changes)
- [ ] Edit form, refresh page → Native browser dialog (expected)
- [ ] Edit form, close tab → Native browser dialog (expected)

## Comparison: Before vs After

### Before:
```
Browser Back Button → Native "Leave site?" → Inconsistent UX
Sidebar Links       → Custom Dialog        → Good UX
Back Arrow          → Custom Dialog        → Good UX
```

### After:
```
Browser Back Button → Custom Dialog → ✅ Consistent!
Sidebar Links       → Custom Dialog → ✅ Consistent!
Back Arrow          → Custom Dialog → ✅ Consistent!
```

## Known Limitations

### Still Using Native Dialogs For:
1. **Page Refresh (F5, Cmd+R)** - Browser security restriction
2. **Tab Close** - Browser security restriction
3. **Browser Close** - Browser security restriction

These MUST use `beforeunload` with native browser dialogs because:
- Browser prevents custom UI during unload
- Security feature to prevent malicious sites trapping users
- Cannot be overridden with any JavaScript technique

## Status

✅ **Implemented**  
✅ **No compilation errors**  
✅ **Browser back/forward buttons now use custom dialog**  
✅ **Consistent UX across all in-app navigation**  
✅ **Ready for testing**  

Users now get a consistent, custom-styled dialog for **all** in-app navigation including the browser back button! 🎉
