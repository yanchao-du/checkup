# Backend API Update - Doctor-Clinic Many-to-Many Relationships

**Date**: October 23, 2025  
**Update**: Complete backend services and API endpoints for many-to-many doctor-clinic relationships

## Summary of Changes

All backend services and API endpoints have been updated to support the many-to-many relationship between doctors and clinics. This includes:

1. ✅ Created complete Clinics module (service, controller, module)
2. ✅ Updated Users service to include doctor-clinic relationships
3. ✅ Added endpoints for managing doctor-clinic assignments
4. ✅ Integrated MCR numbers and HCI codes throughout the API
5. ✅ Updated all responses to include clinic/doctor lists

---

## New Files Created

### 1. `/backend/src/clinics/clinics.service.ts`
Complete CRUD service for clinics with doctor relationship management:
- `findAll()` - Get all clinics with pagination
- `findOne(id)` - Get clinic details including assigned doctors
- `create()` - Create new clinic with HCI code validation
- `update()` - Update clinic details
- `remove()` - Delete clinic (with safety checks)
- `getDoctors(id)` - Get all doctors assigned to a clinic

### 2. `/backend/src/clinics/clinics.controller.ts`
REST API endpoints for clinic management:
- `GET /clinics` - List all clinics
- `GET /clinics/:id` - Get clinic details with doctors
- `GET /clinics/:id/doctors` - Get doctors at specific clinic
- `POST /clinics` - Create new clinic
- `PUT /clinics/:id` - Update clinic
- `DELETE /clinics/:id` - Delete clinic

### 3. `/backend/src/clinics/clinics.module.ts`
NestJS module configuration for clinics feature.

---

## Updated Files

### 1. `/backend/src/users/users.service.ts`

#### Updated Methods:

**`findDoctors(clinicId)`** - Now uses many-to-many relationship:
```typescript
// OLD: Queried User table with single clinicId
// NEW: Queries DoctorClinic junction table
const doctorClinics = await this.prisma.doctorClinic.findMany({
  where: { clinicId, doctor: { status: 'active' } },
  select: {
    isPrimary: true,
    doctor: { select: { id, name, email, mcrNumber } }
  }
});
```
**Returns**: Array of doctors with `isPrimary` flag and `mcrNumber`

**`findOne(id, clinicId)`** - Now includes doctor's clinics:
```typescript
// Added: doctorClinics relationship
select: {
  // ... existing fields
  mcrNumber: true,  // NEW
  doctorClinics: {  // NEW
    select: {
      isPrimary: true,
      clinic: { select: { id, name, hciCode } }
    }
  }
}
```
**Returns**: User object with `clinics` array (for doctors) and `mcrNumber`

**`create(clinicId, createUserDto)`** - Handles MCR and doctor-clinic:
```typescript
// NEW: Check MCR number uniqueness
if (createUserDto.mcrNumber) {
  const existingMCR = await this.prisma.user.findUnique({
    where: { mcrNumber: createUserDto.mcrNumber }
  });
  if (existingMCR) {
    throw new ConflictException('MCR Number already exists');
  }
}

// NEW: Auto-create DoctorClinic relationship for doctors
if (createUserDto.role === 'doctor') {
  await this.prisma.doctorClinic.create({
    data: { doctorId: user.id, clinicId, isPrimary: true }
  });
}
```
**Returns**: User object with `mcrNumber` field

**`update(id, clinicId, updateUserDto)`** - Handles MCR updates:
```typescript
// NEW: Check MCR number uniqueness on update
if (updateUserDto.mcrNumber) {
  const existingMCR = await this.prisma.user.findUnique({
    where: { mcrNumber: updateUserDto.mcrNumber }
  });
  if (existingMCR && existingMCR.id !== id) {
    throw new ConflictException('MCR Number already exists');
  }
}

// Added mcrNumber to updateData
updateData.mcrNumber = updateUserDto.mcrNumber;
```
**Returns**: Updated user with `mcrNumber`

#### New Methods:

