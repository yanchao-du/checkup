# Database Schema for CheckUp Medical Portal

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLINICS                                 │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              VARCHAR(36)                                │
│    │ name            VARCHAR(255)                               │
│    │ registration    VARCHAR(50)                                │
│    │ address         TEXT                                       │
│    │ phone           VARCHAR(20)                                │
│    │ email           VARCHAR(255)                               │
│    │ created_at      TIMESTAMP                                  │
│    │ updated_at      TIMESTAMP                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:N
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              VARCHAR(36)                                │
│ FK │ clinic_id       VARCHAR(36) → CLINICS.id                   │
│    │ email           VARCHAR(255) UNIQUE                        │
│    │ password_hash   VARCHAR(255)                               │
│    │ name            VARCHAR(255)                               │
│    │ role            ENUM('doctor','nurse','admin')             │
│    │ status          ENUM('active','inactive')                  │
│    │ last_login_at   TIMESTAMP                                  │
│    │ created_at      TIMESTAMP                                  │
│    │ updated_at      TIMESTAMP                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:N
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MEDICAL_SUBMISSIONS                          │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    VARCHAR(36)                          │
│ FK │ clinic_id             VARCHAR(36) → CLINICS.id             │
│ FK │ created_by            VARCHAR(36) → USERS.id               │
│ FK │ approved_by           VARCHAR(36) → USERS.id (nullable)    │
│    │ exam_type             VARCHAR(100)                         │
│    │ patient_name          VARCHAR(255)                         │
│    │ patient_nric          VARCHAR(20)                          │
│    │ patient_dob           DATE                                 │
│    │ status                ENUM('draft','pending_approval',     │
│    │                            'submitted','rejected')         │
│    │ form_data             JSONB                                │
│    │ created_date          TIMESTAMP                            │
│    │ submitted_date        TIMESTAMP (nullable)                 │
│    │ approved_date         TIMESTAMP (nullable)                 │
│    │ rejected_reason       TEXT (nullable)                      │
│    │ updated_at            TIMESTAMP                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:N
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AUDIT_LOGS                                │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    VARCHAR(36)                          │
│ FK │ submission_id         VARCHAR(36) → MEDICAL_SUBMISSIONS.id │
│ FK │ user_id               VARCHAR(36) → USERS.id               │
│    │ event_type            VARCHAR(50)                          │
│    │                       (created, updated, submitted,        │
│    │                        approved, rejected)                 │
│    │ changes               JSONB                                │
│    │ ip_address            VARCHAR(45)                          │
│    │ user_agent            TEXT                                 │
│    │ timestamp             TIMESTAMP                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        SESSIONS (Optional)                      │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    VARCHAR(36)                          │
│ FK │ user_id               VARCHAR(36) → USERS.id               │
│    │ token_hash            VARCHAR(255)                         │
│    │ expires_at            TIMESTAMP                            │
│    │ created_at            TIMESTAMP                            │
└─────────────────────────────────────────────────────────────────┘
```

## PostgreSQL Schema (SQL DDL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clinics table
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles enum
CREATE TYPE user_role AS ENUM ('doctor', 'nurse', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam types enum
CREATE TYPE exam_type AS ENUM (
  'Six-monthly Medical Exam for Migrant Domestic Worker (MOM)',
    'Full Medical Exam for Work Permit (MOM)',
    'Medical Exam for Aged Drivers (SPF)'
);

-- Submission status enum
CREATE TYPE submission_status AS ENUM (
    'draft',
    'pending_approval',
    'submitted',
    'rejected'
);

-- Medical submissions table
CREATE TABLE medical_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    exam_type exam_type NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_nric VARCHAR(20) NOT NULL,
    patient_dob DATE NOT NULL,
    status submission_status DEFAULT 'draft',
    form_data JSONB NOT NULL DEFAULT '{}',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_date TIMESTAMP,
    approved_date TIMESTAMP,
    rejected_reason TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event types enum
CREATE TYPE event_type AS ENUM (
    'created',
    'updated',
    'submitted',
    'approved',
    'rejected',
    'deleted'
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES medical_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    event_type event_type NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for JWT token management)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_clinic ON users(clinic_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_submissions_clinic ON medical_submissions(clinic_id);
CREATE INDEX idx_submissions_created_by ON medical_submissions(created_by);
CREATE INDEX idx_submissions_status ON medical_submissions(status);
CREATE INDEX idx_submissions_patient_nric ON medical_submissions(patient_nric);
CREATE INDEX idx_submissions_exam_type ON medical_submissions(exam_type);
CREATE INDEX idx_submissions_created_date ON medical_submissions(created_date DESC);
CREATE INDEX idx_audit_submission ON audit_logs(submission_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON medical_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on tables
ALTER TABLE medical_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all submissions in their clinic
CREATE POLICY admin_view_all_submissions ON medical_submissions
    FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID 
            AND role = 'admin'
        )
    );

-- Policy: Doctors/Nurses can see their own submissions
CREATE POLICY user_view_own_submissions ON medical_submissions
    FOR SELECT
    USING (
        created_by = current_setting('app.current_user_id')::UUID
        OR approved_by = current_setting('app.current_user_id')::UUID
    );

-- Policy: Doctors can see pending approvals
CREATE POLICY doctor_view_pending_approvals ON medical_submissions
    FOR SELECT
    USING (
        status = 'pending_approval'
        AND clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID 
            AND role = 'doctor'
        )
    );

-- Policy: Users can insert submissions
CREATE POLICY user_insert_submission ON medical_submissions
    FOR INSERT
    WITH CHECK (
        created_by = current_setting('app.current_user_id')::UUID
        AND clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID
        )
    );

-- Policy: Users can update their own drafts/pending submissions
CREATE POLICY user_update_own_submission ON medical_submissions
    FOR UPDATE
    USING (
        created_by = current_setting('app.current_user_id')::UUID
        AND status IN ('draft', 'pending_approval', 'rejected')
    );

-- Policy: Doctors can update submissions for approval
CREATE POLICY doctor_approve_submission ON medical_submissions
    FOR UPDATE
    USING (
        status = 'pending_approval'
        AND clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID 
            AND role = 'doctor'
        )
    );
```

