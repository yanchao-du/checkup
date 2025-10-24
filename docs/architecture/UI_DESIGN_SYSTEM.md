# UI Design System - Action Buttons

**Date**: October 23, 2024  
**Purpose**: Standardize colors, fonts, and icons for action buttons across all submission list views

## Design Standards

### Action Button Pattern

All action buttons follow this consistent pattern:

```tsx
<Button 
  variant="ghost" 
  size="sm"
  className="text-{color}-600 hover:text-{color}-700 hover:bg-{color}-50"
>
  <Icon className="w-4 h-4 mr-1" />
  Label
</Button>
```

### Color & Icon Mapping

| Action | Color | Icon | Usage |
|--------|-------|------|-------|
| **View** | Blue | `Eye` | View submission details (read-only) |
| **Edit/Continue** | Blue | `Edit` | Edit or continue working on draft |
| **Approve** | Green | `CheckCircle` | Approve submission for agency submission |
| **Reject** | Red | `XCircle` | Reject submission and return to drafts |
| **Delete** | Red | `Trash2` | Permanently delete draft |
| **Reopen** | Green | `RotateCcw` | Reopen rejected submission for editing |

### Color Palette

#### Blue (View/Edit)
- Text: `text-blue-600`
- Hover Text: `hover:text-blue-700`
- Hover Background: `hover:bg-blue-50`

#### Green (Approve/Reopen)
- Text: `text-green-600`
- Hover Text: `hover:text-green-700`
- Hover Background: `hover:bg-green-50`

#### Red (Reject/Delete)
- Text: `text-red-600`
- Hover Text: `hover:text-red-700`
- Hover Background: `hover:bg-red-50`

### Icon Standards

- **Size**: `w-4 h-4` (16x16px)
- **Margin**: `mr-1` (4px right margin between icon and label)
- **Placement**: Icon always appears before text label

## Implementation

### Components Updated

#### 1. SubmissionsList.tsx
```tsx
<Link to={`/view-submission/${submission.id}`}>
  <Button 
    variant="ghost" 
    size="sm"
    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
  >
    <Eye className="w-4 h-4 mr-1" />
    View
  </Button>
</Link>
```

**Actions**: View (Blue)

#### 2. DraftsList.tsx
```tsx
{/* Continue Editing */}
<Link to={`/draft/${draft.id}`}>
  <Button 
    variant="ghost" 
    size="sm"
    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
  >
    <Edit className="w-4 h-4 mr-1" />
    Continue
  </Button>
</Link>

{/* Delete Draft */}
<Button
  variant="ghost"
  size="sm"
  onClick={() => setDeleteId(draft.id)}
  className="text-red-600 hover:text-red-700 hover:bg-red-50"
>
  <Trash2 className="w-4 h-4 mr-1" />
  Delete
</Button>
```

**Actions**: Continue (Blue), Delete (Red)

#### 3. PendingApprovals.tsx
```tsx
<Link to={`/view-submission/${submission.id}`}>
  <Button 
    variant="ghost" 
    size="sm"
    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
  >
    <Eye className="w-4 h-4 mr-1" />
    View
  </Button>
</Link>

{/* Commented out - actions moved to ViewSubmission page */}
{/* Approve (Green), Reject (Red) buttons */}
```

**Actions**: View (Blue)  
**Note**: Approve/Reject actions now handled on the ViewSubmission page for better UX

#### 4. RejectedSubmissions.tsx
```tsx
{/* View Submission */}
<Link to={`/view-submission/${submission.id}`}>
  <Button 
    variant="ghost" 
    size="sm"
    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
  >
    <Eye className="w-4 h-4 mr-1" />
    View
  </Button>
</Link>

{/* Reopen for Editing */}
<Button
  size="sm"
  variant="ghost"
  onClick={() => handleReopen(submission.id)}
  disabled={reopeningId === submission.id}
  className="text-green-600 hover:text-green-700 hover:bg-green-50"
>
  {reopeningId === submission.id ? (
    <>
      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      Reopening...
    </>
  ) : (
    <>
      <RotateCcw className="w-4 h-4 mr-1" />
      Reopen
    </>
  )}
</Button>
```

**Actions**: View (Blue), Reopen (Green)

## Benefits

✅ **Consistency**: All action buttons use the same visual language  
✅ **Recognition**: Colors intuitively match actions (blue=view, green=approve/reopen, red=delete/reject)  
✅ **Accessibility**: Clear icons and text labels improve usability  
✅ **Maintainability**: Standardized patterns make updates easier  
✅ **User Experience**: Users learn the interface faster with consistent patterns

## Visual Hierarchy

1. **Primary Actions** (Blue): Most common actions users perform (View, Edit)
2. **Positive Actions** (Green): Affirmative actions that move workflow forward (Approve, Reopen)
3. **Destructive Actions** (Red): Actions that delete or reject data (Delete, Reject)

## Future Considerations

- Consider creating reusable button components like `<ViewButton />`, `<DeleteButton />` to ensure consistency
- Add data-testid attributes for Cypress testing
- Consider adding tooltips for icon-only buttons in mobile views
- Ensure color choices meet WCAG accessibility standards for contrast

## Files Modified

- `frontend/src/components/SubmissionsList.tsx` - Added Eye icon and blue styling to View button
- `frontend/src/components/DraftsList.tsx` - Added Edit icon to Continue, standardized Delete button
- `frontend/src/components/PendingApprovals.tsx` - Added blue styling to View button
- `frontend/src/components/RejectedSubmissions.tsx` - Standardized View and Reopen buttons with consistent styling

## Testing Checklist

- [ ] All buttons render with correct colors
- [ ] Icons appear before text labels
- [ ] Hover states work correctly (darker text + light background)
- [ ] Buttons are consistently sized across all pages
- [ ] Actions are easily distinguishable by color
- [ ] Icon sizes are consistent (16x16px)
- [ ] Spacing between icon and text is consistent
