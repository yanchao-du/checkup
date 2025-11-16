# Change Proposal: Add Favorite Exam Types

**Change ID:** `add-favorite-exam-types`  
**Status:** Draft  
**Created:** 2025-11-06  
**Author:** AI Assistant  

## Overview

Add functionality for users to mark frequently used exam types as favorites, enabling quick access and streamlined workflow by auto-opening the selected exam form directly.

## Motivation

Currently, users must:
1. Navigate to "New Submission" page
2. Open the exam type dropdown
3. Select their exam type from grouped list
4. Wait for form to render

For users who primarily work with one or two exam types (e.g., clinic nurses handling mostly MDW exams), this adds unnecessary friction to their daily workflow.

## Proposed Solution

Implement a user preference system where users can:
- Mark exam types as "favorites" (star icon in dropdown)
- Store favorites in user profile
- See favorite exam types highlighted at the top of dropdown
- Optionally: Add quick action buttons on dashboard/homepage for favorite exam types that directly open the form

## User Benefits

- **Efficiency**: Save 2-3 clicks per submission for frequently used exam types
- **Reduced cognitive load**: No need to scan through grouped dropdown for common exam
- **Personalization**: Each user can customize their experience based on their clinic's primary exam types

## Technical Approach

### Frontend Changes
1. Add star icon to exam type dropdown items
2. Store user's favorite exam types in user profile state
3. Reorder dropdown to show favorites first (with visual separator)
4. Add quick action cards/buttons on dashboard for favorite exam types

### Backend Changes
1. Add `favoriteExamTypes` field to User model (JSON array)
2. Add API endpoint: `PATCH /v1/users/me/preferences` to update favorites
3. Return favorites in user profile response

### Data Storage
```typescript
// User model extension
{
  favoriteExamTypes: ExamType[] // e.g., ["SIX_MONTHLY_MDW", "FULL_MEDICAL_EXAM"]
}
```

## Scope

**In Scope:**
- User preference storage (backend)
- Favorite marking/unmarking in exam type dropdown (frontend)
- Reordering dropdown to show favorites first
- Persist favorites across sessions
- Dashboard quick action buttons for favorite exam types
- Maximum 3 favorites per user

**Out of Scope (Future Enhancement):**
- Sharing favorites across clinic (admin feature)
- Analytics on most-used exam types
- Customizable favorite order/sorting

## Risks & Mitigation

- **Risk**: Users accidentally unfavorite their preferred exam type
  - **Mitigation**: Add undo toast notification after unfavoriting
  
- **Risk**: Dropdown becomes cluttered if user favorites many exam types
  - **Mitigation**: Hard limit to maximum 3 favorites with clear UI feedback

- **Risk**: Dashboard becomes cluttered with many quick action buttons
  - **Mitigation**: Maximum 3 favorites ensures at most 3 dashboard buttons

## Success Criteria

- Users can mark/unmark exam types as favorites
- Favorites persist across browser sessions
- Favorites appear at top of dropdown with visual distinction
- No performance degradation on exam type selection

## Dependencies

- User authentication system (existing)
- User profile API (existing)

## Timeline Estimate

- Backend API: 1-2 hours
- Frontend dropdown UI: 2-3 hours
- Frontend dashboard quick actions: 1-2 hours
- Testing: 1-2 hours
- **Total**: ~8 hours

## Alternatives Considered

1. **Recent exam types**: Show recently used exam types instead of favorites
   - Rejected: Less predictable, doesn't respect user intent
   
2. **Clinic-level defaults**: Admin sets default exam type for entire clinic
   - Rejected: Too rigid, doesn't accommodate mixed-use clinics

3. **Browser localStorage only**: No backend persistence
   - Rejected: Lost when clearing cache or switching devices

## Open Questions

1. Should we show a tutorial/tooltip on first visit to help users discover this feature?
2. Should dashboard quick action buttons show exam type icons/colors for visual distinction?
3. Where on the dashboard should the quick action buttons appear? (Top banner, sidebar, or dedicated section?)
