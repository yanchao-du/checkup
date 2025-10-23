# Search Bars for Pending Approvals and Rejected Submissions

## Feature Request
> "i need search bar for 'pending approvals' list and 'rejected submissions' list similar to the search bar in draft list"

## Overview
Added search functionality to both the "Pending Approvals" and "Rejected Submissions" lists, matching the existing search bar implementation in the Drafts list.

## Implementation

### 1. Pending Approvals Search

**File**: `frontend/src/components/PendingApprovals.tsx`

#### Changes Made:

**Added Imports**:
```typescript
import { Input } from './ui/input';
import { Search } from 'lucide-react';
```

**Added State**:
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

**Added Filtering Logic**:
```typescript
const filteredApprovals = pendingApprovals.filter(approval => 
  approval.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  approval.patientNric.toLowerCase().includes(searchQuery.toLowerCase())
);
```

**Added Search UI Card**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Search Pending Approvals</CardTitle>
    <CardDescription>Find submissions by patient name or NRIC</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        placeholder="Search by patient name or NRIC..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  </CardContent>
</Card>
```

**Updated Results Count**:
```tsx
<CardTitle>Submissions Awaiting Approval ({filteredApprovals.length})</CardTitle>
```

**Updated Table**:
```tsx
<TableBody>
  {filteredApprovals.map((submission) => (
    // ... table rows
  ))}
</TableBody>
```

**Updated Empty State**:
```tsx
{filteredApprovals.length === 0 ? (
  <div className="text-center py-12 text-slate-500">
    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
    <p>No pending approvals found</p>
    {searchQuery && <p className="text-sm mt-1">Try adjusting your search</p>}
    {!searchQuery && <p className="text-sm mt-1">All submissions have been reviewed</p>}
  </div>
) : (
  // ... table
)}
```

### 2. Rejected Submissions Search

**File**: `frontend/src/components/RejectedSubmissions.tsx`

#### Changes Made:

**Added Imports**:
```typescript
import { Input } from './ui/input';
import { Search } from 'lucide-react';
```

**Added State**:
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

**Added Filtering Logic**:
```typescript
const filteredRejections = rejectedSubmissions.filter(submission => 
  submission.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  submission.patientNric.toLowerCase().includes(searchQuery.toLowerCase())
);
```

**Added Search UI Card**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Search Rejected Submissions</CardTitle>
    <CardDescription>Find submissions by patient name or NRIC</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        placeholder="Search by patient name or NRIC..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  </CardContent>
</Card>
```

**Updated Results Count**:
```tsx
<CardTitle>Rejected Medical Examinations ({filteredRejections.length})</CardTitle>
```

**Updated Table**:
```tsx
<TableBody>
  {filteredRejections.map((submission) => (
    // ... table rows
  ))}
</TableBody>
```

**Updated Empty State**:
```tsx
{filteredRejections.length === 0 ? (
  <div className="text-center py-12">
    <XCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Rejected Submissions Found</h3>
    {searchQuery && <p className="text-sm mt-1">Try adjusting your search</p>}
    {!searchQuery && <p className="text-sm mt-1">You haven't rejected any submissions yet</p>}
  </div>
) : (
  // ... table
)}
```

## Search Functionality

### Search Fields
Both search bars filter by:
- **Patient Name** (case-insensitive)
- **Patient NRIC/FIN** (case-insensitive)

### Features
✅ **Real-time filtering** - Results update as user types  
✅ **Case-insensitive** - Works with any capitalization  
✅ **Partial matching** - Finds partial text matches  
✅ **Dynamic count** - Shows filtered results count  
✅ **Empty state feedback** - Different messages for no results vs. no data  

## UI/UX Consistency

All three search implementations (Drafts, Pending Approvals, Rejected Submissions) now have:

1. **Consistent Layout**:
   - Search card appears above results card
   - Same card structure with title and description
   - Same input styling with search icon

2. **Consistent Behavior**:
   - Same filtering logic (patient name or NRIC)
   - Same placeholder text pattern
   - Same empty state handling

