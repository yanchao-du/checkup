# Nurse-Clinic Many-to-Many Relationship Implementation

## Overview
This document describes the implementation of many-to-many relationships between nurses and clinics, allowing nurses to work in multiple clinics, similar to how doctors can work in multiple clinics.

## Database Schema Changes

### New Table: `nurse_clinics`

A junction table similar to `doctor_clinics`:

```sql
CREATE TABLE nurse_clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(nurse_id, clinic_id)
);

CREATE INDEX idx_nurse_clinics_nurse_id ON nurse_clinics(nurse_id);
CREATE INDEX idx_nurse_clinics_clinic_id ON nurse_clinics(clinic_id);
```

### Updated Models

#### Clinic Model
- Added `nurseClinics: NurseClinic[]` relation

#### User Model  
- Added `nurseClinics: NurseClinic[]` relation for nurses

## Backend Changes

### Prisma Schema (`backend/prisma/schema.prisma`)

```prisma
model Clinic {
  // ... existing fields
  nurseClinics       NurseClinic[]       // Many-to-many with nurses
}

model User {
  // ... existing fields
  nurseClinics        NurseClinic[]       // Many-to-many with clinics (nurses only)
}

model NurseClinic {
  id        String   @id @default(uuid())
  nurseId   String   @map("nurse_id")
  clinicId  String   @map("clinic_id")
  isPrimary Boolean  @default(false) @map("is_primary")
  createdAt DateTime @default(now()) @map("created_at")
  
  nurse     User     @relation(fields: [nurseId], references: [id], onDelete: Cascade)
  clinic    Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  @@unique([nurseId, clinicId])
  @@index([nurseId])
  @@index([clinicId])
  @@map("nurse_clinics")
}
```

### Users Service (`backend/src/users/users.service.ts`)

#### Updated Methods:

**1. `findAll(clinicId, page, limit)`**
- Now includes nurses through `NurseClinic` junction table
- Query uses OR condition to find:
  - Admins with direct `clinicId`
  - Doctors through `doctorClinics` relationship
  - Nurses through `nurseClinics` relationship

```typescript
where: {
  OR: [
    { clinicId, role: 'admin' },
    { role: 'doctor', doctorClinics: { some: { clinicId } } },
    { role: 'nurse', nurseClinics: { some: { clinicId } } },
  ],
}
```

**2. `create(clinicId, createUserDto)`**
- When creating a nurse, automatically creates `NurseClinic` entry marking the clinic as primary

**3. `findOne(id, clinicId)`**
- Updated WHERE clause to find nurses through `nurseClinics`
- Returns nurse's clinic list through `nurseClinics` relation
- Transforms response to include `clinics` array for nurses

**4. New Method: `findNurses(clinicId)`**
- Returns all active nurses working at a clinic
- Similar to `findDoctors()` but for nurses

### Users Controller (`backend/src/users/users.controller.ts`)

**New Endpoint:**
```typescript
@Get('nurses/list')
async getNurses(@CurrentUser() user: any) {
  return this.usersService.findNurses(user.clinicId);
}
```

### Clinics Service (`backend/src/clinics/clinics.service.ts`)

#### Updated Methods:

**1. `findOne(id)`**
- Now includes `nurseClinics` relation
- Returns both doctors and nurses lists

**2. New Method: `getNurses(id)`**
- Returns all nurses assigned to a clinic
- Includes `isPrimary` flag

### Clinics Controller (`backend/src/clinics/clinics.controller.ts`)

**New Endpoint:**
```typescript
@Get(':id/nurses')
@Roles('admin')
getNurses(@Param('id') id: string) {
  return this.clinicsService.getNurses(id);
}
```

## Frontend Changes

### API Types (`frontend/src/types/api.ts`)

**New Interface:**
```typescript
export interface NurseClinic {
  nurseId: string;
  clinicId: string;
  isPrimary: boolean;
  clinic?: Clinic;
  nurse?: ClinicUser;
}
```

**Updated Interface:**
```typescript
export interface ClinicUser {
  // ... existing fields
  clinics?: (DoctorClinic | NurseClinic)[]; // For doctors/nurses
  primaryClinic?: Clinic; // For doctors/nurses
}
```

