# MCR and HCI Code Validation

**Date**: October 23, 2024  
**Update**: Standardized format validation for MCR Numbers and HCI Codes

## Format Specifications

### MCR Number (Medical Council Registration Number)

**Format**: 1 letter + 5 numbers + 1 letter  
**Examples**: 
- `M12345A` ✅
- `M23456B` ✅
- `D98765Z` ✅

**Invalid Examples**:
- `M12345` ❌ (missing last letter)
- `12345AB` ❌ (missing first letter)
- `M1234AB` ❌ (only 4 numbers)
- `m12345a` ❌ (lowercase letters)
- `M-12345-A` ❌ (contains hyphens)

**Regex Pattern**: `/^[A-Z]\d{5}[A-Z]$/`

**Validation Rules**:
- Required for all users with `role: 'doctor'`
- Optional for nurses and admins (should be null)
- Must be unique across all doctors
- Case-sensitive (uppercase only)
- No spaces, hyphens, or special characters

### HCI Code (Healthcare Institution Code)

**Format**: 7 alphanumeric characters  
**Examples**:
- `HCI0001` ✅
- `HCI0002` ✅
- `MED1234` ✅
- `ABC1234` ✅

**Invalid Examples**:
- `HCI-001` ❌ (contains hyphen, only 6 chars after removing hyphen)
- `HCI001` ❌ (only 6 characters)
- `HCI00001` ❌ (8 characters)
- `hci0001` ❌ (lowercase letters)
- `HCI 001` ❌ (contains space)

**Regex Pattern**: `/^[A-Z0-9]{7}$/`

**Validation Rules**:
- Optional but recommended for all clinics
- Must be unique across all clinics
- Case-sensitive (uppercase only)
- No spaces, hyphens, or special characters
- Exactly 7 characters

## Backend Implementation

### User DTOs

**CreateUserDto** (`backend/src/users/dto/create-user.dto.ts`):
```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, Matches, ValidateIf } from 'class-validator';

export class CreateUserDto {
  // ... other fields

  @ValidateIf(o => o.role === 'doctor')
  @IsNotEmpty({ message: 'MCR Number is required for doctors' })
  @IsString()
  @Matches(/^[A-Z]\d{5}[A-Z]$/, {
    message: 'MCR Number must be in format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)'
  })
  mcrNumber?: string;
}
```

**UpdateUserDto** (`backend/src/users/dto/update-user.dto.ts`):
```typescript
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
  // ... other fields

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]\d{5}[A-Z]$/, {
    message: 'MCR Number must be in format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)'
  })
  mcrNumber?: string;
}
```

### Clinic DTOs

**CreateClinicDto** (`backend/src/clinics/dto/create-clinic.dto.ts`):
```typescript
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateClinicDto {
  // ... other fields

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{7}$/, {
    message: 'HCI Code must be 7 alphanumeric characters (e.g., HCI0001)'
  })
  hciCode?: string;
}
```

**UpdateClinicDto** (`backend/src/clinics/dto/update-clinic.dto.ts`):
```typescript
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateClinicDto {
  // ... other fields

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{7}$/, {
    message: 'HCI Code must be 7 alphanumeric characters (e.g., HCI0001)'
  })
  hciCode?: string;
}
```

## Frontend Implementation

### Input Validation

**MCR Number Input**:
```tsx
<Input
  type="text"
  placeholder="M12345A"
  maxLength={7}
  pattern="[A-Z]\d{5}[A-Z]"
  title="Format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)"
  style={{ textTransform: 'uppercase' }}
/>
```

**HCI Code Input**:
```tsx
<Input
  type="text"
  placeholder="HCI0001"
  maxLength={7}
  pattern="[A-Z0-9]{7}"
  title="Format: 7 alphanumeric characters (e.g., HCI0001)"
  style={{ textTransform: 'uppercase' }}
/>
```

### TypeScript Validation Functions

```typescript
export function validateMCRNumber(mcrNumber: string): boolean {
  const regex = /^[A-Z]\d{5}[A-Z]$/;
  return regex.test(mcrNumber);
}

export function validateHCICode(hciCode: string): boolean {
  const regex = /^[A-Z0-9]{7}$/;
  return regex.test(hciCode);
}

export function formatMCRNumber(input: string): string {
  // Convert to uppercase and remove non-alphanumeric characters
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

export function formatHCICode(input: string): string {
  // Convert to uppercase and remove non-alphanumeric characters
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}
```

### Error Messages

**MCR Number Errors**:
- Missing: "MCR Number is required for doctors"
- Invalid format: "MCR Number must be in format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)"
- Duplicate: "This MCR Number is already registered"