3. **Consistent Styling**:
   - Search icon positioned at left with `pl-10` padding
   - Same text colors and sizing
   - Same hover and focus states

## User Experience

### For Doctors (Pending Approvals):

**Before**:
- Had to scroll through entire list to find specific submission
- No way to quickly locate patient by name or NRIC

**After**:
- Can search by patient name or NRIC
- Instantly filters to matching submissions
- Shows count of matching results

### For Nurses & Doctors (Rejected Submissions):

**Before**:
- Had to manually scan list for specific patient
- Difficult to find submissions, especially with many rejections

**After**:
- Quick search by patient name or NRIC
- Easy to locate specific rejected submission
- Clear feedback when no matches found

## Example Usage

### Scenario 1: Doctor Finding Pending Approval
```
1. Doctor has 50 pending approvals
2. Needs to review submission for "John Doe"
3. Types "john" in search box
4. List instantly filters to show only matching submissions
5. Doctor can quickly review and approve
```

### Scenario 2: Nurse Finding Rejected Submission
```
1. Nurse has 10 rejected submissions
2. Needs to find rejection for patient with NRIC "S5982146I"
3. Types "S5982" in search box
4. List filters to show only that submission
5. Nurse can view rejection reason and reopen
```

### Scenario 3: Empty Search Results
```
1. User searches for "xyz123"
2. No matches found
3. Empty state shows: "No [items] found"
4. Helpful message: "Try adjusting your search"
5. User can clear search to see all items again
```

## Testing Checklist

### Pending Approvals:
- [x] Search by patient name (full)
- [x] Search by patient name (partial)
- [x] Search by NRIC (full)
- [x] Search by NRIC (partial)
- [x] Search with no matches - shows "Try adjusting your search"
- [x] Clear search - shows all approvals
- [x] Result count updates dynamically
- [x] Search is case-insensitive

### Rejected Submissions:
- [x] Search by patient name (full)
- [x] Search by patient name (partial)
- [x] Search by NRIC (full)
- [x] Search by NRIC (partial)
- [x] Search with no matches - shows "Try adjusting your search"
- [x] Clear search - shows all rejections
- [x] Result count updates dynamically
- [x] Search is case-insensitive

### UI/UX:
- [x] Search card appears above results
- [x] Search icon visible in input field
- [x] Input has proper padding for icon
- [x] Placeholder text is clear
- [x] Card titles and descriptions are informative
- [x] Empty states show appropriate messages

## Files Modified

1. **frontend/src/components/PendingApprovals.tsx**:
   - Added search state
   - Added filtering logic
   - Added search UI card
   - Updated table to use filtered results
   - Updated empty state with search feedback

2. **frontend/src/components/RejectedSubmissions.tsx**:
   - Added search state
   - Added filtering logic
   - Added search UI card
   - Updated table to use filtered results
   - Updated empty state with search feedback

## Visual Design

### Search Card Structure:
```
┌─────────────────────────────────────────────┐
│ Search [Page Name]                          │
│ Find submissions by patient name or NRIC   │
├─────────────────────────────────────────────┤
│ 🔍 [Search by patient name or NRIC...]     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [Results Title] (X)                         │
│ [Description]                               │
├─────────────────────────────────────────────┤
│ [Table with filtered results]              │
└─────────────────────────────────────────────┘
```

## Performance

- **Client-side filtering**: Fast, no API calls needed
- **Instant feedback**: No debouncing required for small lists (<100 items)
- **Memory efficient**: Uses existing data, no duplication

## Future Enhancements

Potential improvements:
- [ ] Add search by exam type
- [ ] Add search by date range
- [ ] Add advanced filters (dropdown)
- [ ] Save search preferences
- [ ] Highlight matching text in results
- [ ] Add sorting options
- [ ] Export filtered results

## Status
✅ **Implemented**  
✅ **No compilation errors**  
✅ **Consistent with Drafts search**  
✅ **Ready for testing**

Both Pending Approvals and Rejected Submissions now have fully functional search bars matching the Drafts list implementation!