### Users Service (`frontend/src/services/users.service.ts`)

**New API Methods:**

```typescript
// Get list of nurses (for assignment)
getNurses: async (): Promise<Doctor[]> => {
  return apiClient.get<Doctor[]>('/users/nurses/list');
}

// Get all clinics for a specific nurse
getNurseClinics: async (nurseId: string): Promise<Clinic[]> => {
  return apiClient.get<Clinic[]>(`/users/${nurseId}/nurse-clinics`);
}

// Assign a nurse to a clinic
assignNurseToClinic: async (
  nurseId: string, 
  data: AssignDoctorToClinicRequest
): Promise<DoctorClinic> => {
  return apiClient.post<DoctorClinic>(`/users/${nurseId}/nurse-clinics`, data);
}

// Remove a nurse from a clinic
removeNurseFromClinic: async (
  nurseId: string, 
  clinicId: string
): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/users/${nurseId}/nurse-clinics/${clinicId}`);
}

// Set a clinic as the primary clinic for a nurse
setNursePrimaryClinic: async (
  nurseId: string, 
  clinicId: string
): Promise<{ message: string }> => {
  return apiClient.put<{ message: string }>(
    `/users/${nurseId}/nurse-clinics/${clinicId}/primary`,
    {}
  );
}
```

### NurseClinicAssignment Component

**New Component:** `frontend/src/components/NurseClinicAssignment.tsx`

A full-featured component for managing nurse-clinic assignments:

**Features:**
- List all nurses with clinic counts
- Select a nurse to view their clinic assignments
- Assign nurses to multiple clinics
- Set primary clinic designation
- Remove nurses from clinics (with validation)
- Real-time updates of clinic counts
- Responsive UI with loading states

**Key Functionality:**
```typescript
// Assign a nurse to a clinic
const handleAssignClinic = async () => {
  await usersApi.assignNurseToClinic(selectedNurse.id, {
    clinicId: selectedClinicId,
    isPrimary,
  });
  toast.success('Clinic assigned successfully');
  await fetchNurseClinics(selectedNurse.id);
}

// Remove nurse from clinic
const handleRemoveClinic = async (clinicId: string, clinicName: string) => {
  await usersApi.removeNurseFromClinic(selectedNurse.id, clinicId);
  toast.success('Clinic removed successfully');
  await fetchNurseClinics(selectedNurse.id);
}

// Set primary clinic
const handleSetPrimary = async (clinicId: string) => {
  await usersApi.setNursePrimaryClinic(selectedNurse.id, clinicId);
  toast.success('Primary clinic updated');
  await fetchNurseClinics(selectedNurse.id);
}
```

### Settings Component (`frontend/src/components/Settings.tsx`)

**Updated Navigation:**
Added a new tab for "Nurse Assignments":

```typescript
<button
  onClick={() => setActiveTab('nurse-assignments')}
  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
    activeTab === 'nurse-assignments'
      ? 'border-blue-600 text-blue-600'
      : 'border-transparent text-slate-600 hover:text-slate-900'
  }`}
>
  <UserCog className="w-4 h-4 inline mr-2" />
  Nurse Assignments
</button>
```

**Tab Content:**
```typescript
{activeTab === 'nurse-assignments' && <NurseClinicAssignment />}
```

**Navigation Structure:**
1. User Management
2. Clinic Management
3. Doctor Assignments
4. **Nurse Assignments** (NEW)

## Migration

### Running the Migration

```bash
cd backend
npx prisma migrate dev --name add_nurse_clinic_junction_table
```

This creates the `nurse_clinics` table and updates the Prisma Client.

## API Endpoints

### Nurse Management Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/nurses/list` | All roles | Get nurses at current user's clinic |
| GET | `/clinics/:id/nurses` | Admin | Get all nurses at a specific clinic |
| GET | `/users/:id/nurse-clinics` | Admin, Nurse | Get all clinics for a specific nurse |
| POST | `/users/:id/nurse-clinics` | Admin | Assign nurse to a clinic |
| DELETE | `/users/:id/nurse-clinics/:clinicId` | Admin | Remove nurse from a clinic |
| PUT | `/users/:id/nurse-clinics/:clinicId/primary` | Admin | Set primary clinic for a nurse |

