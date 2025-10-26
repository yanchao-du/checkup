# Docker Deployment Guide

## ✅ Status: WORKING!

**Last Updated:** October 25, 2025  
**All containers running successfully!**

## Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3344/v1
- PostgreSQL: localhost:55432

**Demo Accounts:**
- Doctor: `doctor@clinic.sg` / `password`
- Nurse: `nurse@clinic.sg` / `password`
- Admin: `admin@clinic.sg` / `password`

---

## ✅ Issues Fixed

### Backend
1. ✅ Added Prisma client generation in build stage
2. ✅ Fixed Prisma schema and client copying to production stage
3. ✅ Removed incorrect TypeORM migration paths
4. ✅ Updated docker-entrypoint.sh to use Prisma CLI commands
5. ✅ Fixed port from 3000 → 3344 (matches main.ts)
6. ✅ Added health endpoint at `/v1/health`
7. ✅ Added static files (CorpPass certs) to production image
8. ✅ Cleaned up duplicate .dockerignore content

### Frontend
1. ✅ Created nginx.conf with proper SPA routing
2. ✅ Added health check endpoint at `/health`
3. ✅ Configured gzip compression and security headers
4. ✅ Set up static asset caching

## 🧪 Testing Locally

### Quick Test with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Test Individual Services

**Backend:**
```bash
cd backend

# Build
docker build -t checkup-backend:test .

# Run with local PostgreSQL
docker run -p 3344:3344 \
  -e DATABASE_URL="postgresql://checkup:checkup@host.docker.internal:5432/checkup" \
  -e JWT_SECRET="test-secret" \
  -e CORS_ORIGIN="http://localhost:8080" \
  checkup-backend:test

# Check health
curl http://localhost:3344/v1/health
```

**Frontend:**
```bash
cd frontend

# Build
docker build -t checkup-frontend:test .

# Run
docker run -p 8080:8080 checkup-frontend:test

# Check health
curl http://localhost:8080/health

# Open in browser
open http://localhost:8080
```

## 🔍 Debugging

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs
docker-compose logs -f backend
```

### Execute Commands in Container
```bash
# Backend
docker-compose exec backend sh

# Inside container:
npx prisma --version
ls -la prisma/
env | grep DATABASE
node -v
npm -v

# Frontend
docker-compose exec frontend sh

# Inside container:
ls -la /usr/share/nginx/html
cat /etc/nginx/conf.d/default.conf
```

### Check Database Connection
```bash
# From backend container
docker-compose exec backend npx prisma db pull

# Direct PostgreSQL access
docker-compose exec postgres psql -U checkup -d checkup
```

## 📦 Production Build & Push

### Build for Production

```bash
# Backend
docker build -t checkup-backend:latest ./backend
docker build -t checkup-backend:v1.0.0 ./backend

# Frontend
docker build -t checkup-frontend:latest ./frontend
docker build -t checkup-frontend:v1.0.0 ./frontend
```

### Tag for ECR (AWS)

```bash
# Replace with your AWS account ID and region
AWS_ACCOUNT_ID="123456789012"
AWS_REGION="ap-southeast-1"
ECR_BACKEND="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/checkup-backend"
ECR_FRONTEND="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/checkup-frontend"

# Tag images
docker tag checkup-backend:latest $ECR_BACKEND:latest
docker tag checkup-backend:latest $ECR_BACKEND:v1.0.0
docker tag checkup-frontend:latest $ECR_FRONTEND:latest
docker tag checkup-frontend:latest $ECR_FRONTEND:v1.0.0
```

### Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Push images
docker push $ECR_BACKEND:latest
docker push $ECR_BACKEND:v1.0.0
docker push $ECR_FRONTEND:latest
docker push $ECR_FRONTEND:v1.0.0
```

## 🌐 Environment Variables

### Backend Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-secret-key-change-in-production

# CORS
CORS_ORIGIN=https://yourdomain.com

# Port (optional, defaults to 3344)
PORT=3344

