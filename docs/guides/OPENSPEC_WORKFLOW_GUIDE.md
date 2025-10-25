# OpenSpec Workflow Guide for CheckUp Project

## What is OpenSpec?

OpenSpec is a **spec-driven development system** that helps manage changes to your codebase through structured proposals, design documents, and specification deltas. Think of it as a "change request system" that ensures:

- 📋 **Planned Changes**: All significant changes are documented before implementation
- 🎯 **Clear Scope**: What's changing and why is explicit
- ✅ **Validation**: Automated checks ensure specs are complete
- 📚 **History**: Archive of all changes for future reference

## Three-Stage Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: CREATING CHANGES (Proposal & Planning)           │
├─────────────────────────────────────────────────────────────┤
│  1. Review current state (specs, active changes)            │
│  2. Create change proposal with unique ID                   │
│  3. Write spec deltas (ADDED/MODIFIED/REMOVED)              │
│  4. Create tasks checklist                                  │
│  5. Validate with `openspec validate --strict`              │
│  6. Get approval before implementation                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: IMPLEMENTING CHANGES (Development)                │
├─────────────────────────────────────────────────────────────┤
│  1. Read proposal.md (understand WHY)                       │
│  2. Read design.md if exists (understand HOW)               │
│  3. Read tasks.md (understand WHAT)                         │
│  4. Implement tasks sequentially                            │
│  5. Update checklist as you complete tasks                  │
│  6. Test and verify all requirements met                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: ARCHIVING CHANGES (Post-deployment)               │
├─────────────────────────────────────────────────────────────┤
│  1. Move change to archive/ with timestamp                  │
│  2. Update specs/ with final state                          │
│  3. Validate archived change                                │
│  4. Commit as separate PR                                   │
└─────────────────────────────────────────────────────────────┘
```

## When to Create an OpenSpec Proposal

### ✅ CREATE PROPOSAL FOR:
- **New Features**: Adding capabilities (e.g., CorpPass integration)
- **Breaking Changes**: API changes, schema migrations
- **Architecture Changes**: Moving from REST to GraphQL
- **Performance Optimizations**: If behavior changes
- **Security Updates**: New auth patterns, encryption

### ❌ NO PROPOSAL NEEDED FOR:
- **Bug Fixes**: Restoring intended behavior
- **Typos**: Code comments, documentation
- **Formatting**: Code style, whitespace
- **Dependency Updates**: Non-breaking version bumps
- **Config Changes**: Port numbers, env vars

**When Unclear?** → Create a proposal (safer!)

## Directory Structure

```
CheckUp/
├── openspec/
│   ├── AGENTS.md                 # Instructions (you're reading the guide for this)
│   ├── project.md                # ✅ NOW POPULATED with your project details
│   ├── specs/                    # Current truth - what IS built
│   │   ├── auth/                 # Example capability
│   │   │   ├── spec.md          # Requirements & scenarios
│   │   │   └── design.md        # Technical patterns
│   │   ├── submissions/
│   │   └── approvals/
│   ├── changes/                  # Proposals - what SHOULD change
│   │   ├── add-corppass/        # Example active change
│   │   │   ├── proposal.md      # Why, what, impact
│   │   │   ├── tasks.md         # Implementation checklist
│   │   │   ├── design.md        # Technical decisions (optional)
│   │   │   └── specs/           # Delta changes
│   │   │       └── auth/
│   │   │           └── spec.md  # ADDED/MODIFIED/REMOVED
│   │   └── archive/             # Completed changes
│   │       └── 2025-10-15-add-nurse-clinic/
│   └── ...
```

## Essential CLI Commands

### Viewing Current State
```bash
# List all active change proposals
openspec list

# List all current specifications (capabilities)
openspec list --specs

# Show details of a specific change
openspec show add-corppass

# Show details of a specific spec
openspec show auth --type spec

# Show only the delta changes
openspec show add-corppass --json --deltas-only

# See the diff between current and proposed specs
openspec diff add-corppass
```

### Validation
```bash
# Validate a specific change (strict mode recommended)
openspec validate add-corppass --strict

# Validate all changes
openspec validate

# Validate a specific spec
openspec validate auth --type spec
```

### Archiving (After Deployment)
```bash
# Archive a completed change
openspec archive add-corppass

# Archive without updating specs (for tooling-only changes)
openspec archive add-corppass --skip-specs

# Non-interactive archive (skip confirmations)
openspec archive add-corppass --yes
```

### Project Management
```bash
# Initialize OpenSpec in a new project
openspec init

