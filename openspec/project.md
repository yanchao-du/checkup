# Project Context

## Purpose
CheckUp is a comprehensive medical examination portal for Singapore clinics that manages medical exam submissions for government agencies (MOM, SPF). The system provides:
- Role-based access control (Doctor, Nurse, Admin)
- Complete approval workflow: Nurses create → Doctors approve → Submit to government
- Support for 3 Singapore exam types: MOM migrant worker exams, MOM work permit exams, SPF aged driver exams
- Draft management, audit trails, and search/filter capabilities

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS v3 with class-variance-authority
- **Forms**: React Hook Form
- **State Management**: React Context (AuthContext)
- **HTTP Client**: Fetch API
- **Testing**: Cypress for E2E tests
- **Port**: 6688

### Backend
- **Framework**: NestJS 11 with TypeScript
- **Runtime**: Node.js
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 6.18
- **Authentication**: JWT with Passport
- **Password Hashing**: bcrypt
- **Validation**: class-validator, class-transformer
- **Testing**: Jest (unit), Supertest (E2E)
- **Port**: 3344
- **API Prefix**: /v1

### Database
- **Primary DB**: PostgreSQL
- **Schema Management**: Prisma migrations
- **Seeding**: TypeScript seed scripts in `backend/prisma/seed.ts`

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled, explicit return types preferred
- **Naming Conventions**:
  - Files: kebab-case (e.g., `user-management.tsx`, `users.service.ts`)
  - Components: PascalCase (e.g., `UserManagement`, `DashboardLayout`)
  - Functions/Variables: camelCase (e.g., `getUserById`, `formData`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
  - Database Tables: snake_case (e.g., `medical_submissions`, `audit_logs`)
- **Formatting**: 
  - 2-space indentation
  - Single quotes for strings
  - Trailing commas in multi-line objects/arrays
  - Max line length: 120 characters (flexible)
- **Linting**: ESLint configured for TypeScript
- **Git Commit Messages**: 
  - Format: `type:description` (e.g., `feat:add nurse-clinic assignment`, `fix:timeline duplicate events`)
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `ui`, `chore`

### Architecture Patterns

#### Backend (NestJS)
- **Layered Architecture**:
  - Controllers: Handle HTTP requests, validation, responses
  - Services: Business logic, data access via Prisma
  - DTOs: Data transfer objects with class-validator decorators
  - Guards: JWT authentication, role-based authorization
  - Modules: Feature-based modules (users, submissions, approvals, auth, clinics)
- **API Design**:
  - RESTful endpoints with versioning (/v1/)
  - Pagination: `{ data: [], meta: { total, page, limit, totalPages } }`
  - Error responses: Consistent structure with status codes
  - JWT tokens in Authorization header: `Bearer <token>`
- **Database Patterns**:
  - UUID primary keys
  - Soft deletes where appropriate
  - Audit logging for sensitive operations
  - Many-to-many relationships via junction tables (DoctorClinic, NurseClinic)
  - `createdAt`/`updatedAt` timestamps on all entities

#### Frontend (React)
- **Component Organization**:
  - Pages in `src/components/` (e.g., Dashboard, LoginPage, UserManagement)
  - Shared UI in `src/components/ui/` (shadcn/ui components)
  - Services in `src/services/` (API clients)
  - Context in `src/components/` (AuthContext)
- **State Management**:
  - AuthContext for global auth state
  - Local component state with useState
  - Forms with React Hook Form
- **Routing**:
  - Protected routes via AuthContext
  - Role-based route guards
  - Navigation blocking for unsaved changes (useBlocker)
- **API Integration**:
  - Centralized API clients in services/ (auth.service.ts, users.service.ts, etc.)
  - Token management via AuthContext
  - Error handling with try-catch and toast notifications

### Testing Strategy

#### Backend Testing
- **Unit Tests**: Jest with service layer coverage
  - Mock Prisma with jest.fn()
  - Test business logic, error handling, validation
  - Located: `src/**/*.spec.ts`
- **E2E Tests**: Jest + Supertest
  - Test full API request/response cycle
  - Database cleanup between tests
  - Located: `test/**/*.e2e-spec.ts`
- **Coverage Goals**: 80%+ for critical paths (auth, submissions, approvals)
- **Run Commands**:
  - `npm test` - All unit tests
  - `npm run test:e2e` - E2E tests
  - `npm run test:cov` - Coverage report

#### Frontend Testing
- **E2E Tests**: Cypress
  - User flow testing (login, create submission, approve, etc.)
  - Role-based access testing
  - Located: `frontend/cypress/e2e/`
  - Custom commands in `cypress/support/commands.ts`
- **Test Data**: 
  - Seeded users (admin@clinic.sg, doctor@clinic.sg, nurse@clinic.sg)
  - Dynamic test data with timestamps for uniqueness
- **Run Commands**:
  - `npx cypress open` - Interactive mode
  - `npx cypress run` - Headless mode

### Git Workflow
- **Branching Strategy**:
  - `main` - Production-ready code
  - Feature branches from main (e.g., `corppass`, `integrateBE`)
  - Merge via pull requests (when team grows)
- **Commit Conventions**:
  - Atomic commits: One logical change per commit
  - Descriptive messages: `feat:add nurse-clinic many-to-many relationship`
  - Reference issues if applicable
- **Pre-commit**: No hooks currently, manual linting

## Domain Context

### Medical Examination Types
1. **Six-monthly Medical Exam for Migrant Domestic Workers (MOM)**
   - Required every 6 months for MDWs
   - Includes pregnancy test, infectious diseases screening
2. **Full Medical Exam for Work Permit (MOM)**
   - Required for new work permit holders
   - Comprehensive health screening
3. **Medical Exam for Aged Drivers (SPF)**
   - Required for elderly drivers to renew license
   - Focuses on vision, cognitive function

### Roles & Permissions
- **Admin**: Full system access, user management, clinic management
- **Doctor**: Approve submissions, create submissions, view all clinic submissions
- **Nurse**: Create submissions, save drafts, view own submissions

### Workflow States
- **draft**: Nurse saved but not submitted for approval
- **pending_approval**: Nurse routed to doctor, awaiting approval
- **approved**: Doctor approved, ready for government submission
- **rejected**: Doctor rejected, nurse can reopen and edit
- **submitted**: Submitted to government agency (final state)

### Data Requirements
- **NRIC Format**: Singapore NRIC (S/T/F/G + 7 digits + letter)
- **Date Formats**: ISO 8601 (YYYY-MM-DD)
- **Audit Trail**: All state changes, approvals, rejections logged
- **Data Retention**: Keep all submissions indefinitely for compliance

## Important Constraints

### Technical Constraints
- **Database**: PostgreSQL 14+ required for JSON support
- **Node.js**: v18+ required for backend
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- **Authentication**: JWT tokens expire after 24 hours
- **File Upload**: Not yet implemented (planned)

### Business Constraints
- **Singapore Context**: All exam types are Singapore-specific
- **Government Submission**: Manual process (API integration planned)
- **Clinic Isolation**: Users can only see data from their clinic(s)
- **Doctor Approval**: Required for all submissions to government

### Regulatory Constraints
- **Data Privacy**: Medical data - handle with care
- **Audit Requirements**: Complete audit trail for all submissions
- **Access Control**: Strict role-based access
- **Password Policy**: bcrypt hashing, minimum strength TBD

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data store
- **SMTP Server**: (Planned) Email notifications
- **Government APIs**: (Planned) MOM, SPF submission endpoints

### Optional Services
- **Redis**: (Planned) Session storage, caching
- **S3/Cloud Storage**: (Planned) Document uploads
- **Monitoring**: (Planned) Error tracking, analytics

### Development Tools
- **Prisma Studio**: Database GUI (`npx prisma studio`)
- **OpenAPI/Swagger**: API documentation (openapi.yaml)
- **VS Code**: Recommended IDE with ESLint, Prettier extensions

## Current State (October 2025)

### Completed Features
- ✅ Full authentication system (JWT)
- ✅ Role-based access control
- ✅ Submission CRUD operations
- ✅ Draft management
- ✅ Approval workflow (route, approve, reject, reopen)
- ✅ Audit logging
- ✅ User management (admin)
- ✅ Clinic management (admin)
- ✅ Doctor-clinic many-to-many relationship
- ✅ Nurse-clinic many-to-many relationship
- ✅ Search and filter functionality
- ✅ Settings page
- ✅ Toast notifications
- ✅ Navigation protection (unsaved changes)
- ✅ Comprehensive test coverage (backend & frontend)

### Known Issues
- None critical (see docs/fixes/ for historical fixes)

### Planned Features
- 🔜 CorpPass integration (Singapore business authentication)
- 📋 File upload for medical documents
- 📋 Email notifications
- 📋 Government API integration
- 📋 Advanced reporting and analytics
- 📋 Multi-clinic support for doctors/nurses (already implemented for data model)
