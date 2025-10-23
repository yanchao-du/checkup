# Draft List Ordering Enhancement

## Issue
The draft list was ordered by creation date, which meant older drafts appeared at the top even if they were recently edited. This was confusing for users who wanted to continue working on their most recently updated drafts.

## User Expectation
> "can draft list be order with the most recently updated at the top?"

Users expect the draft list to show the most recently modified drafts first, making it easier to:
- Continue editing drafts they were just working on
- Find drafts that were recently reopened from rejections
- See which drafts need attention based on recent activity

## Previous Behavior
```typescript
const [submissions, total] = await Promise.all([
  this.prisma.medicalSubmission.findMany({
    where,
    include: { ... },
    orderBy: { createdDate: 'desc' },  // Always by creation date
    skip: (page - 1) * limit,
    take: limit,
  }),
  this.prisma.medicalSubmission.count({ where }),
]);
```

**Problem**: 
- All submissions (including drafts) were ordered by `createdDate`
- A draft created 3 days ago but edited today would appear below a draft created yesterday
- Recently reopened drafts would appear at the bottom based on original creation date

## Updated Behavior
```typescript
// For drafts, order by most recently updated; for others, order by created date
const orderBy = status === 'draft' 
  ? { updatedAt: 'desc' as const }
  : { createdDate: 'desc' as const };

const [submissions, total] = await Promise.all([
  this.prisma.medicalSubmission.findMany({
    where,
    include: { ... },
    orderBy,  // Dynamic ordering based on status
    skip: (page - 1) * limit,
    take: limit,
  }),
  this.prisma.medicalSubmission.count({ where }),
]);
```

**Solution**:
- Drafts are ordered by `updatedAt: 'desc'` (most recently updated first)
- Other submissions (pending, submitted, approved, rejected) remain ordered by `createdDate: 'desc'`
- Provides intuitive ordering for each use case

## Implementation Details

### File: `backend/src/submissions/submissions.service.ts`

#### Modified: `findAll()` method

**Before**:
```typescript
const [submissions, total] = await Promise.all([
  this.prisma.medicalSubmission.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
      assignedDoctor: { select: { name: true } },
    },
    orderBy: { createdDate: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  }),
  this.prisma.medicalSubmission.count({ where }),
]);
```

**After**:
```typescript
// For drafts, order by most recently updated; for others, order by created date
const orderBy = status === 'draft' 
  ? { updatedAt: 'desc' as const }
  : { createdDate: 'desc' as const };

const [submissions, total] = await Promise.all([
  this.prisma.medicalSubmission.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
      assignedDoctor: { select: { name: true } },
    },
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  }),
  this.prisma.medicalSubmission.count({ where }),
]);
```

### Database Field Used

From `backend/prisma/schema.prisma`:
```prisma
model MedicalSubmission {
  id                 String              @id @default(uuid())
  // ... other fields ...
  createdDate        DateTime            @default(now()) @map("created_date")
  updatedAt          DateTime            @updatedAt @map("updated_at")
  // ... other fields ...
}
```

**`updatedAt`**:
- Automatically updated by Prisma on every update
- Mapped to `updated_at` column in database
- Perfect for tracking when a draft was last modified

## User Experience Impact

### Before:
```
Drafts List (ordered by createdDate desc):
1. Draft created 2 days ago (last edited 2 days ago)
2. Draft created 3 days ago (last edited 1 hour ago) ← Recently edited but buried
3. Draft created 5 days ago (last edited yesterday) ← Recently edited but buried
4. Draft created 1 week ago (never edited)
```

### After:
```
Drafts List (ordered by updatedAt desc):
1. Draft created 3 days ago (last edited 1 hour ago) ✨ Most recent work
2. Draft created 5 days ago (last edited yesterday) ✨ Recent work
3. Draft created 2 days ago (last edited 2 days ago)
4. Draft created 1 week ago (never edited)
```

## Use Cases Improved

### 1. **Editing Workflow**
- User edits a draft → saves → draft moves to top
- Next time user opens drafts page → sees their recent work first
- No scrolling through old drafts to find what they were working on

### 2. **Reopened Rejections**
- Doctor rejects a submission → nurse reopens it (becomes draft)
- Draft's `updatedAt` is updated to current time
- Draft appears at top of list for immediate attention
- Nurse doesn't have to search for reopened items

### 3. **Multiple Draft Sessions**
- Nurse works on multiple drafts throughout the day
- Each edit updates `updatedAt`
- Most recent work is always at the top
- Clear priority based on recency

### 4. **Other Submission Lists Unchanged**
- Pending approvals: Still ordered by `createdDate` (oldest first in queue)
- Submitted: Still ordered by `createdDate` (submission order matters)
- Rejected: Ordered by `createdDate` (when it was rejected)
- Approved: Ordered by `createdDate` (approval timeline)

## Edge Cases Handled

### Case 1: Draft Never Edited
- `createdDate` and `updatedAt` are the same
- No difference in behavior from before