# Update instruction files (AGENTS.md, etc.)
openspec update
```

## How to Work with AI on This Project

### Workflow with AI Assistant

#### 1. **Starting a New Feature**

**You say:**
> "I want to add CorpPass authentication to replace email/password login. Please create an OpenSpec change proposal for this feature."

**AI will:**
1. Read `openspec/project.md` to understand your stack
2. Check existing specs with `openspec list --specs`
3. Check active changes with `openspec list`
4. Create a unique change ID: `add-corppass-auth`
5. Scaffold the proposal structure:
   - `openspec/changes/add-corppass-auth/proposal.md`
   - `openspec/changes/add-corppass-auth/tasks.md`
   - `openspec/changes/add-corppass-auth/design.md` (if needed)
   - `openspec/changes/add-corppass-auth/specs/auth/spec.md` (deltas)
6. Write comprehensive spec deltas with scenarios
7. Validate with `openspec validate add-corppass-auth --strict`
8. Share the proposal for your review

**You review and approve:**
> "Looks good, let's implement it!"

#### 2. **Implementing the Change**

**AI will:**
1. Read `proposal.md` to understand WHY
2. Read `design.md` to understand HOW (technical approach)
3. Read `tasks.md` to get the checklist
4. Implement tasks one by one, in order
5. Update checklist: `- [ ]` → `- [x]` as completed
6. Run tests, validate implementation
7. Confirm all requirements from spec deltas are met

#### 3. **After Deployment**

**You say:**
> "CorpPass is deployed to production. Please archive the change."

**AI will:**
1. Move `changes/add-corppass-auth/` → `changes/archive/2025-10-24-add-corppass-auth/`
2. Update `specs/auth/spec.md` with the final state
3. Validate the archived change
4. Create a commit for the archive

## Creating Your First Change Proposal

### Example: Adding CorpPass Integration

Let's walk through creating a real proposal for your project.

#### Step 1: AI Creates the Proposal

The AI will create:

**`openspec/changes/add-corppass-auth/proposal.md`**
```markdown
## Why
CheckUp currently uses email/password authentication, but Singapore government 
regulations require CorpPass for business authentication. This change adds 
CorpPass as an alternative authentication method alongside existing email/password.

## What Changes
- Add CorpPass OAuth 2.0 authentication flow
- Add CorpPass configuration to backend
- Add "Login with CorpPass" button to frontend
- Maintain existing email/password auth for backward compatibility
- Link CorpPass accounts to existing users by email

## Impact
- Affected specs: `auth`
- Affected code:
  - Backend: `src/auth/` module (new CorpPass strategy)
  - Frontend: `src/components/LoginPage.tsx`
  - Database: New `corppass_users` table
  - Environment: New `CORPPASS_CLIENT_ID`, `CORPPASS_CLIENT_SECRET`
- **BREAKING**: None (additive change)
```

**`openspec/changes/add-corppass-auth/specs/auth/spec.md`**
```markdown
## ADDED Requirements

### Requirement: CorpPass Authentication
The system SHALL support CorpPass OAuth 2.0 authentication for Singapore business users.

#### Scenario: User logs in with CorpPass
- **GIVEN** a user with a valid CorpPass account
- **WHEN** user clicks "Login with CorpPass"
- **THEN** system redirects to CorpPass login page
- **AND** user completes CorpPass authentication
- **AND** system receives OAuth callback with user info
- **AND** system creates/updates user record
- **AND** system issues JWT token
- **AND** user is redirected to dashboard

#### Scenario: CorpPass login fails
- **GIVEN** a user attempts CorpPass login
- **WHEN** CorpPass authentication fails
- **THEN** system displays error message
- **AND** user can retry or use email/password login

### Requirement: Account Linking
The system SHALL automatically link CorpPass accounts to existing users by email address.

#### Scenario: CorpPass user matches existing email
- **GIVEN** a user with email "doctor@clinic.sg" exists in the system
- **WHEN** same email logs in via CorpPass for first time
- **THEN** system links CorpPass account to existing user record
- **AND** user can subsequently use either login method

## MODIFIED Requirements

### Requirement: User Authentication (existing requirement)
The system SHALL support both email/password and CorpPass authentication methods.

**Previous**: The system SHALL authenticate users with email and password.
**Now**: The system SHALL authenticate users with email/password OR CorpPass.

#### Scenario: User has choice of login methods (NEW)
- **GIVEN** user navigates to login page
- **WHEN** page loads
- **THEN** user sees "Email/Password" form
- **AND** user sees "Login with CorpPass" button
- **AND** user can choose either method
```

**`openspec/changes/add-corppass-auth/tasks.md`**
```markdown
## 1. Backend Implementation
- [ ] 1.1 Install passport-oauth2 package
- [ ] 1.2 Create CorpPass strategy in `src/auth/strategies/corppass.strategy.ts`
- [ ] 1.3 Add CorpPass routes to `src/auth/auth.controller.ts`
- [ ] 1.4 Add environment variables to `.env.example`
- [ ] 1.5 Create migration for `corppass_users` table
- [ ] 1.6 Implement account linking logic in `src/auth/auth.service.ts`

