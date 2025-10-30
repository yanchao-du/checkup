# CheckUp Medical Portal - API Documentation

## Overview

This OpenAPI 3.0 specification documents the backend API for the Singapore Medical Portal, a comprehensive system for managing medical examinations across Singapore clinics with role-based access control and approval workflows.

## Current Implementation Status

**⚠️ Note**: The current application uses **localStorage** for data persistence and does not have a backend API implemented yet. This OpenAPI specification serves as:

1. **API Design Blueprint** - Documents the API structure needed to migrate from localStorage to a proper backend
2. **Spec-Driven Development** - Provides a contract-first approach for backend implementation
3. **Frontend-Backend Contract** - Defines the interface between frontend React app and future backend
4. **Documentation** - Describes all data models, endpoints, and workflows

## Exam Types Supported

### 1. Six-monthly Medical Exam for Migrant Domestic Worker (MOM)
- Regular health screenings for MDWs
- Required fields: height, weight, blood pressure, pregnancy test, chest X-ray
- Submitted to Ministry of Manpower

### 2. Full Medical Exam for Work Permit (MOM)
- Comprehensive medical examination for work permit applications
- Required fields: vital signs, HIV test, TB test, hepatitis B, syphilis, malaria tests
- Submitted to Ministry of Manpower

### 3. Medical Exam for Aged Drivers (SPF)
- Medical assessment for elderly drivers license renewal
- Required fields: visual acuity, hearing, blood pressure, chronic conditions
- Submitted to Singapore Police Force

## User Roles & Permissions

### Doctor
- ✅ Create medical exam submissions
- ✅ Approve submissions from nurses
- ✅ Submit directly to government portals
- ✅ View own submissions
- ✅ Save drafts

### Nurse
- ✅ Create medical exam submissions
- ✅ Route submissions to doctors for approval
- ✅ View own submissions
- ✅ Save drafts
- ❌ Cannot submit directly (unless approved by doctor)

### Admin
- ✅ View all submissions across the clinic
- ✅ Manage users (create, edit, deactivate)
- ✅ View dashboard statistics
- ❌ Cannot create or approve medical exams

## Approval Workflow

```
1. Nurse creates exam
   ↓
2. Saves as draft (optional)
   ↓
3. Submits for approval → Status: pending_approval
   ↓
4. Doctor reviews
   ↓
   ├─→ Approves → Status: submitted (sent to government)
   └─→ Rejects → Status: rejected (back to nurse)
```

Doctors can skip the approval step and submit directly.

## API Endpoints Summary

### Authentication
- `POST /auth/login` - User login with email/password
- `POST /auth/logout` - Logout and invalidate session
- `GET /auth/me` - Get current user info

### Submissions (Completed Exams)
- `GET /submissions` - List all submissions (filtered by role)
- `POST /submissions` - Create new submission
- `GET /submissions/{id}` - Get submission details
- `PUT /submissions/{id}` - Update submission
- `GET /audit-trail/{submissionId}` - Get audit trail

### Drafts (Incomplete Exams)
- `GET /drafts` - List all drafts
- `POST /drafts` - Create draft
- `GET /drafts/{id}` - Get draft details
- `PUT /drafts/{id}` - Update draft
- `DELETE /drafts/{id}` - Delete draft
- `POST /drafts/{id}/submit` - Convert draft to submission

### Approvals (Doctors Only)
- `GET /approvals` - List pending approvals
- `POST /approvals/{id}/approve` - Approve submission
- `POST /approvals/{id}/reject` - Reject submission

### Users (Admin Only)
- `GET /users` - List clinic users
- `POST /users` - Create new user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Deactivate user

### Dashboard
- `GET /dashboard/stats` - Get statistics and overview

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. Login via `POST /auth/login` with email and password
2. Receive JWT token in response
3. Include token in `Authorization` header for all subsequent requests:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Demo Accounts

```
Doctor:
  Email: doctor@clinic.sg
  Password: password

Nurse:
  Email: nurse@clinic.sg
  Password: password

Admin:
  Email: admin@clinic.sg
  Password: password
```

## Data Models

### MedicalSubmission
Core model for all medical exams:
- `id` - Unique identifier
- `examType` - Type of medical exam
- `patientName` - Patient full name
- `patientNric` - Singapore NRIC/FIN
- `patientDateOfBirth` - Date of birth
- `status` - draft | pending_approval | submitted | rejected
- `createdBy` / `createdByName` - User who created
- `approvedBy` / `approvedByName` - Doctor who approved
- `formData` - Exam-specific fields (varies by exam type)

### Status Flow
```
draft → pending_approval → submitted
              ↓
          rejected
```

## Using the OpenAPI Spec

### 1. View in Swagger UI
```bash
# Install Swagger UI globally
npm install -g swagger-ui-watcher

# View the spec
swagger-ui-watcher openapi.yaml
```