**`assignDoctorToClinic(doctorId, clinicId, isPrimary)`**
- Assigns a doctor to work at a clinic
- Validates doctor and clinic existence
- Prevents duplicate assignments
- Optionally sets as primary clinic
- If setting as primary, unsets other primary clinics

**Parameters**:
- `doctorId: string` - ID of doctor to assign
- `clinicId: string` - ID of clinic to assign to
- `isPrimary: boolean` - Whether this is the primary clinic (default: false)

**Returns**:
```typescript
{
  doctorId: string,
  clinicId: string,
  isPrimary: boolean,
  doctor: { id, name, email, mcrNumber },
  clinic: { id, name, hciCode }
}
```

**Errors**:
- `404 NotFoundException` - Doctor or clinic not found
- `409 ConflictException` - Doctor already assigned to this clinic

**`removeDoctorFromClinic(doctorId, clinicId)`**
- Removes doctor from a clinic
- Validates relationship exists
- Prevents removal if it's the only clinic

**Parameters**:
- `doctorId: string` - ID of doctor
- `clinicId: string` - ID of clinic

**Returns**: `{ message: 'Doctor removed from clinic successfully' }`

**Errors**:
- `404 NotFoundException` - Relationship doesn't exist
- `409 ConflictException` - Cannot remove last clinic

**`setPrimaryClinic(doctorId, clinicId)`**
- Sets a clinic as the doctor's primary clinic
- Unsets all other primary clinics for this doctor

**Parameters**:
- `doctorId: string` - ID of doctor
- `clinicId: string` - ID of clinic to set as primary

**Returns**:
```typescript
{
  doctorId: string,
  clinicId: string,
  isPrimary: true,
  doctor: { id, name, email, mcrNumber },
  clinic: { id, name, hciCode }
}
```

**Errors**:
- `404 NotFoundException` - Doctor not assigned to this clinic

**`getDoctorClinics(doctorId)`**
- Gets all clinics where a doctor works
- Returns primary clinic first

**Parameters**:
- `doctorId: string` - ID of doctor

**Returns**: Array of clinics with `isPrimary` flag
```typescript
[
  {
    id: string,
    name: string,
    hciCode: string,
    address: string,
    phone: string,
    isPrimary: boolean
  }
]
```

**Errors**:
- `404 NotFoundException` - Doctor not found

---

### 2. `/backend/src/users/users.controller.ts`

#### New Endpoints:

**`GET /users/:id/clinics`**
- Get all clinics where a doctor works
- **Auth**: Admin or the doctor themselves
- **Returns**: Array of clinics with `isPrimary` flag

**`POST /users/:id/clinics`**
- Assign a doctor to work at a clinic
- **Auth**: Admin only
- **Body**: `{ clinicId: string, isPrimary?: boolean }`
- **Returns**: Doctor-clinic relationship details

**`DELETE /users/:id/clinics/:clinicId`**
- Remove doctor from a clinic
- **Auth**: Admin only
- **Returns**: Success message

**`PUT /users/:id/clinics/:clinicId/primary`**
- Set a clinic as doctor's primary clinic
- **Auth**: Admin only
- **Returns**: Updated doctor-clinic relationship

---

### 3. `/backend/src/app.module.ts`

**Updated imports**:
```typescript
import { ClinicsModule } from './clinics/clinics.module';

@Module({
  imports: [
    // ... existing modules
    ClinicsModule,  // NEW
  ],
})
```

---

## API Endpoints Reference

### Clinics Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/clinics` | Admin | List all clinics |
| GET | `/clinics/:id` | Admin | Get clinic details with doctors |
| GET | `/clinics/:id/doctors` | Admin, Nurse | Get doctors at clinic |
| POST | `/clinics` | Admin | Create new clinic |
| PUT | `/clinics/:id` | Admin | Update clinic |
| DELETE | `/clinics/:id` | Admin | Delete clinic |

