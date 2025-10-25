# ✅ Docker Setup Complete!

**Date:** October 25, 2025  
**Status:** All services running successfully

## 🎉 Summary

Your CheckUp application is now fully Dockerized and running in containers!

## 📦 Running Services

| Service | Container Name | Status | Ports | Health |
|---------|---------------|--------|-------|--------|
| PostgreSQL | `checkup-postgres` | ✅ Running | 55432:5432 | Healthy |
| Backend API | `checkup-backend` | ✅ Running | 3344:3344 | Healthy |
| Frontend | `checkup-frontend` | ✅ Running | 8080:8080 | Healthy |

## 🔧 Issues Fixed

### 1. Frontend Build Output Directory
**Problem:** Dockerfile referenced `/app/dist` but Vite builds to `/app/build`  
**Fix:** Updated Dockerfile to copy from `/app/build`

### 2. Backend Port Conflict
**Problem:** Local PostgreSQL using port 5432  
**Fix:** Changed Docker port mapping to `55432:5432`

### 3. Docker Network Configuration
**Problem:** Backend couldn't reach postgres service  
**Fix:** Added postgres to `checkup-network`

### 4. Backend Build Output Path
**Problem:** CMD referenced `dist/main.js` but NestJS builds to `dist/src/main.js`  
**Fix:** Updated CMD to `node dist/src/main.js`

### 5. Missing ts-node in Production
**Problem:** `npm prune --production` removed ts-node needed for seeding  
**Fix:** Removed `npm prune` step to keep all dependencies

### 6. Database Connection Timing
**Problem:** Backend started before Postgres was ready  
**Fix:** Added wait-for logic using `nc` (netcat) in entrypoint script

### 7. Environment Variable Name
**Problem:** Code expected `CORPPASS_JWKS_URL` but docker-compose had `CORPPASS_JWKS_URI`  
**Fix:** Updated environment variable name in docker-compose.yml

## 🚀 Quick Start

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
docker-compose up --build -d
```

## 🔍 Health Checks

### Backend API
```bash
curl http://localhost:3344/v1/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-25T06:26:46.196Z",
  "uptime": 13.554748844
}
```

### Frontend
```bash
curl http://localhost:8080/health
```
Expected response:
```
healthy
```

### PostgreSQL
```bash
docker-compose exec postgres pg_isready -U checkup
```
Expected response:
```
/var/run/postgresql:5432 - accepting connections
```

## 📊 Database Access

### Connect to PostgreSQL
```bash
# From host machine (port 55432)
psql -h localhost -p 55432 -U checkup -d checkup

# From backend container (port 5432)
docker-compose exec backend npx prisma studio
```

### Demo Accounts (from seed data)
- **Doctor:** `doctor@clinic.sg` / `password`
- **Nurse:** `nurse@clinic.sg` / `password`
- **Admin:** `admin@clinic.sg` / `password`

## 🌐 Access Points

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3344/v1
- **API Health:** http://localhost:3344/v1/health
- **PostgreSQL:** localhost:55432

## 📝 Configuration Files Modified

1. ✅ `/frontend/Dockerfile` - Fixed build output path (`dist` → `build`)
2. ✅ `/frontend/nginx.conf` - Created with SPA routing and health endpoint
3. ✅ `/backend/Dockerfile` - Fixed main.js path, added netcat, removed npm prune
4. ✅ `/backend/docker-entrypoint.sh` - Added database wait logic
5. ✅ `/docker-compose.yml` - Fixed network, port, and environment variables

## 🔐 Security Notes

- ✅ Both containers run as non-root users
- ✅ Network isolation via `checkup-network`
- ✅ PostgreSQL data persisted in named volume
- ⚠️ Current setup uses development secrets (change for production!)

## 📈 Next Steps

### For Local Development
1. ✅ All set! Start coding
2. Use `docker-compose logs -f` to monitor
3. Rebuild after major changes: `docker-compose up --build`

### For Production Deployment (AWS)

1. **Push Images to ECR**
   ```bash
   # Build production images
   docker build -t checkup-backend:latest ./backend
   docker build -t checkup-frontend:latest ./frontend
   
   # Tag for ECR
   docker tag checkup-backend:latest <aws-account>.dkr.ecr.<region>.amazonaws.com/checkup-backend:latest
   docker tag checkup-frontend:latest <aws-account>.dkr.ecr.<region>.amazonaws.com/checkup-frontend:latest
   
   # Push to ECR
   docker push <aws-account>.dkr.ecr.<region>.amazonaws.com/checkup-backend:latest
   docker push <aws-account>.dkr.ecr.<region>.amazonaws.com/checkup-frontend:latest
   ```

2. **Set Up Infrastructure with Terraform**
   - VPC with public/private subnets
   - RDS PostgreSQL (production database)
   - ECS Fargate cluster
   - ALB (Application Load Balancer)
   - CloudWatch for logs
   - Secrets Manager for credentials

3. **Update Environment Variables**
   - Use AWS Secrets Manager for sensitive data
   - Update `DATABASE_URL` to point to RDS
   - Configure production CorpPass credentials
   - Set strong `JWT_SECRET`

4. **Enable SSL/TLS**
   - Configure ACM certificate
   - Update ALB listeners for HTTPS
   - Update CORS settings

## 🐛 Troubleshooting

### Container Keeps Restarting
```bash
# Check logs
docker logs checkup-backend

# Common issues:
# - Database not ready (wait-for should handle this)
# - Missing environment variable
# - Port already in use
```

### Can't Connect to Database
```bash
# Verify postgres is running
docker-compose ps

# Check network
docker network inspect checkup_checkup-network

# Test connection from backend
docker-compose exec backend nc -zv postgres 5432
```

### Frontend Shows 404 on Refresh
- nginx.conf is configured with `try_files $uri $uri/ /index.html;`
- Should work, but verify nginx config is loaded:
  ```bash
  docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
  ```

### Slow Build Times
```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Use layer caching
docker-compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

## 📚 References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/prisma#docker)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-aws-lambda)
- [Nginx Docker Guide](https://hub.docker.com/_/nginx)

---

**Congratulations!** Your application is now containerized and ready for deployment! 🚀