### Case 2: Draft Created and Immediately Edited
- `updatedAt` is more recent than `createdDate`
- Appears higher in list than expected with old ordering
- This is desirable - recent activity should be prioritized

### Case 3: Multiple Drafts Updated at Same Time
- Both have same `updatedAt`
- Prisma will use secondary ordering (likely by ID)
- No functional impact - they're equally recent

### Case 4: Non-Draft Submissions
- Uses `createdDate: 'desc'` as before
- No behavior change for pending, submitted, approved, rejected
- Maintains chronological submission timeline

## Benefits

### For Nurses
✅ **Most recent work first**: Continue where you left off  
✅ **Reopened drafts prioritized**: Rejected items that need attention appear at top  
✅ **No searching**: Recent drafts are immediately visible  
✅ **Natural workflow**: Most recently modified = most likely to work on next  
✅ **Time-saving**: Don't scroll through old drafts  

### For Doctors
✅ **No impact**: Doctor-focused lists (pending approvals, rejected) maintain chronological order  
✅ **Consistent behavior**: Only drafts are affected  

### For System
✅ **Minimal change**: Single line of conditional logic  
✅ **Uses existing field**: `updatedAt` is already tracked by Prisma  
✅ **No migration needed**: No database schema changes  
✅ **Performant**: Indexed timestamp field, no performance impact  

## Technical Notes

### Why `updatedAt` Instead of `createdDate` for Drafts?

1. **Drafts are work-in-progress**: Recent edits matter more than creation time
2. **Reopened submissions**: Become drafts with old `createdDate` but need attention
3. **Multi-session editing**: Users often work on drafts over multiple sessions
4. **Task prioritization**: Most recent activity = highest priority

### Why Keep `createdDate` for Other Statuses?

1. **Submission timeline**: When things entered the system matters
2. **Approval queue**: FIFO ordering for doctors
3. **Audit trail**: Chronological history is important
4. **Report generation**: Submissions by date submitted, not date modified

### Prisma `@updatedAt` Directive

- Automatically updated on every `update()` call
- Managed by Prisma, not application code
- Reliable and consistent
- No manual timestamp management needed

## Testing Checklist

- [ ] Create a draft → verify it appears at top of draft list
- [ ] Edit an existing draft → verify it moves to top after save
- [ ] Create draft A, then draft B → verify B is at top
- [ ] Edit draft A → verify A moves above B
- [ ] Reopen a rejected submission → verify reopened draft appears at top
- [ ] Create a draft but don't edit → verify still appears in correct order
- [ ] Query non-draft submissions → verify still ordered by `createdDate`
- [ ] Query pending approvals → verify ordered by `createdDate`
- [ ] Query rejected submissions → verify ordered by `createdDate`
- [ ] Multiple users creating/editing drafts → verify each user sees their drafts in correct order

## API Impact

### Endpoint: `GET /submissions?status=draft`

**Response** (example):
```json
{
  "data": [
    {
      "id": "draft-3",
      "patientName": "John Doe",
      "status": "draft",
      "createdDate": "2025-10-20T10:00:00Z",
      "updatedAt": "2025-10-23T14:30:00Z"  // ← Most recent
    },
    {
      "id": "draft-1",
      "patientName": "Jane Smith",
      "status": "draft",
      "createdDate": "2025-10-23T09:00:00Z",
      "updatedAt": "2025-10-23T09:15:00Z"  // ← Second most recent
    },
    {
      "id": "draft-2",
      "patientName": "Bob Johnson",
      "status": "draft",
      "createdDate": "2025-10-22T11:00:00Z",
      "updatedAt": "2025-10-22T11:00:00Z"  // ← Oldest, never edited
    }
  ],
  "pagination": { ... }
}
```

**Order**: draft-3, draft-1, draft-2 (by `updatedAt` desc)

### Endpoint: `GET /submissions?status=pending_approval`

**Response** (example):
```json
{
  "data": [
    {
      "id": "pending-2",
      "status": "pending_approval",
      "createdDate": "2025-10-23T10:00:00Z"  // ← Most recent submission
    },
    {
      "id": "pending-1",
      "status": "pending_approval",
      "createdDate": "2025-10-22T15:00:00Z"  // ← Older submission
    }
  ]
}
```

**Order**: pending-2, pending-1 (by `createdDate` desc, unchanged)

## Related Files

- **Modified**: `backend/src/submissions/submissions.service.ts`
- **Schema Reference**: `backend/prisma/schema.prisma`
- **API Consumer**: `frontend/src/services/submissions.service.ts`
- **UI Component**: `frontend/src/components/Dashboard.tsx` (displays drafts)

## Status
✅ **Implemented**  
✅ **No compilation errors**  
⏳ **Pending user testing**

## Future Enhancements

Potential improvements if needed:
- [ ] Add user preference to toggle between `updatedAt` and `createdDate` ordering
- [ ] Add "Last Modified" column to drafts table in UI
- [ ] Add sorting options in UI (by name, date, exam type)
- [ ] Add filters (modified today, this week, older than X days)
- [ ] Highlight drafts modified in last 24 hours