**HCI Code Errors**:
- Invalid format: "HCI Code must be 7 alphanumeric characters (e.g., HCI0001)"
- Duplicate: "This HCI Code is already registered"

## Database Constraints

### Unique Constraints

```sql
-- MCR Number uniqueness
CREATE UNIQUE INDEX users_mcr_number_key ON users(mcr_number);

-- HCI Code uniqueness
CREATE UNIQUE INDEX clinics_hci_code_key ON clinics(hci_code);
```

### Check Constraints (Optional Enhancement)

```sql
-- MCR Number format check
ALTER TABLE users ADD CONSTRAINT mcr_number_format_check 
CHECK (mcr_number IS NULL OR mcr_number ~ '^[A-Z]\d{5}[A-Z]$');

-- HCI Code format check
ALTER TABLE clinics ADD CONSTRAINT hci_code_format_check 
CHECK (hci_code IS NULL OR hci_code ~ '^[A-Z0-9]{7}$');
```

## Testing

### Unit Tests

**MCR Number Validation**:
```typescript
describe('MCR Number Validation', () => {
  it('should accept valid MCR number', () => {
    expect(validateMCRNumber('M12345A')).toBe(true);
    expect(validateMCRNumber('D98765Z')).toBe(true);
  });

  it('should reject invalid MCR number', () => {
    expect(validateMCRNumber('M12345')).toBe(false);    // Missing last letter
    expect(validateMCRNumber('12345AB')).toBe(false);   // Missing first letter
    expect(validateMCRNumber('M1234AB')).toBe(false);   // Only 4 digits
    expect(validateMCRNumber('m12345a')).toBe(false);   // Lowercase
    expect(validateMCRNumber('M-12345-A')).toBe(false); // Contains hyphens
  });
});
```

**HCI Code Validation**:
```typescript
describe('HCI Code Validation', () => {
  it('should accept valid HCI code', () => {
    expect(validateHCICode('HCI0001')).toBe(true);
    expect(validateHCICode('MED1234')).toBe(true);
    expect(validateHCICode('ABC1234')).toBe(true);
  });

  it('should reject invalid HCI code', () => {
    expect(validateHCICode('HCI-001')).toBe(false);  // Contains hyphen
    expect(validateHCICode('HCI001')).toBe(false);   // Only 6 characters
    expect(validateHCICode('HCI00001')).toBe(false); // 8 characters
    expect(validateHCICode('hci0001')).toBe(false);  // Lowercase
    expect(validateHCICode('HCI 001')).toBe(false);  // Contains space
  });
});
```

### Integration Tests

```typescript
describe('User Creation with MCR Number', () => {
  it('should create doctor with valid MCR number', async () => {
    const dto: CreateUserDto = {
      name: 'Dr. Test',
      email: 'test@doctor.sg',
      password: 'password123',
      role: 'doctor',
      mcrNumber: 'M12345A'
    };
    // ... test implementation
  });

  it('should reject doctor without MCR number', async () => {
    const dto: CreateUserDto = {
      name: 'Dr. Test',
      email: 'test@doctor.sg',
      password: 'password123',
      role: 'doctor'
      // mcrNumber missing
    };
    // ... expect validation error
  });

  it('should reject duplicate MCR number', async () => {
    // ... test implementation
  });
});
```

## Migration from Old Format

If you have existing data with old formats:

### MCR Number Migration

```sql
-- Example: Convert M12345 to M12345A
UPDATE users 
SET mcr_number = mcr_number || 'A' 
WHERE role = 'doctor' 
AND mcr_number ~ '^M\d{5}$'
AND LENGTH(mcr_number) = 6;
```

### HCI Code Migration

```sql
-- Example: Convert HCI-C001 to HCI0001
UPDATE clinics
SET hci_code = REPLACE(REPLACE(hci_code, '-', ''), 'C', '')
WHERE hci_code LIKE 'HCI-%';

-- Pad with leading zeros if needed
UPDATE clinics
SET hci_code = 'HCI' || LPAD(SUBSTRING(hci_code FROM 4), 4, '0')
WHERE hci_code ~ '^HCI\d{1,3}$';
```

## References

- Singapore Medical Council (SMC): https://www.healthprofessionals.gov.sg/smc
- MOH Healthcare Institution Codes: https://www.moh.gov.sg/
- Class Validator Documentation: https://github.com/typestack/class-validator

## Summary

- ✅ MCR Number: `[A-Z]\d{5}[A-Z]` (e.g., M12345A)
- ✅ HCI Code: `[A-Z0-9]{7}` (e.g., HCI0001)
- ✅ Backend validation implemented in DTOs
- ✅ Unique constraints enforced in database
- ✅ Seed data updated with correct formats
- ⏳ Frontend validation pending
- ⏳ Frontend TypeScript interfaces pending
