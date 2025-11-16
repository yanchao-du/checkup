# CheckUp Medical Portal

A comprehensive medical examination portal for Singapore clinics with role-based access control, approval workflows, and complete backend API.

**Frontend**: React + TypeScript + Vite  
**Backend**: NestJS + PostgreSQL + Prisma  
**Auth**: JWT with role-based access control

## 🌟 Features

- **Role-Based Access**: Doctor, Nurse, and Admin roles with different permissions
- **Medical Exam Types**: Support for 7 Singapore government exam types
  - Six-monthly Medical Exam for Migrant Domestic Worker (MOM)
  - Six-monthly Medical Exam for Female Migrant Worker (MOM)
  - Full Medical Exam for Work Permit (MOM)
  - Medical Exam for Permanent Residency, Student Pass, LTVP (ICA)
  - Driving Licence Medical Examination (TP)
  - Driving & Vocational Licence Medical Examination (TP & LTA)
  - Vocational Licence Medical Examination (LTA)
- **Approval Workflow**: Nurses create → Doctors approve → Submit to government
- **Draft Management**: Save incomplete exams and resume later
- **PDF Generation**: Download professional PDF reports for submitted examinations
- **Complete Audit Trail**: Track all changes and approvals
- **Search & Filter**: Advanced filtering by status, exam type, patient details
- **RESTful API**: Full backend implementation with OpenAPI documentation

## 📁 Project Structure

```
CheckUp/
├── frontend/              # React frontend
│   ├── src/              # Frontend source code
│   ├── index.html        # HTML entry point
│   ├── vite.config.ts    # Vite configuration
│   └── package.json      # Frontend dependencies
├── backend/               # NestJS backend API
│   ├── src/              # API source code
│   ├── prisma/           # Database schema & migrations
│   └── README.md         # Backend documentation
├── openapi.yaml          # OpenAPI 3.0 specification
├── API_DOCUMENTATION.md  # API documentation
├── DATABASE_SCHEMA.md    # Database design
└── BACKEND_SETUP_COMPLETE.md  # Setup guide
```

## 🚀 Quick Start

### Frontend (React)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:6688

### Backend (NestJS)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create database (if using local PostgreSQL)
createdb checkup_medical

# Run migrations
npx prisma migrate dev
npx prisma generate

# Seed database
npx prisma db seed

# Start backend server
node_modules/.bin/nest start --watch
```

Backend API runs at: http://localhost:3344/v1

**See [BACKEND_SETUP_COMPLETE.md](BACKEND_SETUP_COMPLETE.md) for detailed setup instructions.**

## 🔐 Demo Accounts

After seeding the database:

- **Doctor**: `doctor@clinic.sg` / `password`
- **Nurse**: `nurse@clinic.sg` / `password`
- **Admin**: `admin@clinic.sg` / `password`

For CorpPass/MockPass development and testing, see the list of seeded NRICs and roles: `docs/guides/MOCKPASS_TEST_IDS.md`

## 📡 API Endpoints

### Authentication
- `POST /v1/auth/login` - User login
- `GET /v1/auth/me` - Get current user
- `POST /v1/auth/logout` - Logout

### Submissions
- `GET /v1/submissions` - List submissions
- `POST /v1/submissions` - Create submission
- `GET /v1/submissions/:id` - Get submission
- `PUT /v1/submissions/:id` - Update submission
- `GET /v1/submissions/:id/pdf` - Download submission PDF report

### Approvals (Doctors only)
- `GET /v1/approvals` - List pending approvals
- `POST /v1/approvals/:id/approve` - Approve submission
- `POST /v1/approvals/:id/reject` - Reject submission

Full API documentation: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## � PDF Generation

The portal includes professional PDF report generation for medical submissions:

### Features
- **Automatic generation** - PDFs are generated on-demand via API
- **Exam-type specific content** - Each exam type has custom formatting matching the ViewSubmission display
- **Authorization-aware** - Respects user permissions (clinic-based access)
- **Professional formatting** - Clean layout with clinic branding, patient info, test results, and declaration
- **Patient privacy** - Patient names masked in drafts, full names in submitted reports

### PDF Content
- **Header**: Clinic name, exam type title, reference number, submission date
- **Patient Information**: Name, FIN/NRIC, date of birth, contact details
- **Body Measurements**: Height, weight, BMI with categories (where applicable)
- **Exam-Specific Content**: 
  - MDW/FMW: Pregnancy test, chest X-ray, syphilis, HIV results
  - Full Medical: Complete medical history, physical examination, test results
  - ICA (PR/Student/LTVP): HIV and chest X-ray results
  - Driver Exams: Medical declaration, medical history, general examination, AMT score, fitness assessment
- **Remarks**: Additional notes or observations
- **Declaration**: Medical practitioner certification with doctor and clinic information

### Usage

**Backend API:**
```bash
GET /v1/submissions/{id}/pdf
Authorization: Bearer <token>
```

**Frontend:**
- ViewSubmission page: "Download PDF" button (submitted submissions only)
- Acknowledgement page: "Download PDF" button after submission
- Dashboard: Download icon button in submission list

### Technical Implementation
- **Library**: pdfmake (~2MB, lightweight)
- **Performance**: ~100-500ms generation time, ~10-20MB memory per PDF
- **File size**: ~30-50KB per PDF
- **Format**: A4 page size with professional margins
- **Fonts**: Roboto font family (normal, bold, italic)

## �🗄️ Database

PostgreSQL database with Prisma ORM:

- **Clinics** - Medical clinic information
- **Users** - Staff (doctors, nurses, admins)
- **Medical Submissions** - Exam submissions
- **Audit Logs** - Complete audit trail

Schema details: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

## 🔒 User Roles

### Doctor
- ✅ Create and submit exams directly
- ✅ Approve submissions from nurses
- ✅ View own submissions

### Nurse
- ✅ Create exams and save drafts
- ✅ Route to doctors for approval
- ✅ View own submissions
- ❌ Cannot submit directly

### Admin
- ✅ View all clinic submissions
- ✅ Manage users
- ❌ Cannot create/approve exams

## 📚 Documentation

- [OpenAPI Specification](openapi.yaml) - Complete API spec
- [API Documentation](API_DOCUMENTATION.md) - Developer guide
- [Database Schema](DATABASE_SCHEMA.md) - Database design
- [Backend Setup Guide](BACKEND_SETUP_COMPLETE.md) - Setup instructions
- [Backend README](backend/README.md) - Backend-specific docs

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components
- React Router

### Backend
- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing
- Class validator & transformer

## 📝 Original Design

This project is based on the Figma design: [Doctor and Nurse Portal](https://www.figma.com/design/oawFd7xA0vEzbOcpyfA06x/Doctor-and-Nurse-Portal)

## 🔮 Future Enhancements

- [ ] File upload for medical documents
- [ ] Email notifications
- [ ] Real-time updates with WebSockets
- [x] Export to PDF ✅ (Completed)
- [ ] Digital signatures on PDFs
- [ ] PDF watermarks
- [ ] Integration with government portals
- [ ] Multi-clinic support
- [ ] Mobile app

## 📄 License

Proprietary - HealthFirst Medical Clinic

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

---

**Need help?** Check [BACKEND_SETUP_COMPLETE.md](BACKEND_SETUP_COMPLETE.md) for troubleshooting.