# Add New Test Users to EC2 Production Database

This script safely adds 10 new doctors and 10 new nurses to the production database without affecting existing data.

## What it does:
- Checks if users already exist (won't create duplicates)
- Only creates new users that don't exist
- Preserves all existing submissions, patients, and other data
- Creates proper doctor-clinic and nurse-clinic relationships

## New Users:
- **Doctors**: doctor5@clinic.sg through doctor14@clinic.sg (10 users)
- **Nurses**: nurse3@clinic.sg through nurse12@clinic.sg (10 users)
- **Password**: All use `password`

## Steps to run on EC2:

### 1. SSH into EC2
```bash
ssh -i your-key.pem ec2-user@your-ec2-instance
```

### 2. Navigate to backend directory
```bash
cd /path/to/CheckUp/backend
```

### 3. Pull latest code (if using git)
```bash
git pull origin main  # or your branch name
```

### 4. Run the migration script
```bash
npx ts-node prisma/add-new-users.ts
```

## Alternative: Run full seed (safe with upsert)

If you want to ensure all seed data is up-to-date:

```bash
npx prisma db seed
```

This is safe because:
- All operations use `upsert` (update if exists, create if not)
- Won't duplicate existing data
- Only updates NRIC field for existing users
- Skips sample submissions if they already exist

## Verify the users were created

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Check doctors
SELECT email, name, role FROM "User" WHERE role = 'doctor' ORDER BY email;

# Check nurses
SELECT email, name, role FROM "User" WHERE role = 'nurse' ORDER BY email;

# Exit
\q
```

## Rollback (if needed)

If you need to remove these users:

```sql
DELETE FROM "User" WHERE email IN (
  'doctor5@clinic.sg', 'doctor6@clinic.sg', 'doctor7@clinic.sg', 
  'doctor8@clinic.sg', 'doctor9@clinic.sg', 'doctor10@clinic.sg',
  'doctor11@clinic.sg', 'doctor12@clinic.sg', 'doctor13@clinic.sg', 
  'doctor14@clinic.sg', 'nurse3@clinic.sg', 'nurse4@clinic.sg', 
  'nurse5@clinic.sg', 'nurse6@clinic.sg', 'nurse7@clinic.sg',
  'nurse8@clinic.sg', 'nurse9@clinic.sg', 'nurse10@clinic.sg',
  'nurse11@clinic.sg', 'nurse12@clinic.sg'
);
```