## Seed Data

```sql
-- Insert demo clinic
INSERT INTO clinics (id, name, registration_number, address, phone, email) VALUES
('550e8400-e29b-41d4-a716-446655440000', 
 'HealthFirst Medical Clinic', 
 'RC001234',
 '123 Orchard Road, #01-01, Singapore 238858',
 '+65 6123 4567',
 'info@healthfirst.sg');

-- Insert demo users (passwords are hashed 'password')
INSERT INTO users (id, clinic_id, email, password_hash, name, role, status) VALUES
('550e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440000',
 'doctor@clinic.sg',
 '$2b$10$rKvvJQJKJQjKJQjKJQjKJOeY8w8w8w8w8w8w8w8w8w8w8w8w8w',
 'Dr. Sarah Tan',
 'doctor',
 'active'),
 
('550e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440000',
 'nurse@clinic.sg',
 '$2b$10$rKvvJQJKJQjKJQjKJQjKJOeY8w8w8w8w8w8w8w8w8w8w8w8w',
 'Nurse Mary Lim',
 'nurse',
 'active'),
 
('550e8400-e29b-41d4-a716-446655440003',
 '550e8400-e29b-41d4-a716-446655440000',
 'admin@clinic.sg',
 '$2b$10$rKvvJQJKJQjKJQjKJQjKJOeY8w8w8w8w8w8w8w8w8w8w8w8w',
 'Admin John Wong',
 'admin',
 'active');

-- Insert demo submissions
INSERT INTO medical_submissions (
    id, clinic_id, created_by, approved_by, exam_type, 
    patient_name, patient_nric, patient_dob, status, 
    form_data, created_date, submitted_date, approved_date
) VALUES
('650e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440000',
 '550e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440001',
 'Six-monthly Medical Exam for Migrant Domestic Worker (MOM)',
 'Maria Santos',
 'S1234567A',
 '1990-05-15',
 'submitted',
 '{"height": "160", "weight": "55", "bloodPressure": "120/80", "pregnancyTest": "Negative", "chestXray": "Normal"}',
 '2025-10-15 10:30:00',
 '2025-10-15 14:20:00',
 '2025-10-15 14:00:00');
```

## Prisma Schema (Optional - for TypeScript/Node.js)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Clinic {
  id                 String              @id @default(uuid())
  name               String
  registrationNumber String?             @unique @map("registration_number")
  address            String?
  phone              String?
  email              String?
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")
  
  users              User[]
  submissions        MedicalSubmission[]

  @@map("clinics")
}

model User {
  id                String              @id @default(uuid())
  clinicId          String              @map("clinic_id")
  email             String              @unique
  passwordHash      String              @map("password_hash")
  name              String
  role              UserRole
  status            UserStatus          @default(active)
  lastLoginAt       DateTime?           @map("last_login_at")
  createdAt         DateTime            @default(now()) @map("created_at")
  updatedAt         DateTime            @updatedAt @map("updated_at")
  
  clinic            Clinic              @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  createdSubmissions MedicalSubmission[] @relation("CreatedBy")
  approvedSubmissions MedicalSubmission[] @relation("ApprovedBy")
  auditLogs         AuditLog[]
  sessions          Session[]

  @@index([clinicId])
  @@index([email])
  @@map("users")
}

