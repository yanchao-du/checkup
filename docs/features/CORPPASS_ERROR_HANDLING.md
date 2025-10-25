# CorpPass Authentication Error Handling

## Overview
Enhanced CorpPass authentication error handling to display user-friendly error pages instead of raw JSON error messages.

## Changes Made

### Backend (`/backend/src/auth/`)

#### 1. **auth.controller.ts** - Enhanced Error Handling
- Wrapped the CorpPass callback handler in a try-catch block
- Applied custom `CorpPassExceptionFilter` to intercept errors from AuthGuard
- On authentication errors, redirect to frontend error page (`/auth/error`) with error message
- Error cases handled:
  - Missing session or state parameter
  - Invalid or expired OAuth session
  - User not found after authentication
  - Account pending approval or inactive
  - Any unexpected errors

#### 2. **strategies/corppass.strategy.ts** - Error Propagation
- Updated the `validate` method to properly propagate `UnauthorizedException` errors
- Ensures error messages from `findOrCreateCorpPassUser` are preserved and passed to the controller

#### 3. **filters/corppass-exception.filter.ts** (NEW) - Exception Filter
- Custom NestJS exception filter that intercepts `UnauthorizedException`
- Specifically handles errors on `/auth/corppass/callback` endpoint
- Redirects to frontend error page instead of returning JSON
- Extracts meaningful error messages from exception responses
- Logs errors for debugging

#### 4. **auth.module.ts** - Module Configuration
- Added `CorpPassExceptionFilter` as a provider
- Ensures the filter has access to `ConfigService` for frontend URL configuration

### Frontend (`/frontend/src/`)

#### 1. **components/AuthError.tsx** - New Error Page Component
- User-friendly error page for authentication failures
- Displays the error message from the backend
- Provides helpful guidance:
  - What to do if account is pending approval
  - How to contact administrator
  - Option to return to login page
- Styled with Tailwind CSS to match the app's design system

#### 2. **App.tsx** - Added Error Route
- Added new route: `/auth/error`
- Mapped to the `AuthError` component
- Accessible without authentication (public route)

## User Experience

### Before
When a user with pending approval or inactive account tried to login via CorpPass:
```
{"message":"Account is pending approval or inactive","error":"Unauthorized","statusCode":401}
```

### After
User is redirected to a friendly error page showing:
- Clear error title: "Authentication Failed"
- Specific error message (e.g., "Account is pending approval or inactive")
- Helpful instructions on what to do next
- Contact information guidance
- "Back to Login Page" button

## Error Messages Handled

1. **Account Pending Approval**
   - "Account created successfully. Please wait for administrator approval before logging in."

2. **Account Inactive**
   - "Account is pending approval or inactive"

3. **OAuth Session Errors**
   - "Missing session or state parameter. Please try again."
   - "Invalid or expired OAuth session. Please try again."

4. **Generic Errors**
   - "Authentication failed. Please contact your administrator."
   - "An unexpected error occurred. Please try again."

## Testing

### Cypress E2E Tests

A comprehensive Cypress test suite has been added: `frontend/cypress/e2e/corppass-error-handling.cy.ts`

**Test Coverage:**
- ✅ Error page display with custom messages
- ✅ Default error message when no message provided
- ✅ Navigation back to login page
- ✅ Helpful guidance sections display
- ✅ Error icon and styling
- ✅ Long error message handling
- ✅ Special characters and XSS prevention
- ✅ Accessibility (heading hierarchy, keyboard navigation)
- ✅ Responsive design (mobile and tablet viewports)

**Run the tests:**
```bash
cd frontend
npx cypress run --spec "cypress/e2e/corppass-error-handling.cy.ts"
```

All 13 tests should pass.

### Manual Testing

To test the error page manually:

1. **Pending Approval User**
   - Create a new CorpPass user (will be created with `inactive` status)
   - Try to login via CorpPass
   - Should see error page with approval message

2. **Inactive Account**
   - Set an existing user's status to `inactive` in the database
   - Try to login via CorpPass
   - Should see error page with inactive account message

3. **Direct URL Test**
   - Navigate to: `http://localhost:6688/auth/error?message=Test+error+message`
   - Should see the error page with "Test error message"

### Backend Integration Test

The exception filter intercepts `UnauthorizedException` from the CorpPass strategy:

```typescript
// In CorpPassStrategy.validate()
throw new UnauthorizedException('Account is pending approval or inactive');

// Intercepted by CorpPassExceptionFilter
// Redirects to: http://localhost:6688/auth/error?message=Account+is+pending+approval+or+inactive
```

## Files Modified

- `backend/src/auth/auth.controller.ts` - Added `@UseFilters` decorator and try-catch
- `backend/src/auth/strategies/corppass.strategy.ts` - Enhanced error propagation
- `backend/src/auth/filters/corppass-exception.filter.ts` - **New exception filter**
- `backend/src/auth/auth.module.ts` - Added filter as provider
- `frontend/src/components/AuthError.tsx` - **New error page component**
- `frontend/src/App.tsx` - Added `/auth/error` route
- `frontend/cypress/e2e/corppass-error-handling.cy.ts` - **New Cypress test suite (13 tests)**

## Security Considerations

- Error messages are sanitized and displayed safely (no XSS risk)
- OAuth session validation still enforced before any error handling
- Error page is accessible without authentication (by design, for auth errors)
- No sensitive information exposed in error messages

## Future Improvements

- Add telemetry/logging for authentication errors
- Provide admin contact email/phone in error page (from config)
- Add "Request Access" form directly on error page
- Track failed login attempts for security monitoring
