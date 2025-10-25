# Terraform AWS ECS Infrastructure

This directory contains Terraform configuration for deploying the Checkup to AWS using ECS Fargate.

## Architecture Overview

The infrastructure includes:

- **VPC**: Custom VPC with public, private, and database subnets across 2 AZs
- **NAT Instance**: t3.micro NAT instance for outbound internet access from private subnets (cost-effective alternative to NAT Gateway)
- **ECR**: Container registries for backend and frontend images
- **RDS**: PostgreSQL database (db.t3.micro) in private database subnets
- **ECS**: Fargate cluster running backend and frontend containers
- **EC2 + nginx**: t3.micro instance with nginx reverse proxy as application load balancer
- **Service Discovery**: AWS Cloud Map for inter-service communication
- **Auto-scaling**: Target tracking auto-scaling based on CPU and memory
- **CloudWatch**: Logs and alarms for monitoring

## CorpPass Configuration

### Overview
The application supports two CorpPass authentication modes:
- **Dev/Test**: MockPass (simulated CorpPass for development)
- **Production**: Real Singapore CorpPass integration

### Dev Environment (MockPass Enabled)

The dev environment deploys a **MockPass ECS service** that simulates Singapore's CorpPass authentication system. This allows testing the full authentication flow without requiring real CorpPass credentials.

#### Dev Deployment Configuration
```hcl
# In environments/dev/terraform.tfvars
enable_mockpass = true  # Deploys MockPass service

# MockPass URLs (automatically configured via locals)
corppass_issuer        = "http://mockpass.checkup.local:5156/corppass/v2"
corppass_authorize_url = "http://mockpass.checkup.local:5156/corppass/v2/auth"
corppass_token_url     = "http://mockpass.checkup.local:5156/corppass/v2/token"
corppass_jwks_url      = "http://mockpass.checkup.local:5156/corppass/v2/.well-known/keys"
corppass_client_id     = "checkup-app"
```

#### What Gets Deployed (Dev)
- ✅ **MockPass ECS Service**: Runs `mockpass:5156` container with service discovery DNS `mockpass.checkup.local:5156`
- ✅ **Backend**: Configured to use MockPass endpoints via service discovery
- ✅ **Frontend**: Points to backend on port 3344
- ✅ **Database**: RDS PostgreSQL with DATABASE_URL SSM parameter

#### Testing with MockPass
1. Access the application via nginx public DNS or custom domain
2. Click "Login with CorpPass"
3. MockPass login screen appears (simulated CorpPass UI)
4. Select test user (S1234567A, S1234567B, S1234567C, S1234567D)
5. Authentication flow completes using MockPass tokens

### Production Environment (Real CorpPass)

For production deployment, disable MockPass and configure real CorpPass endpoints.

#### Production Deployment Configuration
```hcl
# In environments/prod/terraform.tfvars (or pass as CLI variables)
enable_mockpass = false  # CRITICAL: Disable MockPass for production

# Real CorpPass URLs (Singapore government endpoints)
corppass_issuer        = "https://corppass.gov.sg/corppass/v2"
corppass_authorize_url = "https://corppass.gov.sg/corppass/v2/auth"
corppass_token_url     = "https://corppass.gov.sg/corppass/v2/token"
corppass_jwks_url      = "https://corppass.gov.sg/corppass/v2/.well-known/keys"
corppass_client_id     = "your-registered-corppass-client-id"
```

#### What Gets Deployed (Production)
- ❌ **MockPass**: NOT deployed (enable_mockpass=false)
- ✅ **Backend**: Configured to use real CorpPass endpoints (`https://corppass.gov.sg`)
- ✅ **Frontend**: Points to backend on port 3344
- ✅ **Database**: RDS PostgreSQL with DATABASE_URL SSM parameter

#### Production Prerequisites
1. **Register with CorpPass**: Apply at https://www.corppass.gov.sg/ to obtain:
   - Client ID
   - Client certificates (for JWT signing)
   - Approved callback URLs
2. **Update Terraform variables**: Set real CorpPass URLs in `environments/prod/terraform.tfvars`
3. **Upload certificates**: Store CorpPass client certificates in `backend/static/certs/` before building Docker images
4. **Configure callback URLs**: Update `corppass_callback_url` and `corppass_frontend_callback_url` to match your production domain

### Environment Variables Summary

| Variable | Dev (MockPass) | Production (Real CorpPass) |
|----------|---------------|---------------------------|
| `enable_mockpass` | `true` | `false` |
| `corppass_issuer` | `http://mockpass.checkup.local:5156/corppass/v2` | `https://corppass.gov.sg/corppass/v2` |
| `corppass_authorize_url` | `http://mockpass.checkup.local:5156/corppass/v2/auth` | `https://corppass.gov.sg/corppass/v2/auth` |
| `corppass_token_url` | `http://mockpass.checkup.local:5156/corppass/v2/token` | `https://corppass.gov.sg/corppass/v2/token` |
| `corppass_jwks_url` | `http://mockpass.checkup.local:5156/corppass/v2/.well-known/keys` | `https://corppass.gov.sg/corppass/v2/.well-known/keys` |
| `corppass_client_id` | `checkup-app` | `your-registered-client-id` |
| `corppass_callback_url` | Auto-computed: `http://{nginx_dns}:3344/v1/auth/corppass/callback` | Auto-computed: `https://{domain}/v1/auth/corppass/callback` |
| `corppass_frontend_callback_url` | Auto-computed: `http://{nginx_dns}:8080/auth/corppass/callback` | Auto-computed: `https://{domain}/auth/corppass/callback` |

