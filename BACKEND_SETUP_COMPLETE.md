# ✅ Backend Setup Complete!

## 🎉 Success!

Your NestJS backend for the CheckUp Medical Portal is now running successfully!

## 📊 What's Running

**Backend API**: http://localhost:3001/v1
**Database**: PostgreSQL (local instance on port 5432)
**Database Name**: `checkup_medical`

## ⚙️ Configuration

- **Port Changed**: 3001 (instead of 3000, which was in use)
- **Database**: Using your existing local PostgreSQL instead of Docker
- **SSL Certificate**: Bypassed for Prisma downloads (corporate proxy issue)

## 🔐 Demo Accounts

Login with these credentials:

**Doctor**
- Email: `doctor@clinic.sg`
- Password: `password`

**Nurse**
- Email: `nurse@clinic.sg`
- Password: `password`

**Admin**
- Email: `admin@clinic.sg`
- Password: `password`

## 🧪 Test the API

### 1. Login as Doctor
```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@clinic.sg","password":"password"}'
```

### 2. Get Current User (with token)
```bash
curl -X GET http://localhost:3001/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. List Submissions
```bash
curl -X GET http://localhost:3001/v1/submissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. List Pending Approvals (Doctor only)
```bash
curl -X GET http://localhost:3001/v1/approvals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📡 Available Endpoints

### Authentication
- `POST /v1/auth/login` - Login
- `GET /v1/auth/me` - Get current user
- `POST /v1/auth/logout` - Logout

### Submissions
- `GET /v1/submissions` - List submissions
- `POST /v1/submissions` - Create submission
- `GET /v1/submissions/:id` - Get submission
- `PUT /v1/submissions/:id` - Update submission

### Approvals (Doctors Only)
- `GET /v1/approvals` - List pending approvals
- `POST /v1/approvals/:id/approve` - Approve
- `POST /v1/approvals/:id/reject` - Reject

## 🗄️ Database

**Sample data loaded:**
- ✅ 1 Clinic (HealthFirst Medical Clinic)
- ✅ 3 Users (doctor, nurse, admin)
- ✅ 3 Submitted exams
- ✅ 1 Pending approval
- ✅ 1 Draft
- ✅ Audit trail logs

### Useful Database Commands

```bash
# Open Prisma Studio (Database GUI)
cd backend
npx prisma studio

# View all tables
psql -d checkup_medical -c "\dt"

# Query users
psql -d checkup_medical -c "SELECT name, email, role FROM users;"

# Query submissions
psql -d checkup_medical -c "SELECT patient_name, exam_type, status FROM medical_submissions;"
```

## 🚀 Development Workflow

### Start Backend Server
```bash
cd backend
node_modules/.bin/nest start --watch
```

### Make Database Changes
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Generate Prisma client
npx prisma generate
```

### Reset Database
```bash
npx prisma migrate reset
# This will drop all tables, re-run migrations, and re-seed
```

## 🔧 Troubleshooting

### Port Already in Use
- Changed from 3000 → 3001 in `.env`
- Frontend should connect to `http://localhost:3001/v1`

### PostgreSQL Not Running
```bash
# Check if PostgreSQL is running
lsof -i :5432

# Start PostgreSQL (macOS)
brew services start postgresql
```

### Prisma SSL Certificate Errors
```bash
# Use this prefix for Prisma commands
NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma [command]
```

## 📝 Next Steps

### Connect Frontend to Backend

Update your React frontend to use the API:

1. **Update API Base URL**
   ```typescript
   // src/api/client.ts
   const API_URL = 'http://localhost:3001/v1';
   ```

2. **Replace `useMockData` Hook**
   - Replace localStorage calls with API calls
   - Use fetch or axios for HTTP requests
   - Handle authentication tokens

3. **Update Auth Context**
   ```typescript
   // Login
   const response = await fetch('http://localhost:3001/v1/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   const { token, user } = await response.json();
   localStorage.setItem('authToken', token);
   ```

### Optional Enhancements

- [ ] Add validation pipes with class-validator
- [ ] Add Swagger documentation
- [ ] Create drafts module
- [ ] Create users management module
- [ ] Add dashboard statistics endpoint
- [ ] Add file upload capability
- [ ] Add email notifications
- [ ] Add comprehensive error handling

## 📚 Documentation

- **OpenAPI Spec**: `../openapi.yaml`
- **Database Schema**: `../DATABASE_SCHEMA.md`
- **API Documentation**: `../API_DOCUMENTATION.md`
- **Backend README**: `./README.md`

## 🎊 You're All Set!

The backend is fully functional and ready to integrate with your React frontend!

**Backend API**: http://localhost:3001/v1 ✅
**Database**: PostgreSQL with seed data ✅
**Authentication**: JWT with role-based access ✅
**Endpoints**: Auth, Submissions, Approvals ✅

Happy coding! 🚀