### Users Endpoints (Updated)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | List all users (now includes MCR) |
| GET | `/users/:id` | Admin | Get user (includes clinics for doctors) |
| GET | `/users/:id/clinics` | Admin, Doctor | Get doctor's clinics |
| POST | `/users` | Admin | Create user (includes MCR validation) |
| PUT | `/users/:id` | Admin | Update user (includes MCR) |
| DELETE | `/users/:id` | Admin | Delete user |
| POST | `/users/:id/clinics` | Admin | Assign doctor to clinic |
| DELETE | `/users/:id/clinics/:clinicId` | Admin | Remove doctor from clinic |
| PUT | `/users/:id/clinics/:clinicId/primary` | Admin | Set primary clinic |

---

## Request/Response Examples

### Create Doctor with MCR Number

**Request**: `POST /users`
```json
{
  "name": "Dr. Sarah Tan",
  "email": "sarah.tan@clinic.sg",
  "password": "securePassword123",
  "role": "doctor",
  "mcrNumber": "M12345A"
}
```

**Response**:
```json
{
  "id": "uuid-here",
  "name": "Dr. Sarah Tan",
  "email": "sarah.tan@clinic.sg",
  "role": "doctor",
  "mcrNumber": "M12345A",
  "status": "active",
  "lastLoginAt": null,
  "createdAt": "2025-10-23T10:00:00Z"
}
```

**Note**: Doctor is automatically assigned to their primary clinic with `isPrimary: true`.

---

### Get Doctor with Clinics

**Request**: `GET /users/{doctorId}`

**Response**:
```json
{
  "id": "uuid-here",
  "name": "Dr. Sarah Tan",
  "email": "sarah.tan@clinic.sg",
  "role": "doctor",
  "mcrNumber": "M12345A",
  "status": "active",
  "lastLoginAt": "2025-10-23T09:30:00Z",
  "createdAt": "2025-10-22T10:00:00Z",
  "clinics": [
    {
      "id": "clinic-uuid-1",
      "name": "HealthFirst Medical Clinic",
      "hciCode": "HCI0001",
      "isPrimary": true
    },
    {
      "id": "clinic-uuid-2",
      "name": "CareWell Medical Centre",
      "hciCode": "HCI0002",
      "isPrimary": false
    }
  ]
}
```

---

### Assign Doctor to Clinic

**Request**: `POST /users/{doctorId}/clinics`
```json
{
  "clinicId": "clinic-uuid-2",
  "isPrimary": false
}
```

**Response**:
```json
{
  "doctorId": "doctor-uuid",
  "clinicId": "clinic-uuid-2",
  "isPrimary": false,
  "doctor": {
    "id": "doctor-uuid",
    "name": "Dr. Sarah Tan",
    "email": "sarah.tan@clinic.sg",
    "mcrNumber": "M12345A"
  },
  "clinic": {
    "id": "clinic-uuid-2",
    "name": "CareWell Medical Centre",
    "hciCode": "HCI0002"
  }
}
```

---

### Get Clinic with Doctors

**Request**: `GET /clinics/{clinicId}`

**Response**:
```json
{
  "id": "clinic-uuid-1",
  "name": "HealthFirst Medical Clinic",
  "hciCode": "HCI0001",
  "registrationNumber": "REG-001",
  "address": "123 Medical Street",
  "phone": "+65 6123 4567",
  "email": "info@healthfirst.sg",
  "createdAt": "2025-01-15T08:00:00Z",
  "updatedAt": "2025-10-23T10:00:00Z",
  "doctors": [
    {
      "id": "doctor-uuid-1",
      "name": "Dr. Sarah Tan",
      "email": "sarah.tan@clinic.sg",
      "mcrNumber": "M12345A",
      "status": "active",
      "isPrimary": true
    },
    {
      "id": "doctor-uuid-2",
      "name": "Dr. James Lee",
      "email": "james.lee@clinic.sg",
      "mcrNumber": "M23456B",
      "status": "active",
      "isPrimary": false
    }
  ]
}
```

---

### Create Clinic with HCI Code