### Service Discovery (AWS Cloud Map)

The ECS module creates service discovery namespaces for inter-service communication:
- **Namespace**: `checkup.local` (private DNS)
- **Services**:
  - `backend.checkup.local:3344` - Backend API
  - `frontend.checkup.local:8080` - Frontend web app
  - `mockpass.checkup.local:5156` - MockPass (dev only, conditional)

### Infrastructure Alignment

The Terraform configuration has been fully aligned with the root `docker-compose.yml`:
- **Backend port**: `3344` (matches docker-compose)
- **Health checks**: 
  - Backend: `/v1/health` (port 3344)
  - Frontend: `/health` (port 8080)
  - MockPass: `/corppass/v2/.well-known/keys` (port 5156, dev only)
- **Database**: Single `DATABASE_URL` environment variable (Prisma connection string format)
- **CorpPass**: All 7 CorpPass environment variables configured with conditional endpoints
- **CORS**: `CORS_ORIGIN` dynamically computed based on nginx public DNS or custom domain

## Cost Estimate

Based on decision worksheet (part-time usage: 3 days/month):

### Free Tier (12 months)
- RDS db.t3.micro: 750 hours/month ✓
- EC2 t3.micro (nginx): 750 hours/month ✓
- ECS Fargate: 20 GB-month storage, limited compute ✓

### Estimated Monthly Cost (3 days/month, ~72 hours)
- NAT Instance (t3.micro): ~$0.60 (72 hours × $0.0084/hour)
- RDS: Free tier
- nginx EC2: Free tier
- ECS Fargate: ~$0.50 (minimal usage, mostly within free tier)
- Data Transfer: ~$0.20
- **Total: ~$0.50-2.00/month**

### Full-time cost (24/7)
- Would be approximately $15-25/month (mostly NAT instance + RDS)

## Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI installed and configured: `aws configure`
- AWS credentials with permissions to create VPC, ECS, RDS, EC2, ECR resources

### 2. Required Tools
```bash
# Terraform
brew install terraform

# AWS CLI
brew install awscli

# Docker (for building images)
# Already installed via Colima
```

### 3. SSH Key Pair
Create an EC2 key pair in AWS console or via CLI:
```bash
aws ec2 create-key-pair \
  --key-name checkup-dev \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/checkup-dev.pem

chmod 400 ~/.ssh/checkup-dev.pem
```

### 4. S3 Backend (for Terraform state)
Create S3 bucket and DynamoDB table for state locking:
```bash
# Create S3 bucket
aws s3api create-bucket \
  --bucket checkup-terraform-state \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket checkup-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket checkup-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name checkup-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Quick Start

### 1. Navigate to dev environment
```bash
cd terraform/environments/dev
```

### 2. Create terraform.tfvars
Copy the example and customize:
```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set:
- `owner_email`: Your email address
- `key_name`: Your SSH key pair name
- `ssh_cidr_blocks`: Your IP address (get it from `curl https://checkip.amazonaws.com`)

### 3. Initialize Terraform
```bash
terraform init
```

### 4. Review the plan
```bash
terraform plan
```

Expected resources: ~40-50 resources will be created

### 5. Apply infrastructure
```bash
terraform apply
```

Type `yes` when prompted. This will take ~10-15 minutes.

### 6. Build and push Docker images

After infrastructure is created, get ECR repository URLs from outputs:
```bash
terraform output backend_repository_url
terraform output frontend_repository_url
```

Login to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(terraform output -raw backend_repository_url | cut -d'/' -f1)
```

Build and push images:
```bash
# Navigate to project root
cd ../../../

# Build and push backend
cd backend
docker build -t $(terraform -chdir=terraform/environments/dev output -raw backend_repository_url):latest .
docker push $(terraform -chdir=terraform/environments/dev output -raw backend_repository_url):latest

# Build and push frontend (requires backend URL)
cd ../frontend
docker build -t $(terraform -chdir=terraform/environments/dev output -raw frontend_repository_url):latest \
  --build-arg VITE_API_URL=$(terraform -chdir=terraform/environments/dev output -raw nginx_public_dns) .
docker push $(terraform -chdir=terraform/environments/dev output -raw frontend_repository_url):latest
```

### 7. Deploy ECS services
```bash
cd terraform/environments/dev

# Update backend service
aws ecs update-service \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw backend_service_name) \
  --force-new-deployment \
  --region us-east-1

# Update frontend service
aws ecs update-service \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw frontend_service_name) \
  --force-new-deployment \
  --region us-east-1
