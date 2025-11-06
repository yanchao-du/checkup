# Implementation Tasks: Add Favorite Exam Types

## Backend Tasks

- [ ] Add `favoriteExamTypes` field to User model in Prisma schema (JSON array of ExamType enums)
- [ ] Create database migration for User.favoriteExamTypes field
- [ ] Add validation in UpdateUserDto to accept favoriteExamTypes array (max 3 items)
- [ ] Update `PATCH /v1/users/:id` endpoint to handle favoriteExamTypes update
- [ ] Update `GET /v1/users/me` response to include favoriteExamTypes
- [ ] Add unit tests for user preferences update
- [ ] Add E2E tests for updating and retrieving favorite exam types

## Frontend Tasks

- [ ] Add star icon component to exam type dropdown items
- [ ] Implement toggle favorite logic (click star to add/remove)
- [ ] Update exam type dropdown to show favorites section at top
- [ ] Add visual separator between favorites and regular exam types
- [ ] Call user preferences API to persist favorites
- [ ] Update user context/state to include favoriteExamTypes
- [ ] Add loading state while saving favorites
- [ ] Add toast notification for successful favorite add/remove
- [ ] Limit favorites to maximum of 3 (show tooltip if limit reached)
- [ ] Add hover tooltips for star icons ("Add to favorites" / "Remove from favorites")

## Testing Tasks

- [ ] Test adding first favorite exam type
- [ ] Test adding multiple favorites (up to limit)
- [ ] Test removing favorite exam type
- [ ] Test favorites persist across page refresh
- [ ] Test favorites shown at top of dropdown
- [ ] Test favorite limit enforcement (max 3)
- [ ] Test with no favorites (empty state)
- [ ] Test error handling if API call fails

## Documentation Tasks

- [ ] Update user guide with favorite exam types feature
- [ ] Add screenshots showing how to favorite exam types
- [ ] Document API changes in backend README

## Optional Enhancement Tasks (Future)

- [ ] Add quick action cards on dashboard for favorite exam types
- [ ] Add onboarding tooltip to introduce favorites feature
- [ ] Add analytics tracking for favorite usage