**Request**: `POST /clinics`
```json
{
  "name": "CareWell Medical Centre",
  "hciCode": "HCI0002",
  "registrationNumber": "REG-002",
  "address": "456 Health Avenue",
  "phone": "+65 6234 5678",
  "email": "info@carewell.sg"
}
```

**Response**:
```json
{
  "id": "new-clinic-uuid",
  "name": "CareWell Medical Centre",
  "hciCode": "HCI0002",
  "registrationNumber": "REG-002",
  "address": "456 Health Avenue",
  "phone": "+65 6234 5678",
  "email": "info@carewell.sg",
  "createdAt": "2025-10-23T10:15:00Z",
  "updatedAt": "2025-10-23T10:15:00Z"
}
```

---

## Validation Rules

### MCR Number
- **Format**: `/^[A-Z]\d{5}[A-Z]$/` (1 letter + 5 digits + 1 letter)
- **Required**: Only for doctors
- **Unique**: Across all users
- **Examples**: M12345A, D98765Z

### HCI Code
- **Format**: `/^[A-Z0-9]{7}$/` (7 alphanumeric characters)
- **Required**: No (optional)
- **Unique**: Across all clinics
- **Examples**: HCI0001, MED1234

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid JWT
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate MCR/HCI or invalid operation

**Example Validation Error**:
```json
{
  "statusCode": 400,
  "message": [
    "MCR Number must be in format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)"
  ],
  "error": "Bad Request"
}
```

**Example Conflict Error**:
```json
{
  "statusCode": 409,
  "message": "MCR Number already exists",
  "error": "Conflict"
}
```

---

## Database Impact

### Junction Table: `DoctorClinic`
```sql
CREATE TABLE doctor_clinics (
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (doctor_id, clinic_id)
);
```

### Updated Tables:
- `users` - Added `mcr_number VARCHAR UNIQUE`
- `clinics` - Added `hci_code VARCHAR UNIQUE`

---

## Testing Checklist

### Unit Tests Needed:
- [ ] ClinicsService CRUD operations
- [ ] UsersService doctor-clinic management methods
- [ ] MCR number validation
- [ ] HCI code validation
- [ ] Primary clinic logic

### Integration Tests Needed:
- [ ] Create doctor with MCR automatically creates DoctorClinic
- [ ] Assign/remove doctor to multiple clinics
- [ ] Set/unset primary clinic
- [ ] Prevent removal of last clinic
- [ ] Get doctors filtered by clinic via junction table
- [ ] Duplicate MCR/HCI detection

### API Tests Needed:
- [ ] All clinics endpoints with auth
- [ ] All new users endpoints
- [ ] Doctor-clinic relationship endpoints
- [ ] Error cases (404, 409, 403)

---

## Migration Notes

### From Old System to New System:

1. **Existing Doctors**: Already have `clinicId` (primary clinic)
   - Migration automatically created `DoctorClinic` records with `isPrimary: true`
   - No action needed

2. **MCR Numbers**: Need to be collected
   - Currently `NULL` for existing doctors
   - Admin should update via `PUT /users/:id` endpoint

3. **HCI Codes**: Need to be collected
   - Currently `NULL` for existing clinics
   - Admin should update via `PUT /clinics/:id` endpoint

---

## Next Steps

1. ✅ Backend services and APIs complete
2. ⏳ Update frontend TypeScript interfaces
3. ⏳ Update frontend API service layer
4. ⏳ Create UI for managing doctor-clinic assignments
5. ⏳ Add MCR/HCI input fields to user/clinic forms
6. ⏳ Update doctor selection components to show MCR numbers

---

## Summary

**All backend work is complete!** The system now fully supports:
- ✅ Many-to-many doctor-clinic relationships
- ✅ MCR number validation for doctors
- ✅ HCI code validation for clinics
- ✅ Complete CRUD operations for clinics
- ✅ Doctor-clinic assignment management
- ✅ Primary clinic designation
- ✅ Proper error handling and validation
- ✅ All responses include relevant MCR/HCI/clinic data

The backend is ready for frontend integration.