```

### 8. Access your application
```bash
terraform output application_url
```

Visit the URL in your browser!

## Module Structure

```
terraform/
├── modules/
│   ├── networking/       # VPC, subnets, NAT, security groups
│   ├── ecr/             # Container registries
│   ├── rds/             # PostgreSQL database
│   ├── ecs/             # ECS cluster, services, tasks
│   └── ec2-nginx/       # nginx reverse proxy
└── environments/
    └── dev/             # Development environment config
```

## Management Commands

### View infrastructure status
```bash
cd terraform/environments/dev
terraform show
```

### View outputs
```bash
terraform output
```

### Update infrastructure
```bash
# After modifying .tf files
terraform plan
terraform apply
```

### Destroy infrastructure
```bash
# WARNING: This will delete all resources
terraform destroy
```

### View logs
```bash
# ECS logs
aws logs tail /ecs/checkup-dev --follow --region us-east-1

# nginx access logs
aws logs tail /aws/ec2/nginx/access --follow --region us-east-1

# nginx error logs
aws logs tail /aws/ec2/nginx/error --follow --region us-east-1
```

### SSH to nginx instance
```bash
ssh -i ~/.ssh/checkup-dev.pem ec2-user@$(terraform output -raw nginx_public_ip)
```

### Monitor ECS services
```bash
# List services
aws ecs list-services --cluster $(terraform output -raw ecs_cluster_name) --region us-east-1

# Describe service
aws ecs describe-services \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --services $(terraform output -raw backend_service_name) \
  --region us-east-1

# List running tasks
aws ecs list-tasks --cluster $(terraform output -raw ecs_cluster_name) --region us-east-1
```

### Scale services manually
```bash
# Scale backend to 2 tasks
aws ecs update-service \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw backend_service_name) \
  --desired-count 2 \
  --region us-east-1
```

## Start/Stop for Cost Savings

To minimize costs, you can stop all services when not in use:

### Stop services
```bash
# Stop ECS services (set desired count to 0)
aws ecs update-service \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw backend_service_name) \
  --desired-count 0 \
  --region us-east-1

aws ecs update-service \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw frontend_service_name) \
  --desired-count 0 \
  --region us-east-1

# Stop RDS
aws rds stop-db-instance \
  --db-instance-identifier checkup-dev \
  --region us-east-1

# Stop nginx and NAT instances
aws ec2 stop-instances \
  --instance-ids $(terraform output -raw nginx_instance_id) \
  --region us-east-1

# Note: RDS will auto-start after 7 days of being stopped
```

### Start services
```bash
# Start RDS
aws rds start-db-instance \
  --db-instance-identifier checkup-dev \
  --region us-east-1

# Wait for RDS to be available (~5 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier checkup-dev \
  --region us-east-1

# Start nginx and NAT instances
aws ec2 start-instances \
  --instance-ids $(terraform output -raw nginx_instance_id) \
  --region us-east-1

# Start ECS services
aws ecs update-service \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw backend_service_name) \
  --desired-count 1 \
  --region us-east-1

aws ecs update-service \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --service $(terraform output -raw frontend_service_name) \
  --desired-count 1 \
  --region us-east-1
```

## Troubleshooting

### ECS tasks failing to start
```bash
# Check task definition
aws ecs describe-task-definition \
  --task-definition $(terraform output -raw backend_task_definition_arn) \
  --region us-east-1

# Check stopped tasks
aws ecs list-tasks \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --desired-status STOPPED \
  --region us-east-1
```

### Database connection issues
```bash
# Verify security groups allow ECS tasks to connect to RDS
# Check SSM parameters
aws ssm get-parameter --name /checkup/dev/db/host --region us-east-1
```

### nginx not responding
```bash
# SSH to nginx instance
ssh -i ~/.ssh/checkup-dev.pem ec2-user@$(terraform output -raw nginx_public_ip)

# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### High costs
```bash
# Check running resources
aws ec2 describe-instances --filters "Name=tag:Project,Values=checkup" --region us-east-1
aws ecs list-services --cluster $(terraform output -raw ecs_cluster_name) --region us-east-1
aws rds describe-db-instances --filters "Name=tag:Project,Values=checkup" --region us-east-1

# Review CloudWatch costs
# Check NAT instance data transfer costs
```

## Security Best Practices

1. **SSH Access**: Restrict `ssh_cidr_blocks` to your IP only
2. **Database**: Never expose RDS publicly
3. **Secrets**: Use AWS Secrets Manager for production
4. **IAM**: Use least privilege principles
5. **Encryption**: Enable encryption at rest and in transit
6. **VPC Flow Logs**: Enable for security auditing in production

## Next Steps

After successful deployment:

1. Set up CI/CD with GitHub Actions (Phase 3)
2. Configure custom domain name
3. Set up SSL/TLS with Let's Encrypt
4. Implement monitoring and alerting
5. Set up automated backups
6. Configure disaster recovery

## Support

For issues or questions:
- Email: du.yanchao@gt.tech.gov.sg
- GitHub Issues: yanchao-du/checkup

## License

[Your License Here]