## 2. Frontend Implementation
- [ ] 2.1 Add "Login with CorpPass" button to `LoginPage.tsx`
- [ ] 2.2 Implement CorpPass OAuth flow in `auth.service.ts`
- [ ] 2.3 Handle OAuth callback route
- [ ] 2.4 Update AuthContext to support CorpPass tokens

## 3. Testing
- [ ] 3.1 Write unit tests for CorpPass strategy
- [ ] 3.2 Write E2E tests for CorpPass login flow
- [ ] 3.3 Test account linking scenarios
- [ ] 3.4 Test error handling (failed auth, network errors)

## 4. Documentation
- [ ] 4.1 Update README with CorpPass setup instructions
- [ ] 4.2 Update API docs with new endpoints
- [ ] 4.3 Add CorpPass environment variables to docs

## 5. Deployment
- [ ] 5.1 Register app with CorpPass developer portal
- [ ] 5.2 Configure production credentials
- [ ] 5.3 Update deployment scripts
```

#### Step 2: AI Validates

```bash
$ openspec validate add-corppass-auth --strict
✓ Proposal structure valid
✓ All spec deltas have scenarios
✓ Tasks checklist complete
✓ No validation errors
```

#### Step 3: You Approve

You review the proposal and either:
- ✅ Approve: "Let's implement this!"
- 🔄 Request changes: "Can we also support SingPass?"
- ❌ Reject: "Let's stick with email/password for now"

#### Step 4: AI Implements

The AI goes through `tasks.md` one by one, implementing each item and marking it complete.

## Best Practices

### 1. **Unique Change IDs**
- Use kebab-case: `add-corppass-auth`
- Start with verb: `add-`, `update-`, `remove-`, `refactor-`
- Be descriptive: `fix-timeline-events` not `fix-bug`

### 2. **Write Good Scenarios**
Every requirement needs at least one scenario:
```markdown
#### Scenario: Success case
- **GIVEN** [initial state]
- **WHEN** [action]
- **THEN** [expected result]
- **AND** [additional expectations]
```

### 3. **Mark Breaking Changes**
In `proposal.md`:
```markdown
- **BREAKING**: Remove email/password auth (forces CorpPass)
- **BREAKING**: Change JWT payload structure
```

### 4. **Design.md When Needed**
Create `design.md` when:
- Architecture decisions need explanation
- Multiple technical approaches considered
- Complex implementation details
- Trade-offs to document

Skip it for straightforward changes.

### 5. **Validate Before Sharing**
Always run:
```bash
openspec validate add-corppass-auth --strict
```

### 6. **One Change at a Time**
Don't mix unrelated changes. Create separate proposals for:
- Adding CorpPass auth → `add-corppass-auth`
- Refactoring user service → `refactor-user-service`

## Integration with Your Current Workflow

### Current CheckUp Workflow
```
1. Identify feature/fix needed
2. Discuss approach
3. Implement code
4. Test
5. Commit with `feat:` or `fix:` prefix
6. Deploy
```

### Enhanced Workflow with OpenSpec
```
1. Identify feature/fix needed
2. If significant: Create OpenSpec proposal ← NEW
3. AI validates proposal ← NEW
4. You approve proposal ← NEW
5. AI implements following tasks.md ← GUIDED
6. Test (already in tasks.md)
7. Commit with `feat:` prefix (same)
8. Deploy (same)
9. Archive OpenSpec change ← NEW
```

## Quick Reference Card

```bash
# Before coding a new feature
openspec list --specs              # What capabilities exist?
openspec list                      # What changes are active?

# During planning
openspec show [change-id]          # View proposal
openspec diff [change-id]          # See spec changes
openspec validate [change-id] --strict  # Check proposal

# During implementation
# (Just follow tasks.md and update checkboxes)

# After deployment
openspec archive [change-id]       # Move to archive
```

## Getting Help

### From AI Assistant
- "Please create an OpenSpec proposal for [feature]"
- "Show me the current specs for [capability]"
- "What active changes are there?"
- "Help me understand the OpenSpec workflow"

### From OpenSpec CLI
```bash
openspec --help                    # General help
openspec list --help               # Command-specific help
openspec validate --help           # Validation options
```

### Documentation
- `openspec/AGENTS.md` - Full instructions for AI
- `openspec/project.md` - Your project context
- This guide - Workflow overview

## Next Steps

1. ✅ **Done**: Your `project.md` is populated
2. 📋 **Next**: Ask AI to create your first change proposal
3. 🚀 **Then**: Follow the implementation workflow
4. 📦 **Finally**: Archive the change after deployment

---

**Ready to start?** Ask the AI:
> "I want to add CorpPass authentication. Please create an OpenSpec change proposal for this feature."

Or:
> "Please explain the differences between specs/ and changes/ directories."

Or:
> "Show me what active changes currently exist in the project."
