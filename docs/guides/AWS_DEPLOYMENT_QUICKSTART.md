# Quick Deployment Guide: AWS Dev Environment with MockPass

**Target**: Deploy CheckUp to AWS dev environment with MockPass (simulated CorpPass)  
**Prerequisites**: AWS account, Terraform installed, AWS CLI configured  
**Estimated Time**: 15-20 minutes  
**Estimated Cost**: ~$50-60/month (can be stopped when not in use)

## Step 1: Build and Push Docker Images

```bash
# 1. Login to AWS ECR (replace REGION and ACCOUNT_ID)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# 2. Build backend image
cd backend
docker build -t checkup-backend .
docker tag checkup-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/checkup-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/checkup-backend:latest

# 3. Build frontend image
cd ../frontend
docker build -t checkup-frontend .
docker tag checkup-frontend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/checkup-frontend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/checkup-frontend:latest

# 4. Build MockPass image (for dev only)
cd ..
docker build -f backend/Dockerfile.mockpass -t checkup-mockpass .
docker tag checkup-mockpass:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/checkup-mockpass:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/checkup-mockpass:latest
```

## Step 2: Configure Terraform Variables

Create `terraform/environments/dev/terraform.tfvars`:

```hcl
# Project Configuration
project_name = "checkup"
environment  = "dev"
aws_region   = "us-east-1"

# Enable MockPass for Dev (IMPORTANT!)
enable_mockpass = true

# CorpPass Configuration (Dev defaults to MockPass)
corppass_client_id = "checkup-app"

# Optional: Use custom domain (leave empty to use EC2 public DNS)
custom_domain = ""  # e.g., "dev.checkup.example.com"

# Database Configuration
db_name              = "checkup"
db_username          = "checkup_admin"
db_backup_retention  = 7
db_skip_final_snapshot = true  # Set to false for production

# JWT Configuration (generate a strong secret)
jwt_secret = "your-super-secret-jwt-key-min-32-chars"  # CHANGE THIS!

# Resource Sizing (Dev - cost-optimized)
backend_cpu    = 256   # 0.25 vCPU
backend_memory = 512   # 512 MB
frontend_cpu   = 256   # 0.25 vCPU
frontend_memory = 512  # 512 MB
mockpass_cpu    = 256  # 0.25 vCPU
mockpass_memory = 512  # 512 MB
```

## Step 3: Deploy Infrastructure

```bash
cd terraform/environments/dev

# 1. Initialize Terraform
terraform init

# 2. Review deployment plan
terraform plan

# 3. Deploy (this will take ~10-15 minutes)
terraform apply

# 4. Save outputs
terraform output > deployment-info.txt
```

## Step 4: Access Your Application

After deployment completes:

```bash
# Get nginx public DNS
terraform output nginx_public_dns

# Example output: ec2-3-123-45-67.us-east-1.compute.amazonaws.com

# Access your application
# Frontend: http://<nginx_public_dns>:8080
# Backend API: http://<nginx_public_dns>:3344
# MockPass (internal only, not directly accessible)
```

## Step 5: Test CorpPass Authentication

1. Open browser: `http://<nginx_public_dns>:8080`
2. Click "Login with CorpPass"
3. MockPass login screen appears
4. Select test user:
   - S1234567A (Name of S1234567A)
   - S1234567B (Name of S1234567B)
   - S1234567C (Name of S1234567C)
   - S1234567D (Name of S1234567D)
5. Click "Submit" to complete authentication

## Step 6: Monitor Deployment

```bash
# View ECS tasks
aws ecs list-tasks --cluster checkup-dev --region us-east-1

# View service logs (replace TASK_ID)
aws logs tail /ecs/checkup-dev-backend --follow --region us-east-1
aws logs tail /ecs/checkup-dev-frontend --follow --region us-east-1
aws logs tail /ecs/checkup-dev-mockpass --follow --region us-east-1

# Check RDS database status
aws rds describe-db-instances --db-instance-identifier checkup-dev-postgres --region us-east-1
```

## Step 7: Cost Management

