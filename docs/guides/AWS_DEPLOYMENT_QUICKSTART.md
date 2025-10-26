# Quick Deployment Guide: AWS Dev Environment with MockPass

**Target**: Deploy CheckUp to AWS dev environment with MockPass (simulated CorpPass)  
**Prerequisites**: AWS account, Terraform installed, AWS CLI configured  
**Estimated Time**: 15-20 minutes  
**Estimated Cost**: ~$0/month (FREE TIER eligible with t2.micro EC2 instances)

## Step 1: Build and Push Docker Images

```bash
# 1. Login to AWS ECR (replace REGION and ACCOUNT_ID)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

#1.1 Create ECR repository before pushing image
aws ecr create-repository --repository-name checkup-backend --region us-east-1
aws ecr create-repository --repository-name checkup-frontend --region us-east-1
aws ecr create-repository --repository-name checkup-mockpass --region us-east-1

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
# docker build -f backend/Dockerfile.mockpass -t checkup-mockpass .
docker build -t checkup-mockpass ./backend
docker tag checkup-mockpass:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/checkup-mockpass:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/checkup-mockpass:latest
```

Create S3 bucket

```bash
aws s3 mb s3://checkup-terraform-state --region us-east-1




```

(Optional but recommended) Create the DynamoDB table for state locking (this will fall within free tier due to low usage)
```bash
aws dynamodb create-table \
  --table-name checkup-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
  ```

check what are the postgres versions available in your regaion
```bash
aws rds describe-db-engine-versions \
  --engine postgres \
  --query "DBEngineVersions[].EngineVersion" \
  --region us-east-1 
```

Run in 'terraform/environments/dev'
```bash
terraform init && terraform validate
terraform plan
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

# ECS EC2 Configuration (Free Tier)
ecs_instance_type         = "t2.micro"  # FREE TIER: 750 hours/month for 12 months
ecs_instance_desired_count = 1
ecs_instance_min_count    = 1
ecs_instance_max_count    = 2

# Resource Sizing (Optimized for t2.micro 1GB RAM)
backend_memory  = 256  # 256 MB (EC2 launch type, no CPU allocation needed)
frontend_memory = 256  # 256 MB (EC2 launch type, no CPU allocation needed)
mockpass_memory = 256  # 256 MB (EC2 launch type, no CPU allocation needed)
# Total: 768 MB for 3 containers, ~256 MB for OS overhead
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
# Stop all ECS tasks by scaling down to 0
aws ecs update-service --cluster checkup-dev --service checkup-dev-backend --desired-count 0 --region us-east-1
aws ecs update-service --cluster checkup-dev --service checkup-dev-frontend --desired-count 0 --region us-east-1
aws ecs update-service --cluster checkup-dev --service checkup-dev-mockpass --desired-count 0 --region us-east-1

# Stop ECS EC2 instances (via Auto Scaling Group)
aws autoscaling set-desired-capacity --auto-scaling-group-name checkup-dev-ecs-asg --desired-capacity 0 --region us-east-1

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

# Start ECS EC2 instances (via Auto Scaling Group)
aws autoscaling set-desired-capacity --auto-scaling-group-name checkup-dev-ecs-asg --desired-capacity 1 --region us-east-1

# Wait for EC2 instances to join cluster, then restart ECS services
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

- 💰 **Cost**: 
  - **FREE TIER**: t2.micro EC2 instances (750 hours/month for 12 months)
  - **FREE TIER**: 30 GB EBS storage, 15 GB data transfer
  - **PAID**: RDS db.t3.micro (~$13/month, can be stopped when not in use)
  - **PAID**: nginx t2.micro (~$9/month if running 24/7, FREE if within 750 hours)
  - **Total**: ~$13-22/month (vs ~$50/month with Fargate)
  - After 12 months: ~$22/month (t2.micro becomes paid)

- 🎯 **MockPass**: Only for dev/test. Never enable in production.

- 🚀 **EC2 Launch Type**: Using EC2 instances instead of Fargate for free tier eligibility
  - Containers run on t2.micro instances (1 vCPU, 1 GB RAM)
  - Bridge networking with dynamic port allocation
  - Auto Scaling Group manages EC2 instance lifecycle

---

**Last Updated**: January 25, 2025  
**Related**: `TERRAFORM_DOCKER_ALIGNMENT.md`, `terraform/README.md`