### 2. Generate API Client
```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o src/api/generated
```

### 3. Import to Postman
1. Open Postman
2. File → Import
3. Select `openapi.yaml`
4. Postman will generate a full collection with all endpoints

### 4. Mock Server
```bash
# Use Prism to create a mock API server
npm install -g @stoplight/prism-cli

# Start mock server
prism mock openapi.yaml
```

### 5. Validate Responses
```bash
# Validate API responses against spec
prism proxy openapi.yaml http://localhost:3344
```

## Backend Implementation Guide

### Tech Stack Recommendations

**Option 1: Node.js + Express + PostgreSQL**
```
- Express.js for REST API
- PostgreSQL for relational data
- Prisma ORM for database access
- JWT for authentication
- bcrypt for password hashing
```

**Option 2: Supabase (Recommended for Fast MVP)**
```
- Instant PostgreSQL database
- Built-in authentication
- Row-level security
- Real-time subscriptions
- Auto-generated REST API
```

**Option 3: Next.js API Routes + Supabase**
```
- Next.js API routes for backend
- Supabase for database + auth
- Server-side rendering support
- Easy deployment to Vercel
```

### Implementation Steps

1. **Set up database schema**
   - Users table (id, email, password_hash, role, clinic_id)
   - Submissions table (maps to MedicalSubmission model)
   - Audit_logs table (tracks all changes)

2. **Implement authentication**
   - Password hashing with bcrypt
   - JWT token generation and validation
   - Middleware for role-based access control

3. **Create API endpoints**
   - Follow OpenAPI spec exactly
   - Implement validation using schema
   - Add proper error handling

4. **Add authorization logic**
   - Nurses can only see/edit their own submissions
   - Doctors can approve submissions
   - Admins can see all data

5. **Implement audit trail**
   - Log all create/update/approve/reject actions
   - Store user, timestamp, and changes

6. **Add business logic**
   - Validate exam-specific fields
   - Enforce workflow (draft → pending → submitted)
   - Send notifications on approval/rejection

## Security Considerations

### Production Requirements

⚠️ **Critical**: This application handles Protected Health Information (PHI). For production deployment:

1. **Data Encryption**
   - Encrypt data at rest (database level)
   - Use HTTPS/TLS for all API calls
   - Encrypt sensitive fields (NRIC, medical data)

2. **Authentication & Authorization**
   - Implement strong password policies
   - Add multi-factor authentication (MFA)
   - Use refresh tokens with short expiry
   - Implement rate limiting

3. **Compliance**
   - HIPAA compliance (if handling US data)
   - Singapore PDPA compliance
   - Proper consent management
   - Data retention policies

4. **Audit & Logging**
   - Log all access to patient data
   - Immutable audit trail
   - Regular security audits
   - Penetration testing

5. **Data Isolation**
   - Row-level security in database
   - Multi-tenancy for different clinics
   - Prevent cross-clinic data access

6. **Backup & Recovery**
   - Regular automated backups
   - Disaster recovery plan
   - Point-in-time recovery capability

## Migration from localStorage

Current frontend uses localStorage. To migrate:

1. **Create API client layer**
   ```typescript
   // src/api/client.ts
   import axios from 'axios';
   
   const apiClient = axios.create({
     baseURL: process.env.VITE_API_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });
   
   apiClient.interceptors.request.use((config) => {
     const token = localStorage.getItem('authToken');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

2. **Replace useMockData hook**
   ```typescript
   // Replace localStorage calls with API calls
   const { data: submissions } = await apiClient.get('/submissions');
   ```

3. **Add error handling**
   ```typescript
   try {
     await apiClient.post('/submissions', data);
   } catch (error) {
     if (error.response?.status === 401) {
       // Redirect to login
     }
     // Show error toast
   }
   ```

4. **Add loading states**
   ```typescript
   const [loading, setLoading] = useState(true);
   // Show loading spinners during API calls
   ```

## Testing

### Test Data

The spec includes example data for all endpoints. Use for:
- Unit testing backend endpoints
- Integration testing
- E2E testing
- Postman collection testing

### Sample Test Flow

1. Login as nurse
2. Create draft
3. Update draft
4. Submit for approval
5. Login as doctor
6. View pending approvals
7. Approve submission
8. Verify status changed to 'submitted'

## Future Enhancements

- [ ] File uploads (chest X-rays, lab reports)
- [ ] Integration with government portals
- [ ] Real-time notifications
- [ ] Mobile app API support
- [ ] Batch submission of multiple exams
- [ ] Analytics and reporting endpoints
- [ ] Export to PDF
- [ ] E-signature integration
- [ ] Telemedicine integration

## Support

For questions or issues:
- Review the OpenAPI spec: `openapi.yaml`
- Check example requests in spec
- Use Swagger UI for interactive documentation

## License

Proprietary - HealthFirst Medical Clinic
