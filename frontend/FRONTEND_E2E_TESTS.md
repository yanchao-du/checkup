# Frontend E2E Testing with Cypress

This document provides comprehensive guidance on running and writing Cypress E2E tests for the CheckUp Medical Portal frontend.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Custom Commands](#custom-commands)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The CheckUp Medical Portal uses Cypress for frontend E2E testing. Our test suite covers:
- **Authentication**: Login/logout flows for all user roles
- **Dashboard**: Navigation and role-based access control
- **Submissions**: Creating, viewing, and managing medical examination submissions
- **Approvals**: Doctor/admin approval workflows
- **User Management**: Admin-only user CRUD operations

## Setup

### Prerequisites
- Node.js 18+ installed
- Frontend development server running on port 6688
- Backend API server running on port 3344
- PostgreSQL database with seed data

### Installation

Cypress is already installed as a dev dependency. If you need to reinstall:

```bash
cd frontend
npm install --save-dev cypress @cypress/vite-dev-server
```

### Configuration

Cypress configuration is in `cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress'
import viteConfig from './vite.config'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:6688',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig,
    },
  },
})
```

**Key Settings:**
- `baseUrl`: Frontend application URL (port 6688)
- `e2e`: Configuration for E2E tests
- `component`: Configuration for component tests (future use)

## Running Tests

### Interactive Mode (Cypress UI)

Open Cypress Test Runner with interactive UI:

```bash
npm run cypress:open
```

This will:
1. Launch the Cypress Test Runner
2. Allow you to select which tests to run
3. Show live browser interaction
4. Provide detailed debugging information

### Headless Mode (CI/CD)

Run all tests in headless mode (no UI):

```bash
npm run test:e2e
```

Or use the direct Cypress command:

```bash
npm run cypress:run
```

### Headed Mode (Debug)

Run tests with browser visible but automated:

```bash
npm run test:e2e:headed
```

### Run Specific Test File

```bash
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```

### Run Tests in Specific Browser

```bash
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

## Test Structure

### Test Files

```
frontend/cypress/
├── e2e/
│   ├── auth.cy.ts              # Authentication tests
│   ├── dashboard.cy.ts         # Dashboard and navigation tests
│   ├── submissions.cy.ts       # Medical submission tests
│   ├── approvals.cy.ts         # Approval workflow tests
│   └── user-management.cy.ts   # User management tests
├── support/
│   ├── commands.ts             # Custom Cypress commands
│   ├── e2e.ts                  # E2E support file
│   └── component.ts            # Component test support
└── cypress.config.ts           # Cypress configuration
```

### Test File Example

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    cy.clearAppData()
    cy.login('user@clinic.sg', 'password')
  })

  it('should perform expected action', () => {
    // Arrange
    cy.visit('/some-page')
    
    // Act
    cy.get('button').click()
    
    // Assert
    cy.url().should('include', '/expected-url')
    cy.contains('Expected Text').should('be.visible')
  })
})
```

## Custom Commands

We've created custom Cypress commands to simplify common test actions. These are defined in `cypress/support/commands.ts`.

### `cy.login(email, password)`

Logs in a user and waits for redirect to dashboard.

**Usage:**
```typescript
cy.login('doctor@clinic.sg', 'password')
```

**Implementation:**
```typescript
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})
```

### `cy.logout()`

Logs out the current user via the user menu.

**Usage:**
```typescript
cy.logout()
```

**Implementation:**
```typescript
Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/@/).click()
  cy.contains('Logout').click()
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})
```

### `cy.clearAppData()`

Clears all localStorage and cookies to reset application state.

**Usage:**
```typescript
cy.clearAppData()
```

**Implementation:**
```typescript
Cypress.Commands.add('clearAppData', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})
```

## Writing Tests

### Test Organization

Follow the Arrange-Act-Assert pattern:

```typescript
it('should create a new submission', () => {
  // Arrange - Set up test conditions
  cy.login('nurse@clinic.sg', 'password')
  cy.contains('New Submission').click()
  
  // Act - Perform the action
  cy.get('input[name="patientName"]').type('Test Patient')
  cy.get('input[name="nric"]').type('S1234567A')
  cy.contains('button', 'Save as Draft').click()
  
  // Assert - Verify the outcome
  cy.url().should('include', '/drafts')
  cy.contains('Test Patient').should('be.visible')
})
```

### Role-Based Testing

Test different user roles by organizing tests in describe blocks:

```typescript
describe('Pending Approvals', () => {
  describe('Doctor Role', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('doctor@clinic.sg', 'password')
    })

    it('should see pending approvals', () => {
      cy.contains('Pending Approvals').should('be.visible')
    })
  })

  describe('Nurse Role', () => {
    beforeEach(() => {
      cy.clearAppData()
      cy.login('nurse@clinic.sg', 'password')
    })

    it('should NOT see pending approvals', () => {
      cy.contains('Pending Approvals').should('not.exist')
    })
  })
})
```

### Testing Dynamic Content

Use conditional checks for dynamic content:

```typescript
it('should handle dynamic submission list', () => {
  cy.contains('Submissions').click()
  
  cy.get('body').then($body => {
    if ($body.find('table tr:not(:first-child)').length > 0) {
      // Table has data
      cy.get('table tr').should('have.length.at.least', 2)
    } else {
      // Empty state
      cy.contains('No submissions found').should('be.visible')
    }
  })
})
```

### Waiting for API Calls

Use `cy.wait()` after actions that trigger API calls:

```typescript
it('should approve submission', () => {
  cy.contains('button', 'Approve').click()
  cy.contains('button', 'Confirm').click()
  
  cy.wait(1000) // Wait for API call to complete
  
  cy.contains('Approved').should('be.visible')
})
```

### Testing Forms

```typescript
it('should validate form fields', () => {
  cy.get('input[name="email"]').type('invalid-email')
  cy.get('button[type="submit"]').click()
  
  // Check for validation error
  cy.contains(/invalid|valid email/i).should('be.visible')
})
```

## Best Practices

### 1. Use Data Attributes

Add `data-testid` attributes for reliable element selection:

```typescript
// Preferred
cy.get('[data-testid="submit-button"]').click()

// Avoid (fragile)
cy.get('.btn-primary').click()
```

### 2. Avoid Hard-Coded Waits

Use Cypress's built-in retry-ability instead of `cy.wait(ms)`:

```typescript
// Preferred
cy.get('.loader').should('not.exist')
cy.contains('Data loaded').should('be.visible')

// Avoid
cy.wait(5000)
```

### 3. Clean State Before Tests

Always start with a clean state:

```typescript
beforeEach(() => {
  cy.clearAppData()
  cy.login('user@clinic.sg', 'password')
})
```

### 4. Make Tests Independent

Each test should run independently:

```typescript
// Good - Independent test
it('should create submission', () => {
  cy.login('nurse@clinic.sg', 'password')
  cy.contains('New Submission').click()
  // ... rest of test
})

// Bad - Depends on previous test
it('should approve submission', () => {
  // Assumes submission from previous test exists
  cy.contains('Approve').click()
})
```

### 5. Use Descriptive Test Names

```typescript
// Good
it('should prevent nurse from accessing pending approvals')

// Bad
it('test approvals')
```

### 6. Group Related Tests

```typescript
describe('Medical Submissions', () => {
  describe('Create Submission', () => {
    it('should create draft')
    it('should submit for approval')
  })
  
  describe('View Submissions', () => {
    it('should list all submissions')
    it('should filter by status')
  })
})
```

## Test Users

The following seeded users are available for testing:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `doctor@clinic.sg` | `password` | Doctor | Can create, view, approve submissions |
| `nurse@clinic.sg` | `password` | Nurse | Can create and view submissions |
| `admin@clinic.sg` | `password` | Admin | Full access including user management |

## Troubleshooting

### Tests Failing: "Element not found"

**Problem:** Cypress cannot find an element.

**Solutions:**
1. Check if element exists in the UI
2. Wait for dynamic content to load
3. Use more specific selectors
4. Add `data-testid` attributes

```typescript
// Add wait for element
cy.get('[data-testid="submit-button"]', { timeout: 10000 })
  .should('be.visible')
  .click()
```

### Tests Failing: "Timed out waiting for..."

**Problem:** Element takes too long to appear.

**Solutions:**
1. Increase timeout for specific command
2. Check if API is responding
3. Verify backend is running

```typescript
cy.get('.slow-element', { timeout: 10000 }).should('be.visible')
```

### Tests Pass Locally but Fail in CI

**Problem:** Environment differences.

**Solutions:**
1. Ensure consistent seed data
2. Use `cy.wait()` for API calls
3. Check viewport size differences
4. Verify environment variables

```typescript
// Set consistent viewport
beforeEach(() => {
  cy.viewport(1280, 720)
})
```

### Login Tests Failing

**Problem:** Authentication not working.

**Solutions:**
1. Verify backend is running on port 3344
2. Check database has seed data
3. Verify API endpoints are correct

```bash
# Check backend is running
curl http://localhost:3344/api/health

# Re-seed database
cd backend
npm run db:seed
```

### Cannot Access Localhost

**Problem:** `baseUrl` not accessible.

**Solutions:**
1. Start frontend dev server: `npm run dev`
2. Verify port 6688 is not in use
3. Check firewall settings

```bash
# Start frontend
cd frontend
npm run dev

# Verify it's running
curl http://localhost:6688
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Cypress Tests

on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Backend Dependencies
        run: cd backend && npm ci
      
      - name: Setup Database
        run: cd backend && npm run db:migrate && npm run db:seed
      
      - name: Start Backend
        run: cd backend && npm start &
      
      - name: Install Frontend Dependencies
        run: cd frontend && npm ci
      
      - name: Start Frontend
        run: cd frontend && npm run dev &
      
      - name: Wait for Services
        run: |
          npx wait-on http://localhost:3344/api/health
          npx wait-on http://localhost:6688
      
      - name: Run Cypress Tests
        run: cd frontend && npm run test:e2e
      
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: frontend/cypress/screenshots
      
      - name: Upload Videos
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-videos
          path: frontend/cypress/videos
```

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress TypeScript Support](https://docs.cypress.io/guides/tooling/typescript-support)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

## Contributing

When adding new features:

1. Write E2E tests for user-facing functionality
2. Use existing custom commands where applicable
3. Follow the established test structure
4. Document any new custom commands
5. Ensure tests pass before submitting PR

```bash
# Before submitting PR
npm run test:e2e
```

---

**Last Updated:** 2024-06-15
**Cypress Version:** 15.5.0
**Maintainer:** CheckUp Medical Portal Team
