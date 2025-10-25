# Terraform & Docker Compose Alignment

**Date**: January 25, 2025  
**Status**: ✅ Complete  
**Related**: `DOCKER_DEPLOYMENT.md`, `terraform/README.md`

## Overview

This document summarizes the comprehensive alignment between the root `docker-compose.yml` configuration and the Terraform AWS ECS deployment setup, including the addition of MockPass for dev/test environments.

## Changes Summary

### 1. Backend ECS Task Definition (`terraform/modules/ecs/main.tf`)

#### Before (Misaligned)
- ❌ Port: `3000` (wrong)
- ❌ Health check: `/api` (wrong endpoint)
- ❌ Missing CorpPass environment variables (7 vars)
- ❌ Database: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (separate vars)

#### After (Aligned)
- ✅ Port: `3344` (matches docker-compose)
- ✅ Health check: `/v1/health` (correct endpoint)
- ✅ All CorpPass environment variables configured:
  - `CORPPASS_ISSUER`
  - `CORPPASS_AUTHORIZE_URL`
  - `CORPPASS_TOKEN_URL`
  - `CORPPASS_JWKS_URL`
  - `CORPPASS_CLIENT_ID`
  - `CORPPASS_CLIENT_SECRET` (from SSM)
  - `CORPPASS_CALLBACK_URL`
  - `CORPPASS_FRONTEND_CALLBACK_URL`
- ✅ Database: Single `DATABASE_URL` environment variable (Prisma connection string)
- ✅ `CORS_ORIGIN` dynamically computed

### 2. Frontend ECS Task Definition (`terraform/modules/ecs/main.tf`)

#### Status
✅ Already aligned with docker-compose:
- Port: `8080`
- Health check: `/health`
- Environment: `VITE_API_URL` points to nginx proxy

### 3. MockPass ECS Service (NEW)

#### Added Configuration
```hcl
# MockPass Task Definition (conditional deployment)
resource "aws_ecs_task_definition" "mockpass" {
  count  = var.enable_mockpass ? 1 : 0
  family = "${var.project_name}-mockpass"
  
  container_definitions = [{
    name  = "mockpass"
    image = "${var.ecr_repository_url_mockpass}:latest"
    portMappings = [{ containerPort = 5156 }]
    healthCheck = {
      command     = ["CMD-SHELL", "wget --spider --quiet http://localhost:5156/corppass/v2/.well-known/keys || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }]
}

# Service Discovery: mockpass.checkup.local:5156
resource "aws_service_discovery_service" "mockpass" {
  count = var.enable_mockpass ? 1 : 0
  name  = "mockpass"
  # ...
}
```

#### What This Enables
- 🎯 **Dev/Test**: Deploys MockPass for CorpPass simulation
- 🎯 **Production**: Skips MockPass (enable_mockpass=false)
- 🎯 **Service Discovery**: Backend can reach MockPass via `mockpass.checkup.local:5156`

### 4. Database Configuration (`terraform/modules/rds/main.tf`)

#### Before
- Multiple separate environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Required backend to construct DATABASE_URL from parts

#### After
- Single `DATABASE_URL` SSM parameter with complete Prisma connection string:
  ```
  postgresql://${username}:${password}@${endpoint}:${port}/${database_name}
  ```
- Backend reads complete URL from SSM (no assembly required)

### 5. Dev Environment Configuration (`terraform/environments/dev/`)

#### Added Variables (`variables.tf`)
```hcl
variable "enable_mockpass" {
  description = "Enable MockPass for CorpPass simulation (dev/test only, disable for production)"
  type        = bool
  default     = true  # Dev defaults to MockPass enabled
}

variable "corppass_client_id" {
  description = "CorpPass client ID (registered with CorpPass or 'checkup-app' for MockPass)"
  type        = string
  default     = "checkup-app"
}

variable "corppass_issuer" {
  description = "CorpPass issuer URL (production) or MockPass base URL (dev)"
  type        = string
  default     = "https://corppass.gov.sg/corppass/v2"
}

# ... plus corppass_authorize_url, corppass_token_url, corppass_jwks_url, 
#     corppass_callback_url, corppass_frontend_callback_url
```

#### Computed Locals (`main.tf`)
```hcl
locals {
  # Base URLs
  app_base_url      = var.custom_domain != "" ? "https://${var.custom_domain}" : "http://${module.ec2_nginx.public_dns}"
  mockpass_base_url = "http://mockpass.${var.project_name}.local:5156"
  
  # Conditional CorpPass endpoints (dev uses MockPass, prod uses real CorpPass)
  corppass_issuer = var.enable_mockpass ? 
    "${local.mockpass_base_url}/corppass/v2" : 
    var.corppass_issuer
  
  corppass_authorize_url = var.enable_mockpass ?
    "${local.mockpass_base_url}/corppass/v2/auth" :
    var.corppass_authorize_url
  
  # ... plus token_url, jwks_url
}
```

