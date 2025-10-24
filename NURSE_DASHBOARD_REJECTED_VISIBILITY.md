# Dashboard Enhancement: Prominent Rejected Submissions Display for Nurses

## Overview
Enhanced the nurse's dashboard to make rejected submissions highly visible and actionable, ensuring nurses can quickly identify and address submissions that need their attention.

## Problem
Previously, rejected submissions were not prominently displayed on the nurse's dashboard:
- ❌ No visual alert or notification
- ❌ Had to navigate to "Rejected Submissions" page to see them
- ❌ Easy to miss or forget about rejected items
- ❌ No quick action buttons to fix issues
- ❌ Not prioritized in the interface

This led to:
- Delayed responses to doctor rejections
- Poor user experience
- Missed opportunities to resubmit

## Solution
Added **three prominent visual elements** to the nurse's dashboard to highlight rejected submissions:

### 1. Alert Card (Top Priority)
**Location**: Right after welcome message, before stats cards  
**Visibility**: Large, red-themed alert card  
**Shows**: Up to 3 rejected submissions with details

**Features**:
- 🔴 Red background with alert icon
- Shows patient name and exam type
- Displays rejection reason
- "View" button to see details
- "Reopen & Fix" button for quick action - **automatically reopens and navigates to edit page**
- "View all X rejected submissions" link if more than 3

### 2. Rejected Stat Card
**Location**: Among the stats cards (between Drafts and This Month)  
**Visibility**: Red-themed card that stands out  
**Clickable**: Links directly to rejected submissions page

**Features**:
- 🔴 Red background with XCircle icon
- Shows count of rejected submissions
- "Needs attention" label
- Hover effect for better UX
- Only shows if there are rejected items

### 3. Quick Action Button
**Location**: In "Quick Actions" section  
**Visibility**: Red button with high priority placement  
**Position**: Before "Review Approvals" and "Continue Draft"

**Features**:
- 🔴 Red button (primary action color)
- "Review Rejected (X)" label with count
- XCircle icon
- Only shows if there are rejected items

## Implementation Details

### File: `frontend/src/components/Dashboard.tsx`

#### 1. Alert Card Component
```typescript
#### 1. Alert Card Component
```typescript
// Handler function for reopening and editing
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

