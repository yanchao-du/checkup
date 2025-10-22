# Port Configuration Changes

## Summary
Changed the frontend development server port from **5173** to **6688** and updated all related configuration files.

## Changes Made

### 1. Frontend Configuration
**File: `frontend/vite.config.ts`**
- Changed `server.port` from `3000` to `6688`

### 2. Backend CORS Configuration
**File: `backend/.env`**
- Updated `CORS_ORIGIN` from `http://localhost:5173` to `http://localhost:6688`

**File: `backend/src/main.ts`**
- Updated default CORS origin fallback from `http://localhost:5173` to `http://localhost:6688`

### 3. Documentation Updates

**File: `README.md`**
- Updated frontend URL from `http://localhost:5173` to `http://localhost:6688`

**File: `backend/README.md`**
- Updated environment variables table:
  - `PORT` default changed from `3000` to `3001` (backend)
  - `CORS_ORIGIN` default changed from `http://localhost:5173` to `http://localhost:6688`
- Updated "The API will be available at" from `http://localhost:3000/v1` to `http://localhost:3001/v1`

**File: `API_DOCUMENTATION.md`**
- Updated prism proxy command from `http://localhost:3000` to `http://localhost:3001`

## Current Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 6688 | http://localhost:6688 |
| Backend (NestJS) | 3344 | http://localhost:3344/v1 |
| PostgreSQL | 5432 | localhost:5432 |

## Verification

✅ Frontend running on: http://localhost:6688
✅ Backend configured to run on: http://localhost:3344/v1
✅ All documentation updated

## Next Steps

If you need to change the port again in the future, update these files:
1. `frontend/vite.config.ts` - Frontend port
2. `backend/.env` - CORS_ORIGIN
3. `backend/src/main.ts` - Default CORS origin
4. Documentation files (README.md, backend/README.md, API_DOCUMENTATION.md)
