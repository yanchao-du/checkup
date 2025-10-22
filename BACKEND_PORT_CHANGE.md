# Backend Port Change Summary

## Changes Made: Port 3001 → 3344

Successfully changed the backend port from **3001** to **3344**.

## Files Updated

### 1. Configuration Files
- ✅ **`backend/.env`**
  - Changed `PORT=3001` to `PORT=3344`

- ✅ **`backend/src/main.ts`**
  - Updated default port from `3000` to `3344`

### 2. Documentation Files
- ✅ **`backend/README.md`**
  - Updated "The API will be available at" → `http://localhost:3344/v1`
  - Updated environment variables table: PORT → `3344`
  - Updated troubleshooting section example

- ✅ **`README.md`** (root)
  - Updated "Backend API runs at" → `http://localhost:3344/v1`

- ✅ **`API_DOCUMENTATION.md`**
  - Updated prism proxy command → `http://localhost:3344`

- ✅ **`BACKEND_SETUP_COMPLETE.md`**
  - Updated all API endpoint examples
  - Changed curl commands to use port 3344
  - Updated configuration notes
  - Updated frontend integration examples

- ✅ **`backend/E2E_TEST_DOCUMENTATION.md`**
  - Updated port troubleshooting from 3001 → 3344

- ✅ **`PORT_CONFIGURATION.md`**
  - Updated current port configuration table

## Verification

✅ **Backend Started Successfully**
```
🚀 Application is running on: http://localhost:3344/v1
```

All routes registered:
- `/v1/auth/login` (POST)
- `/v1/auth/logout` (POST)
- `/v1/auth/me` (GET)
- `/v1/submissions` (GET, POST)
- `/v1/submissions/:id` (GET, PUT)
- `/v1/approvals` (GET)
- `/v1/approvals/:id/approve` (POST)
- `/v1/approvals/:id/reject` (POST)

## Current Port Configuration

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend (Vite) | 6688 | http://localhost:6688 | ✅ Running |
| Backend (NestJS) | 3344 | http://localhost:3344/v1 | ✅ Running |
| PostgreSQL | 5432 | localhost:5432 | ✅ Connected |

## Test the Backend

```bash
# Login
curl -X POST http://localhost:3344/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@clinic.sg","password":"password"}'

# Get current user (replace TOKEN with actual token from login)
curl -X GET http://localhost:3344/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Next Steps

When integrating the frontend with the backend, update the API base URL:

```typescript
// src/api/client.ts or wherever you configure axios/fetch
const API_BASE_URL = 'http://localhost:3344/v1';
```

The backend CORS is already configured to accept requests from the frontend at `http://localhost:6688`.

---

**Date**: October 22, 2025
**Status**: ✅ Complete