{user?.role === 'nurse' && rejectedSubmissions.length > 0 && (
  <Card className="border-red-200 bg-red-50">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-red-900">
            {rejectedSubmissions.length} Rejected Submission{rejectedSubmissions.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription className="text-red-700">
            You have submissions that were rejected and need attention
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {rejectedSubmissions.slice(0, 3).map((submission) => (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
            <div className="flex-1">
              <p className="font-medium text-slate-900">{submission.patientName}</p>
              <p className="text-sm text-slate-600">{formatExamType(submission.examType)}</p>
              {submission.rejectedReason && (
                <p className="text-xs text-red-600 mt-1">
                  <span className="font-medium">Reason:</span> {submission.rejectedReason}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">View</Button>
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
          </div>
        ))}
        {rejectedSubmissions.length > 3 && (
          <Button variant="link" className="w-full text-red-700 hover:text-red-800">
            View all {rejectedSubmissions.length} rejected submissions →
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
)}
```
```

#### 2. Rejected Stat Card
```typescript
{user?.role === 'nurse' && rejectedSubmissions.length > 0 && (
  <Link to="/rejected-submissions">
    <Card className="border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-red-900">Rejected</CardTitle>
        <XCircle className="w-4 h-4 text-red-600" />
      </CardHeader>
      <CardContent>
        <div className="text-red-900 font-semibold">{rejectedSubmissions.length}</div>
        <p className="text-xs text-red-700 mt-1">Needs attention</p>
      </CardContent>
    </Card>
  </Link>
)}
```

#### 3. Quick Action Button
```typescript
{user?.role === 'nurse' && rejectedSubmissions.length > 0 && (
  <Link to="/rejected-submissions">
    <Button className="bg-red-600 hover:bg-red-700">
      <XCircle className="w-4 h-4 mr-2" />
      Review Rejected ({rejectedSubmissions.length})
    </Button>
  </Link>
)}
```

## Visual Hierarchy

### Dashboard Layout (Nurse with Rejected Submissions)

```
┌─────────────────────────────────────────────────────┐
│ Welcome, nurse@clinic.sg                            │
│ Here's an overview of your medical exam submissions │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🔴 2 Rejected Submissions                          │ ⬅️ NEW: Alert Card
│ You have submissions that were rejected...          │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ John Doe - Six-monthly Medical Exam          │   │
│ │ Reason: Incomplete medical history           │   │
│ │                    [View] [Reopen & Fix] ───────┐│
│ └──────────────────────────────────────────────┘   ││
│                                                     ││ Quick Action
│ ┌──────────────────────────────────────────────┐   ││
│ │ Jane Smith - Work Permit Exam                │   ││
│ │ Reason: Missing blood test results           │   ││
│ │                    [View] [Reopen & Fix]     │   ││
│ └──────────────────────────────────────────────┘   ││
│                                                     ││
│ [View all 2 rejected submissions →]                 ││
└─────────────────────────────────────────────────────┘│
                                                       │
┌──────┐ ┌──────┐ ┌──────────┐ ┌──────┐             │
│Total │ │Drafts│ │ Rejected │ │Month │ ⬅️ Stats    │
│  15  │ │   3  │ │    2     │ │   8  │             │
└──────┘ └──────┘ └──────────┘ └──────┘             │
                   ⬆️ NEW                             │
                   Red Card                           │
                                                      │
┌─────────────────────────────────────────────────┐  │
│ Quick Actions                                   │  │
│ [New Submission] [Review Rejected (2)] ────────────┘
│ [Continue Draft (3)]          ⬆️ NEW
└─────────────────────────────────────────────────┘
```

## Color Coding

**Red Theme** used throughout for consistency:
- `bg-red-50` - Light red background
- `bg-red-100` - Slightly darker red (hover states)
- `border-red-200` - Red borders
- `text-red-600` - Red icons
- `text-red-700` - Red text
- `text-red-900` - Dark red headers
- `bg-red-600` - Red buttons
- `hover:bg-red-700` - Red button hover

## User Experience Flow

### Nurse logs in with rejected submissions:

1. **Immediate Visibility**
   - 🔴 Large red alert card catches attention
   - Shows count: "2 Rejected Submissions"
   - Descriptive message: "need attention"

2. **Quick Review**
   - Sees patient names and exam types
   - Sees rejection reasons inline
   - No need to navigate away

3. **Quick Action**
   - "Reopen & Fix" button right there
   - **Automatically reopens submission and navigates to edit page**
   - Or "View" to see full details
   - One click to start fixing

4. **Multiple Entry Points**
   - Alert card with "View all" link
   - Red stat card (clickable)
   - Red "Review Rejected" button in Quick Actions
   - Sidebar navigation still available

### Nurse with no rejected submissions:

- ✅ No red alert (clean interface)
- ✅ No red stat card (doesn't show)
- ✅ No "Review Rejected" button (doesn't show)
- Standard dashboard with normal stats

## Benefits

### For Nurses
✅ **Impossible to miss**: Red alert at top of page  
✅ **Context at a glance**: See rejection reasons immediately  
✅ **Quick action**: "Reopen & Fix" button automatically opens edit page  
✅ **One-click workflow**: Reopen and edit in a single action  
✅ **Multiple reminders**: 3 different visual elements  
✅ **Prioritized workflow**: Rejected items come first  

### For Doctors
✅ **Faster turnaround**: Nurses respond quicker to rejections  
✅ **Better quality**: Nurses have context before editing  
✅ **Less back-and-forth**: Issues get fixed faster  

### For System
✅ **Improved metrics**: Faster rejection → reopen → resubmit cycle  
✅ **Better UX**: Clear, actionable interface  
✅ **Reduced errors**: Context-aware editing  

## Conditional Display Logic

All three elements only show when:
```typescript
user?.role === 'nurse' && rejectedSubmissions.length > 0
```

This ensures:
- ✅ Doctors don't see nurse-specific elements
- ✅ Clean dashboard when no rejections exist
- ✅ No empty states or zero counts

## Responsive Design

- **Desktop**: All three elements visible, alert card shows full layout
- **Tablet**: Stats cards stack, alert card adapts
- **Mobile**: Single column, alert card prioritized at top

## Testing Checklist

- [ ] Nurse with 0 rejected submissions - no red elements show
- [ ] Nurse with 1 rejected submission - shows "1 Rejected Submission" (singular)
- [ ] Nurse with 2+ rejected submissions - shows "X Rejected Submissions" (plural)
- [ ] Alert card shows up to 3 submissions
- [ ] Alert card shows "View all X" link when >3 submissions
- [ ] Each submission shows patient name, exam type, rejection reason
- [ ] "View" button links to view-submission page
- [ ] "Reopen & Fix" button calls reopen API and navigates to edit page
- [ ] "Reopen & Fix" button shows "Reopening..." state while processing
- [ ] "Reopen & Fix" button is disabled during reopening
- [ ] "Reopen & Fix" button appears only for status='rejected'
- [ ] Toast notification shows "Submission reopened - redirecting to edit page..."
- [ ] Successfully navigates to /draft/{id} after reopening
- [ ] Red stat card has hover effect
- [ ] Quick action button shows correct count
- [ ] Quick action button links to rejected-submissions page
- [ ] Doctor dashboard doesn't show nurse-specific elements
- [ ] Reopened submissions (status='draft') don't show "Reopen & Fix" button

## Future Enhancements

- [ ] Add notification badge with count in sidebar navigation
- [ ] Email notifications when submission is rejected
- [ ] Push notifications for mobile app
- [ ] Sort rejected submissions by urgency/age
- [ ] Add "Dismiss" action to hide specific rejections
- [ ] Track metrics: time to reopen, time to resubmit
- [ ] Add filters: by exam type, by rejecting doctor, by date