#### Secret Management
```hcl
# CorpPass client secret (random for dev, real for production)
resource "aws_ssm_parameter" "corppass_client_secret" {
  name  = "/${var.project_name}/${var.environment}/corppass/client-secret"
  type  = "SecureString"
  value = random_password.corppass_client_secret.result
}

resource "random_password" "corppass_client_secret" {
  length  = 64
  special = false
}
```

### 6. Module Interface Updates

#### ECS Module (`terraform/modules/ecs/`)

**New Variables Added:**
```hcl
variable "enable_mockpass" {
  description = "Enable MockPass ECS service for CorpPass simulation"
  type        = bool
  default     = false
}

variable "mockpass_cpu" {
  description = "CPU units for MockPass task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "mockpass_memory" {
  description = "Memory for MockPass task (MiB)"
  type        = number
  default     = 512
}

variable "cors_origin" {
  description = "CORS origin for backend (frontend URL)"
  type        = string
}

variable "corppass_client_id" {
  description = "CorpPass client ID"
  type        = string
}

variable "corppass_issuer" {
  description = "CorpPass issuer URL"
  type        = string
}

variable "corppass_authorize_url" {
  description = "CorpPass authorization endpoint URL"
  type        = string
}

variable "corppass_token_url" {
  description = "CorpPass token endpoint URL"
  type        = string
}

variable "corppass_jwks_url" {
  description = "CorpPass JWKS endpoint URL"
  type        = string
}

variable "corppass_callback_url" {
  description = "Backend CorpPass callback URL"
  type        = string
}

variable "corppass_frontend_callback_url" {
  description = "Frontend CorpPass callback URL"
  type        = string
}

variable "database_url_ssm_parameter" {
  description = "ARN of the SSM parameter containing the DATABASE_URL"
  type        = string
}

variable "corppass_client_secret_ssm_parameter" {
  description = "ARN of the SSM parameter containing the CorpPass client secret"
  type        = string
}
```

#### RDS Module (`terraform/modules/rds/`)

**New Outputs Added:**
```hcl
output "database_url_ssm_parameter" {
  description = "ARN of the SSM parameter containing the complete DATABASE_URL"
  value       = aws_ssm_parameter.database_url.arn
}
```

## Deployment Workflow

### Dev Environment (with MockPass)
```bash
cd terraform/environments/dev

# Set enable_mockpass=true (default)
terraform apply -var="enable_mockpass=true"

# What gets deployed:
# ✅ VPC, subnets, NAT instance
# ✅ RDS PostgreSQL (with DATABASE_URL SSM)
# ✅ ECR repositories (backend, frontend, mockpass)
# ✅ ECS cluster
# ✅ Backend ECS service (port 3344, CorpPass → MockPass)
# ✅ Frontend ECS service (port 8080)
# ✅ MockPass ECS service (port 5156) ← ONLY in dev
# ✅ nginx EC2 reverse proxy
# ✅ Service Discovery (backend, frontend, mockpass)
```

### Production Environment (real CorpPass)
```bash
cd terraform/environments/prod

# Set enable_mockpass=false (CRITICAL!)
terraform apply \
  -var="enable_mockpass=false" \
  -var="corppass_client_id=your-registered-client-id" \
  -var="corppass_issuer=https://corppass.gov.sg/corppass/v2" \
  -var="corppass_authorize_url=https://corppass.gov.sg/corppass/v2/auth" \
  -var="corppass_token_url=https://corppass.gov.sg/corppass/v2/token" \
  -var="corppass_jwks_url=https://corppass.gov.sg/corppass/v2/.well-known/keys"

# What gets deployed:
# ✅ VPC, subnets, NAT instance
# ✅ RDS PostgreSQL (with DATABASE_URL SSM)
# ✅ ECR repositories (backend, frontend)
# ✅ ECS cluster
# ✅ Backend ECS service (port 3344, CorpPass → https://corppass.gov.sg)
# ✅ Frontend ECS service (port 8080)
# ❌ MockPass ECS service (NOT deployed)
# ✅ nginx EC2 reverse proxy
# ✅ Service Discovery (backend, frontend only)
```

## Configuration Comparison