model MedicalSubmission {
  id              String            @id @default(uuid())
  clinicId        String            @map("clinic_id")
  createdById     String            @map("created_by")
  approvedById    String?           @map("approved_by")
  examType        ExamType          @map("exam_type")
  patientName     String            @map("patient_name")
  patientNric     String            @map("patient_nric")
  patientDob      DateTime          @map("patient_dob") @db.Date
  status          SubmissionStatus  @default(draft)
  formData        Json              @map("form_data")
  createdDate     DateTime          @default(now()) @map("created_date")
  submittedDate   DateTime?         @map("submitted_date")
  approvedDate    DateTime?         @map("approved_date")
  rejectedReason  String?           @map("rejected_reason")
  updatedAt       DateTime          @updatedAt @map("updated_at")
  
  clinic          Clinic            @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  createdBy       User              @relation("CreatedBy", fields: [createdById], references: [id])
  approvedBy      User?             @relation("ApprovedBy", fields: [approvedById], references: [id])
  auditLogs       AuditLog[]

  @@index([clinicId])
  @@index([createdById])
  @@index([status])
  @@index([patientNric])
  @@index([examType])
  @@index([createdDate(sort: Desc)])
  @@map("medical_submissions")
}

model AuditLog {
  id            String    @id @default(uuid())
  submissionId  String    @map("submission_id")
  userId        String    @map("user_id")
  eventType     EventType @map("event_type")
  changes       Json?
  ipAddress     String?   @map("ip_address")
  userAgent     String?   @map("user_agent")
  timestamp     DateTime  @default(now())
  
  submission    MedicalSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  user          User              @relation(fields: [userId], references: [id])

  @@index([submissionId])
  @@index([timestamp(sort: Desc)])
  @@map("audit_logs")
}

model Session {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  tokenHash  String   @map("token_hash")
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

enum UserRole {
  doctor
  nurse
  admin
}

enum UserStatus {
  active
  inactive
}

enum ExamType {
  Six_monthly_Medical_Exam_for_Migrant_Domestic_Worker_MOM @map("Six-monthly Medical Exam for Migrant Domestic Worker (MOM)")
  Full_Medical_Exam_for_Work_Permit_MOM                     @map("Full Medical Exam for Work Permit (MOM)")
  Medical_Exam_for_Aged_Drivers_SPF                         @map("Medical Exam for Aged Drivers (SPF)")
}

enum SubmissionStatus {
  draft
  pending_approval
  submitted
  rejected
}

enum EventType {
  created
  updated
  submitted
  approved
  rejected
  deleted
}
```

## Migration Guide

### Step 1: Set up Database

```bash
# Using PostgreSQL locally
createdb checkup_medical

# Or using Docker
docker run --name checkup-postgres \
  -e POSTGRES_DB=checkup_medical \
  -e POSTGRES_USER=checkup \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: Run Migrations

```bash
# Using raw SQL
psql -U checkup -d checkup_medical -f schema.sql

# Or using Prisma
npx prisma migrate dev --name init
npx prisma generate
```

### Step 3: Seed Database

```bash
# Run seed data
psql -U checkup -d checkup_medical -f seed.sql

# Or using Prisma
npx prisma db seed
```

## Data Migration from localStorage

```typescript
// migrate-from-localstorage.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLocalStorageData() {
  // Get data from localStorage
  const submissions = JSON.parse(localStorage.getItem('medicalSubmissions') || '[]');
  const drafts = JSON.parse(localStorage.getItem('medicalDrafts') || '[]');
  
  const allData = [...submissions, ...drafts];
  
  for (const item of allData) {
    await prisma.medicalSubmission.create({
      data: {
        examType: item.examType,
        patientName: item.patientName,
        patientNric: item.patientNric,
        patientDob: new Date(item.patientDateOfBirth),
        status: item.status,
        formData: item.formData,
        createdDate: new Date(item.createdDate),
        submittedDate: item.submittedDate ? new Date(item.submittedDate) : null,
        approvedDate: item.approvedDate ? new Date(item.approvedDate) : null,
        clinicId: item.clinicId,
        createdById: item.createdBy,
        approvedById: item.approvedBy || null,
      },
    });
  }
  
  console.log(`Migrated ${allData.length} submissions`);
}
```

## Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U checkup checkup_medical | gzip > "backups/checkup_$DATE.sql.gz"

# Keep only last 30 days
find backups/ -name "checkup_*.sql.gz" -mtime +30 -delete
```

## Performance Optimization

1. **Indexes**: Already added on frequently queried columns
2. **Partitioning**: Partition submissions by created_date for large datasets
3. **Caching**: Use Redis for frequently accessed data
4. **Read Replicas**: Use read replicas for reports and analytics

## Monitoring Queries

```sql
-- Check submissions by status
SELECT status, COUNT(*) 
FROM medical_submissions 
GROUP BY status;

-- Check submissions by exam type
SELECT exam_type, COUNT(*) 
FROM medical_submissions 
GROUP BY exam_type;

-- Find old drafts (>30 days)
SELECT id, patient_name, created_date 
FROM medical_submissions 
WHERE status = 'draft' 
  AND created_date < NOW() - INTERVAL '30 days';

-- Check user activity
SELECT u.name, u.role, COUNT(ms.id) as submission_count
FROM users u
LEFT JOIN medical_submissions ms ON u.id = ms.created_by
GROUP BY u.id, u.name, u.role
ORDER BY submission_count DESC;
```