### Stop Services (when not in use)
```bash
# Stop all ECS services (keeps infrastructure, stops compute)
aws ecs update-service --cluster checkup-dev --service checkup-dev-backend --desired-count 0 --region us-east-1
aws ecs update-service --cluster checkup-dev --service checkup-dev-frontend --desired-count 0 --region us-east-1
aws ecs update-service --cluster checkup-dev --service checkup-dev-mockpass --desired-count 0 --region us-east-1

# Stop RDS database (to save costs)
aws rds stop-db-instance --db-instance-identifier checkup-dev-postgres --region us-east-1

# Stop nginx EC2 instance
aws ec2 stop-instances --instance-ids $(terraform output -raw nginx_instance_id) --region us-east-1
```

### Restart Services
```bash
# Start RDS database
aws rds start-db-instance --db-instance-identifier checkup-dev-postgres --region us-east-1

# Start nginx EC2 instance
aws ec2 start-instances --instance-ids $(terraform output -raw nginx_instance_id) --region us-east-1

# Restart ECS services
aws ecs update-service --cluster checkup-dev --service checkup-dev-backend --desired-count 1 --region us-east-1
aws ecs update-service --cluster checkup-dev --service checkup-dev-frontend --desired-count 1 --region us-east-1
aws ecs update-service --cluster checkup-dev --service checkup-dev-mockpass --desired-count 1 --region us-east-1
```

### Destroy Environment (when done testing)
```bash
cd terraform/environments/dev

# WARNING: This will delete all resources!
terraform destroy

# Manually delete ECR repositories (not managed by Terraform)
aws ecr delete-repository --repository-name checkup-backend --force --region us-east-1
aws ecr delete-repository --repository-name checkup-frontend --force --region us-east-1
aws ecr delete-repository --repository-name checkup-mockpass --force --region us-east-1
```

## Troubleshooting

### Issue: ECS tasks not starting
```bash
# Check task definition
aws ecs describe-task-definition --task-definition checkup-dev-backend --region us-east-1

# Check service events
aws ecs describe-services --cluster checkup-dev --services checkup-dev-backend --region us-east-1

# View task failures
aws ecs list-tasks --cluster checkup-dev --desired-status STOPPED --region us-east-1
```

### Issue: Cannot connect to database
```bash
# Verify DATABASE_URL SSM parameter
aws ssm get-parameter --name /checkup/dev/database/url --with-decryption --region us-east-1

# Check RDS security group
aws rds describe-db-instances --db-instance-identifier checkup-dev-postgres --query 'DBInstances[0].VpcSecurityGroups' --region us-east-1
```

### Issue: CorpPass authentication fails
```bash
# Check backend environment variables
aws ecs describe-task-definition --task-definition checkup-dev-backend --query 'taskDefinition.containerDefinitions[0].environment' --region us-east-1

# Verify MockPass is running
aws ecs describe-services --cluster checkup-dev --services checkup-dev-mockpass --region us-east-1

# Check service discovery
aws servicediscovery list-services --filters Name=NAMESPACE_ID,Values=<namespace-id> --region us-east-1
```

## Next Steps

1. ✅ **Test Application**: Verify all features work with MockPass authentication
2. ⏳ **Custom Domain**: Configure Route 53 and HTTPS (optional)
3. ⏳ **CI/CD**: Set up automated deployments (GitHub Actions, AWS CodePipeline)
4. ⏳ **Production**: Register with real CorpPass and deploy production environment (much later)

## Important Notes

- 🔒 **Security**: This is a dev environment. For production:
  - Enable HTTPS/SSL
  - Use custom domain
  - Set `db_skip_final_snapshot = false`
  - Set `enable_mockpass = false`
  - Configure real CorpPass credentials

- 💰 **Cost**: Estimated $50-60/month if running 24/7. Stop services when not in use to reduce costs.

- 🎯 **MockPass**: Only for dev/test. Never enable in production.

---

**Last Updated**: January 25, 2025  
**Related**: `TERRAFORM_DOCKER_ALIGNMENT.md`, `terraform/README.md`