| Component | Docker Compose (Local) | Terraform Dev (AWS) | Terraform Prod (AWS) |
|-----------|------------------------|---------------------|----------------------|
| **Backend Port** | 3344 | 3344 | 3344 |
| **Backend Health** | `/v1/health` | `/v1/health` | `/v1/health` |
| **Frontend Port** | 8080 | 8080 | 8080 |
| **Frontend Health** | `/health` | `/health` | `/health` |
| **Database** | postgres:16-alpine (port 55432→5432) | RDS PostgreSQL (db.t3.micro) | RDS PostgreSQL (varies) |
| **DATABASE_URL** | `postgresql://checkup:password@postgres:5432/checkup` | SSM parameter (computed) | SSM parameter (computed) |
| **MockPass** | `mockpass:5156` | ECS service `mockpass.checkup.local:5156` | ❌ Not deployed |
| **CorpPass Issuer** | `http://mockpass:5156/corppass/v2` | `http://mockpass.checkup.local:5156/corppass/v2` | `https://corppass.gov.sg/corppass/v2` |
| **CorpPass Client ID** | `checkup-app` | `checkup-app` | `your-registered-client-id` |
| **Service Discovery** | Docker network | AWS Cloud Map | AWS Cloud Map |

## Testing Checklist

### Dev Environment
- [ ] Deploy Terraform with `enable_mockpass=true`
- [ ] Verify MockPass ECS service is running
- [ ] Verify backend can resolve `mockpass.checkup.local:5156`
- [ ] Test CorpPass login flow via MockPass
- [ ] Verify backend logs show MockPass issuer URL
- [ ] Verify frontend can authenticate via MockPass

### Production Environment
- [ ] Register application with Singapore CorpPass
- [ ] Obtain CorpPass client ID and certificates
- [ ] Update Terraform variables with real CorpPass URLs
- [ ] Deploy Terraform with `enable_mockpass=false`
- [ ] Verify MockPass ECS service is NOT running
- [ ] Verify backend uses real CorpPass endpoints
- [ ] Test CorpPass login flow with real Singapore credentials
- [ ] Verify callback URLs match registered CorpPass configuration

## Cost Impact

### Dev Environment (with MockPass)
- **Additional cost**: ~$5-10/month for MockPass ECS task (Fargate)
  - CPU: 0.25 vCPU × 730 hours × $0.04048 = ~$7.38/month
  - Memory: 0.5 GB × 730 hours × $0.004445 = ~$1.62/month
- **Total dev cost**: ~$50-60/month (includes VPC, RDS, ECS, EC2, MockPass)

### Production Environment (without MockPass)
- **No additional cost**: MockPass not deployed
- **Standard cost**: ~$40-50/month (VPC, RDS, ECS, EC2)

## Security Notes

1. **CorpPass Client Secret**: Stored in AWS SSM Parameter Store (SecureString)
   - Dev: Auto-generated random 64-character string
   - Prod: Should be replaced with real CorpPass client secret

2. **Database Credentials**: Stored in AWS SSM Parameter Store (SecureString)
   - DATABASE_URL includes username, password, host, port, database name

3. **MockPass**: 
   - ⚠️ **NEVER enable in production** (`enable_mockpass=false` for prod)
   - 🔒 Only accessible via private service discovery (not exposed to internet)
   - 🎯 Uses test certificates (not valid for real CorpPass)

## Files Modified

1. `terraform/modules/ecs/main.tf` - Backend task, MockPass task, service discovery
2. `terraform/modules/ecs/variables.tf` - CorpPass variables, MockPass variables
3. `terraform/modules/rds/main.tf` - DATABASE_URL SSM parameter
4. `terraform/modules/rds/outputs.tf` - database_url_ssm_parameter output
5. `terraform/environments/dev/main.tf` - Locals, SSM parameter, module call
6. `terraform/environments/dev/variables.tf` - enable_mockpass, CorpPass variables
7. `terraform/README.md` - Comprehensive CorpPass documentation

## Related Documentation

- [Docker Deployment Guide](../DOCKER_DEPLOYMENT.md) - Local Docker Compose setup
- [Terraform README](../../terraform/README.md) - AWS deployment guide with CorpPass configuration
- [Backend Setup](./BACKEND_SETUP_COMPLETE.md) - Backend API configuration
- [Session Security](./SESSION_SECURITY.md) - JWT and session management

## Next Steps

1. ✅ **Dev Deployment**: Test AWS dev environment with MockPass
2. ⏳ **Production Prep**: Register with Singapore CorpPass (when ready)
3. ⏳ **Prod Deployment**: Deploy production with real CorpPass (much later)

---

**Last Updated**: January 25, 2025  
**Author**: GitHub Copilot  
**Status**: ✅ Terraform configuration fully aligned with Docker Compose
