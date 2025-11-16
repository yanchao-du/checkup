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
- **PDF Generation**: pdfmake 0.2.20 (lightweight, declarative PDF generation)
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
  - Modules: Feature-based modules (users, submissions, approvals, auth, clinics, pdf)
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
  - JSON fields for user preferences (e.g., favoriteExamTypes)

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

#### PDF Module (Backend)
- **Modular Architecture**: Separation of concerns with builders and generators
  - **Service Layer**: `PdfService` orchestrates PDF generation with pdfmake
  - **Builders**: Reusable document sections (header, patient info, body measurements, remarks, declaration)
  - **Generators**: Exam-type specific content (MDW, FMW, Full Medical, ICA, Driver exams)
  - **Controller**: `PdfController` handles HTTP endpoints with JWT authentication
- **PDF Generation Flow**:
  1. User requests PDF via `GET /v1/submissions/:id/pdf`
  2. JWT authentication validates token
  3. Authorization checks user access to submission (same logic as submission view)
  4. Service retrieves full submission data with relations
  5. Generator builds exam-type specific document definition
  6. Builders add standard sections (header, patient info, declaration)
  7. pdfmake creates PDF buffer (~100-500ms generation time)
  8. Controller streams PDF to client as attachment
- **Performance Characteristics**:
  - Generation time: 100-500ms per PDF
  - Memory usage: 10-20MB per PDF
  - File size: 30-50KB per PDF
  - Library overhead: ~2MB (pdfmake)
  - No deployment complexity (pure JavaScript, no system dependencies)
- **Supported Exam Types**: All 7 exam types with exam-specific generators
  - Six-monthly MDW/FMW
  - Full Medical Exam
  - ICA Exams (PR/Student Pass/LTVP)
  - Driver Exams (TP/TP+LTA/LTA only)

#### User Preferences (Backend & Frontend)
- **Feature**: Favorite exam types for quick access
  - **Backend**: User model includes `favoriteExamTypes` JSON field (array of ExamType enums)
  - **API Endpoint**: `PUT /v1/users/me/favorites` to update user's favorite exam types
  - **Validation**: Maximum 3 favorites per user, validates against valid ExamType enum values
  - **Storage**: Persisted in PostgreSQL User table, returned in user profile responses
- **Frontend Components**:
  - **FavoritesManager**: Settings page component for managing favorites (add/remove)
  - **Dashboard Integration**: Quick action links on dashboard for favorite exam types
  - **User Experience**: Click favorite to navigate directly to new submission with exam type pre-selected
- **User Benefits**:
  - Saves 2-3 clicks per submission for frequently used exam types
  - Personalized workflow based on clinic's primary exam types
  - Favorites persist across sessions and devices

#### Driver Medical Exam Validation (Backend)
- **Feature**: Comprehensive validation for Singapore driver medical examinations (TP/LTA)
  - **Exam Types Supported**: 3 driver exam types
    - `DRIVING_LICENCE_TP`: Traffic Police driving licence only
    - `DRIVING_VOCATIONAL_TP_LTA`: Combined TP and LTA vocational licence
    - `VOCATIONAL_LICENCE_LTA`: LTA vocational licence only
  - **Type Detection**: Helper functions (`isDriverExam`, `requiresTpValidation`, `requiresLtaValidation`)
  - **Validation Rules**:
    - **AMT (Abbreviated Mental Test)**: Required for TP exams, score 0-10, auto-calculated from 10 questions
    - **LTA Vocational**: Required for LTA exams, validates color/peripheral/night vision fields
    - **Medical Declaration**: Required patient confirmation of past 6 months medical history
    - **Medical History**: Required chronic conditions checklist
    - **Assessment**: TP exams require `fitToDrive`, LTA exams require `fitForVocational`
    - **Common Fields**: Height and weight required for all driver exams
  - **Implementation**: Dedicated `driver-exam.validation.ts` with comprehensive unit test coverage
- **Frontend Components**:
  - **DrivingLicenceTpFields**: TP-only exam form with AMT section
  - **DrivingVocationalTpLtaFields**: Combined exam form with both TP and LTA sections
  - **VocationalLicenceLtaFields**: LTA-only exam form with extended vision tests
  - **Purpose-based Logic**: Different fields shown based on exam purpose (age 65+ TP only, age 64 below LTA only, etc.)
  - **Summary Components**: Exam-specific summary views before submission
  - **Detail Views**: Comprehensive read-only views for approved/submitted exams
- **Validation Enforcement**:
  - Backend validates all required fields before submission
  - Frontend provides real-time validation feedback
  - Clear error messages guide users to complete missing information

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
1. **Six-monthly Medical Exam for Migrant Domestic Worker (MOM)**
   - Required every 6 months for MDWs
   - Includes pregnancy test, infectious diseases screening
2. **Six-monthly Medical Exam for Foreign Migrant Worker (MOM)**
   - Required every 6 months for FMWs
   - Similar to MDW exams with pregnancy, syphilis, HIV, chest X-ray tests
3. **Full Medical Exam for Work Permit (MOM)**
   - Required for new work permit holders
   - Comprehensive health screening including HIV, syphilis, TB tests
4. **ICA Medical Exams (PR/Student Pass/LTVP)**
   - Required for immigration applications
   - Includes HIV and chest X-ray tests
5. **Driving Licence Medical Examination Report (TP)**
   - Required for Traffic Police driving licence applications
   - Includes Abbreviated Mental Test (AMT), vision, hearing, general medical exam
6. **Driving Licence and Vocational Licence (TP & LTA)**
   - Combined exam for both TP driving licence and LTA vocational licence
   - Includes AMT, extended vision tests (color, peripheral, night), general medical exam
7. **Vocational Licence Medical Examination (LTA)**
   - Required for LTA vocational licence only (e.g., bus, taxi drivers)
   - Includes extended vision tests, general medical exam, no AMT required

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
- ✅ PDF generation for medical submissions (server-side, all exam types)
- ✅ User favorite exam types (quick access to frequently used exam types, max 3)
- ✅ Driver medical examinations (TP/LTA) with AMT and vocational licence sections
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