### Updated Endpoints

| Method | Endpoint | Changes |
|--------|----------|---------|
| GET | `/users` | Now returns nurses through junction table |
| GET | `/users/:id` | Now includes nurse's clinics list |
| POST | `/users` | Automatically creates NurseClinic for new nurses |

## Usage Examples

### Creating a Nurse

When a nurse is created, they are automatically assigned to the clinic with `isPrimary: true`:

```typescript
POST /users
{
  "name": "Jane Smith",
  "email": "jane@clinic.com",
  "password": "password123",
  "role": "nurse"
}
```

Backend automatically creates:
```typescript
{
  nurseId: "user-uuid",
  clinicId: "clinic-uuid",
  isPrimary: true
}
```

### Getting Nurses at a Clinic

```typescript
GET /clinics/{clinicId}/nurses

Response:
[
  {
    "id": "nurse-uuid",
    "name": "Jane Smith",
    "email": "jane@clinic.com",
    "status": "active",
    "isPrimary": true
  }
]
```

### Getting a Nurse's Clinics

```typescript
GET /users/{nurseId}

Response:
{
  "id": "nurse-uuid",
  "name": "Jane Smith",
  "role": "nurse",
  "clinics": [
    {
      "id": "clinic-1-uuid",
      "name": "Clinic A",
      "isPrimary": true
    },
    {
      "id": "clinic-2-uuid",
      "name": "Clinic B",
      "isPrimary": false
    }
  ]
}
```

## Future Enhancements

### Backend Endpoints (Implemented ✅)

The following nurse-clinic management endpoints are now available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:id/nurse-clinics` | Get all clinics for a nurse |
| POST | `/users/:id/nurse-clinics` | Assign nurse to a clinic |
| DELETE | `/users/:id/nurse-clinics/:clinicId` | Remove nurse from clinic |
| PUT | `/users/:id/nurse-clinics/:clinicId/primary` | Set primary clinic for nurse |

### Frontend Components (Implemented ✅)

1. **NurseClinicAssignment Component** ✅
   - Admin interface to assign nurses to multiple clinics
   - Manage primary clinic designation
   - View nurse's assigned clinics
   - Real-time updates and validation

2. **Settings Tab** ✅
   - Added "Nurse Assignments" tab in admin settings
   - Navigation between User/Clinic/Doctor/Nurse management
   - Seamless integration with existing UI

```typescript
// Assign nurse to clinic
POST /clinics/:clinicId/nurses/:nurseId
{
  "isPrimary": false
}

// Remove nurse from clinic
DELETE /clinics/:clinicId/nurses/:nurseId

// Set primary clinic for nurse
PUT /clinics/:clinicId/nurses/:nurseId/set-primary
```

## Testing Checklist

- [ ] Create a new nurse - should auto-assign to clinic
- [ ] Verify nurse appears in clinic's nurse list
- [ ] Verify nurse can access submissions from their clinic(s)
- [ ] Test listing users at a clinic includes nurses
- [ ] Test getting nurse details includes clinic list
- [ ] Test nurses from multiple clinics don't see each other's data
- [ ] Test admin can view nurses across all clinics

## Database Considerations

### Data Integrity
- `ON DELETE CASCADE`: When a nurse or clinic is deleted, the junction table entry is automatically removed
- `UNIQUE(nurseId, clinicId)`: Prevents duplicate assignments
- Indexes on both foreign keys for query performance

### Performance
- Indexes on `nurse_id` and `clinic_id` ensure fast lookups
- Query uses `some` clause which leverages indexes efficiently

## Rollback

If needed to rollback:

```bash
cd backend
npx prisma migrate resolve --rolled-back 20241024015448_add_nurse_clinic_junction_table
npx prisma migrate dev
```

## Related Documentation

- `DOCTOR_CLINIC_MANY_TO_MANY.md` - Similar implementation for doctors
- `DATABASE_SCHEMA.md` - Complete database schema
- `API_DOCUMENTATION.md` - Full API reference
