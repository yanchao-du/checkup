# Quick Reference: New Project Structure

## Current Directory Layout

```
CheckUp/
├── frontend/                    # React + Vite frontend
│   ├── src/                    # React components and code
│   │   ├── components/         # All React components
│   │   ├── styles/            # CSS files
│   │   ├── App.tsx            # Main App component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── vite.config.ts         # Vite configuration
│   ├── package.json           # Frontend dependencies
│   └── node_modules/          # Frontend packages
│
├── backend/                    # NestJS API
│   ├── src/                   # API source code
│   │   ├── auth/             # Authentication module
│   │   ├── submissions/      # Submissions module
│   │   ├── approvals/        # Approvals module
│   │   ├── prisma/           # Prisma service
│   │   └── main.ts           # API entry point
│   ├── prisma/               # Database
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Migration files
│   │   └── seed.ts           # Seed data
│   ├── test/                 # E2E tests
│   ├── dist/                 # Compiled output (ignored)
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend docs
│
├── package.json               # Root workspace scripts
├── .gitignore                # Git ignore rules
├── README.md                 # Main documentation
├── openapi.yaml              # API specification
├── API_DOCUMENTATION.md      # API docs
├── DATABASE_SCHEMA.md        # Database docs
└── BACKEND_SETUP_COMPLETE.md # Setup guide
```

## Quick Commands

### From Root Directory

```bash
# Install everything
npm run install:all

# Run both frontend and backend
npm run dev

# Build everything
npm run build

# Run E2E tests
npm run test:e2e
```

### Frontend Only

```bash
cd frontend

# Install
npm install

# Dev server (http://localhost:6688)
npm run dev

# Build for production
npm run build
```

### Backend Only

```bash
cd backend

# Install
npm install

# Dev server (http://localhost:3344/v1)
npm run start:dev

# Run tests
npm run test
npm run test:e2e

# Prisma commands
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 6688 | http://localhost:6688 |
| Backend API | 3344 | http://localhost:3344/v1 |
| PostgreSQL | 5432 | localhost:5432 |
| Prisma Studio | 5555 | http://localhost:5555 |

## Key Files

| Purpose | Location |
|---------|----------|
| Frontend Config | `frontend/vite.config.ts` |
| Frontend Deps | `frontend/package.json` |
| Backend Config | `backend/src/main.ts` |
| Backend Deps | `backend/package.json` |
| Database Schema | `backend/prisma/schema.prisma` |
| API Spec | `openapi.yaml` |
| Environment Vars | `backend/.env` |

## Git History Preserved

All 73 files were moved using `git mv`, so git history is fully preserved:
- View file history: `git log --follow frontend/src/App.tsx`
- See renames: `git log --stat --follow <file>`

## Development Workflow

1. **Start Development**:
   ```bash
   npm run dev  # Runs both frontend and backend
   ```

2. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Hot reload at http://localhost:6688

3. **Backend Changes**:
   - Edit files in `backend/src/`
   - Auto-restart at http://localhost:3344/v1

4. **Database Changes**:
   ```bash
   cd backend
   npx prisma migrate dev --name description
   npx prisma db seed
   ```

5. **Commit**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

## Benefits of New Structure

✅ **Clear Separation**: Frontend and backend are distinct
✅ **Independent Development**: Work on one without affecting the other
✅ **Better Dependency Management**: Separate node_modules
✅ **Professional Layout**: Industry-standard monorepo structure
✅ **Easier Navigation**: Clear where to find files
✅ **Better Tooling**: IDEs understand the structure better

---

**Updated**: October 22, 2025
