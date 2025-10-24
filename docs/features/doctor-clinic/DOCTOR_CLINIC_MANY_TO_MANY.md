# Doctor-Clinic Many-to-Many Relationship

**Date**: October 23, 2024  
**Feature**: Support for doctors working at multiple clinics and clinics having multiple doctors

## Overview

Updated the database schema to properly reflect the real-world relationship where:
- **Doctors** can work at one or more clinics
- **Clinics** can have one or more doctors
- Each **doctor** has a unique MCR Number (Medical Council Registration Number)
- Each **clinic** has a unique HCI Code (Healthcare Institution Code)

## Database Schema Changes

### Updated Models

#### 1. **Clinic Model**
Added:
- `hciCode` (String, unique): Healthcare Institution Code - unique identifier for the clinic
- `doctorClinics` (DoctorClinic[]): Many-to-many relationship with doctors

```prisma
model Clinic {
  id                 String              @id @default(uuid())
  name               String
  hciCode            String?             @unique @map("hci_code")
  registrationNumber String?             @unique @map("registration_number")
  // ... other fields
  
  doctorClinics      DoctorClinic[]      // Many-to-many with doctors
  users              User[]              // Keep for backward compatibility (primary clinic)
}
```

#### 2. **User Model**
Added:
- `mcrNumber` (String, unique): Medical Council Registration Number - required for doctors only
- `doctorClinics` (DoctorClinic[]): Many-to-many relationship with clinics (doctors only)

```prisma
model User {
  id                  String              @id @default(uuid())
  clinicId            String              @map("clinic_id")  // Primary clinic
  // ... other fields
  role                UserRole
  mcrNumber           String?             @unique @map("mcr_number")
  
  clinic              Clinic              @relation(fields: [clinicId], references: [id])
  doctorClinics       DoctorClinic[]      // Many-to-many with clinics (doctors only)
}
```

#### 3. **DoctorClinic Model** (NEW - Junction Table)
```prisma
model DoctorClinic {
  id        String   @id @default(uuid())
  doctorId  String   @map("doctor_id")
  clinicId  String   @map("clinic_id")
  isPrimary Boolean  @default(false) @map("is_primary")
  createdAt DateTime @default(now()) @map("created_at")
  
  doctor    User     @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  clinic    Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  @@unique([doctorId, clinicId])
  @@index([doctorId])
  @@index([clinicId])
}
```

## Migration

**Migration Name**: `20251023141408_add_doctor_clinic_many_to_many`

**SQL Changes**:
1. Added `hci_code` column to `clinics` table (nullable, unique)
2. Added `mcr_number` column to `users` table (nullable, unique)
3. Created `doctor_clinics` junction table with:
   - `id` (primary key)
   - `doctor_id` (foreign key to users)
   - `clinic_id` (foreign key to clinics)
   - `is_primary` (boolean flag)
   - `created_at` (timestamp)
   - Unique constraint on `(doctor_id, clinic_id)` pair
   - Indexes on both foreign keys

## Data Model Explanation

### Primary vs Secondary Clinics

- Each doctor has a **primary clinic** (`isPrimary: true`) - typically where they spend most time
- Doctors can work at **multiple clinics** - represented by additional `DoctorClinic` records
- The `User.clinicId` field still exists for backward compatibility and represents the primary clinic
- The `DoctorClinic.isPrimary` flag explicitly marks which clinic is primary

### Example Relationships (from seed data)

```
HealthFirst Medical Clinic (HCI0001)
├── Dr. Sarah Tan (M12345A) - PRIMARY
├── Dr. James Lee (M23456B) - PRIMARY
└── Dr. Emily Chen (M34567C) - Secondary

CareWell Medical Centre (HCI0002)
├── Dr. Sarah Tan (M12345A) - Secondary
├── Dr. Emily Chen (M34567C) - PRIMARY
└── Dr. Michael Tan (M45678D) - PRIMARY
```

## Backend Implementation

### Querying Doctors by Clinic

```typescript
// Get all doctors at a specific clinic
const doctors = await prisma.user.findMany({
  where: {
    doctorClinics: {
      some: {
        clinicId: clinicId
      }
    },
    role: 'doctor'
  },
  include: {
    doctorClinics: {
      include: {
        clinic: true
      }
    }
  }
});
```

### Querying Clinics by Doctor

```typescript
// Get all clinics where a doctor works
const clinics = await prisma.doctorClinic.findMany({
  where: {
    doctorId: doctorId
  },
  include: {
    clinic: true
  },
  orderBy: {
    isPrimary: 'desc'  // Primary clinic first
  }
});
```

### Adding Doctor to Clinic

