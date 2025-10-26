# Docker Setup Review & Fixes

## Overview
Reviewed Docker configuration for both backend (NestJS) and frontend (React + Vite) applications. Found several issues that need fixing before deployment.

---

## 🔴 **CRITICAL ISSUES**

### Backend

#### 1. **Missing Prisma in Production Build** ⚠️
**Problem:** The Dockerfile doesn't copy Prisma schema or generate the Prisma client.

**Current Issue:**
- Prisma client is generated during `npm install` but not included in production stage
- Schema file is missing for migrations
- No Prisma CLI available to run migrations

**Fix Required:**
```dockerfile
# In builder stage - after npm ci, add:
RUN npx prisma generate

# In production stage - add before copying dist:
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
```

#### 2. **Incorrect Migration Paths** ⚠️
**Problem:** Docker tries to copy `/app/src/migrations` and `/app/src/config/data-source.ts` which don't exist.

**Reality:** 
- Migrations are in `/app/prisma/migrations/`
- No `src/config/data-source.ts` file exists (Prisma doesn't use TypeORM)

**Fix Required:** Remove these lines or update to correct Prisma paths.

#### 3. **Missing npm Scripts for Docker** ⚠️
**Problem:** `docker-entrypoint.sh` calls `npm run migration:run` and `npm run seed` but these scripts don't exist in `package.json`.

**Current scripts in package.json:**
- ✅ `npm run studio` exists
- ❌ `npm run migration:run` missing
- ❌ `npm run migration:deploy` missing
- ✅ `prisma.seed` configured correctly

**Fix Required:** Add to `package.json`:
```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

Update `docker-entrypoint.sh`:
```bash
#!/bin/sh
set -e

echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed or no migrations to run"

echo "Seeding database..."
npx prisma db seed || echo "Seeding failed or already seeded"

echo "Starting application..."
exec "$@"
```

#### 4. **Health Check Endpoint Missing** ⚠️
**Problem:** Dockerfile includes health check to `http://localhost:3000/health` but this endpoint doesn't exist.

**Fix Required:** 
Either:
1. Remove the health check, OR
2. Add a health endpoint to the backend

**Option 2 (Recommended):** Add to `app.controller.ts`:
```typescript
@Get('health')
healthCheck() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

#### 5. **Port Mismatch** ⚠️
**Problem:**
- Dockerfile exposes port `3000`
- Health check checks port `3000`
- But `main.ts` uses port `3344` (or `process.env.PORT`)

**Fix Required:** Update Dockerfile:
```dockerfile
EXPOSE 3344

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3344/v1/health', ...)"
```

#### 6. **Static Certs Directory** ⚠️
**Problem:** Backend uses `static/certs/` for CorpPass keys but these aren't copied in Dockerfile.

**Fix Required:** Add to Dockerfile production stage:
```dockerfile
COPY --from=builder /app/static ./static
```

---

### Frontend

#### 1. **Missing nginx.conf** ⚠️
**Problem:** Dockerfile references `nginx.conf` but the file doesn't exist.

**Status:** ✅ **FIXED** - Created `/frontend/nginx.conf` with:
- SPA routing support (fallback to index.html)
- Gzip compression
- Security headers
- Static asset caching
- Health check endpoint at `/health`
- Port 8080 (non-root user compatible)

#### 2. **Build Directory Name** ⚠️
**Potential Issue:** Vite typically outputs to `dist` by default, but verify with `vite.config.ts`.

**Check:** The Dockerfile assumes build output is in `/app/dist`. If Vite is configured differently, update the Dockerfile.

---

## ⚠️ **WARNINGS & RECOMMENDATIONS**

### Backend

1. **TypeScript in Production**
   - Currently using `ts-node` in entrypoint for seeding
   - **Recommendation:** Pre-compile seed script or use `node` with compiled JS

2. **.dockerignore Cleanup**
   - File has duplicate sections (lines 1-55 and 56-100)
   - **Recommendation:** Remove duplicate content

3. **Environment Variables**
   - No `.env` files are copied (correct, but document required env vars)
   - **Recommendation:** Create `ENV_VARS.md` listing all required environment variables

4. **Database Connection**
   - Docker assumes DATABASE_URL is provided at runtime
   - **Recommendation:** Document that `DATABASE_URL` must be set via environment or secrets

5. **Security: Running as Non-Root**
   - ✅ Correctly implemented with user `nestjs:nodejs`
   - Good practice!

### Frontend

1. **API Base URL**
   - Frontend needs to know backend URL at build time or runtime
   - **Recommendation:** Use environment variables and build-time replacement or runtime config

2. **Build Output Verification**
   - Check `vite.config.ts` for actual output directory
   - **Current assumption:** `dist` directory

3. **Nginx User**
   - Created custom user `nginx-app:nginx-app` (good!)
   - But nginx might conflict with default nginx user
   - **Recommendation:** Test thoroughly or use nginx's built-in user with proper permissions

---

## ✅ **WHAT'S GOOD**

### Backend
- ✅ Multi-stage build (reduces image size)
- ✅ Non-root user for security
- ✅ Production dependencies only in final image
- ✅ Health check configured (needs endpoint fix)
- ✅ Proper use of `npm ci` for reproducible builds

### Frontend
- ✅ Multi-stage build
- ✅ Nginx for production serving
- ✅ Non-root user
- ✅ Health check endpoint
- ✅ Static asset caching headers

---

## 📋 **REQUIRED FIXES CHECKLIST**

### Backend - Must Fix Before Deploy

- [ ] Add Prisma client generation and copy schema
- [ ] Fix migration paths (remove TypeORM references)
- [ ] Add missing npm scripts or update entrypoint
- [ ] Add `/v1/health` endpoint to backend
- [ ] Fix port exposure (3000 → 3344 or make configurable)
- [ ] Copy `static/certs/` directory for CorpPass
- [ ] Clean up duplicate .dockerignore content
- [ ] Test Prisma migrations in Docker environment

### Frontend - Must Fix Before Deploy

- [x] Create nginx.conf file
- [ ] Verify Vite build output directory
- [ ] Configure API base URL (env var or build arg)
- [ ] Test nginx user permissions
- [ ] Verify SPA routing works in Docker

---

## 🚀 **QUICK FIX COMMANDS**

### Test Docker Builds Locally

**Backend:**
```bash
cd backend
docker build -t checkup-backend:test .
docker run -p 3344:3344 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="test-secret" \
  checkup-backend:test
```

**Frontend:**
```bash
cd frontend
docker build -t checkup-frontend:test .
docker run -p 8080:8080 checkup-frontend:test
```

### Test with Docker Compose

Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: checkup
      POSTGRES_USER: checkup
      POSTGRES_PASSWORD: checkup
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3344:3344"
    environment:
      DATABASE_URL: postgresql://checkup:checkup@postgres:5432/checkup
      JWT_SECRET: dev-secret-change-in-prod
      CORS_ORIGIN: http://localhost:8080
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "8080:8080"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Test:
```bash
docker-compose up --build
```

---

## 📝 **NEXT STEPS FOR AWS DEPLOYMENT**

1. **Fix all critical issues above**
2. **Create ECR repositories** (Elastic Container Registry)
3. **Build and push images:**
   ```bash
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
   
   docker tag checkup-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/checkup-backend:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/checkup-backend:latest
   ```
4. **Set up RDS PostgreSQL** for production database
5. **Configure ECS/Fargate or EKS** for container orchestration
6. **Set up ALB** (Application Load Balancer) for routing
7. **Configure secrets** in AWS Secrets Manager or Parameter Store
8. **Set up CloudWatch** for logs and monitoring

---

## 🔐 **SECURITY RECOMMENDATIONS**

1. **Secrets Management**
   - Never hardcode secrets in Dockerfile
   - Use AWS Secrets Manager or Parameter Store
   - Inject at runtime via environment variables

2. **Image Scanning**
   - Enable ECR image scanning
   - Use tools like Trivy or Snyk

3. **Least Privilege**
   - ✅ Already using non-root users
   - Ensure IAM roles for ECS tasks are minimal

4. **Network Security**
   - Use VPC with private subnets for containers
   - Only expose ALB publicly
   - Use security groups to restrict traffic

---

## 📊 **ESTIMATED IMAGE SIZES**

**Before optimization:**
- Backend: ~800MB (with all deps + alpine base)
- Frontend: ~50MB (nginx alpine + built assets)

**After fixes and optimization:**
- Backend: ~600MB (with proper pruning)
- Frontend: ~30MB (optimized nginx + gzipped assets)

---

## ✉️ **SUPPORT & QUESTIONS**

If you encounter issues:
1. Check Docker logs: `docker logs <container-id>`
2. Exec into container: `docker exec -it <container-id> sh`
3. Verify env vars: `docker exec <container-id> env`
4. Check Prisma: `docker exec <container-id> npx prisma --version`
