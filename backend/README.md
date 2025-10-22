# CheckUp Medical Portal - Backend API

NestJS backend for the Singapore Medical Portal with role-based access control, JWT authentication, and PostgreSQL database.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

### 4. Run Database Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed Database (Optional)
```bash
npx prisma db seed
```

### 6. Start Development Server
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001/v1`

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── decorators/        # Custom decorators (@CurrentUser, @Roles)
│   │   ├── dto/               # Data transfer objects
│   │   ├── guards/            # Auth guards (JWT, Roles)
│   │   ├── strategies/        # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── submissions/           # Medical submissions module
│   │   ├── dto/
│   │   ├── submissions.controller.ts
│   │   ├── submissions.service.ts
│   │   └── submissions.module.ts
│   ├── approvals/             # Approval workflow module
│   │   ├── approvals.controller.ts
│   │   ├── approvals.service.ts
│   │   └── approvals.module.ts
│   ├── prisma/                # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml         # PostgreSQL container
├── .env.example
└── package.json
```

## 🔑 Authentication

### Demo Accounts
After seeding the database, use these credentials:

**Doctor:**
```
Email: doctor@clinic.sg
Password: password
```

**Nurse:**
```
Email: nurse@clinic.sg
Password: password
```

**Admin:**
```
Email: admin@clinic.sg
Password: password
```

### API Authentication
1. Login via `POST /v1/auth/login`
2. Receive JWT token
3. Include token in subsequent requests:
```
Authorization: Bearer <your-jwt-token>
```

## 📡 API Endpoints

### Authentication
- `POST /v1/auth/login` - User login
- `POST /v1/auth/logout` - User logout
- `GET /v1/auth/me` - Get current user

### Submissions
- `GET /v1/submissions` - List submissions (filtered by role)
- `POST /v1/submissions` - Create submission
- `GET /v1/submissions/:id` - Get submission details
- `PUT /v1/submissions/:id` - Update submission

### Approvals (Doctors only)
- `GET /v1/approvals` - List pending approvals
- `POST /v1/approvals/:id/approve` - Approve submission
- `POST /v1/approvals/:id/reject` - Reject submission

## 🗄️ Database Commands

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio
```

### Generate Prisma Client
```bash
npx prisma generate
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔧 Development

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build

# Production mode
npm run start:prod
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `1d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:6688` |

## 🐳 Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f

# Remove volumes (deletes data)
docker-compose down -v
```

## 🔒 Role-Based Access Control

### Doctor
- ✅ Create and submit exams directly
- ✅ Approve submissions from nurses
- ✅ View own submissions
- ✅ Save drafts

### Nurse
- ✅ Create exams
- ✅ Route submissions to doctors for approval
- ✅ View own submissions
- ✅ Save drafts
- ❌ Cannot approve or submit directly

### Admin
- ✅ View all clinic submissions
- ✅ Manage users
- ❌ Cannot create or approve exams

## 📊 Database Schema

Key models:
- **Clinic** - Medical clinic information
- **User** - Clinic staff (doctors, nurses, admins)
- **MedicalSubmission** - Medical exam submissions
- **AuditLog** - Complete audit trail

See `../DATABASE_SCHEMA.md` for full schema details.

## 🚨 Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## 📄 License

Proprietary - HealthFirst Medical Clinic

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart
```

### Prisma Client Not Found
```bash
npx prisma generate
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

## 🔮 Next Steps

- [ ] Add drafts module
- [ ] Add users management module  
- [ ] Add dashboard statistics endpoint
- [ ] Add validation pipes
- [ ] Add Swagger/OpenAPI documentation
- [ ] Add integration tests
- [ ] Add file upload for medical documents
- [ ] Add email notifications
- [ ] Add rate limiting
- [ ] Add logging with Winston