# CorpPass (Production)
CORPPASS_ISSUER=https://corppass-issuer.gov.sg
CORPPASS_AUTHORIZE_URL=https://corppass.gov.sg/oauth/authorize
CORPPASS_TOKEN_URL=https://corppass.gov.sg/oauth/token
CORPPASS_JWKS_URI=https://corppass.gov.sg/.well-known/keys
CORPPASS_CLIENT_ID=your-client-id
CORPPASS_CLIENT_SECRET=your-client-secret
CORPPASS_CALLBACK_URL=https://api.yourdomain.com/v1/auth/corppass/callback
CORPPASS_FRONTEND_CALLBACK_URL=https://yourdomain.com/auth/corppass/callback
```

### Frontend Build-Time Variables

The frontend is a static build, so API URL must be configured at build time via `vite.config.ts` or environment variables injected during build.

Check `frontend/src/lib/api-client.ts` for the API base URL configuration.

## 🏗️ AWS Infrastructure Setup

### Prerequisites

1. AWS CLI installed and configured
2. Terraform installed (v1.0+)
3. AWS account with appropriate permissions

### Infrastructure Components

- **VPC**: Private subnets for containers, public for ALB
- **RDS PostgreSQL**: Managed database service
- **ECS Fargate**: Container orchestration (serverless)
- **ECR**: Docker image registry
- **ALB**: Application Load Balancer for routing
- **CloudWatch**: Logs and monitoring
- **Secrets Manager**: Secure storage for secrets
- **Route53**: DNS management (optional)
- **ACM**: SSL/TLS certificates

### Estimated Costs (Monthly)

- RDS PostgreSQL (db.t3.micro): ~$15
- ECS Fargate (2 tasks): ~$30-50
- ALB: ~$20
- Data Transfer: Variable
- **Total**: ~$65-85/month for small workload

## 🔐 Security Checklist

- [ ] Secrets in AWS Secrets Manager (not hardcoded)
- [ ] Non-root users in Docker images ✅
- [ ] VPC with private subnets for containers
- [ ] Security groups restrict traffic
- [ ] SSL/TLS on ALB
- [ ] RDS encryption at rest
- [ ] Enable ECR image scanning
- [ ] CloudWatch logs enabled
- [ ] IAM roles follow least privilege
- [ ] No sensitive data in environment variables (use Secrets Manager)

## 📊 Health Checks

### Backend
- Endpoint: `GET /v1/health`
- Expected: `200 OK` with JSON `{"status": "ok", "timestamp": "...", "uptime": 123.45}`

### Frontend
- Endpoint: `GET /health`
- Expected: `200 OK` with text `"healthy"`

### Docker Compose
Both services have health checks configured in `docker-compose.yml`:
- Backend: Checks `/v1/health` every 30s
- Frontend: Checks `/health` every 30s
- PostgreSQL: Checks `pg_isready` every 10s

## 🚀 Deployment Workflow

### Local Development
```bash
# Start all services
docker-compose up -d

# Make code changes
# ...

# Rebuild specific service
docker-compose up -d --build backend

# Or rebuild all
docker-compose up -d --build
```

### CI/CD Pipeline (Recommended)

1. **Build**: Build Docker images on push to main
2. **Test**: Run tests inside containers
3. **Scan**: Scan images for vulnerabilities
4. **Push**: Push to ECR if tests pass
5. **Deploy**: Update ECS service with new image
6. **Verify**: Run smoke tests against production

### Manual Deployment

```bash
# 1. Build and tag
./scripts/build-and-push.sh

# 2. Update ECS task definition with new image
aws ecs update-service \
  --cluster checkup-cluster \
  --service checkup-backend-service \
  --force-new-deployment

aws ecs update-service \
  --cluster checkup-cluster \
  --service checkup-frontend-service \
  --force-new-deployment

# 3. Monitor deployment
aws ecs describe-services \
  --cluster checkup-cluster \
  --services checkup-backend-service checkup-frontend-service
```

## 🐛 Common Issues

### Issue: Prisma Client Not Generated
**Symptom:** `@prisma/client` not found
**Fix:** Ensure `npx prisma generate` runs in Dockerfile (already fixed ✅)

### Issue: Database Connection Failed
**Symptom:** Can't connect to PostgreSQL
**Fix:** Check `DATABASE_URL` and ensure database is accessible from container

### Issue: CORS Errors
**Symptom:** Frontend can't call backend API
**Fix:** Set correct `CORS_ORIGIN` in backend environment variables

### Issue: 404 on Frontend Routes
**Symptom:** Refreshing page gives 404
**Fix:** nginx.conf configured for SPA routing (already fixed ✅)

### Issue: Health Check Failing
**Symptom:** Container keeps restarting
**Fix:** Check logs with `docker logs <container-id>`

## 📚 Additional Resources

- [NestJS Docker](https://docs.nestjs.com/recipes/prisma#docker)
- [Prisma in Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-aws-lambda#prisma-client-in-docker)
- [Vite Docker](https://vitejs.dev/guide/static-deploy.html)
- [AWS ECS Deployment](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create-application-load-balancer.html)
- [Terraform AWS ECS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service)

## ✉️ Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Test database connectivity
4. Check health endpoints
5. Review Docker build logs