```typescript
await prisma.doctorClinic.create({
  data: {
    doctorId: doctorId,
    clinicId: clinicId,
    isPrimary: false  // or true if this is their primary clinic
  }
});
```

## Frontend Changes Needed

### 1. User Management
- [ ] Update user creation/edit forms to:
  - Collect MCR number for doctors
  - Allow selection of multiple clinics for doctors
  - Mark primary clinic

### 2. Doctor Selection Components
- [ ] Update doctor dropdowns to:
  - Show all doctors from current clinic
  - Optionally show MCR number alongside name
  - Filter by clinic if needed

### 3. Display Components
- [ ] Show doctor's MCR number in profiles
- [ ] Show clinic's HCI code in clinic details
- [ ] Display list of clinics for each doctor
- [ ] Display list of doctors for each clinic

### 4. TypeScript Interfaces
```typescript
interface Doctor {
  id: string;
  name: string;
  email: string;
  mcrNumber?: string;  // NEW
  clinics: {  // NEW
    id: string;
    name: string;
    hciCode?: string;
    isPrimary: boolean;
  }[];
}

interface Clinic {
  id: string;
  name: string;
  hciCode?: string;  // NEW
  doctors: {  // NEW
    id: string;
    name: string;
    mcrNumber?: string;
    isPrimary: boolean;
  }[];
}
```

## Backward Compatibility

- ✅ Existing `User.clinicId` field maintained for backward compatibility
- ✅ Existing relationships still work
- ✅ Nurses and admins only have one clinic (via `clinicId`)
- ✅ Only doctors use the many-to-many `DoctorClinic` relationship
- ✅ Both `hciCode` and `mcrNumber` are nullable (optional) to not break existing data

## Validation Rules

### MCR Number
- **Format**: 1 letter + 5 numbers + 1 letter (e.g., M12345A)
- **Required**: Only for users with role='doctor'
- **Unique**: Must be unique across all doctors
- **Regex**: `/^[A-Z]\d{5}[A-Z]$/`
- **Validation**: Enforced in `CreateUserDto` and `UpdateUserDto`

### HCI Code
- **Format**: 7 alphanumeric characters (e.g., HCI0001)
- **Required**: Optional but recommended for all clinics
- **Unique**: Must be unique across all clinics
- **Regex**: `/^[A-Z0-9]{7}$/`
- **Validation**: Enforced in `CreateClinicDto` and `UpdateClinicDto`

## Benefits

1. **Accuracy**: Properly models real-world doctor-clinic relationships
2. **Flexibility**: Doctors can work at multiple locations
3. **Compliance**: MCR and HCI codes support regulatory requirements
4. **Scalability**: Easy to add/remove doctor-clinic associations
5. **Reporting**: Can track which doctors work at which clinics
6. **Audit**: Clear record of doctor assignments over time

## Testing Checklist

- [ ] Create doctor with MCR number
- [ ] Create clinic with HCI code
- [ ] Assign doctor to multiple clinics
- [ ] Mark one clinic as primary for doctor
- [ ] Query all doctors at a specific clinic
- [ ] Query all clinics for a specific doctor
- [ ] Remove doctor from clinic
- [ ] Update primary clinic designation
- [ ] Validate MCR number uniqueness
- [ ] Validate HCI code uniqueness
- [ ] Test submission assignment with multi-clinic doctors

## Migration Rollback

If needed to rollback:
```bash
npx prisma migrate resolve --rolled-back 20251023141408_add_doctor_clinic_many_to_many
```

Then create a new migration to drop:
- `doctor_clinics` table
- `hci_code` column from `clinics`
- `mcr_number` column from `users`

## Files Modified

### Backend
- `backend/prisma/schema.prisma` - Updated models
- `backend/prisma/migrations/20251023141408_add_doctor_clinic_many_to_many/migration.sql` - Migration SQL
- `backend/prisma/seed.ts` - Updated seed data with MCR, HCI, and relationships
- `backend/src/users/dto/create-user.dto.ts` - Added MCR validation for doctors
- `backend/src/users/dto/update-user.dto.ts` - Added MCR validation for doctors
- `backend/src/clinics/dto/create-clinic.dto.ts` - Created with HCI validation
- `backend/src/clinics/dto/update-clinic.dto.ts` - Created with HCI validation

### Frontend (Pending)
- TypeScript interfaces for User and Clinic
- User management forms
- Doctor selection components
- Display components for profiles and lists

## Next Steps

1. Update backend API endpoints to return doctor-clinic relationships
2. Update frontend TypeScript interfaces
3. Modify user management UI to handle multiple clinics
4. Update doctor selection dropdowns
5. Add validation for MCR and HCI code formats
6. Create admin UI for managing doctor-clinic assignments
